import { TYPE_PRIORITY } from "./categories"

function textOf(supplier) {
  return [
    supplier.name,
    supplier.type,
    ...(supplier.categories || []),
    ...(supplier.brands || []),
    ...(supplier.products || []),
    supplier.notes,
  ]
    .join(" ")
    .toLowerCase()
}

export function matchSuppliers(suppliers, parsed) {
  const spec = (parsed.spec || "").toLowerCase()
  const product = (parsed.product || "").toLowerCase()
  const brands = (parsed.brands || []).map((b) => b.toLowerCase())
  const cats = parsed.categories || []

  return suppliers
    .map((supplier) => {
      const hay = textOf(supplier)
      const reasons = []
      let score = 0

      cats.forEach((cat) => {
        if ((supplier.categories || []).includes(cat)) {
          score += 4
          reasons.push(`Trabalha com ${cat.toLowerCase()}`)
        }
      })

      if (product && hay.includes(product.toLowerCase())) {
        score += 5
        reasons.push(`Relacionado a ${parsed.product}`)
      }

      if (spec) {
        const hasSpec = (supplier.products || []).some((item) =>
          item.toLowerCase().includes(spec),
        )
        if (hasSpec) {
          score += 6
          reasons.push(`Produto ${parsed.spec} registrado na ficha`)
        }
      }

      const brandHits = (supplier.brands || []).filter((b) =>
        brands.includes(b.toLowerCase()),
      )
      if (brandHits.length) {
        score += 8
        reasons.push(`Comercializa ${brandHits.join(", ")}`)
      } else if (brands.length && (supplier.brands || []).length) {
        score += 1
        reasons.push("Outras marcas na ficha — pode ter alternativa")
      }

      if (supplier.b2b === true) {
        score += 2
        reasons.push("Atende empresas")
      }
      if (supplier.phone || supplier.email || supplier.website) {
        score += 1
        reasons.push("Possui canal comercial")
      }
      if (supplier.favorite) {
        score += 3
        reasons.push("Fornecedor frequente da SS")
      }

      const prio = TYPE_PRIORITY[supplier.type] || 3
      score += prio === 1 ? 3 : prio === 2 ? 1 : 0

      return { supplier, score, reasons, brandHits }
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      if (a.supplier.favorite !== b.supplier.favorite) return a.supplier.favorite ? -1 : 1
      return a.supplier.name.localeCompare(b.supplier.name)
    })
}

export function emptyField(value) {
  const v = String(value || "").trim()
  return v || "Não informado"
}
