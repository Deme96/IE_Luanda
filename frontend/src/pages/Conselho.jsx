import EntityCrudPage from "@/components/EntityCrudPage";

export default function Conselho() {
  const columns = [
    { key: "nome", label: "Nome" },
    { key: "cargo", label: "Cargo" },
    { key: "status", label: "Status" },
  ];

  const fields = [
    { name: "nome", label: "Nome", required: true },
    { name: "membro_id", label: "ID do Membro" },
    {
      name: "cargo",
      label: "Cargo",
      type: "select",
      required: true,
      options: [
        { label: "Presidente", value: "presidente" },
        { label: "Vice-Presidente", value: "vice_presidente" },
        { label: "Secretário", value: "secretario" },
        { label: "Tesoureiro", value: "tesoureiro" },
        { label: "Conselheiro", value: "conselheiro" },
      ],
    },
    { name: "data_inicio", label: "Data de Início", type: "date" },
    { name: "data_fim", label: "Data de Fim", type: "date" },
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

  return <EntityCrudPage title="Conselho Presbiteral" entityName="ConselhoPresbiterio" columns={columns} fields={fields} />;
}
