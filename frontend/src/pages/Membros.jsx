import { useState, useEffect } from "react";
import { base44 } from "@/base44";
import EntityCrudPage from "@/components/EntityCrudPage";

export default function Membros() {
  const [departamentos, setDepartamentos] = useState([]);

  useEffect(() => {
    async function loadDepartamentos() {
      const deps = await base44.db.get("Departamento");
      setDepartamentos(deps);
    }
    loadDepartamentos();
  }, []);

  const columns = [
    { key: "nome", label: "Nome" },
    { key: "email", label: "E-mail" },
    { key: "telefone", label: "Telefone" },
    { key: "departamento", label: "Departamento" },
    { key: "status", label: "Status", render: (val) => {
      const colors = {
        ativo: "text-emerald-700 bg-emerald-100",
        inativo: "text-gray-600 bg-gray-100",
        afastado: "text-amber-700 bg-amber-100",
        disciplina: "text-red-700 bg-red-100",
      };
      return <span className={`px-2 py-1 rounded-full text-xs font-bold ${colors[val] || ""}`}>{val || "—"}</span>;
    }},
    { key: "cargo", label: "Cargo" },
    {
      key: "pdf_document",
      label: "Documento",
      render: (val) => {
        if (!val) return "—";
        const isDataPdf = String(val).startsWith("data:application/pdf");
        return (
          <a href={val} target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm" {...(isDataPdf ? { download: "documento_membro.pdf" } : {})}>
            Ver PDF
          </a>
        );
      },
    },
  ];

  const depOptions = departamentos.map(d => ({ label: d.nome, value: d.nome }));

  const fields = [
    { name: "nome", label: "Nome Completo", required: true },
    { name: "email", label: "E-mail", type: "email" },
    { name: "telefone", label: "Telefone" },
    { name: "data_nascimento", label: "Data de Nascimento", type: "date" },
    { name: "endereco", label: "Endereço" },
    { name: "cidade", label: "Cidade" },
    {
      name: "estado_civil",
      label: "Estado Civil",
      type: "select",
      options: [
        { label: "Solteiro", value: "solteiro" },
        { label: "Casado", value: "casado" },
        { label: "Divorciado", value: "divorciado" },
        { label: "Viúvo", value: "viuvo" },
      ],
    },
    {
      name: "departamento",
      label: "Departamento",
      type: "select",
      options: depOptions.length > 0 ? depOptions : [{ label: "Nenhum cadastrado", value: "" }],
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Ativo", value: "ativo" },
        { label: "Inativo", value: "inativo" },
        { label: "Afastado", value: "afastado" },
        { label: "Disciplina", value: "disciplina" },
      ],
    },
    { name: "cargo", label: "Cargo (opcional)" },
    { name: "pdf_document", label: "Documento do Membro (PDF)", type: "file", className: "sm:col-span-2" },
  ];

  const renderMemberDetails = (member, { can }) => (
    <div className="space-y-3 text-sm text-gray-700">
      <p><strong>Nome:</strong> {member.nome}</p>
      <p><strong>E-mail:</strong> {member.email}</p>
      <p><strong>Telefone:</strong> {member.telefone}</p>
      <p><strong>Departamento:</strong> {member.departamento || "—"}</p>
      <p><strong>Status:</strong> {member.status || "—"}</p>
      <p><strong>Cargo:</strong> {member.cargo || "—"}</p>
      <p><strong>Data de Nascimento:</strong> {member.data_nascimento || "—"}</p>
      <p><strong>Endereço:</strong> {member.endereco || "—"}</p>
      <p><strong>Cidade:</strong> {member.cidade || "—"}</p>
      <p><strong>Estado Civil:</strong> {member.estado_civil || "—"}</p>
      {can("membros.documentos") && <div>
        <strong>Documento:</strong>
        {member.pdf_document ? (
          <div className="mt-2">
            {String(member.pdf_document).startsWith("data:application/pdf") ? (
              <>
                <a href={member.pdf_document} target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm" download="documento_membro.pdf">Download PDF</a>
                <div className="mt-3">
                  <iframe src={member.pdf_document} title="Preview PDF" className="w-full" style={{ height: 420, border: '1px solid #e5e7eb', borderRadius: 8 }} />
                </div>
              </>
            ) : (
              <>
                <a href={member.pdf_document} target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm">Abrir PDF</a>
                <div className="mt-3">
                  <iframe src={member.pdf_document} title="Preview PDF" className="w-full" style={{ height: 420, border: '1px solid #e5e7eb', borderRadius: 8 }} />
                </div>
              </>
            )}
          </div>
        ) : (
          <div>Sem documento anexado.</div>
        )}
      </div>}
    </div>
  );

  return <EntityCrudPage title="Membros" entityName="Membro" columns={columns} fields={fields} detailRender={renderMemberDetails} permissionKeys={{ view: "membros.visualizar", create: "membros.cadastrar", edit: "membros.editar", delete: "membros.excluir" }} fieldPermissions={{ pdf_document: "membros.documentos" }} formDialogClassName="w-[94vw] max-w-[640px] h-[90dvh] max-h-[640px] flex flex-col overflow-hidden" formFieldsClassName="grid grid-cols-1 sm:grid-cols-2 content-start gap-4 overflow-x-hidden px-1 pb-1" />;
}
