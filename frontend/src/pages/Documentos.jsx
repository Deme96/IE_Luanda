import EntityCrudPage from "@/components/EntityCrudPage";
import { DocumentPreviewButton } from "@/components/DocumentPreviewDialog";

export default function Documentos() {
  const columns = [
    { key: "titulo", label: "Título" },
    { key: "tipo", label: "Tipo" },
    {
      key: "file_url",
      label: "Arquivo Anexado",
      render: (val, row) => {
        const href = row.file_url || row.url || val;
        if (!href || href === "#") return "Nenhum";
        return (
          <DocumentPreviewButton
            fileUrl={href}
            title={row.titulo || "Documento"}
            fileName={row.titulo || "documento"}
            className="text-blue-700"
          />
        );
      },
    },
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
    { name: "file_url", label: "Arquivo Local (Upload)", type: "file", accept: "application/pdf,image/*" },
    { name: "data", label: "Data do Documento", type: "date" },
    { name: "membro_id", label: "ID do Membro (opcional)" },
  ];

  const detailRender = (item) => {
    const href = item.file_url || item.url;
    if (!href || href === "#") return <div>Sem documento anexado.</div>;
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">{item.titulo}</h3>
          <p className="text-sm text-gray-600">{item.categoria} — {item.data}</p>
        </div>
        <DocumentPreviewButton
          fileUrl={href}
          title={item.titulo || "Documento"}
          fileName={item.titulo || "documento"}
        />
      </div>
    );
  };

  return <EntityCrudPage title="Documentos" entityName="Documento" columns={columns} fields={fields} detailRender={detailRender} permissionKeys={{ view: "secretaria.atas_documentos", create: "secretaria.atas_documentos", edit: "secretaria.atas_documentos", delete: "secretaria.atas_documentos" }} />;
}
