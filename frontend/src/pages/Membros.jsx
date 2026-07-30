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
  ];

  return <EntityCrudPage title="Membros" entityName="Membro" columns={columns} fields={fields} />;
}
