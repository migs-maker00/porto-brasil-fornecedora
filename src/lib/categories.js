export const CATEGORIES = [
  "Hidráulica",
  "Elétrica",
  "Mecânica",
  "Rolamentos",
  "Ferragens",
  "Ferramentas",
  "Náutica",
  "Motores",
  "Equipamentos",
  "Consumíveis",
  "Peças",
  "Materiais de manutenção",
]

export const SUPPLIER_TYPES = [
  "Distribuidor",
  "Distribuidor autorizado",
  "Fabricante",
  "Importador",
  "Revendedor",
  "Fornecedor especializado",
  "Loja industrial",
]

export const TYPE_PRIORITY = {
  "Distribuidor autorizado": 1,
  Distribuidor: 1,
  Fabricante: 1,
  Importador: 2,
  "Fornecedor especializado": 2,
  "Loja industrial": 2,
  Revendedor: 2,
}

export const CONFIDENCE = {
  confirmado: "Confirmado",
  possivel: "Possível — confirmar com fornecedor",
  nao_informado: "Não informado",
}
