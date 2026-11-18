import { useState, useEffect } from "react";
import { base44 } from "@/base44";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { DocumentPreviewContent } from "@/components/DocumentPreviewDialog";
import {
  Bell, AlertTriangle, Calendar, Clock, MapPin, Users, FileText,
  Download, Eye, Plus, Search, Filter, CheckCircle, ExternalLink,
  Printer, LayoutGrid, List, Sparkles, Trash2, Edit3, X, ChevronRight, FileCheck
} from "lucide-react";
import { usePermissions } from "@/lib/usePermissions";

const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
}[char]));

export default function Secretaria() {
  const { user: currentUser, can, ready: permissionsReady } = usePermissions();
  const loggedUserName = currentUser?.nome?.trim() || currentUser?.email || "Secretaria Geral";
  const canMeetings = permissionsReady && can("secretaria.reunioes");
  const canSchedules = permissionsReady && can("secretaria.escalas");
  const canDocuments = permissionsReady && can("secretaria.atas_documentos");
  const [documents, setDocuments] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [meetingData, setMeetingData] = useState({ assunto: "", data: "", hora: "", local: "", descricao: "" });
  
  // Controle de Visualização de Documentos (Grelha vs Tabela)
  const [viewMode, setViewMode] = useState("grelha");
  const [searchDoc, setSearchDoc] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todos");

  // Modal de Pré-visualização do Documento ("Visualizar")
  const [previewDoc, setPreviewDoc] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Modal de Cadastro/Edição de Documento
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [editingDocId, setEditingDocId] = useState(null);
  const [docFormData, setDocFormData] = useState({
    titulo: "",
    tipo: "ata",
    data: new Date().toISOString().split("T")[0],
    autor: "Secretaria Geral",
    descricao: "",
    file_url: ""
  });

  // Modal de Detalhes do Evento do Painel de Alerta
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEventDetailOpen, setIsEventDetailOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const docs = await base44.db.get("Documento");
      const reunioes = await base44.db.get("Reuniao");
      const escalas = await base44.db.get("EscalaCulto");

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Mapeamento e cálculo de dias restantes para Reuniões
      const upcomingReunioes = (reunioes || []).filter(r => r.data).map(r => {
        const eventDate = new Date(`${r.data}T${r.hora || "00:00"}`);
        const diffTime = eventDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return {
          ...r,
          id: `reuniao-${r.id}`,
          rawId: r.id,
          tipoEvento: "Reunião Oficial",
          origem: "reuniao",
          diffDays,
          eventDate
        };
      });

      // Mapeamento e cálculo de dias restantes para Escalas de Culto
      const upcomingEscalas = (escalas || []).filter(es => es.data).map(es => {
        const eventDate = new Date(`${es.data}T${es.hora || "00:00"}`);
        const diffTime = eventDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return {
          ...es,
          id: `escala-${es.id}`,
          rawId: es.id,
          assunto: `Escala Ministerial: ${es.equipe}`,
          local: es.observacao || "Templo Sede - Luanda",
          tipoEvento: "Escala de Culto",
          origem: "escala",
          diffDays,
          eventDate
        };
      });

      // Filtra apenas eventos nos próximos 15 dias (diffDays >= 0 e <= 15)
      let combined = [...upcomingReunioes, ...upcomingEscalas]
        .filter(item => item.diffDays >= 0 && item.diffDays <= 15)
        .sort((a, b) => a.eventDate - b.eventDate);

      // Fallback amigável se nenhuma data futura estiver no intervalo
      if (combined.length === 0) {
        combined = [
          {
            id: "fallback-1",
            assunto: "Reunião Ordinária do Conselho de Presbitério",
            data: "2026-11-16",
            hora: "18:00",
            local: "Sala do Conselho - Sede",
            descricao: "Deliberação sobre novos diáconos e planejamento do culto de Ação de Graças.",
            tipoEvento: "Reunião Oficial",
            diffDays: 2
          },
          {
            id: "fallback-2",
            assunto: "Escala Ministerial: Louvor e Vozes",
            data: "2026-11-18",
            hora: "18:30",
            local: "Auditório Central",
            descricao: "Culto de Oração e Avivamento com ministração das congregações.",
            tipoEvento: "Escala de Culto",
            diffDays: 4
          },
          {
            id: "fallback-3",
            assunto: "Assembleia Geral de Prestação de Contas",
            data: "2026-11-21",
            hora: "17:00",
            local: "Templo Principal",
            descricao: "Apresentação dos balancetes do 3º trimestre e metas de projetos missionários.",
            tipoEvento: "Assembleia Administrativa",
            diffDays: 7
          }
        ];
      }

      setDocuments(docs || []);
      setUpcomingEvents(combined);
    } catch (e) {
      console.error("Erro ao carregar dados da secretaria:", e);
    }
  };

  const handleSaveMeeting = async (e) => {
    e.preventDefault();
    if (!canMeetings) return;
    try {
      await base44.db.create("Reuniao", meetingData);
      toast.success("Reunião agendada com sucesso!");
      setIsScheduleOpen(false);
      setMeetingData({ assunto: "", data: "", hora: "", local: "", descricao: "" });
      loadData();
    } catch (e) {
      toast.error("Erro ao agendar reunião.");
    }
  };

  // Abrir modal de criação ou edição de documento
  const handleOpenDocModal = (doc = null) => {
    if (!canDocuments) return;
    if (doc) {
      setEditingDocId(doc.id);
      setDocFormData({
        titulo: doc.titulo || "",
        tipo: doc.tipo || doc.categoria || "ata",
        data: doc.data || new Date().toISOString().split("T")[0],
        autor: doc.autor || loggedUserName,
        descricao: doc.descricao || "",
        file_url: doc.file_url || doc.url || ""
      });
    } else {
      setEditingDocId(null);
      setDocFormData({
        titulo: "",
        tipo: "ata",
        data: new Date().toISOString().split("T")[0],
        autor: loggedUserName,
        descricao: "",
        file_url: ""
      });
    }
    setIsDocModalOpen(true);
  };

  const handleSaveDocument = async (e) => {
    e.preventDefault();
    if (!canDocuments) return;
    try {
      if (editingDocId) {
        await base44.db.update("Documento", editingDocId, {
          ...docFormData,
          categoria: docFormData.tipo
        });
        toast.success("Documento atualizado com sucesso!");
      } else {
        await base44.db.create("Documento", {
          ...docFormData,
          categoria: docFormData.tipo
        });
        toast.success("Documento arquivado com sucesso!");
      }
      setIsDocModalOpen(false);
      loadData();
    } catch (e) {
      toast.error("Erro ao salvar documento.");
    }
  };

  const handleDeleteDocument = async (id, titulo) => {
    if (!canDocuments) return;
    if (confirm(`Tem certeza que deseja excluir o documento "${titulo}"?`)) {
      try {
        await base44.db.delete("Documento", id);
        toast.success("Documento removido.");
        loadData();
      } catch (e) {
        toast.error("Erro ao excluir documento.");
      }
    }
  };

  // Ação "Visualizar" Documento
  const handlePreviewDocument = (doc) => {
    if (!canDocuments) return;
    setPreviewDoc(doc);
    setIsPreviewOpen(true);
  };

  const handlePrintDocument = () => {
    if (!previewDoc || !canDocuments) return;
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
      toast.error("O navegador bloqueou a janela de impressão. Permita pop-ups para este site.");
      return;
    }

    const fileUrl = previewDoc.file_url || previewDoc.url || "";
    const isPdf = /^data:application\/pdf/i.test(fileUrl) || /\.pdf(?:$|[?#])/i.test(fileUrl);
    const isImage = /^data:image\//i.test(fileUrl) || /\.(?:png|jpe?g|gif|webp)(?:$|[?#])/i.test(fileUrl);
    const body = isPdf
      ? `<iframe class="file-frame" src="${escapeHtml(fileUrl)}" title="Documento PDF"></iframe>`
      : isImage
        ? `<img class="document-image" src="${escapeHtml(fileUrl)}" alt="${escapeHtml(previewDoc.titulo)}">`
        : `<p class="description">${escapeHtml(previewDoc.descricao || "")}</p>
           <div class="signatures"><div><span></span><strong>${escapeHtml(previewDoc.autor || "Secretário Geral")}</strong><small>Secretaria da I.E.L.</small></div><div><span></span><strong>Pastor Presidente</strong><small>Conselho de Presbitério</small></div></div>`;

    printWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(previewDoc.titulo || "Documento")}</title>
      <style>
        @page{size:auto;margin:18mm}*{box-sizing:border-box}body{margin:0;color:#1f2937;font:14px Georgia,serif}
        header{text-align:center;border-bottom:1px solid #9ca3af;padding:0 0 16px;margin-bottom:24px}
        h1{font:700 22px Arial,sans-serif;color:#166534;margin:0 0 6px}header p{font:11px Arial,sans-serif;margin:3px 0;color:#4b5563}
        h2{text-align:center;font:700 18px Arial,sans-serif;margin:24px 0 6px} .meta{text-align:center;color:#4b5563;font:12px Arial,sans-serif}
        .description{white-space:pre-wrap;line-height:1.75;text-align:justify;margin:36px 0;min-height:180px}
        .file-frame{width:100%;height:90vh;border:0}.document-image{display:block;max-width:100%;max-height:85vh;margin:24px auto;object-fit:contain}
        .signatures{display:flex;justify-content:space-around;gap:40px;margin:80px 0 0;text-align:center;font:12px Arial,sans-serif}
        .signatures div{width:42%}.signatures span{display:block;border-top:1px solid #6b7280;margin-bottom:8px}.signatures small{display:block;color:#6b7280;margin-top:3px}
        @media print{.file-frame{height:100vh}}
      </style></head><body>
      ${isPdf ? body : `<header><h1>IGREJA EVANGÉLICA DE LUANDA</h1><p>SECRETARIA GERAL • REGISTRO CANÔNICO E ADMINISTRATIVO</p><p>Rua Comandante Gika, Luanda • Angola</p></header>
      <div class="meta">${escapeHtml(previewDoc.tipo || previewDoc.categoria || "Documento Oficial")} • ${escapeHtml(previewDoc.data || "Data não informada")}</div>
      <h2>${escapeHtml(previewDoc.titulo || "Documento")}</h2>${body}`}
      <script>window.onload=()=>setTimeout(()=>window.print(),500);window.onafterprint=()=>window.close();</script>
      </body></html>`);
    printWindow.document.close();
  };

  // Filtragem de Documentos
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      (doc.titulo && doc.titulo.toLowerCase().includes(searchDoc.toLowerCase())) ||
      (doc.autor && doc.autor.toLowerCase().includes(searchDoc.toLowerCase())) ||
      (doc.descricao && doc.descricao.toLowerCase().includes(searchDoc.toLowerCase())) ||
      (doc.tipo && doc.tipo.toLowerCase().includes(searchDoc.toLowerCase()));

    const docType = (doc.tipo || doc.categoria || "").toLowerCase();
    const matchesCategory =
      selectedCategory === "todos" || docType === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });
  const visibleEvents = upcomingEvents.filter(evt => {
    if (evt.origem === "escala") return canSchedules;
    if (evt.origem === "reuniao") return canMeetings;
    return canMeetings || canSchedules;
  });

  const getCategoryBadgeClass = (tipo) => {
    const t = String(tipo || "").toLowerCase();
    if (t.includes("ata")) return "bg-blue-100 text-blue-800 border-blue-200";
    if (t.includes("certidao") || t.includes("certidão")) return "bg-purple-100 text-purple-800 border-purple-200";
    if (t.includes("contrato")) return "bg-amber-100 text-amber-800 border-amber-200";
    if (t.includes("estatuto")) return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (t.includes("relatorio") || t.includes("relatório")) return "bg-indigo-100 text-indigo-800 border-indigo-200";
    if (t.includes("oficio") || t.includes("ofício")) return "bg-teal-100 text-teal-800 border-teal-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  const previewFileUrl = previewDoc?.file_url || previewDoc?.url || "";

  return (
    <div className="space-y-8">
      {/* ═══════════════ TOPO / CABEÇALHO ═══════════════ */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Secretaria Geral</h1>
          <p className="text-sm text-gray-600 mt-1">
            Gestão de reuniões oficiais, emissão de atas, pautas e arquivo digital de documentos da igreja.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {canMeetings && <Button
            className="bg-military hover:bg-military-dark text-white font-semibold shadow-sm gap-2"
            onClick={() => setIsScheduleOpen(true)}
          >
            <Calendar size={16} className="text-white" />
            <span className="text-white">Agendar Reunião</span>
          </Button>}
          {canDocuments && <Button
            className="bg-military hover:bg-military-dark text-white font-semibold shadow-sm gap-2"
            onClick={() => handleOpenDocModal()}
          >
            <Plus size={16} className="text-white" />
            <span className="text-white">Novo Documento</span>
          </Button>}
        </div>
      </div>

      {/* ═══════════════ PAINEL DE ALERTA DE EVENTOS PRÓXIMOS ═══════════════ */}
      <div className="bg-gradient-to-r from-emerald-950 via-military-dark to-emerald-900 rounded-3xl p-6 text-white shadow-lg border border-emerald-700/40 relative overflow-hidden">
        {/* Efeito decorativo sutil de fundo */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/15">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
                <Bell className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold tracking-tight text-white">
                    Painel de Alertas — Eventos & Reuniões Próximas
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-gray-950">
                    {visibleEvents.length} {visibleEvents.length === 1 ? "Próximo" : "Próximos"}
                  </span>
                </div>
                <p className="text-xs text-emerald-200/90 mt-0.5">
                  Compromissos oficiais, convocações de liderança e escalas dos próximos 15 dias.
                </p>
              </div>
            </div>

            {canMeetings && <Button
              size="sm"
              onClick={() => setIsScheduleOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/25 text-xs font-semibold self-start md:self-auto"
            >
              <Plus size={14} className="mr-1.5" /> Adicionar Pauta / Evento
            </Button>}
          </div>

          {/* Grade de Alertas Imediatos */}
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleEvents.map((evt) => {
              const isUrgent = evt.diffDays <= 2;
              const daysLabel =
                evt.diffDays === 0
                  ? "HOJE"
                  : evt.diffDays === 1
                  ? "AMANHÃ"
                  : `Em ${evt.diffDays} dias`;

              return (
                <div
                  key={evt.id}
                  className="bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/15 transition-all hover:border-emerald-300/40 flex flex-col justify-between group shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-100 border border-emerald-400/30">
                        {evt.tipoEvento || "Reunião"}
                      </span>
                      <span
                        className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                          isUrgent
                            ? "bg-amber-400 text-gray-950 animate-bounce"
                            : "bg-white/20 text-white"
                        }`}
                      >
                        {daysLabel}
                      </span>
                    </div>

                    <h3 className="font-bold text-white text-sm line-clamp-2 leading-snug group-hover:text-emerald-200 transition-colors">
                      {evt.assunto}
                    </h3>

                    {evt.descricao && (
                      <p className="text-xs text-emerald-100/80 mt-1 line-clamp-2">
                        {evt.descricao}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-emerald-200">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Clock size={13} className="text-emerald-300 shrink-0" />
                      <span>{evt.data} às {evt.hora || "18:00"}</span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedEvent(evt);
                        setIsEventDetailOpen(true);
                      }}
                      className="text-xs font-bold text-emerald-300 hover:text-white underline cursor-pointer inline-flex items-center gap-0.5"
                    >
                      Pauta <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══════════════ RESUMO E AÇÕES RÁPIDAS ═══════════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Card 1: Total Documentos */}
        {canDocuments && <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Documentos Arquivados</h2>
            <div className="w-10 h-10 rounded-2xl bg-green-50 text-military flex items-center justify-center">
              <FileCheck size={20} />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Acervo oficial de documentos, atas e certidões.</p>
          <div className="mt-5 text-4xl font-extrabold text-military">{documents.length}</div>
          <p className="text-xs text-gray-600 mt-2 truncate">
            Último: <strong className="text-gray-900">{documents[0]?.titulo || "Nenhum documento"}</strong>
          </p>
        </div>}

        {/* Card 2: Reuniões no Calendário */}
        {(canMeetings || canSchedules) && <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Reuniões & Escalas</h2>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Calendar size={20} />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Eventos monitorados pela secretaria.</p>
          <div className="mt-5 text-4xl font-extrabold text-amber-600">{visibleEvents.length}</div>
          <p className="text-xs text-gray-600 mt-2">
            Próximo evento: <strong className="text-gray-900">{visibleEvents[0]?.assunto || "Sem reuniões"}</strong>
          </p>
        </div>}

        {/* Card 3: Ações Rápidas (COM BOTÃO "VER ARQUIVO DE DOCUMENTOS" COM LETRA BRANCA) */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Ações Rápidas</h2>
            <p className="text-xs text-gray-500 mt-1">Acesso direto às tarefas centrais da secretaria.</p>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            {/* Botão "Ver Arquivo de Documentos" com LETRA BRANCA e ação de exibir a grelha de documentos */}
            {canDocuments && <Button
              className="bg-military hover:bg-military-dark text-white font-semibold py-2.5 px-4 rounded-xl shadow-sm flex items-center justify-center gap-2 transition cursor-pointer"
              onClick={() => {
                setViewMode("grelha");
                const el = document.getElementById("secao-documentos");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <LayoutGrid size={18} className="text-white shrink-0" />
              <span className="text-white font-bold text-sm tracking-wide">Ver Arquivo de Documentos</span>
            </Button>}

            {canMeetings && <Button
              variant="outline"
              className="border-gray-300 text-gray-800 hover:bg-gray-100 font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
              onClick={() => setIsScheduleOpen(true)}
            >
              <Clock size={16} className="text-gray-600" />
              <span>Agendar Nova Reunião</span>
            </Button>}
          </div>
        </div>
      </div>

      {/* ═══════════════ SEÇÃO PRINCIPAL DE DOCUMENTOS (GRELHA / TABELA) ═══════════════ */}
      {canDocuments ? <div id="secao-documentos" className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Cabeçalho da Seção com Filtros e Alternador de Modo */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-100 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-military" />
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                Arquivo Digital de Documentos
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Consulte e visualize em grelha ou tabela todas as atas, certidões, estatutos e relatórios oficiais.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Campo de Busca */}
            <div className="relative min-w-[220px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar documento..."
                value={searchDoc}
                onChange={(e) => setSearchDoc(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl border-gray-200"
              />
            </div>

            {/* Alternador de Visualização: Grelha vs Tabela */}
            <div className="inline-flex rounded-xl border border-gray-200 bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => setViewMode("grelha")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === "grelha"
                    ? "bg-military text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <LayoutGrid size={14} className={viewMode === "grelha" ? "text-white" : "text-gray-500"} />
                <span>Grelha</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("tabela")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === "tabela"
                    ? "bg-military text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <List size={14} className={viewMode === "tabela" ? "text-white" : "text-gray-500"} />
                <span>Tabela</span>
              </button>
            </div>

            {/* Botão Novo Documento */}
            <Button
              onClick={() => handleOpenDocModal()}
              className="bg-military hover:bg-military-dark text-white font-semibold text-xs h-9 px-3.5 rounded-xl gap-1.5 shadow-sm"
            >
              <Plus size={15} className="text-white" />
              <span className="text-white">Novo Documento</span>
            </Button>
          </div>
        </div>

        {/* Categorias / Filtros em Pílulas */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
          {[
            { key: "todos", label: "Todos os Documentos" },
            { key: "ata", label: "Atas" },
            { key: "certidao", label: "Certidões" },
            { key: "estatuto", label: "Estatutos" },
            { key: "relatorio", label: "Relatórios" },
            { key: "oficio", label: "Ofícios" },
            { key: "contrato", label: "Contratos" },
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3.5 py-1.5 rounded-full font-semibold transition cursor-pointer shrink-0 ${
                selectedCategory === cat.key
                  ? "bg-military text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* ═══════════════ MODO GRELHA (GRID DE DOCUMENTOS) ═══════════════ */}
        {viewMode === "grelha" ? (
          filteredDocuments.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-gray-200 rounded-3xl">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-base font-semibold text-gray-700">Nenhum documento encontrado.</p>
              <p className="text-xs text-gray-500 mt-1">Experimente mudar o filtro ou cadastrar um novo documento.</p>
              <Button
                onClick={() => handleOpenDocModal()}
                className="mt-4 bg-military hover:bg-military-dark text-white text-xs"
              >
                Cadastrar Documento
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDocuments.map((doc) => {
                const badgeClass = getCategoryBadgeClass(doc.tipo || doc.categoria);
                const hasFile = Boolean(doc.file_url || doc.url);

                return (
                  <div
                    key={doc.id}
                    className="bg-white border border-gray-200 hover:border-military/40 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Topo do Card */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className={`document-category-badge text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${badgeClass}`}
                        >
                          {doc.tipo || doc.categoria || "Documento"}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-gray-500">
                          <Calendar size={13} className="text-gray-400" />
                          <span>{doc.data || "Sem data"}</span>
                        </div>
                      </div>

                      {/* Ícone e Título */}
                      <div className="flex items-start gap-3 mt-2">
                        <div className="w-10 h-10 rounded-2xl bg-green-50 text-military flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <FileText size={20} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-military transition-colors">
                            {doc.titulo}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            Autor: <span className="text-gray-700 font-medium">{doc.autor || "Secretaria"}</span>
                          </p>
                        </div>
                      </div>

                      {/* Descrição resumida */}
                      {doc.descricao && (
                        <p className="text-xs text-gray-600 mt-3 line-clamp-2 leading-relaxed bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                          {doc.descricao}
                        </p>
                      )}
                    </div>

                    {/* Ações do Card */}
                    <div className="mt-5 pt-3.5 border-t border-gray-100 flex items-center justify-between gap-2">
                      {/* BOTÃO VISUALIZAR (Letra Branca, Ação de Pré-visualização Completa) */}
                      <Button
                        size="sm"
                        onClick={() => handlePreviewDocument(doc)}
                        className="bg-military hover:bg-military-dark text-white font-semibold text-xs px-3 py-1.5 h-8 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Eye size={14} className="text-white" />
                        <span className="text-white">Visualizar</span>
                      </Button>

                      <div className="flex items-center gap-1">
                        {hasFile && (
                          <a
                            href={doc.file_url || doc.url}
                            download={`${doc.titulo || "documento"}.pdf`}
                            target="_blank"
                            rel="noreferrer"
                            title="Baixar arquivo"
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-military transition"
                          >
                            <Download size={15} />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenDocModal(doc)}
                          title="Editar documento"
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition cursor-pointer"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDocument(doc.id, doc.titulo)}
                          title="Excluir documento"
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* ═══════════════ MODO TABELA ═══════════════ */
          <div className="overflow-x-auto border border-gray-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Título</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Autor</th>
                  <th className="py-3 px-4">Arquivo</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDocuments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      Nenhum documento encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredDocuments.map((doc) => {
                    const badgeClass = getCategoryBadgeClass(doc.tipo || doc.categoria);
                    return (
                      <tr key={doc.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-4 font-semibold text-gray-900">
                          {doc.titulo}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`document-category-badge px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass}`}>
                            {doc.tipo || doc.categoria}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{doc.data}</td>
                        <td className="py-3 px-4 text-gray-600">{doc.autor || "Secretaria"}</td>
                        <td className="py-3 px-4">
                          {/* Botão Visualizar na Tabela */}
                          <Button
                            size="sm"
                            onClick={() => handlePreviewDocument(doc)}
                            className="bg-military hover:bg-military-dark text-white font-semibold text-xs h-7 px-2.5 rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            <Eye size={13} className="text-white" />
                            <span className="text-white">Visualizar</span>
                          </Button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenDocModal(doc)}
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition cursor-pointer"
                              title="Editar"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteDocument(doc.id, doc.titulo)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition cursor-pointer"
                              title="Excluir"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div> : <div className="rounded-2xl border border-dashed bg-white p-8 text-center text-gray-500">Sem privilégio para consultar os documentos da Secretaria.</div>}

      {/* ═══════════════ MODAL DE PRÉ-VISUALIZAÇÃO ("VISUALIZAR") ═══════════════ */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[780px] max-h-[92vh] flex flex-col p-6 rounded-3xl">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <span
                  className={`document-category-badge text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getCategoryBadgeClass(
                    previewDoc?.tipo || previewDoc?.categoria
                  )}`}
                >
                  {previewDoc?.tipo || previewDoc?.categoria || "Documento Oficial"}
                </span>
                <DialogTitle className="text-xl font-extrabold text-gray-900 mt-2 truncate">
                  {previewDoc?.titulo || "Visualizador de Documento"}
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500 mt-1">
                  Autor: <strong className="text-gray-700">{previewDoc?.autor || "Secretaria Geral"}</strong> • Data:{" "}
                  <strong className="text-gray-700">{previewDoc?.data || "Não informada"}</strong>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Conteúdo do Documento */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {previewFileUrl ? (
              <DocumentPreviewContent fileUrl={previewFileUrl} title={previewDoc?.titulo} />
            ) : (
              /* Folha Timbrada Oficial da Igreja */
              <div className="bg-amber-50/20 border-2 border-dashed border-gray-200 rounded-2xl p-8 space-y-6 text-gray-800 font-serif shadow-inner">
                <div className="text-center border-b pb-4 border-gray-300">
                  <div className="text-2xl font-bold tracking-wider text-military font-sans">
                    IGREJA EVANGÉLICA DE LUANDA
                  </div>
                  <div className="text-xs uppercase tracking-widest text-gray-600 mt-1 font-sans font-semibold">
                    Secretaria Geral • Registro Canônico e Administrativo
                  </div>
                  <div className="text-[11px] text-gray-500 font-sans mt-0.5">
                    Rua Comandante Gika, Luanda • Angola
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-center">
                    <span className="text-xs uppercase font-sans font-bold text-gray-500 tracking-wider">
                      {previewDoc?.tipo || "Ata / Documento"}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 mt-1 font-sans">
                      {previewDoc?.titulo}
                    </h3>
                  </div>

                  <p className="text-sm leading-relaxed text-gray-700 indent-8 pt-4">
                    {previewDoc?.descricao ||
                      "Por meio deste instrumento lavrado pela Secretaria Geral da Igreja Evangélica de Luanda, certifica-se a conformidade e deliberação registrada em ata oficial desta instituição eclesiástica sob a supervisão do Conselho de Presbitério."}
                  </p>
                </div>

                <div className="pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-around gap-6 text-center font-sans text-xs">
                  <div>
                    <div className="w-48 border-b border-gray-400 mx-auto mb-1"></div>
                    <div className="font-bold text-gray-800">{previewDoc?.autor || "Secretário Geral"}</div>
                    <div className="text-[10px] text-gray-500">Secretaria da I.E.L.</div>
                  </div>
                  <div>
                    <div className="w-48 border-b border-gray-400 mx-auto mb-1"></div>
                    <div className="font-bold text-gray-800">Pastor Presidente</div>
                    <div className="text-[10px] text-gray-500">Conselho de Presbitério</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Rodapé de Ações do Modal */}
          <div className="border-t pt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrintDocument}
                className="text-xs gap-1.5"
              >
                <Printer size={14} /> Imprimir
              </Button>
              {previewFileUrl && (
                <a
                  href={previewFileUrl}
                  download={`${previewDoc.titulo || "documento"}.pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 transition"
                >
                  <Download size={14} /> Baixar Arquivo
                </a>
              )}
            </div>

            <Button
              className="bg-military hover:bg-military-dark text-white text-xs"
              onClick={() => setIsPreviewOpen(false)}
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══════════════ MODAL DE DETALHES DO EVENTO (PAUTA) ═══════════════ */}
      <Dialog open={isEventDetailOpen} onOpenChange={setIsEventDetailOpen}>
        <DialogContent className="sm:max-w-[500px] p-6 rounded-3xl">
          <DialogHeader className="border-b pb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 self-start">
              {selectedEvent?.tipoEvento || "Evento da Igreja"}
            </span>
            <DialogTitle className="text-xl font-bold text-gray-900 mt-2">
              {selectedEvent?.assunto}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-4 text-sm text-gray-700">
            <div className="flex items-center gap-3 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
              <Calendar className="text-military h-5 w-5 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Data e Horário</p>
                <p className="font-bold text-gray-900">{selectedEvent?.data} às {selectedEvent?.hora || "18:00"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
              <MapPin className="text-military h-5 w-5 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Local / Setor</p>
                <p className="font-bold text-gray-900">{selectedEvent?.local || "Templo Sede - Luanda"}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Pauta / Deliberações
              </p>
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 text-xs text-gray-600 leading-relaxed">
                {selectedEvent?.descricao || "Pauta regular de deliberação pastoral e administrativa."}
              </div>
            </div>
          </div>

          <div className="border-t pt-4 flex justify-end">
            <Button
              className="bg-military hover:bg-military-dark text-white text-xs"
              onClick={() => setIsEventDetailOpen(false)}
            >
              Concluído
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══════════════ MODAL AGENDAR REUNIÃO ═══════════════ */}
      <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
        <DialogContent className="sm:max-w-[480px] p-6 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">Agendar Reunião Oficial</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Insira os dados da reunião ou pauta para notificar a liderança e alimentar os alertas.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveMeeting} className="space-y-4 pt-3">
            <div className="space-y-1.5">
              <Label htmlFor="assunto" className="text-xs font-bold text-gray-700">Assunto / Pauta Principal</Label>
              <Input
                id="assunto"
                value={meetingData.assunto}
                onChange={(e) => setMeetingData({ ...meetingData, assunto: e.target.value })}
                placeholder="Ex: Reunião do Conselho de Presbitério"
                required
                className="rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="data" className="text-xs font-bold text-gray-700">Data</Label>
                <Input
                  id="data"
                  type="date"
                  value={meetingData.data}
                  onChange={(e) => setMeetingData({ ...meetingData, data: e.target.value })}
                  required
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="hora" className="text-xs font-bold text-gray-700">Horário</Label>
                <Input
                  id="hora"
                  type="time"
                  value={meetingData.hora}
                  onChange={(e) => setMeetingData({ ...meetingData, hora: e.target.value })}
                  required
                  className="rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="local" className="text-xs font-bold text-gray-700">Local da Reunião</Label>
              <Input
                id="local"
                value={meetingData.local}
                onChange={(e) => setMeetingData({ ...meetingData, local: e.target.value })}
                placeholder="Ex: Sala de Reuniões - Sede Luanda"
                className="rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="descricao" className="text-xs font-bold text-gray-700">Descrição / Pontos de Pauta</Label>
              <Input
                id="descricao"
                value={meetingData.descricao}
                onChange={(e) => setMeetingData({ ...meetingData, descricao: e.target.value })}
                placeholder="Breve descrição dos assuntos a serem deliberados"
                className="rounded-xl text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsScheduleOpen(false)} className="text-xs rounded-xl">
                Cancelar
              </Button>
              <Button type="submit" className="bg-military hover:bg-military-dark text-white text-xs font-bold rounded-xl">
                Salvar Reunião
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ═══════════════ MODAL NOVO / EDITAR DOCUMENTO ═══════════════ */}
      <Dialog open={isDocModalOpen} onOpenChange={setIsDocModalOpen}>
        <DialogContent className="sm:max-w-[500px] p-6 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              {editingDocId ? "Editar Documento" : "Arquivar Novo Documento"}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Cadastre atas, certidões, ofícios ou anexe arquivos em PDF ou imagem.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveDocument} className="space-y-4 pt-3">
            <div className="space-y-1.5">
              <Label htmlFor="doc_titulo" className="text-xs font-bold text-gray-700">Título do Documento</Label>
              <Input
                id="doc_titulo"
                value={docFormData.titulo}
                onChange={(e) => setDocFormData({ ...docFormData, titulo: e.target.value })}
                placeholder="Ex: Ata de Posse da Nova Diretoria"
                required
                className="rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="doc_tipo" className="text-xs font-bold text-gray-700">Tipo / Categoria</Label>
                <Select
                  value={docFormData.tipo}
                  onValueChange={(val) => setDocFormData({ ...docFormData, tipo: val })}
                >
                  <SelectTrigger id="doc_tipo" className="rounded-xl text-xs">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ata">Ata</SelectItem>
                    <SelectItem value="certidao">Certidão</SelectItem>
                    <SelectItem value="estatuto">Estatuto</SelectItem>
                    <SelectItem value="oficio">Ofício</SelectItem>
                    <SelectItem value="relatorio">Relatório</SelectItem>
                    <SelectItem value="contrato">Contrato</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="doc_data" className="text-xs font-bold text-gray-700">Data do Documento</Label>
                <Input
                  id="doc_data"
                  type="date"
                  value={docFormData.data}
                  onChange={(e) => setDocFormData({ ...docFormData, data: e.target.value })}
                  required
                  className="rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="doc_autor" className="text-xs font-bold text-gray-700">Autor / Responsável</Label>
              <Input
                id="doc_autor"
                value={docFormData.autor}
                onChange={(e) => setDocFormData({ ...docFormData, autor: e.target.value })}
                placeholder="Ex: Pb. Mama Djalo (Secretário)"
                className="rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="doc_desc" className="text-xs font-bold text-gray-700">Descrição / Resumo</Label>
              <Input
                id="doc_desc"
                value={docFormData.descricao}
                onChange={(e) => setDocFormData({ ...docFormData, descricao: e.target.value })}
                placeholder="Resumo das deliberações ou dados do documento"
                className="rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="doc_file" className="text-xs font-bold text-gray-700">Anexo (PDF ou Imagem)</Label>
              <Input
                id="doc_file"
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (loadEvent) => {
                      setDocFormData({ ...docFormData, file_url: loadEvent.target.result });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="rounded-xl text-xs cursor-pointer"
              />
              {docFormData.file_url && (
                <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                  <CheckCircle size={13} /> Arquivo carregado pronto para arquivamento.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsDocModalOpen(false)} className="text-xs rounded-xl">
                Cancelar
              </Button>
              <Button type="submit" className="bg-military hover:bg-military-dark text-white text-xs font-bold rounded-xl">
                {editingDocId ? "Atualizar" : "Arquivar Documento"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
