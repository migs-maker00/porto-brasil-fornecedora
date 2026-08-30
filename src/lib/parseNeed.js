import { CATEGORIES } from "./categories"

const BRANDS = [
  "SKF",
  "NSK",
  "FAG",
  "NTN",
  "TIMKEN",
  "KOYO",
  "NACHI",
  "INA",
  "CATERPILLAR",
  "CAT",
  "CUMMINS",
  "PARKER",
  "BOSCH",
  "REXROTH",
  "HYDAC",
  "DRESSER",
  "WARTSILA",
  "MAN",
]

const PRODUCT_RULES = [
  { test: /rolamentos?/i, product: "Rolamento", category: "Rolamentos" },
  { test: /bomba\s*hidr/i, product: "Bomba hidráulica", category: "Hidráulica" },
  { test: /anel de veda/i, product: "Anel de vedação", category: "Hidráulica" },
  { test: /junta dresser/i, product: "Junta Dresser", category: "Hidráulica" },
  { test: /filtro/i, product: "Filtro", category: "Consumíveis" },
  { test: /l[aâ]mpadas?/i, product: "Lâmpada", category: "Elétrica" },
  { test: /parafuso/i, product: "Parafuso", category: "Ferragens" },
  { test: /mangueira/i, product: "Mangueira", category: "Hidráulica" },
  { test: /bomba/i, product: "Bomba", category: "Hidráulica" },
  { test: /motor/i, product: "Motor", category: "Motores" },
  { test: /ferramenta/i, product: "Ferramenta", category: "Ferramentas" },
  { test: /v[aá]lvula/i, product: "Válvula", category: "Hidráulica" },
]

const CATEGORY_HINTS = [
  [/navio|embarca[cç][aã]o|n[aá]utic|bordo|comandante|capit[aã]o/i, "Náutica"],
  [/hidr[aá]ulic/i, "Hidráulica"],
  [/el[eé]tric|l[aâ]mpad|cabo/i, "Elétrica"],
  [/rolamento|bearing/i, "Rolamentos"],
  [/motor|caterpillar|cummins/i, "Motores"],
  [/manuten[cç][aã]o/i, "Materiais de manutenção"],
  [/mec[aâ]nic/i, "Mecânica"],
  [/equipamento/i, "Equipamentos"],
]

export function parseNeed(text) {
  const raw = String(text || "").trim()
  const brands = BRANDS.filter((brand) => new RegExp(`\\b${brand}\\b`, "i").test(raw))

  const qtyMatch =
    raw.match(
      /\b(\d{1,5}(?:[.,]\d+)?)\s*(?:unidades?|pe[cç]as?|p[cç]s?|und)\b/i,
    ) ||
    raw.match(
      /\b(\d{1,4})\s+(?:rolamentos?|bombas?|l[aâ]mpadas?|filtros?|parafusos?|mangueiras?|an[eé]is|v[aá]lvulas?|pe[cç]as?)\b/i,
    )

  const codeMatch = raw.match(/\b(\d{4}(?:-\d+)?)\b/)
  const sealMatch = raw.match(/\b(ZZ|2RS|2Z|RS|Z)\b/i)
  const clearanceMatch = raw.match(/\b(C[2-5])\b/i)

  const rule = PRODUCT_RULES.find((item) => item.test.test(raw))
  const product = rule?.product || firstPhrase(raw)
  const categories = new Set()
  if (rule?.category) categories.add(rule.category)
  CATEGORY_HINTS.forEach(([re, cat]) => {
    if (re.test(raw)) categories.add(cat)
  })
  if (!categories.size) categories.add("Peças")

  const missing = suggestMissing(raw, product)
  const appMatch = raw.match(/(?:sistema|aplica[cç][aã]o|para o|para a)\s+([^.,;]+)/i)
  const urgency = /urgent/i.test(raw) ? "urgente" : /prioridade alta|\balta\b/i.test(raw) ? "alta" : "normal"

  return {
    raw,
    product,
    code: codeMatch ? codeMatch[1] : "",
    seal: sealMatch ? sealMatch[1].toUpperCase() : "",
    clearance: clearanceMatch ? clearanceMatch[1].toUpperCase() : "",
    quantity: qtyMatch ? qtyMatch[1].replace(",", ".") : "",
    brands,
    categories: [...categories].filter((c) => CATEGORIES.includes(c)),
    missing,
    application: appMatch ? appMatch[1].trim().slice(0, 80) : "",
    urgency,
    spec: [codeMatch?.[1], sealMatch?.[1]?.toUpperCase(), clearanceMatch?.[1]?.toUpperCase()]
      .filter(Boolean)
      .join(" "),
  }
}

function firstPhrase(raw) {
  const cleaned = raw
    .replace(/^(preciso de|precisamos de|cota[cç][aã]o de|quero)\s+/i, "")
    .split(/[,.]/)[0]
    .trim()
  return cleaned.slice(0, 90) || "Material não classificado"
}

function suggestMissing(raw, product) {
  const missing = []
  if (/bomba/i.test(product) || /bomba/i.test(raw)) {
    if (!/modelo/i.test(raw)) missing.push("modelo")
    if (!/aplica/i.test(raw)) missing.push("aplicação")
    if (!/press[aã]o/i.test(raw)) missing.push("pressão")
    if (!/vaz[aã]o/i.test(raw)) missing.push("vazão")
    if (!BRANDS.some((b) => new RegExp(`\\b${b}\\b`, "i").test(raw))) missing.push("fabricante")
  }
  if (/filtro/i.test(raw) && !/\b\d{4,}\b/.test(raw) && !/c[oó]digo/i.test(raw)) {
    missing.push("código")
    missing.push("modelo do motor")
  }
  return missing
}

export function searchQueries(parsed) {
  const spec = (parsed.spec || parsed.product || "").trim()
  const product = parsed.product || "material"
  const queries = []

  if (spec) {
    queries.push(`${spec} fornecedor`)
    queries.push(`${spec} distribuidor`)
    queries.push(`${spec} atacado`)
    queries.push(`${spec} revenda`)
    queries.push(`${spec} ${product} industrial`)
  }

  parsed.categories.forEach((cat) => {
    queries.push(`distribuidor ${cat} Brasil`)
  })

  if (parsed.brands.length) {
    parsed.brands.forEach((brand) => {
      queries.push(`distribuidor ${brand} ${product} Brasil`)
      queries.push(`${brand} distribuidor autorizado`)
      if (spec) queries.push(`${spec} ${brand} distribuidor`)
    })
  } else {
    queries.push(`${product} ${spec} fornecedor B2B`.trim())
  }

  return [...new Set(queries.filter(Boolean))].slice(0, 12)
}
