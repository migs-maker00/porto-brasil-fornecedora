export const STATUSES = [
  { id: "pesquisando", label: "Pesquisando fornecedores" },
  { id: "encontrados", label: "Fornecedores encontrados" },
  { id: "selecionados", label: "Fornecedores selecionados" },
  { id: "enviada", label: "Cotação enviada" },
  { id: "aguardando", label: "Aguardando resposta" },
  { id: "recebidas", label: "Propostas recebidas" },
  { id: "analise", label: "Em análise" },
  { id: "apresentado", label: "Apresentado ao cliente" },
  { id: "aprovado", label: "Aprovado" },
  { id: "encerrado", label: "Encerrado" },
]

export function statusLabel(id) {
  return STATUSES.find((s) => s.id === id)?.label || id
}

export function isOpenStatus(id) {
  return id !== "aprovado" && id !== "encerrado"
}
