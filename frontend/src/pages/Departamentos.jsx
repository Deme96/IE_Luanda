import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/base44";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { usePermissions } from "@/lib/usePermissions";
import {
  Plus, Search, Trash2, Edit, Users, UserPlus,
  UserX, Phone, Mail, ShieldCheck, Layers, ChevronRight
} from "lucide-react";

export default function Departamentos() {
  const { can, ready: permissionsReady } = usePermissions();
  const canView = permissionsReady && can("departamentos.visualizar");
  const canManage = permissionsReady && can("departamentos.gerenciar");
  const canDelete = permissionsReady && can("departamentos.excluir");
  const canViewMembers = permissionsReady && can("departamentos.ver_membros");
  const canLinkMembers = permissionsReady && can("departamentos.vincular_membros");
  const [departamentos, setDepartamentos] = useState([]);
  const [membros, setMembros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Estado para Criar/Editar Departamento
  const [isDeptDialogOpen, setIsDeptDialogOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deptForm, setDeptForm] = useState({ nome: "", responsavel: "", descricao: "" });

  // Estado para Visualização de Membros do Departamento
  const [selectedDept, setSelectedDept] = useState(null);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedMemberToAdd, setSelectedMemberToAdd] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [deps, mems] = await Promise.all([
        base44.db.get("Departamento"),
        base44.db.get("Membro")
      ]);
      setDepartamentos(deps || []);
      setMembros(mems || []);
    } catch (e) {
      toast.error("Erro ao carregar dados: " + (e.message || e));
    } finally {
      setLoading(false);
    }
  };

  // Helper para verificar se um membro pertence a um departamento
  const isMemberInDept = (member, dept) => {
    if (!member || !member.departamento || !dept) return false;
    const depVal = String(member.departamento).trim().toLowerCase();
    const deptId = String(dept.id).trim().toLowerCase();
    const deptNome = String(dept.nome).trim().toLowerCase();
    return depVal === deptId || depVal === deptNome;
  };

  // Obter lista de membros de um departamento
  const getMembersOfDept = (dept) => {
    if (!dept) return [];
    return membros.filter(m => isMemberInDept(m, dept));
  };

  // Departamentos filtrados pela busca
  const filteredDepartments = useMemo(() => {
    const q = search.toLowerCase();
    return departamentos.filter(d => 
      (d.nome && d.nome.toLowerCase().includes(q)) ||
      (d.responsavel && d.responsavel.toLowerCase().includes(q)) ||
      (d.descricao && d.descricao.toLowerCase().includes(q))
    );
  }, [departamentos, search]);

  // Membros do departamento selecionado com filtro de busca
  const deptMembers = useMemo(() => {
    if (!selectedDept) return [];
    const allDeptMems = getMembersOfDept(selectedDept);
    if (!memberSearch) return allDeptMems;
    const q = memberSearch.toLowerCase();
    return allDeptMems.filter(m => 
      (m.nome && m.nome.toLowerCase().includes(q)) ||
      (m.email && m.email.toLowerCase().includes(q)) ||
      (m.cargo && m.cargo.toLowerCase().includes(q))
    );
  }, [selectedDept, membros, memberSearch]);

  // Membros disponíveis que NÃO estão neste departamento
  const availableMembersToAdd = useMemo(() => {
    if (!selectedDept) return [];
    return membros.filter(m => !isMemberInDept(m, selectedDept));
  }, [selectedDept, membros]);

  // Abertura do formulário de departamento
  const handleOpenDeptDialog = (dept = null) => {
    if (!canManage) return;
    if (dept) {
      setEditingDept(dept);
      setDeptForm({
        nome: dept.nome || "",
        responsavel: dept.responsavel || "",
        descricao: dept.descricao || ""
      });
    } else {
      setEditingDept(null);
      setDeptForm({ nome: "", responsavel: "", descricao: "" });
    }
    setIsDeptDialogOpen(true);
  };

  const handleSaveDept = async (e) => {
    e.preventDefault();
    if (!canManage) return;
    if (!deptForm.nome.trim()) {
      toast.error("O nome do departamento é obrigatório.");
      return;
    }
    try {
      if (editingDept) {
        await base44.db.update("Departamento", editingDept.id, deptForm);
        toast.success("Departamento atualizado com sucesso!");
      } else {
        await base44.db.create("Departamento", deptForm);
        toast.success("Departamento cadastrado com sucesso!");
      }
      setIsDeptDialogOpen(false);
      loadData();
    } catch (e) {
      toast.error("Erro ao salvar departamento: " + e.message);
    }
  };

  const handleDeleteDept = async (dept) => {
    if (!canDelete) return;
    const memCount = getMembersOfDept(dept).length;
    const confirmMsg = memCount > 0
      ? `Este departamento possui ${memCount} membro(s) vinculado(s). Tem certeza que deseja excluir?`
      : `Deseja realmente excluir o departamento "${dept.nome}"?`;

    if (window.confirm(confirmMsg)) {
      try {
        await base44.db.delete("Departamento", dept.id);
        toast.success("Departamento excluído com sucesso.");
        loadData();
      } catch (e) {
        toast.error("Erro ao excluir departamento: " + e.message);
      }
    }
  };

  // Abrir Modal de Membros do Departamento
  const handleViewMembers = (dept) => {
    if (!canViewMembers && !canLinkMembers) return;
    setSelectedDept(dept);
    setMemberSearch("");
    setSelectedMemberToAdd("");
    setIsMembersModalOpen(true);
  };

  // Vincular Membro ao Departamento
  const handleAddMemberToDept = async () => {
    if (!canLinkMembers || !selectedMemberToAdd || !selectedDept) return;
    try {
      await base44.db.update("Membro", selectedMemberToAdd, {
        departamento: selectedDept.nome
      });
      toast.success("Membro vinculado ao departamento com sucesso!");
      setSelectedMemberToAdd("");
      await loadData();
    } catch (e) {
      toast.error("Erro ao vincular membro: " + e.message);
    }
  };

  // Desvincular Membro do Departamento
  const handleRemoveMemberFromDept = async (member) => {
    if (!canLinkMembers) return;
    if (window.confirm(`Deseja desvincular ${member.nome} do departamento ${selectedDept.nome}?`)) {
      try {
        await base44.db.update("Membro", member.id, {
          departamento: ""
        });
        toast.success("Membro desvinculado com sucesso.");
        await loadData();
      } catch (e) {
        toast.error("Erro ao desvincular membro: " + e.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <Layers className="h-8 w-8 text-military" /> Departamentos
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Gerencie os ministérios, sociedades internas e visualize os membros pertencentes a cada departamento.
          </p>
        </div>
        {canManage && <Button onClick={() => handleOpenDeptDialog()} className="bg-military hover:bg-military-dark gap-2 shadow-sm">
          <Plus size={18} /> Novo Departamento
        </Button>}
      </div>

      {/* Barra de Pesquisa */}
      <div className="flex items-center bg-white p-2.5 rounded-xl border border-gray-200 max-w-md shadow-sm">
        <Search className="h-4 w-4 text-gray-400 mr-2 shrink-0" />
        <Input
          placeholder="Buscar por nome, responsável ou descrição..."
          className="border-0 shadow-none focus-visible:ring-0 p-0 text-sm h-auto"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tabela de Departamentos */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/80">
            <TableRow>
              <TableHead className="font-bold text-gray-700">Departamento</TableHead>
              <TableHead className="font-bold text-gray-700">Responsável / Líder</TableHead>
              <TableHead className="font-bold text-gray-700">Descrição</TableHead>
              <TableHead className="font-bold text-gray-700 text-center">Membros Pertencentes</TableHead>
              <TableHead className="font-bold text-gray-700 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!canView ? (
              <TableRow><TableCell colSpan={5} className="text-center py-12 text-gray-500">Você não possui privilégio para visualizar departamentos.</TableCell></TableRow>
            ) : loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                  Carregando departamentos...
                </TableCell>
              </TableRow>
            ) : filteredDepartments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                  Nenhum departamento encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredDepartments.map((dept) => {
                const count = getMembersOfDept(dept).length;
                return (
                  <TableRow key={dept.id} className="hover:bg-gray-50/70 transition-colors">
                    <TableCell className="font-semibold text-gray-900">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-military" />
                        {dept.nome}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {dept.responsavel || <span className="text-gray-400 italic">Não informado</span>}
                    </TableCell>
                    <TableCell className="text-gray-600 max-w-xs truncate">
                      {dept.descricao || <span className="text-gray-400 italic">—</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      {(canViewMembers || canLinkMembers) && <button
                        onClick={() => handleViewMembers(dept)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-50 text-green-800 hover:bg-green-100 border border-green-200 transition shadow-sm"
                        title="Clique para visualizar todos os membros deste departamento"
                      >
                        <Users size={14} className="text-military" />
                        <span>{count} {count === 1 ? "membro" : "membros"}</span>
                        <ChevronRight size={13} className="opacity-70" />
                      </button>}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      {(canViewMembers || canLinkMembers) && <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewMembers(dept)}
                        className="text-military border-military/30 hover:bg-military/10 text-xs font-semibold gap-1 mr-1"
                      >
                        <Users size={14} /> Ver Membros
                      </Button>}
                      {canManage && <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDeptDialog(dept)}
                        className="hover:bg-blue-50 text-blue-600 h-8 w-8"
                        title="Editar departamento"
                      >
                        <Edit size={16} />
                      </Button>}
                      {canDelete && <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteDept(dept)}
                        className="hover:bg-red-50 text-red-600 h-8 w-8"
                        title="Excluir departamento"
                      >
                        <Trash2 size={16} />
                      </Button>}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MODAL: Visualização e Gestão de Membros Pertencentes ao Departamento */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Dialog open={isMembersModalOpen} onOpenChange={setIsMembersModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-6 rounded-2xl">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Users className="text-military h-6 w-6" />
                  Membros: {selectedDept?.nome}
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500 mt-1">
                  Responsável: <strong>{selectedDept?.responsavel || "Não atribuído"}</strong> • Total de vinculados: <strong>{getMembersOfDept(selectedDept).length}</strong>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Seção Superior: Adicionar Membro + Barra de Filtro */}
          <div className="py-3 space-y-3 border-b">
            {/* Vincular Membro */}
              {canLinkMembers && <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
                <div className="flex-1">
                <Select value={selectedMemberToAdd} onValueChange={setSelectedMemberToAdd}>
                  <SelectTrigger className="bg-white border-gray-300 text-sm">
                    <SelectValue placeholder="Selecione um membro para vincular a este departamento..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMembersToAdd.length === 0 ? (
                      <SelectItem value="none" disabled>Todos os membros já estão vinculados</SelectItem>
                    ) : (
                      availableMembersToAdd.map(m => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.nome} {m.departamento ? `(Atualmente: ${m.departamento})` : "(Sem departamento)"}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                </div>
                <Button
                  onClick={handleAddMemberToDept}
                  disabled={!selectedMemberToAdd || selectedMemberToAdd === "none"}
                  className="bg-military hover:bg-military-dark text-white text-xs font-semibold gap-1.5 shrink-0"
                >
                  <UserPlus size={15} /> Vincular Membro
                </Button>
              </div>}

            {/* Filtro de Busca Interno */}
            <div className="flex items-center bg-white px-3 py-1.5 rounded-lg border border-gray-200">
              <Search className="h-4 w-4 text-gray-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Filtrar membros listados por nome, e-mail ou cargo..."
                className="w-full text-xs outline-none bg-transparent"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Lista de Membros Pertencentes */}
          <div className="flex-1 overflow-y-auto py-2 space-y-2 min-h-[220px] max-h-[360px]">
            {deptMembers.length === 0 ? (
              <div className="text-center py-12 text-gray-400 space-y-2">
                <Users className="h-10 w-10 mx-auto opacity-30" />
                <p className="text-sm font-medium">Nenhum membro encontrado neste departamento.</p>
                <p className="text-xs text-gray-400">Use a caixa acima para vincular membros da igreja a este departamento.</p>
              </div>
            ) : (
              deptMembers.map(member => (
                <div 
                  key={member.id} 
                  className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/80 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 text-military flex items-center justify-center font-bold text-sm shrink-0">
                      {member.nome.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">{member.nome}</p>
                        {member.cargo && (
                          <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded font-medium">
                            {member.cargo}
                          </span>
                        )}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          member.status === "ativo" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"
                        }`}>
                          {member.status || "Ativo"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        {member.email && (
                          <span className="flex items-center gap-1">
                            <Mail size={12} className="text-gray-400" /> {member.email}
                          </span>
                        )}
                        {member.telefone && (
                          <span className="flex items-center gap-1">
                            <Phone size={12} className="text-gray-400" /> {member.telefone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {canLinkMembers && <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMemberFromDept(member)}
                    className="text-red-600 hover:bg-red-50 text-xs gap-1 font-medium"
                    title="Desvincular membro do departamento"
                  >
                    <UserX size={15} /> Desvincular
                  </Button>}
                </div>
              ))
            )}
          </div>

          {/* Rodapé do Modal */}
          <div className="border-t pt-3 flex justify-between items-center text-xs text-gray-500">
            <span>Mostrando {deptMembers.length} membro(s)</span>
            <Button variant="outline" size="sm" onClick={() => setIsMembersModalOpen(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MODAL: Criar / Editar Departamento */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Dialog open={isDeptDialogOpen} onOpenChange={setIsDeptDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>{editingDept ? "Editar Departamento" : "Novo Departamento"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveDept} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Departamento *</Label>
              <Input
                id="nome"
                placeholder="Ex: Jovens, Senhoras, Louvor, Infantil..."
                value={deptForm.nome}
                onChange={(e) => setDeptForm({ ...deptForm, nome: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="responsavel">Responsável / Líder</Label>
              <Input
                id="responsavel"
                placeholder="Ex: Pr. João, Ir. Maria..."
                value={deptForm.responsavel}
                onChange={(e) => setDeptForm({ ...deptForm, responsavel: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <textarea
                id="descricao"
                rows={3}
                placeholder="Descreva as atividades e propósito deste ministério..."
                className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-military"
                value={deptForm.descricao}
                onChange={(e) => setDeptForm({ ...deptForm, descricao: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsDeptDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-military hover:bg-military-dark">
                Salvar Departamento
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
