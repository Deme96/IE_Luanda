import { useState, useEffect } from "react";
import EntityCrudPage from "@/components/EntityCrudPage";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { base44 } from "@/base44";
import { usePermissions } from "@/lib/usePermissions";
import {
  Trash2, Edit, Plus, Eye, Calendar, Clock, MapPin,
  CheckCircle, XCircle, AlertCircle, Gavel, Users, FileText,
  ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, Minus,
  Search, Filter, ClipboardList, Building2, Shield
} from "lucide-react";

// Tipos de deliberação
const TIPOS_DELIBERACAO = [
  { value: "institucional", label: "Institucional", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "financeira",    label: "Financeira",    color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  { value: "pastoral",      label: "Pastoral",      color: "bg-purple-100 text-purple-800 border-purple-200" },
  { value: "patrimonio",    label: "Patrimônio",    color: "bg-amber-100 text-amber-800 border-amber-200" },
  { value: "disciplinar",   label: "Disciplinar",   color: "bg-red-100 text-red-800 border-red-200" },
  { value: "missoes",       label: "Missões",       color: "bg-teal-100 text-teal-800 border-teal-200" },
  { value: "outros",        label: "Outros",        color: "bg-gray-100 text-gray-700 border-gray-200" },
];

const STATUS_DELIBERACAO = [
  { value: "aprovada",     label: "Aprovada",          icon: CheckCircle,    color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { value: "rejeitada",    label: "Rejeitada",          icon: XCircle,        color: "text-red-600 bg-red-50 border-red-200" },
  { value: "em_andamento", label: "Em Andamento",       icon: AlertCircle,    color: "text-amber-600 bg-amber-50 border-amber-200" },
  { value: "suspensa",     label: "Suspensa / Adiada",  icon: AlertCircle,    color: "text-gray-600 bg-gray-50 border-gray-200" },
  { value: "concluida",    label: "Concluída",          icon: CheckCircle,    color: "text-teal-700 bg-teal-50 border-teal-200" },
];

function getTipoBadge(tipo) {
  return TIPOS_DELIBERACAO.find(t => t.value === tipo) || TIPOS_DELIBERACAO[TIPOS_DELIBERACAO.length - 1];
}

function getStatusBadge(status) {
  return STATUS_DELIBERACAO.find(s => s.value === status) || STATUS_DELIBERACAO[0];
}

const DEFAULT_DELIB_FORM = {
  titulo: "",
  reuniao_assunto: "",
  data_reuniao: new Date().toISOString().split("T")[0],
  tipo: "institucional",
  status: "aprovada",
  descricao: "",
  responsavel: "",
  votos_favor: "",
  votos_contra: "",
  abstencoes: "",
  prazo_execucao: "",
  observacoes: "",
};

export default function Conselho() {
  const { can, ready: permissionsReady } = usePermissions();
  const canViewCouncil = permissionsReady && can("conselho.visualizar");
  const canManageCouncil = permissionsReady && can("conselho.gerenciar");
  const canManageMeetings = permissionsReady && can("secretaria.reunioes");
  const canManageSchedules = permissionsReady && can("secretaria.escalas");
  // ── Estado principal ─────────────────────────────────────────
  const [meetings, setMeetings]           = useState([]);
  const [worships, setWorships]           = useState([]);
  const [deliberacoes, setDeliberacoes]   = useState([]);

  // ── Modais de Reunião e Escala ───────────────────────────────
  const [meetingOpen, setMeetingOpen]   = useState(false);
  const [worshipOpen, setWorshipOpen]   = useState(false);
  const [meetingForm, setMeetingForm]   = useState({ assunto: "", data: "", hora: "", local: "", descricao: "" });
  const [worshipForm, setWorshipForm]   = useState({ equipe: "", data: "", hora: "", observacao: "" });
  const [editingMeetingId, setEditingMeetingId] = useState(null);
  const [editingWorshipId, setEditingWorshipId] = useState(null);

  // ── Modais de Deliberação ────────────────────────────────────
  const [deliberacaoModalOpen, setDeliberacaoModalOpen] = useState(false);
  const [deliberacaoDetalhesOpen, setDeliberacaoDetalhesOpen] = useState(false);
  const [deliberacaoForm, setDeliberacaoForm] = useState(DEFAULT_DELIB_FORM);
  const [editingDelibId, setEditingDelibId]   = useState(null);
  const [deliberacaoAtiva, setDeliberacaoAtiva] = useState(null);

  // ── Filtros de Deliberação ───────────────────────────────────
  const [searchDelib, setSearchDelib]       = useState("");
  const [filterStatus, setFilterStatus]     = useState("todos");
  const [filterTipo, setFilterTipo]         = useState("todos");
  const [expandedDeliberacoes, setExpandedDeliberacoes] = useState(false);

  // ── Configurações Conselho CRUD ──────────────────────────────
  const columns = [
    { key: "nome",   label: "Nome" },
    { key: "cargo",  label: "Cargo" },
    { key: "status", label: "Status" },
  ];
  const fields = [
    { name: "nome", label: "Nome", required: true },
    { name: "membro_id", label: "ID do Membro" },
    {
      name: "cargo", label: "Cargo", type: "select", required: true,
      options: [
        { label: "Presidente",     value: "presidente" },
        { label: "Vice-Presidente", value: "vice_presidente" },
        { label: "Secretário",     value: "secretario" },
        { label: "Tesoureiro",     value: "tesoureiro" },
        { label: "Conselheiro",    value: "conselheiro" },
      ],
    },
    { name: "data_inicio", label: "Data de Início", type: "date" },
    { name: "data_fim",    label: "Data de Fim",    type: "date" },
    {
      name: "status", label: "Status", type: "select",
      options: [
        { label: "Ativo",   value: "ativo" },
        { label: "Inativo", value: "inativo" },
      ],
    },
  ];

  // ── Carregamento de dados ────────────────────────────────────
  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [savedMeetings, savedWorships, savedDelibs] = await Promise.all([
        base44.db.get("Reuniao"),
        base44.db.get("EscalaCulto"),
        base44.db.get("Deliberacao"),
      ]);
      setMeetings((savedMeetings || []).sort((a, b) => new Date(a.data) - new Date(b.data)));
      setWorships((savedWorships || []).sort((a, b) => new Date(a.data) - new Date(b.data)));
      setDeliberacoes((savedDelibs || []).sort((a, b) => new Date(b.data_reuniao) - new Date(a.data_reuniao)));
    } catch (e) {
      console.error("Erro ao carregar dados do conselho:", e);
    }
  };

  // ── Reuniões CRUD ────────────────────────────────────────────
  const openMeetingDialog = (item = null) => {
    if (!canManageMeetings) return;
    if (item) { setMeetingForm(item); setEditingMeetingId(item.id); }
    else { setMeetingForm({ assunto: "", data: "", hora: "", local: "", descricao: "" }); setEditingMeetingId(null); }
    setMeetingOpen(true);
  };

  const handleSaveMeeting = async (e) => {
    e.preventDefault();
    if (!canManageMeetings) return;
    try {
      if (editingMeetingId) {
        await base44.db.update("Reuniao", editingMeetingId, meetingForm);
        toast.success("Reunião atualizada com sucesso.");
      } else {
        await base44.db.create("Reuniao", meetingForm);
        toast.success("Reunião agendada com sucesso.");
      }
      setMeetingOpen(false); setEditingMeetingId(null);
      const saved = await base44.db.get("Reuniao");
      setMeetings((saved || []).sort((a, b) => new Date(a.data) - new Date(b.data)));
    } catch { toast.error("Erro ao salvar a reunião."); }
  };

  const deleteMeeting = async (id) => {
    if (!canManageMeetings) return;
    if (!confirm("Tem certeza que deseja excluir esta reunião?")) return;
    await base44.db.delete("Reuniao", id);
    const saved = await base44.db.get("Reuniao");
    setMeetings((saved || []).sort((a, b) => new Date(a.data) - new Date(b.data)));
  };

  // ── Escalas CRUD ─────────────────────────────────────────────
  const openWorshipDialog = (item = null) => {
    if (!canManageSchedules) return;
    if (item) { setWorshipForm(item); setEditingWorshipId(item.id); }
    else { setWorshipForm({ equipe: "", data: "", hora: "", observacao: "" }); setEditingWorshipId(null); }
    setWorshipOpen(true);
  };

  const handleSaveWorship = async (e) => {
    e.preventDefault();
    if (!canManageSchedules) return;
    try {
      if (editingWorshipId) {
        await base44.db.update("EscalaCulto", editingWorshipId, worshipForm);
        toast.success("Escala atualizada com sucesso.");
      } else {
        await base44.db.create("EscalaCulto", worshipForm);
        toast.success("Escala de culto registrada com sucesso.");
      }
      setWorshipOpen(false); setEditingWorshipId(null);
      const saved = await base44.db.get("EscalaCulto");
      setWorships((saved || []).sort((a, b) => new Date(a.data) - new Date(b.data)));
    } catch { toast.error("Erro ao salvar a escala de culto."); }
  };

  const deleteWorship = async (id) => {
    if (!canManageSchedules) return;
    if (!confirm("Tem certeza que deseja excluir esta escala?")) return;
    await base44.db.delete("EscalaCulto", id);
    const saved = await base44.db.get("EscalaCulto");
    setWorships((saved || []).sort((a, b) => new Date(a.data) - new Date(b.data)));
  };

  // ── Deliberações CRUD ────────────────────────────────────────
  const openDelibModal = (item = null) => {
    if (!canManageCouncil) return;
    if (item) {
      setDeliberacaoForm({ ...DEFAULT_DELIB_FORM, ...item });
      setEditingDelibId(item.id);
    } else {
      setDeliberacaoForm(DEFAULT_DELIB_FORM);
      setEditingDelibId(null);
    }
    setDeliberacaoModalOpen(true);
  };

  const handleSaveDelib = async (e) => {
    e.preventDefault();
    if (!canManageCouncil) return;
    try {
      const payload = {
        ...deliberacaoForm,
        votos_favor:  Number(deliberacaoForm.votos_favor)  || 0,
        votos_contra: Number(deliberacaoForm.votos_contra) || 0,
        abstencoes:   Number(deliberacaoForm.abstencoes)   || 0,
      };
      if (editingDelibId) {
        await base44.db.update("Deliberacao", editingDelibId, payload);
        toast.success("Deliberação atualizada com sucesso.");
      } else {
        await base44.db.create("Deliberacao", payload);
        toast.success("Deliberação registrada com sucesso.");
      }
      setDeliberacaoModalOpen(false); setEditingDelibId(null);
      const saved = await base44.db.get("Deliberacao");
      setDeliberacoes((saved || []).sort((a, b) => new Date(b.data_reuniao) - new Date(a.data_reuniao)));
    } catch { toast.error("Erro ao salvar a deliberação."); }
  };

  const deleteDelib = async (id, titulo) => {
    if (!canManageCouncil) return;
    if (!confirm(`Excluir deliberação "${titulo}"?`)) return;
    await base44.db.delete("Deliberacao", id);
    const saved = await base44.db.get("Deliberacao");
    setDeliberacoes((saved || []).sort((a, b) => new Date(b.data_reuniao) - new Date(a.data_reuniao)));
    toast.success("Deliberação removida.");
  };

  // ── Filtros de Deliberação ───────────────────────────────────
  const filteredDelibs = deliberacoes.filter(d => {
    const q = searchDelib.toLowerCase();
    const matchSearch = !q ||
      (d.titulo || "").toLowerCase().includes(q) ||
      (d.reuniao_assunto || "").toLowerCase().includes(q) ||
      (d.responsavel || "").toLowerCase().includes(q) ||
      (d.descricao || "").toLowerCase().includes(q);
    const matchStatus = filterStatus === "todos" || d.status === filterStatus;
    const matchTipo   = filterTipo   === "todos" || d.tipo === filterTipo;
    return matchSearch && matchStatus && matchTipo;
  });

  const PREVIEW_COUNT = 3;
  const visibleDelibs = expandedDeliberacoes ? filteredDelibs : filteredDelibs.slice(0, PREVIEW_COUNT);

  // ── Totais para indicadores ──────────────────────────────────
  const totalAprovadas  = deliberacoes.filter(d => d.status === "aprovada").length;
  const totalAndamento  = deliberacoes.filter(d => d.status === "em_andamento").length;
  const totalConcluidas = deliberacoes.filter(d => d.status === "concluida").length;

  // ── JSX ──────────────────────────────────────────────────────
  if (!permissionsReady) return <div className="p-8 text-center text-gray-500">Verificando privilégios...</div>;
  if (!canViewCouncil && !canManageMeetings && !canManageSchedules) {
    return <div className="p-8 text-center text-gray-500">Não possui privilégios para consultar o Conselho.</div>;
  }

  return (
    <div className="space-y-8">

      {/* ── CABEÇALHO ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Conselho Presbiteral</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie membros, reuniões, escalas de culto e deliberações oficiais do conselho.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canManageMeetings && <Button className="bg-military hover:bg-military-dark text-white gap-2" onClick={() => openMeetingDialog()}>
            <Calendar size={15} /> Agendar Reunião
          </Button>}
          {canManageSchedules && <Button className="bg-military hover:bg-military-dark text-white gap-2" onClick={() => openWorshipDialog()}>
            <Clock size={15} /> Escala de Culto
          </Button>}
          {canManageCouncil && <Button className="bg-military hover:bg-military-dark text-white gap-2" onClick={() => openDelibModal()}>
            <Gavel size={15} /> Nova Deliberação
          </Button>}
        </div>
      </div>

      {/* ── GRADE SUPERIOR: Reuniões | Escalas | Membros ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Reuniões Agendadas */}
        {canManageMeetings && <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Calendar size={18} className="text-military" /> Reuniões Agendadas
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Próximos encontros do conselho.</p>
            </div>
            {canManageMeetings && <Button size="sm" className="bg-military hover:bg-military-dark text-white" onClick={() => openMeetingDialog()}>
              <Plus size={14} />
            </Button>}
          </div>
          <div className="p-4">
            {meetings.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">Nenhuma reunião agendada.</p>
            ) : (
              <div className="space-y-2">
                {meetings.map((m) => (
                  <div key={m.id} className="flex items-start justify-between gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100 hover:border-military/30 transition">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 text-sm truncate">{m.assunto}</p>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                        <Calendar size={12} /> {m.data} · {m.hora}
                      </p>
                      {m.local && (
                        <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                          <MapPin size={12} /> {m.local}
                        </p>
                      )}
                    </div>
                    {canManageMeetings && <div className="flex gap-1 shrink-0">
                      <button onClick={() => openMeetingDialog(m)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition cursor-pointer"><Edit size={14} /></button>
                      <button onClick={() => deleteMeeting(m.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition cursor-pointer"><Trash2 size={14} /></button>
                    </div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>}

        {/* Escala de Culto */}
        {canManageSchedules && <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ClipboardList size={18} className="text-military" /> Escala de Culto
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Equipes e horários dos cultos.</p>
            </div>
            {canManageSchedules && <Button size="sm" className="bg-military hover:bg-military-dark text-white" onClick={() => openWorshipDialog()}>
              <Plus size={14} />
            </Button>}
          </div>
          <div className="p-4">
            {worships.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">Nenhuma escala registrada.</p>
            ) : (
              <div className="space-y-2">
                {worships.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100 hover:border-military/30 transition">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 text-sm truncate">{item.equipe}</p>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                        <Calendar size={12} /> {item.data} · {item.hora}
                      </p>
                      {item.observacao && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{item.observacao}</p>
                      )}
                    </div>
                    {canManageSchedules && <div className="flex gap-1 shrink-0">
                      <button onClick={() => openWorshipDialog(item)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition cursor-pointer"><Edit size={14} /></button>
                      <button onClick={() => deleteWorship(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition cursor-pointer"><Trash2 size={14} /></button>
                    </div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>}

        {/* Membros do Conselho (EntityCrudPage) */}
        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
          <EntityCrudPage
            title="Membros do Conselho"
            entityName="ConselhoPresbiterio"
            columns={columns}
            fields={fields}
            permissionKeys={{ view: "conselho.visualizar", create: "conselho.gerenciar", edit: "conselho.gerenciar", delete: "conselho.excluir" }}
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ── SEÇÃO DE DELIBERAÇÕES / DECISÕES ── */}
      {/* ══════════════════════════════════════════════════════════ */}
      {canViewCouncil && <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">

        {/* Cabeçalho da Seção */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-military/10 text-military flex items-center justify-center shrink-0">
                <Gavel size={22} />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                  Deliberações & Decisões do Conselho
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Registo oficial das deliberações e decisões tomadas em reuniões do Conselho Presbiteral.
                </p>
              </div>
            </div>
            {canManageCouncil && <Button
              className="bg-military hover:bg-military-dark text-white font-semibold gap-2 shadow-sm self-start lg:self-auto"
              onClick={() => openDelibModal()}
            >
              <Gavel size={16} /> Registar Nova Deliberação
            </Button>}
          </div>

          {/* Indicadores de Totais */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total",        value: deliberacoes.length, color: "bg-gray-100 text-gray-800",     icon: FileText },
              { label: "Aprovadas",    value: totalAprovadas,      color: "bg-emerald-100 text-emerald-800", icon: CheckCircle },
              { label: "Em Andamento", value: totalAndamento,      color: "bg-amber-100 text-amber-800",   icon: AlertCircle },
              { label: "Concluídas",   value: totalConcluidas,     color: "bg-teal-100 text-teal-800",     icon: Shield },
            ].map(({ label, value, color, icon: Icon }) => (
              <div key={label} className={`${color} rounded-2xl px-4 py-3 flex items-center gap-3`}>
                <Icon size={18} className="shrink-0 opacity-80" />
                <div>
                  <p className="text-2xl font-extrabold leading-none">{value}</p>
                  <p className="text-[11px] font-medium mt-0.5 opacity-80">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Barra de Filtros */}
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          {/* Busca */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
            <Input
              placeholder="Buscar deliberações..."
              value={searchDelib}
              onChange={e => setSearchDelib(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl border-gray-200"
            />
          </div>

          {/* Filtro Status */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="h-9 rounded-xl border border-gray-200 text-xs px-3 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-military/40 cursor-pointer min-w-[160px]"
          >
            <option value="todos">Todos os Status</option>
            {STATUS_DELIBERACAO.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          {/* Filtro Tipo */}
          <select
            value={filterTipo}
            onChange={e => setFilterTipo(e.target.value)}
            className="h-9 rounded-xl border border-gray-200 text-xs px-3 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-military/40 cursor-pointer min-w-[160px]"
          >
            <option value="todos">Todos os Tipos</option>
            {TIPOS_DELIBERACAO.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Lista de Deliberações */}
        <div className="p-6 space-y-4">
          {filteredDelibs.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-gray-200 rounded-3xl">
              <Gavel className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-base font-semibold text-gray-700">Nenhuma deliberação encontrada.</p>
              <p className="text-xs text-gray-500 mt-1">Registe decisões e deliberações tomadas nas reuniões do conselho.</p>
              {canManageCouncil && <Button
                onClick={() => openDelibModal()}
                className="mt-4 bg-military hover:bg-military-dark text-white text-xs gap-2"
              >
                <Plus size={14} /> Registar Deliberação
              </Button>}
            </div>
          ) : (
            <>
              {visibleDelibs.map((delib, idx) => {
                const tipoBadge   = getTipoBadge(delib.tipo);
                const statusBadge = getStatusBadge(delib.status);
                const StatusIcon  = statusBadge.icon;
                const totalVotos  = (Number(delib.votos_favor) || 0) + (Number(delib.votos_contra) || 0) + (Number(delib.abstencoes) || 0);

                return (
                  <div
                    key={delib.id}
                    className="border border-gray-200 hover:border-military/40 rounded-3xl overflow-hidden transition-all shadow-sm hover:shadow-md group"
                  >
                    {/* Faixa colorida lateral */}
                    <div className="flex">
                      <div className={`w-1.5 shrink-0 ${
                        delib.status === "aprovada"     ? "bg-emerald-500" :
                        delib.status === "rejeitada"    ? "bg-red-500"     :
                        delib.status === "em_andamento" ? "bg-amber-400"   :
                        delib.status === "concluida"    ? "bg-teal-500"    : "bg-gray-400"
                      }`} />

                      <div className="flex-1 p-5">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          {/* Metadados: Número, Tipo, Status */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-bold text-gray-400">
                              #{String(idx + 1).padStart(3, "0")}
                            </span>
                            <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${tipoBadge.color}`}>
                              {tipoBadge.label}
                            </span>
                            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${statusBadge.color}`}>
                              <StatusIcon size={11} />
                              {statusBadge.label}
                            </span>
                          </div>

                          {/* Ações */}
                          <div className="flex gap-1 shrink-0">
                            {canViewCouncil && <button
                              onClick={() => { setDeliberacaoAtiva(delib); setDeliberacaoDetalhesOpen(true); }}
                              title="Ver detalhes"
                              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-military transition cursor-pointer"
                            >
                              <Eye size={15} />
                            </button>}
                            {canManageCouncil && <button
                              onClick={() => openDelibModal(delib)}
                              title="Editar"
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition cursor-pointer"
                            >
                              <Edit size={15} />
                            </button>}
                            {canManageCouncil && <button
                              onClick={() => deleteDelib(delib.id, delib.titulo)}
                              title="Excluir"
                              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition cursor-pointer"
                            >
                              <Trash2 size={15} />
                            </button>}
                          </div>
                        </div>

                        {/* Título */}
                        <h3 className="font-bold text-gray-900 text-base mt-2 leading-snug group-hover:text-military transition-colors">
                          {delib.titulo}
                        </h3>

                        {/* Reunião de Origem */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1.5">
                            <Calendar size={12} className="text-gray-400 shrink-0" />
                            Reunião: <strong className="text-gray-700">{delib.reuniao_assunto || "—"}</strong>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock size={12} className="text-gray-400 shrink-0" />
                            Data: <strong className="text-gray-700">{delib.data_reuniao || "—"}</strong>
                          </span>
                          {delib.responsavel && (
                            <span className="flex items-center gap-1.5">
                              <Users size={12} className="text-gray-400 shrink-0" />
                              Resp.: <strong className="text-gray-700">{delib.responsavel}</strong>
                            </span>
                          )}
                          {delib.prazo_execucao && (
                            <span className="flex items-center gap-1.5">
                              <AlertCircle size={12} className="text-amber-400 shrink-0" />
                              Prazo: <strong className="text-gray-700">{delib.prazo_execucao}</strong>
                            </span>
                          )}
                        </div>

                        {/* Resumo da Deliberação */}
                        <p className="text-xs text-gray-600 mt-3 leading-relaxed line-clamp-2">
                          {delib.descricao}
                        </p>

                        {/* Votação — se houver dados */}
                        {totalVotos > 0 && (
                          <div className="mt-4 flex flex-wrap items-center gap-3">
                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Votação:</span>
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                              <ThumbsUp size={12} /> {delib.votos_favor} a favor
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
                              <ThumbsDown size={12} /> {delib.votos_contra} contra
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-200 px-2.5 py-0.5 rounded-full">
                              <Minus size={12} /> {delib.abstencoes} abstenção
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Botão Expandir / Recolher */}
              {filteredDelibs.length > PREVIEW_COUNT && (
                <div className="pt-2 text-center">
                  <button
                    onClick={() => setExpandedDeliberacoes(prev => !prev)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-military/30 text-military hover:bg-military hover:text-white text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer"
                  >
                    {expandedDeliberacoes ? (
                      <><span>Recolher</span><ChevronUp size={15} /></>
                    ) : (
                      <><span>Ver todas as deliberações ({filteredDelibs.length})</span><ChevronDown size={15} /></>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* MODAL — Registar / Editar Deliberação */}
      {/* ══════════════════════════════════════════════════════════ */}
      <Dialog open={deliberacaoModalOpen} onOpenChange={setDeliberacaoModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[92vh] overflow-y-auto p-6 rounded-3xl">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Gavel size={20} className="text-military" />
              {editingDelibId ? "Editar Deliberação" : "Registar Nova Deliberação"}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Registe as decisões e deliberações tomadas nas reuniões do Conselho Presbiteral da Igreja.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveDelib} className="space-y-4 pt-4">
            {/* Título */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700">Título da Deliberação *</Label>
              <Input
                value={deliberacaoForm.titulo}
                onChange={e => setDeliberacaoForm(f => ({ ...f, titulo: e.target.value }))}
                placeholder="Ex: Aprovação do Orçamento Anual 2027"
                required className="rounded-xl text-sm"
              />
            </div>

            {/* Reunião / Data */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-700">Reunião de Origem</Label>
                <Input
                  value={deliberacaoForm.reuniao_assunto}
                  onChange={e => setDeliberacaoForm(f => ({ ...f, reuniao_assunto: e.target.value }))}
                  placeholder="Ex: Reunião Ordinária do Conselho"
                  className="rounded-xl text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-700">Data da Reunião *</Label>
                <Input
                  type="date"
                  value={deliberacaoForm.data_reuniao}
                  onChange={e => setDeliberacaoForm(f => ({ ...f, data_reuniao: e.target.value }))}
                  required className="rounded-xl text-sm"
                />
              </div>
            </div>

            {/* Tipo / Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-700">Tipo *</Label>
                <Select
                  value={deliberacaoForm.tipo}
                  onValueChange={val => setDeliberacaoForm(f => ({ ...f, tipo: val }))}
                >
                  <SelectTrigger className="rounded-xl text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TIPOS_DELIBERACAO.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-700">Status *</Label>
                <Select
                  value={deliberacaoForm.status}
                  onValueChange={val => setDeliberacaoForm(f => ({ ...f, status: val }))}
                >
                  <SelectTrigger className="rounded-xl text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_DELIBERACAO.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700">Descrição / Teor da Deliberação *</Label>
              <textarea
                value={deliberacaoForm.descricao}
                onChange={e => setDeliberacaoForm(f => ({ ...f, descricao: e.target.value }))}
                placeholder="Descreva o teor e os fundamentos da decisão tomada..."
                rows={4}
                required
                className="w-full border border-gray-200 rounded-xl text-sm px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-military/30 placeholder:text-gray-400"
              />
            </div>

            {/* Responsável / Prazo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-700">Responsável pela Execução</Label>
                <Input
                  value={deliberacaoForm.responsavel}
                  onChange={e => setDeliberacaoForm(f => ({ ...f, responsavel: e.target.value }))}
                  placeholder="Ex: Comissão de Patrimônio"
                  className="rounded-xl text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-700">Prazo de Execução</Label>
                <Input
                  type="date"
                  value={deliberacaoForm.prazo_execucao}
                  onChange={e => setDeliberacaoForm(f => ({ ...f, prazo_execucao: e.target.value }))}
                  className="rounded-xl text-sm"
                />
              </div>
            </div>

            {/* Votação */}
            <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 space-y-3">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <Users size={14} className="text-military" /> Resultado da Votação (opcional)
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-emerald-700">Votos a Favor</Label>
                  <Input
                    type="number" min="0"
                    value={deliberacaoForm.votos_favor}
                    onChange={e => setDeliberacaoForm(f => ({ ...f, votos_favor: e.target.value }))}
                    placeholder="0"
                    className="rounded-xl text-sm text-center border-emerald-200 focus:ring-emerald-300"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-red-600">Votos Contra</Label>
                  <Input
                    type="number" min="0"
                    value={deliberacaoForm.votos_contra}
                    onChange={e => setDeliberacaoForm(f => ({ ...f, votos_contra: e.target.value }))}
                    placeholder="0"
                    className="rounded-xl text-sm text-center border-red-200 focus:ring-red-300"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-600">Abstenções</Label>
                  <Input
                    type="number" min="0"
                    value={deliberacaoForm.abstencoes}
                    onChange={e => setDeliberacaoForm(f => ({ ...f, abstencoes: e.target.value }))}
                    placeholder="0"
                    className="rounded-xl text-sm text-center"
                  />
                </div>
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700">Observações / Condicionantes</Label>
              <textarea
                value={deliberacaoForm.observacoes}
                onChange={e => setDeliberacaoForm(f => ({ ...f, observacoes: e.target.value }))}
                placeholder="Condicionantes, prazos adicionais, notas de implementação..."
                rows={2}
                className="w-full border border-gray-200 rounded-xl text-sm px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-military/30 placeholder:text-gray-400"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" onClick={() => setDeliberacaoModalOpen(false)} className="rounded-xl text-xs">
                Cancelar
              </Button>
              <Button type="submit" className="bg-military hover:bg-military-dark text-white rounded-xl text-xs font-bold gap-2">
                <Gavel size={14} /> {editingDelibId ? "Atualizar" : "Registar Deliberação"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* MODAL — Detalhes da Deliberação */}
      {/* ══════════════════════════════════════════════════════════ */}
      <Dialog open={deliberacaoDetalhesOpen} onOpenChange={setDeliberacaoDetalhesOpen}>
        <DialogContent className="sm:max-w-[580px] max-h-[92vh] overflow-y-auto p-6 rounded-3xl">
          {deliberacaoAtiva && (() => {
            const tipoBadge   = getTipoBadge(deliberacaoAtiva.tipo);
            const statusBadge = getStatusBadge(deliberacaoAtiva.status);
            const StatusIcon  = statusBadge.icon;
            const totalVotos  = (Number(deliberacaoAtiva.votos_favor) || 0)
                              + (Number(deliberacaoAtiva.votos_contra) || 0)
                              + (Number(deliberacaoAtiva.abstencoes) || 0);
            const favPercent  = totalVotos > 0
              ? Math.round((Number(deliberacaoAtiva.votos_favor) / totalVotos) * 100)
              : 0;

            return (
              <>
                <DialogHeader className="border-b pb-4">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${tipoBadge.color}`}>
                      {tipoBadge.label}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${statusBadge.color}`}>
                      <StatusIcon size={11} /> {statusBadge.label}
                    </span>
                  </div>
                  <DialogTitle className="text-xl font-extrabold text-gray-900 leading-snug">
                    {deliberacaoAtiva.titulo}
                  </DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-5 text-sm">
                  {/* Metadados */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: "Reunião de Origem", value: deliberacaoAtiva.reuniao_assunto, icon: FileText },
                      { label: "Data da Reunião",   value: deliberacaoAtiva.data_reuniao,    icon: Calendar },
                      { label: "Responsável",        value: deliberacaoAtiva.responsavel,     icon: Users },
                      { label: "Prazo de Execução",  value: deliberacaoAtiva.prazo_execucao, icon: AlertCircle },
                    ].filter(r => r.value).map(({ label, value, icon: Icon }) => (
                      <div key={label} className="bg-gray-50 rounded-2xl border border-gray-100 px-4 py-3 flex items-start gap-3">
                        <Icon size={16} className="text-military mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[11px] text-gray-500 font-medium">{label}</p>
                          <p className="font-bold text-gray-900 text-sm">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Descrição */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Teor da Deliberação</p>
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm text-gray-700 leading-relaxed">
                      {deliberacaoAtiva.descricao || "Sem descrição registada."}
                    </div>
                  </div>

                  {/* Votação */}
                  {totalVotos > 0 && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Resultado da Votação</p>
                      <div className="grid grid-cols-3 gap-3 text-center mb-3">
                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl py-3">
                          <ThumbsUp size={18} className="text-emerald-600 mx-auto mb-1" />
                          <p className="text-2xl font-extrabold text-emerald-700">{deliberacaoAtiva.votos_favor}</p>
                          <p className="text-[11px] text-emerald-600 font-semibold">A Favor</p>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded-2xl py-3">
                          <ThumbsDown size={18} className="text-red-600 mx-auto mb-1" />
                          <p className="text-2xl font-extrabold text-red-700">{deliberacaoAtiva.votos_contra}</p>
                          <p className="text-[11px] text-red-600 font-semibold">Contra</p>
                        </div>
                        <div className="bg-gray-100 border border-gray-200 rounded-2xl py-3">
                          <Minus size={18} className="text-gray-500 mx-auto mb-1" />
                          <p className="text-2xl font-extrabold text-gray-700">{deliberacaoAtiva.abstencoes}</p>
                          <p className="text-[11px] text-gray-600 font-semibold">Abstenção</p>
                        </div>
                      </div>
                      {/* Barra de progresso de aprovação */}
                      <div className="rounded-full bg-gray-200 h-2.5 overflow-hidden">
                        <div
                          className="h-2.5 rounded-full bg-emerald-500 transition-all"
                          style={{ width: `${favPercent}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1.5 text-right">
                        {favPercent}% de aprovação · {totalVotos} votos totais
                      </p>
                    </div>
                  )}

                  {/* Observações */}
                  {deliberacaoAtiva.observacoes && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Observações</p>
                      <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-xs text-amber-800 leading-relaxed">
                        {deliberacaoAtiva.observacoes}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 flex justify-between gap-3">
                  <Button
                    variant="outline"
                    onClick={() => { setDeliberacaoDetalhesOpen(false); openDelibModal(deliberacaoAtiva); }}
                    className="text-xs rounded-xl gap-2"
                  >
                    <Edit size={13} /> Editar
                  </Button>
                  <Button
                    onClick={() => setDeliberacaoDetalhesOpen(false)}
                    className="bg-military hover:bg-military-dark text-white text-xs rounded-xl"
                  >
                    Concluído
                  </Button>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* MODAL — Agendar Reunião */}
      {/* ══════════════════════════════════════════════════════════ */}
      <Dialog open={meetingOpen} onOpenChange={setMeetingOpen}>
        <DialogContent className="sm:max-w-[450px] p-6 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar size={18} className="text-military" /> Agendar Reunião
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveMeeting} className="space-y-3 pt-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700">Assunto *</Label>
              <Input value={meetingForm.assunto} onChange={e => setMeetingForm(f => ({ ...f, assunto: e.target.value }))} required className="rounded-xl text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-700">Data *</Label>
                <Input type="date" value={meetingForm.data} onChange={e => setMeetingForm(f => ({ ...f, data: e.target.value }))} required className="rounded-xl text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-700">Hora *</Label>
                <Input type="time" value={meetingForm.hora} onChange={e => setMeetingForm(f => ({ ...f, hora: e.target.value }))} required className="rounded-xl text-sm" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700">Local</Label>
              <Input value={meetingForm.local} onChange={e => setMeetingForm(f => ({ ...f, local: e.target.value }))} placeholder="Ex: Sala do Conselho - Sede" className="rounded-xl text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700">Descrição / Pauta</Label>
              <Input value={meetingForm.descricao} onChange={e => setMeetingForm(f => ({ ...f, descricao: e.target.value }))} className="rounded-xl text-sm" />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" onClick={() => setMeetingOpen(false)} className="rounded-xl text-xs">Cancelar</Button>
              <Button type="submit" className="bg-military hover:bg-military-dark text-white rounded-xl text-xs font-bold">Salvar Reunião</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* MODAL — Escala de Culto */}
      {/* ══════════════════════════════════════════════════════════ */}
      <Dialog open={worshipOpen} onOpenChange={setWorshipOpen}>
        <DialogContent className="sm:max-w-[450px] p-6 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ClipboardList size={18} className="text-military" /> Escala de Culto
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveWorship} className="space-y-3 pt-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700">Equipe *</Label>
              <Input value={worshipForm.equipe} onChange={e => setWorshipForm(f => ({ ...f, equipe: e.target.value }))} required className="rounded-xl text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-700">Data *</Label>
                <Input type="date" value={worshipForm.data} onChange={e => setWorshipForm(f => ({ ...f, data: e.target.value }))} required className="rounded-xl text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-700">Hora *</Label>
                <Input type="time" value={worshipForm.hora} onChange={e => setWorshipForm(f => ({ ...f, hora: e.target.value }))} required className="rounded-xl text-sm" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-gray-700">Observação</Label>
              <Input value={worshipForm.observacao} onChange={e => setWorshipForm(f => ({ ...f, observacao: e.target.value }))} placeholder="Ex: Culto de Oração - Sede" className="rounded-xl text-sm" />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" onClick={() => setWorshipOpen(false)} className="rounded-xl text-xs">Cancelar</Button>
              <Button type="submit" className="bg-military hover:bg-military-dark text-white rounded-xl text-xs font-bold">Salvar Escala</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
