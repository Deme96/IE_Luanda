import EntityCrudPage from "@/components/EntityCrudPage";

export default function Lideres() {
  const columns = [
    { key: "nome", label: "Nome" },
    { key: "cargo", label: "Cargo" },
    { key: "status", label: "Status" },
  ];

  const fields = [
    { name: "nome", label: "Nome do Líder", required: true },
    { name: "membro_id", label: "ID do Membro Relacionado" },
    {
      name: "cargo",
      label: "Cargo",
      type: "select",
      required: true,
      options: [
        { label: "Pastor", value: "pastor" },
        { label: "Presbítero", value: "presbitero" },
        { label: "Diácono", value: "diacono" },
        { label: "Líder de Célula", value: "lider_celula" },
        { label: "Coordenador", value: "coordenador" },
      ],
    },
    { name: "data_inicio", label: "Data de Início", type: "date" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Ativo", value: "ativo" },
        { label: "Inativo", value: "inativo" },
      ],
    },
  ];

  return <EntityCrudPage title="Líderes" entityName="Lider" columns={columns} fields={fields} permissionKeys={{ view: "conselho.visualizar", create: "conselho.gerenciar", edit: "conselho.gerenciar", delete: "conselho.excluir" }} />;
}
