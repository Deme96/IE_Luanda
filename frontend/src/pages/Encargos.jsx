import EntityCrudPage from "@/components/EntityCrudPage";
import { Badge } from "@/components/ui/badge";

export default function Encargos() {
  const columns = [
    { key: "descricao", label: "Descrição" },
    { key: "categoria", label: "Categoria" },
    { key: "valor", label: "Valor", render: (val) => `XOF ${Number(val || 0).toFixed(2)}` },
    { key: "data", label: "Data" },
    { 
      key: "status", 
      label: "Status",
      render: (val) => {
        const colors = {
          pago: "bg-green-100 text-green-800 hover:bg-green-200",
          pendente: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
          cancelado: "bg-red-100 text-red-800 hover:bg-red-200"
        };
        return <Badge className={colors[val] || "bg-gray-100 text-gray-800"}>{val}</Badge>;
      }
    },
  ];

  const fields = [
    { name: "descricao", label: "Descrição", required: true },
    { name: "valor", label: "Valor (XOF)", type: "number", required: true },
    { name: "data", label: "Data de Vencimento/Pagamento", type: "date", required: true },
    {
      name: "categoria",
      label: "Categoria",
      type: "select",
      options: [
        { label: "Manutenção", value: "manutencao" },
        { label: "Água", value: "agua" },
        { label: "Luz", value: "luz" },
        { label: "Internet", value: "internet" },
        { label: "Salário", value: "salario" },
        { label: "Imposto", value: "imposto" },
        { label: "Material", value: "material" },
        { label: "Evento", value: "evento" },
        { label: "Outro", value: "outro" },
      ],
    },
    { name: "fornecedor", label: "Fornecedor" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Pago", value: "pago" },
        { label: "Pendente", value: "pendente" },
        { label: "Cancelado", value: "cancelado" },
      ],
    },
  ];

  return <EntityCrudPage title="Encargos" entityName="Encargo" columns={columns} fields={fields} />;
}
