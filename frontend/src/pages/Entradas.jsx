import { useState, useEffect } from "react";
import { base44 } from "@/base44";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Search, Trash2, Edit } from "lucide-react";
import { usePermissions } from "@/lib/usePermissions";

export default function Entradas() {
  const { can, ready: permissionsReady } = usePermissions();
  const canView = permissionsReady && can("entradas.visualizar");
  const canEdit = permissionsReady && can("entradas.editar");
  const canDelete = permissionsReady && can("entradas.cancelar");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const result = await base44.db.get("Entrada");
      setEntries(result);
    } catch (e) {
      toast.error("Erro ao carregar as entradas.");
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = entries.filter((entry) =>
    [entry.rubrica, entry.valor, entry.data, entry.forma_pagamento, entry.descricao]
      .some((val) => String(val || "").toLowerCase().includes(search.toLowerCase()))
  );

  const groupedByDay = Object.values(
    filteredEntries.reduce((acc, entry) => {
      const dateKey = entry.data || "Sem data";
      if (!acc[dateKey]) {
        acc[dateKey] = { data: dateKey, total: 0, items: [] };
      }
      acc[dateKey].items.push(entry);
      acc[dateKey].total += Number(entry.valor || 0);
      return acc;
    }, {})
  ).sort((a, b) => (a.data < b.data ? 1 : -1));

  const handleOpenDialog = (entry = null) => {
    if (entry ? !canEdit : !(can("entradas.dizimos") || can("entradas.ofertas"))) return;
    if (entry) {
      setFormData(entry);
      setEditingId(entry.id);
    } else {
      setFormData({ rubrica: "Dízimos", valor: "", data: "", forma_pagamento: "dinheiro", descricao: "" });
      setEditingId(null);
    }
    setIsDialogOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (editingId ? !canEdit : !(formData.rubrica === "Ofertas" ? can("entradas.ofertas") : can("entradas.dizimos"))) return;
    try {
      if (editingId) {
        await base44.db.update("Entrada", editingId, formData);
        toast.success("Entrada atualizada com sucesso!");
      } else {
        await base44.db.create("Entrada", formData);
        toast.success("Entrada criada com sucesso!");
      }
      setIsDialogOpen(false);
      fetchEntries();
    } catch (e) {
      toast.error("Erro ao salvar a entrada.");
    }
  };

  const handleDelete = async (id) => {
    if (!canDelete) return;
    if (confirm("Tem certeza que deseja excluir esta entrada?")) {
      try {
        await base44.db.delete("Entrada", id);
        toast.success("Entrada excluída com sucesso!");
        fetchEntries();
      } catch (e) {
        toast.error("Erro ao excluir a entrada.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Entradas</h1>
          <p className="text-sm text-gray-600">Rubricas de Dízimos e Ofertas agrupadas por dia.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center bg-white p-2 rounded-md border max-w-sm w-full sm:w-auto">
            <Search className="h-4 w-4 text-gray-400 mr-2" />
            <Input
              placeholder="Buscar..."
              className="border-0 shadow-none focus-visible:ring-0"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {(can("entradas.dizimos") || can("entradas.ofertas")) && <Button onClick={() => handleOpenDialog()} className="bg-military hover:bg-military-dark">
            <Plus className="mr-2 h-4 w-4" /> Nova Entrada
          </Button>}
        </div>
      </div>

      {!canView ? (
        <div className="bg-white border rounded-md p-6 text-center text-gray-500">Você não possui privilégio para consultar as entradas.</div>
      ) : loading ? (
        <div className="bg-white border rounded-md p-6 text-center text-gray-500">Carregando entradas...</div>
      ) : groupedByDay.length === 0 ? (
        <div className="bg-white border rounded-md p-6 text-center text-gray-500">Nenhuma entrada encontrada.</div>
      ) : (
        <div className="space-y-6">
          {groupedByDay.map((group) => (
            <div key={group.data} className="bg-white border rounded-xl shadow-sm">
              <div className="flex flex-col gap-2 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">{group.data}</h2>
                  <p className="text-sm text-gray-500">Total do dia: XOF {group.total.toLocaleString()}</p>
                </div>
                <span className="inline-flex items-center rounded-full bg-military/10 px-3 py-1 text-sm font-semibold text-military-dark">
                  {group.items.length} item{group.items.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rubrica</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Forma de Pagamento</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.items.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{entry.rubrica}</TableCell>
                        <TableCell>XOF {Number(entry.valor || 0).toLocaleString()}</TableCell>
                        <TableCell>{entry.forma_pagamento}</TableCell>
                        <TableCell>{entry.descricao || "-"}</TableCell>
                        <TableCell className="text-right">
                          {canEdit && <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(entry)}>
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Button>}
                          {canDelete && <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar" : "Nova"} Entrada</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="rubrica">Rubrica</Label>
              <Select
                value={formData.rubrica || ""}
                onValueChange={(val) => setFormData({ ...formData, rubrica: val })}
              >
                <SelectTrigger id="rubrica">
                  <SelectValue placeholder="Selecione a rubrica" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dízimos">Dízimos</SelectItem>
                  <SelectItem value="Ofertas">Ofertas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor">Valor (XOF)</Label>
              <Input
                id="valor"
                type="number"
                value={formData.valor || ""}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data">Data</Label>
              <Input
                id="data"
                type="date"
                value={formData.data || ""}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="forma_pagamento">Forma de Pagamento</Label>
              <Select
                value={formData.forma_pagamento || ""}
                onValueChange={(val) => setFormData({ ...formData, forma_pagamento: val })}
              >
                <SelectTrigger id="forma_pagamento">
                  <SelectValue placeholder="Selecione a forma de pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="orange_money">Orange Money</SelectItem>
                  <SelectItem value="transferencia">Transferência Bancária</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                value={formData.descricao || ""}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-military hover:bg-military-dark">
                Salvar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
