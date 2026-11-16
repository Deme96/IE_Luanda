import EntityCrudPage from "@/components/EntityCrudPage";

export default function Ofertas() {
  const columns = [
    { key: "tipo", label: "Tipo" },
    { key: "valor", label: "Valor", render: (val) => `XOF ${Number(val || 0).toFixed(2)}` },
    { key: "data", label: "Data" },
  ];

  const fields = [
    { name: "valor", label: "Valor (XOF)", type: "number", required: true },
    { name: "data", label: "Data", type: "date", required: true },
    {
      name: "tipo",
      label: "Tipo de Oferta",
      type: "select",
      options: [
        { label: "Culto", value: "culto" },
        { label: "Missão", value: "missao" },
        { label: "Construção", value: "construcao" },
        { label: "Especial", value: "especial" },
      ],
    },
    { name: "descricao", label: "Descrição" },
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
  ];

  return <EntityCrudPage title="Ofertas" entityName="Oferta" columns={columns} fields={fields} permissionKeys={{ view: "entradas.visualizar", create: "entradas.ofertas", edit: "entradas.editar", delete: "entradas.cancelar" }} />;
}
