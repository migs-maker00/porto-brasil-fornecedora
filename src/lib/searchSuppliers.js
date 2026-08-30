import { DIRECTORY, DIRECTORY_LIMIT } from "../data/directory"
import { TYPE_PRIORITY } from "./categories"
import { rootHost } from "./urlHost"

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

export function normalizeName(name) {
  return String(name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\b(ltda|eireli|epp|me|s\/a|sa)\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
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
      let productStatus = "nao_localizado"

      cats.forEach((cat) => {
        if ((supplier.categories || []).includes(cat)) {
          score += 4
          reasons.push(`Trabalha com ${cat.toLowerCase()}`)
        }
      })

      if (product && hay.includes(product)) {
        score += 5
        reasons.push(`Relacionado a ${parsed.product}`)
      }

      if (spec) {
        const hasSpec =
          (supplier.products || []).some((item) => item.toLowerCase().includes(spec)) ||
          hay.includes(spec) ||
          (supplier.evidence || []).some((e) =>
            `${e.value} ${e.source}`.toLowerCase().includes(spec),
          )
        if (hasSpec) {
          score += 6
          productStatus = "confirmado"
          reasons.push(
            supplier.origin === "web"
              ? `Produto ${parsed.spec} citado na fonte da pesquisa ao vivo`
              : `Produto ${parsed.spec} registrado na ficha`,
          )
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

      if (productStatus !== "confirmado" && (cats.some((c) => (supplier.categories || []).includes(c)) || brandHits.length)) {
        productStatus = "possivel"
        reasons.push(
          "Produto específico não localizado, porém a empresa atua na categoria/marca",
        )
      }

      if (supplier.b2b === true) {
        score += 2
        reasons.push("Atende empresas")
      }
      if (supplier.phone || supplier.email || supplier.website) {
        score += 1
        reasons.push("Possui canal comercial")
      }
      if (supplier.favorite || supplier.trusted) {
        score += 3
        reasons.push("Histórico da SS: marcado como frequente/confiável")
      }
      if (supplier.responsive) {
        score += 2
        reasons.push("Costuma responder")
      }
      if (supplier.problematic) {
        score -= 4
        reasons.push("Marcado internamente como problemático")
      }

      const prio = TYPE_PRIORITY[supplier.type] || 3
      score += prio === 1 ? 3 : prio === 2 ? 1 : 0

      return { supplier, score, reasons, brandHits, productStatus }
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return a.supplier.name.localeCompare(b.supplier.name)
    })
}

export function directoryAsSuppliers() {
  return DIRECTORY.map((item) => ({
    id: `dir-${item.slug}`,
    origin: "diretorio",
    favorite: false,
    trusted: false,
    responsive: false,
    problematic: false,
    lastContact: "",
    ...item,
  }))
}

function mergeInto(existing, incoming) {
  existing.evidence = [...(existing.evidence || []), ...(incoming.evidence || [])]
  existing.products = [...new Set([...(existing.products || []), ...(incoming.products || [])])]
  existing.brands = [...new Set([...(existing.brands || []), ...(incoming.brands || [])])]
  if (!existing.phone && incoming.phone) existing.phone = incoming.phone
  if (!existing.email && incoming.email) existing.email = incoming.email
  if (!existing.website && incoming.website) existing.website = incoming.website
  if (!existing.contactPage && incoming.contactPage) existing.contactPage = incoming.contactPage
}

export function mergeSupplierPools(localSuppliers, liveSuppliers = []) {
  const merged = []

  function take(s, origin) {
    const key = normalizeName(s.name)
    const host = rootHost(s.website)
    const existing = merged.find(
      (m) =>
        (key && normalizeName(m.name) === key) ||
        (host && rootHost(m.website) === host),
    )
    if (existing) {
      mergeInto(existing, s)
      return
    }
    merged.push({ ...s, origin: s.origin || origin })
  }

  localSuppliers.forEach((s) => take(s, "memoria"))
  directoryAsSuppliers().forEach((s) => take(s, "diretorio"))
  liveSuppliers.forEach((s) => take(s, "web"))

  return merged
}

export function rankWhoToContact(localSuppliers, parsed, liveSuppliers = [], limit = DIRECTORY_LIMIT) {
  const pool = mergeSupplierPools(localSuppliers, liveSuppliers)
  let ranked = matchSuppliers(pool, parsed)

  const minUseful = Math.min(12, limit)
  if (ranked.length < minUseful) {
    const used = new Set(ranked.map((row) => row.supplier.id))
    const extras = pool
      .filter((s) => !used.has(s.id))
      .filter((s) =>
        ["Distribuidor", "Distribuidor autorizado", "Fornecedor especializado", "Fabricante"].includes(
          s.type,
        ),
      )
      .slice(0, Math.max(0, minUseful - ranked.length))
      .map((supplier) => ({
        supplier,
        score: 1,
        brandHits: [],
        productStatus: "nao_localizado",
        reasons: [
          "Especialista conhecido no mercado industrial. O produto específico não foi localizado na ficha — confirmar com a empresa.",
        ],
      }))
    ranked = [...ranked, ...extras]
  }

  return ranked.slice(0, limit)
}

export function isDirectoryId(id) {
  return String(id || "").startsWith("dir-")
}

export function isWebId(id) {
  return String(id || "").startsWith("web-")
}

export function originLabel(origin) {
  if (origin === "memoria") return "Histórico da SS"
  if (origin === "web") return "Pesquisa ao vivo"
  return "Diretório oficial"
}

export function emptyField(value) {
  const v = String(value || "").trim()
  return v || "Não informado"
}

export function productStatusLabel(status) {
  if (status === "confirmado") return "Produto confirmado na ficha"
  if (status === "possivel") return "Fornecedor potencial"
  return "Produto não localizado na ficha"
}
