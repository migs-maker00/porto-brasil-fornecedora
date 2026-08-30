export function buildQuoteMessage(process, company) {
  const p = process.parsed || {}
  const qty = p.quantity ? `${p.quantity} unidades de ` : ""
  const name = [p.product, p.spec].filter(Boolean).join(" ")
  const brands = p.brands?.length ? `\nMarca de preferência: ${p.brands.join(" ou ")}.` : ""

  return [
    "Prezados, boa tarde.",
    "",
    `Solicito cotação de ${qty}${name || process.rawNeed}.${brands}`,
    "",
    "Favor enviar preço para revenda, prazo de entrega, disponibilidade e formas de pagamento.",
    "",
    "Fico no aguardo.",
    "",
    "Atenciosamente,",
    company?.legalName || "SS Comércio e Serviços",
    company?.cnpj ? `CNPJ ${company.cnpj}` : "",
  ]
    .filter((line) => line !== undefined)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
}
