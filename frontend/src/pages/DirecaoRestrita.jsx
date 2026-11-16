import EntityCrudPage from "@/components/EntityCrudPage";

export default function DirecaoRestrita() {
  const columns = [
    { key: "membro", label: "Membro" },
    { key: "cargo", label: "Cargo" },
    { key: "data_posse", label: "Data de Posse" },
    { key: "status", label: "Status" },
  ];

  const fields = [
    { name: "nome", label: "Título do Cargo", required: true },
    { name: "membro", label: "Nome do Membro", required: true },
    {
      name: "cargo",
      label: "Cargo",
      type: "select",
      required: true,
      options: [
        { label: "Pastor Presidente", value: "Pastor Presidente" },
        { label: "Vice-Presidente", value: "Vice-Presidente" },
        { label: "Secretário Geral", value: "Secretário Geral" },
        { label: "Tesoureiro", value: "Tesoureiro" },
        { label: "Diretor de Patrimônio", value: "Diretor de Patrimônio" },
        { label: "Diretor de Evangelismo", value: "Diretor de Evangelismo" },
        { label: "Diretor de Educação Cristã", value: "Diretor de Educação Cristã" },
        { label: "Outro", value: "Outro" },
      ],
    },
    { name: "data_posse", label: "Data de Posse", type: "date" },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Ativo", value: "ativo" },
        { label: "Inativo", value: "inativo" },
        { label: "Afastado", value: "afastado" },
      ],
    },
    { name: "observacoes", label: "Observações" },
  ];

  return <EntityCrudPage title="Direção Restrita" entityName="DirecaoRestrita" columns={columns} fields={fields} permissionKeys={{ view: "conselho.direcao_restrita", create: "conselho.direcao_restrita", edit: "conselho.direcao_restrita", delete: "conselho.direcao_restrita" }} />;
}
