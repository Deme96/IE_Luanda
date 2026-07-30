import EntityCrudPage from "@/components/EntityCrudPage";
import { Badge } from "@/components/ui/badge";

export default function IgrejasFilhadas() {
  const columns = [
    { key: "nome", label: "Nome da Congregação" },
    { key: "cidade", label: "Cidade" },
    { key: "pastor", label: "Pastor Responsável" },
    { 
      key: "status", 
      label: "Status",
      render: (val) => (
        <Badge className={val === 'ativa' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
          {val}
        </Badge>
      )
    },
  ];

  const fields = [
    { name: "nome", label: "Nome da Congregação", required: true },
    { name: "endereco", label: "Endereço Completo" },
    { name: "cidade", label: "Cidade" },
    { name: "pastor", label: "Pastor Responsável" },
    { name: "data_fundacao", label: "Data de Fundação", type: "date" },
    { name: "telefone", label: "Telefone" },
    { name: "email", label: "E-mail", type: "email" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Ativa", value: "ativa" },
        { label: "Inativa", value: "inativa" },
      ],
    },
  ];

  return <EntityCrudPage title="Igrejas Filiadas" entityName="IgrejaFilhada" columns={columns} fields={fields} />;
}
