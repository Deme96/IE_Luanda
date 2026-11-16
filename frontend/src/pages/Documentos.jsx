import EntityCrudPage from "@/components/EntityCrudPage";

export default function Documentos() {
  const columns = [
    { key: "titulo", label: "Título" },
    { key: "tipo", label: "Tipo" },
    {
      key: "file_url",
      label: "Arquivo Anexado",
      render: (val, row) => {
        const href = row.file_url || row.url;
        if (!href || href === "#") return "Nenhum";
        const isDataPdf = href.startsWith("data:application/pdf");
        return (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline text-sm"
            {...(isDataPdf ? { download: "documento.pdf" } : {})}
          >
            Visualizar Documento
          </a>
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
    { name: "file_url", label: "Arquivo Local (Upload)", type: "file" },
    { name: "data", label: "Data do Documento", type: "date" },
    { name: "membro_id", label: "ID do Membro (opcional)" },
  ];

  const detailRender = (item) => {
    const href = item.file_url || item.url;
    if (!href || href === "#") return <div>Sem documento anexado.</div>;
    const isDataPdf = String(href).startsWith("data:application/pdf");
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">{item.titulo}</h3>
          <p className="text-sm text-gray-600">{item.categoria} — {item.data}</p>
        </div>
        <div>
          {isDataPdf ? (
            <>
              <a href={href} download="documento.pdf" className="text-blue-600 underline">Download PDF</a>
              <div className="mt-3">
                <iframe src={href} title="Preview Documento" className="w-full" style={{ height: 480, border: '1px solid #e5e7eb', borderRadius: 8 }} />
              </div>
            </>
          ) : (
            <>
              <a href={href} target="_blank" rel="noreferrer" className="text-blue-600 underline">Abrir Documento</a>
              <div className="mt-3">
                <iframe src={href} title="Preview Documento" className="w-full" style={{ height: 480, border: '1px solid #e5e7eb', borderRadius: 8 }} />
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return <EntityCrudPage title="Documentos" entityName="Documento" columns={columns} fields={fields} detailRender={detailRender} permissionKeys={{ view: "secretaria.atas_documentos", create: "secretaria.atas_documentos", edit: "secretaria.atas_documentos", delete: "secretaria.atas_documentos" }} />;
}
