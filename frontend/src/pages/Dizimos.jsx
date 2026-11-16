import EntityCrudPage from "@/components/EntityCrudPage";

export default function Dizimos() {
  const columns = [
    { key: "nome_membro", label: "Membro" },
    { key: "valor", label: "Valor", render: (val) => `XOF ${Number(val || 0).toFixed(2)}` },
    { key: "data", label: "Data" },
    { key: "forma_pagamento", label: "Forma de Pagamento" },
  ];

  const fields = [
    { name: "nome_membro", label: "Nome do Membro", required: true },
    { name: "membro_id", label: "ID do Membro" },
    { name: "valor", label: "Valor (XOF)", type: "number", required: true },
    { name: "data", label: "Data", type: "date", required: true },
    {
      name: "forma_pagamento",
      label: "Forma de Pagamento",
      type: "select",
      options: [
        { label: "Dinheiro", value: "dinheiro" },
        { label: "Orange Money", value: "orange_money" },
        { label: "Transferência Bancária", value: "transferencia" },
      ],
    },
    { name: "observacao", label: "Observação" },
  ];

  return <EntityCrudPage title="Dízimos" entityName="Dizimo" columns={columns} fields={fields} permissionKeys={{ view: "entradas.visualizar", create: "entradas.dizimos", edit: "entradas.editar", delete: "entradas.cancelar" }} />;
}
