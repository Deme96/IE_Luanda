import EntityCrudPage from "@/components/EntityCrudPage";

export default function Departamentos() {
  const columns = [
    { key: "nome", label: "Nome" },
    { key: "responsavel", label: "Responsável" },
    { key: "descricao", label: "Descrição" },
  ];

  const fields = [
    { name: "nome", label: "Nome do Departamento", required: true },
    { name: "responsavel", label: "Responsável" },
    { name: "descricao", label: "Descrição" },
  ];

  return <EntityCrudPage title="Departamentos" entityName="Departamento" columns={columns} fields={fields} />;
}
