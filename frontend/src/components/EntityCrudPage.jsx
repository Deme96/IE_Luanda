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

export default function EntityCrudPage({ title, entityName, columns, fields }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [entityName]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await base44.db.get(entityName);
      setData(result);
    } catch (e) {
      toast.error("Erro ao carregar os dados.");
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter((item) =>
    Object.values(item).some((val) => String(val).toLowerCase().includes(search.toLowerCase()))
  );

  const handleOpenDialog = (item = null) => {
    if (item) {
      setFormData(item);
      setEditingId(item.id);
    } else {
      setFormData({});
      setEditingId(null);
    }
    setIsDialogOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await base44.db.update(entityName, editingId, formData);
        toast.success(`${title} atualizado com sucesso!`);
      } else {
        await base44.db.create(entityName, formData);
        toast.success(`${title} criado com sucesso!`);
      }
      setIsDialogOpen(false);
      fetchData();
    } catch (e) {
      toast.error("Erro ao salvar.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Tem certeza que deseja excluir?")) {
      try {
        await base44.db.delete(entityName, id);
        toast.success(`${title} excluído com sucesso!`);
        fetchData();
      } catch (e) {
        toast.error("Erro ao excluir.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
        <Button onClick={() => handleOpenDialog()} className="bg-military hover:bg-military-dark">
          <Plus className="mr-2 h-4 w-4" /> Novo {title}
        </Button>
      </div>

      <div className="flex items-center bg-white p-2 rounded-md border max-w-sm">
        <Search className="h-4 w-4 text-gray-400 mr-2" />
        <Input
          placeholder="Buscar..."
          className="border-0 shadow-none focus-visible:ring-0"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key}>{col.label}</TableHead>
              ))}
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="text-center py-8">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="text-center py-8 text-gray-500">
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(row)}>
                      <Edit className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(row.id)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar" : "Novo"} {title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-4">
            {fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name}>{field.label}</Label>
                {field.type === "select" ? (
                  <Select
                    value={formData[field.name] || ""}
                    onValueChange={(val) => setFormData({ ...formData, [field.name]: val })}
                  >
                    <SelectTrigger id={field.name}>
                      <SelectValue placeholder={`Selecione ${field.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === "file" ? (
                  <Input
                    id={field.name}
                    type="file"
                    onChange={(e) => {
                      // Simulação de upload salvando o nome do arquivo (mock)
                      const file = e.target.files[0];
                      if(file) setFormData({ ...formData, [field.name]: file.name });
                    }}
                    required={field.required && !formData[field.name]}
                  />
                ) : (
                  <Input
                    id={field.name}
                    type={field.type || "text"}
                    value={formData[field.name] || ""}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    required={field.required}
                  />
                )}
              </div>
            ))}
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
