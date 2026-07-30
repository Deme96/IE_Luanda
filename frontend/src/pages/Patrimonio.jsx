import EntityCrudPage from "@/components/EntityCrudPage";

export default function Patrimonio() {
  const columns = [
    { key: "nome", label: "Nome" },
    { key: "categoria", label: "Categoria" },
    { key: "valor_estimado", label: "Valor Estimado (XOF)", render: (val) => `XOF ${Number(val || 0).toLocaleString()}` },
    { key: "estado", label: "Estado" },
  ];

  const fields = [
    { name: "nome", label: "Nome do Patrimônio", required: true },
    {
      name: "categoria",
      label: "Categoria",
      type: "select",
      required: true,
      options: [
        { label: "Imóvel", value: "Imovel" },
        { label: "Veículo", value: "Veiculo" },
        { label: "Equipamento", value: "Equipamento" },
        { label: "Mobiliário", value: "Mobiliario" },
        { label: "Instrumento Musical", value: "Instrumento" },
        { label: "Outro", value: "Outro" },
      ],
    },
    { name: "valor_estimado", label: "Valor Estimado (XOF)", required: true },
    { name: "data_aquisicao", label: "Data de Aquisição", type: "date" },
    {
      name: "estado",
      label: "Estado de Conservação",
      type: "select",
      options: [
        { label: "Ótimo", value: "Ótimo" },
        { label: "Bom", value: "Bom" },
        { label: "Regular", value: "Regular" },
        { label: "Ruim", value: "Ruim" },
        { label: "Inutilizável", value: "Inutilizável" },
      ],
    },
    { name: "descricao", label: "Descrição / Observações" },
  ];

  return <EntityCrudPage title="Patrimônio" entityName="Patrimonio" columns={columns} fields={fields} />;
}
