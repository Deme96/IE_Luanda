import EntityCrudPage from "@/components/EntityCrudPage";

export default function Documentos() {
  const columns = [
    { key: "titulo", label: "Título" },
    { key: "tipo", label: "Tipo" },
    { key: "file_url", label: "Arquivo Anexado", render: (val) => val ? <span className="text-blue-600 underline text-sm">{val}</span> : "Nenhum" },
    { key: "data", label: "Data" },
  ];

  const fields = [
    { name: "titulo", label: "Título", required: true },
    {
      name: "tipo",
      label: "Tipo",
      type: "select",
      required: true,
      options: [
        { label: "Ata", value: "ata" },
        { label: "Certidão", value: "certidao" },
        { label: "Contrato", value: "contrato" },
        { label: "Ofício", value: "oficio" },
        { label: "Relatório", value: "relatorio" },
        { label: "Outro", value: "outro" },
      ],
    },
    { name: "descricao", label: "Descrição" },
    { name: "file_url", label: "Arquivo Local (Upload)", type: "file" },
    { name: "data", label: "Data do Documento", type: "date" },
    { name: "membro_id", label: "ID do Membro (opcional)" },
  ];

  return <EntityCrudPage title="Documentos" entityName="Documento" columns={columns} fields={fields} />;
}
