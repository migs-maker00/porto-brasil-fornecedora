function money(value) {
  const n = Number(String(value).replace(/\./g, "").replace(",", "."))
  return Number.isFinite(n) ? n : null
}

export function analyzeProposals(proposals, suppliers) {
  const rows = proposals.filter((p) => p.price || p.leadDays || p.payment)
  if (!rows.length) {
    return "Ainda não há propostas registradas para comparar."
  }

  const withPrice = rows
    .map((p) => ({ ...p, n: money(p.price) }))
    .filter((p) => p.n != null)
    .sort((a, b) => a.n - b.n)

  const withLead = rows
    .filter((p) => p.leadDays !== "" && p.leadDays != null)
    .slice()
    .sort((a, b) => Number(a.leadDays) - Number(b.leadDays))

  const name = (id) => suppliers.find((s) => s.id === id)?.name || "Fornecedor"

  const parts = [`Foram registradas ${rows.length} proposta(s).`]

  if (withPrice.length) {
    const low = withPrice[0]
    parts.push(`${name(low.supplierId)} apresentou o menor preço informado (R$ ${low.price}).`)
  }
  if (withLead.length) {
    const fast = withLead[0]
    parts.push(`${name(fast.supplierId)} informou o menor prazo (${fast.leadDays} dia(s)).`)
  }

  const credit = rows.find((p) => /dia|28|21|14|prazo/i.test(p.payment || ""))
  if (credit) {
    parts.push(
      `${name(credit.supplierId)} informou condição de pagamento a prazo (${credit.payment}).`,
    )
  }

  parts.push(
    "A SS apresenta as alternativas. A decisão fica com o cliente.",
  )
  return parts.join(" ")
}
