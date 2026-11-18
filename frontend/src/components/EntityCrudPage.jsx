import { useState, useEffect } from "react";
import { base44 } from "@/base44";
import { hasPermission } from "@/lib/permissions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Search, Trash2, Edit, Eye } from "lucide-react";

export default function EntityCrudPage({ title, entityName, columns, fields, detailRender, permissionKeys = {}, fieldPermissions = {}, editFieldPermissions = {}, formDialogClassName = "sm:max-w-[425px]", formFieldsClassName = "space-y-4" }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchData();
    base44.auth.getSession().then(setCurrentUser);
  }, [entityName]);

  const can = (action) => {
    const required = permissionKeys[action];
    if (!required) return true;
    return (Array.isArray(required) ? required : [required]).some(key => hasPermission(currentUser, key));
  };
  const canViewField = (fieldKey) => !fieldPermissions[fieldKey] || hasPermission(currentUser, fieldPermissions[fieldKey]);

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
    Object.entries(item)
      .filter(([key]) => canViewField(key))
      .some(([, val]) => String(val).toLowerCase().includes(search.toLowerCase()))
  );

  const handleOpenDialog = (item = null) => {
    if (!can(item ? "edit" : "create")) return;
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
    if (!can(editingId ? "edit" : "create")) return;
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
      toast.error(`Erro ao salvar: ${e.message || "verifique a conexão com a API."}`);
    }
  };

  const handleDelete = async (id) => {
    if (!can("delete")) return;
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

  const handleOpenDetails = (item) => {
    setDetailItem(item);
    setIsDetailDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
        {can("create") && (
          <Button onClick={() => handleOpenDialog()} className="bg-military hover:bg-military-dark">
            <Plus className="mr-2 h-4 w-4" /> Novo {title}
          </Button>
        )}
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
              {columns.filter(col => canViewField(col.key)).map((col) => (
                <TableHead key={col.key}>{col.label}</TableHead>
              ))}
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!can("view") ? (
              <TableRow>
                  <TableCell colSpan={columns.filter(col => canViewField(col.key)).length + 1} className="text-center py-8 text-gray-500">
                  Você não possui privilégio para visualizar estes registros.
                </TableCell>
              </TableRow>
            ) : loading ? (
              <TableRow>
                  <TableCell colSpan={columns.filter(col => canViewField(col.key)).length + 1} className="text-center py-8">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                  <TableCell colSpan={columns.filter(col => canViewField(col.key)).length + 1} className="text-center py-8 text-gray-500">
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((row) => (
                <TableRow key={row.id}>
                  {columns.filter(col => canViewField(col.key)).map((col) => (
                    <TableCell key={col.key}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    {detailRender && can("view") && (
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDetails(row)}>
                      <Eye className="h-4 w-4 text-gray-600" />
                    </Button>
                  )}
                  {can("edit") && <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(row)}>
                      <Edit className="h-4 w-4 text-blue-600" />
                    </Button>}
                    {can("delete") && <Button variant="ghost" size="icon" onClick={() => handleDelete(row.id)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className={formDialogClassName}>
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar" : "Novo"} {title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="flex min-h-0 flex-1 flex-col pt-3">
            <div className={`min-h-0 flex-1 overflow-y-auto ${formFieldsClassName}`}>
              {fields.filter(field => canViewField(field.name) && (!editingId || !editFieldPermissions[field.name] || hasPermission(currentUser, editFieldPermissions[field.name]))).map((field) => (
              <div key={field.name} className={`space-y-2 ${field.className || ""}`}>
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
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (loadEvent) => {
                          const dataUrl = loadEvent.target.result;
                          setFormData({ ...formData, [field.name]: dataUrl });
                        };
                        reader.readAsDataURL(file);
                      }
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
            </div>
            <div className="mt-4 flex shrink-0 justify-end gap-2 border-t pt-4">
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
      {detailRender && (
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Detalhes de {title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {detailItem ? detailRender(detailItem, { can: hasPermission.bind(null, currentUser) }) : <p>Carregando...</p>}
            </div>
            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                Fechar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
