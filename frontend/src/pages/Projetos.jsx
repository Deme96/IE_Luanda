import EntityCrudPage from "@/components/EntityCrudPage";
import { Badge } from "@/components/ui/badge";

export default function Projetos() {
  const columns = [
    { key: "nome", label: "Nome do Projeto" },
    { key: "orcamento", label: "Orçamento", render: (val) => `XOF ${Number(val || 0).toFixed(2)}` },
    { key: "valor_arrecadado", label: "Arrecadado", render: (val) => `XOF ${Number(val || 0).toFixed(2)}` },
    { 
      key: "status", 
      label: "Status",
      render: (val) => {
        const colors = {
          planejado: "bg-blue-100 text-blue-800",
          em_andamento: "bg-yellow-100 text-yellow-800",
          concluido: "bg-green-100 text-green-800",
          cancelado: "bg-red-100 text-red-800"
        };
        return <Badge className={colors[val] || "bg-gray-100"}>{val}</Badge>;
      }
    },
  ];

  const fields = [
    { name: "nome", label: "Nome do Projeto", required: true },
    { name: "descricao", label: "Descrição" },
    { name: "data_inicio", label: "Data de Início", type: "date" },
    { name: "data_fim", label: "Data de Fim", type: "date" },
    { name: "orcamento", label: "Orçamento Previsto (XOF)", type: "number" },
    { name: "valor_arrecadado", label: "Valor Arrecadado (XOF)", type: "number" },
    { name: "responsavel", label: "Responsável" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Planejado", value: "planejado" },
        { label: "Em andamento", value: "em_andamento" },
        { label: "Concluído", value: "concluido" },
        { label: "Cancelado", value: "cancelado" },
      ],
    },
  ];

  return <EntityCrudPage title="Projetos Missionários" entityName="Projeto" columns={columns} fields={fields} />;
}
