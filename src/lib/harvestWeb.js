import { nameFromHost, rootHost } from "./urlHost.js"

const SKIP =
  /mercadolivre|mercadolibre|amazon\.|shopee\.|americanas\.|magazineluiza|aliexpress|olx\.|youtube\.|facebook\.|instagram\.|tiktok\.|pinterest\.|wikipedia\.|google\.|bing\.|duckduckgo\./i

const OFFICIAL_FOREIGN =
  /skf\.com|nsk\.com|schaeffler\.|timken\.com|parker\.com|boschrexroth|hydac\.com|cat\.com|cummins\.com|wartsila\.com|man-es\.com|weg\.net|siemens\.com|se\.com/i

function usefulUrl(url) {
  if (SKIP.test(url)) return false
  if (/\.com\.br(\/|$)/i.test(url)) return true
  if (OFFICIAL_FOREIGN.test(url)) return true
  return false
}

function specMentioned(blob, spec) {
  if (!spec) return false
  const compact = (s) => String(s).toLowerCase().replace(/[\s\-_/.]/g, "")
  if (compact(blob).includes(compact(spec))) return true
  const code = String(spec).match(/\d{4}/)
  return Boolean(code && blob.includes(code[0]))
}

const UA =
  "Mozilla/5.0 (compatible; SSComercioPesquisa/1.0; +https://porto-brasil-fornecedora.vercel.app/)"

function classifyType(title, snippet) {
  const t = `${title} ${snippet}`.toLowerCase()
  if (/distribuidor autorizado|concession[aá]ria/.test(t)) return "Distribuidor autorizado"
  if (/distribuid/.test(t)) return "Distribuidor"
  if (/fabricante|manufacturer/.test(t)) return "Fabricante"
  if (/importador/.test(t)) return "Importador"
  if (/atacad|revenda/.test(t)) return "Revendedor"
  return "Fornecedor especializado"
}

function classifySource(url, title, snippet) {
  const t = `${url} ${title} ${snippet}`.toLowerCase()
  if (/skf\.com|nsk\.com|schaeffler\.|parker\.com|boschrexroth|hydac\.com|cat\.com|cummins\.com/.test(t)) {
    return "fabricante"
  }
  if (/distribuid/.test(t)) return "distribuidor"
  if (/cat[aá]logo|loja\./.test(t)) return "catalogo"
  return "outra"
}

function decodeHtml(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x2F;/g, "/")
}

function unwrapUrl(href) {
  try {
    const u = new URL(href, "https://example.com")
    const uddg = u.searchParams.get("uddg")
    if (uddg) return decodeURIComponent(uddg)
    const u3 = u.searchParams.get("u")
    if (u3 && /^https?:/.test(u3)) return u3
    if (u.protocol === "http:" || u.protocol === "https:") return u.href
  } catch {
    /* ignore */
  }
  return href
}

function extractPhone(text) {
  const m = String(text || "").match(/(?:\+55\s*)?(?:\(?\d{2}\)?\s*)?(?:9\d{4}|\d{4})[-\s]?\d{4}/)
  return m ? m[0].trim() : ""
}

function extractEmail(text) {
  const m = String(text || "").match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i)
  if (!m) return ""
  if (/example\.|email\.com|dominio\./i.test(m[0])) return ""
  return m[0].toLowerCase()
}

export function parseDuckHtml(html) {
  const rows = []
  const re =
    /<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?(?:class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/(?:a|td|span)>)/gi
  let m
  while ((m = re.exec(html))) {
    rows.push({
      url: unwrapUrl(decodeHtml(m[1])),
      title: decodeHtml(m[2].replace(/<[^>]+>/g, "")).trim(),
      snippet: decodeHtml(m[3].replace(/<[^>]+>/g, "")).trim(),
    })
  }
  return rows
}

export function parseBingHtml(html) {
  const rows = []
  const re =
    /<li class="b_algo"[\s\S]*?<h2>\s*<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/gi
  let m
  while ((m = re.exec(html))) {
    rows.push({
      url: unwrapUrl(decodeHtml(m[1])),
      title: decodeHtml(m[2].replace(/<[^>]+>/g, "")).trim(),
      snippet: decodeHtml(m[3].replace(/<[^>]+>/g, "")).trim(),
    })
  }
  return rows
}

async function fetchText(url, timeoutMs = 8000) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "User-Agent": UA, Accept: "text/html" },
      redirect: "follow",
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.text()
  } finally {
    clearTimeout(timer)
  }
}

async function searchDuck(query) {
  const html = await fetchText(
    `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
  )
  return parseDuckHtml(html)
}

async function searchBing(query) {
  const html = await fetchText(`https://www.bing.com/search?q=${encodeURIComponent(query)}`)
  return parseBingHtml(html)
}

function toSupplier(hit, parsed, queriedAt) {
  const url = hit.url
  if (!url || !/^https?:/i.test(url)) return null
  if (!usefulUrl(url)) return null
  const host = rootHost(url)
  if (!host) return null

  const title = hit.title || host
  const snippet = hit.snippet || ""
  const name = nameFromHost(url) || title.split(/[|\-–]/)[0].trim().slice(0, 80)
  const spec = parsed.spec || ""
  const blob = `${title} ${snippet} ${url}`.toLowerCase()
  const productHit = specMentioned(blob, spec)
  const phone = extractPhone(snippet)
  const email = extractEmail(snippet)
  const sourceType = classifySource(url, title, snippet)

  return {
    id: `web-${host}`,
    name,
    type: classifyType(title, snippet),
    categories: parsed.categories || [],
    brands: (parsed.brands || []).filter((b) => blob.includes(b.toLowerCase())),
    products: productHit && parsed.spec ? [parsed.spec] : [],
    location: /brasil|\.com\.br/i.test(url) ? "Brasil" : "",
    phone,
    email,
    website: `https://${host}`,
    contactPage: url,
    b2b: /b2b|atacad|distribuid|industrial|revenda/i.test(blob) ? true : null,
    notes: "Encontrado na pesquisa ao vivo. Confirme contato e disponibilidade no site.",
    origin: "web",
    evidence: [
      {
        field: productHit ? "produto na página" : "página encontrada",
        value: snippet.slice(0, 220) || title,
        source: url,
        sourceType,
        queriedAt,
        confidence: productHit ? "possivel" : "possivel",
      },
      ...(phone
        ? [
            {
              field: "telefone",
              value: phone,
              source: url,
              sourceType,
              queriedAt,
              confidence: "possivel",
            },
          ]
        : []),
      ...(email
        ? [
            {
              field: "e-mail",
              value: email,
              source: url,
              sourceType,
              queriedAt,
              confidence: "possivel",
            },
          ]
        : []),
    ],
  }
}

export async function runLiveSearch(body) {
  const queries = (Array.isArray(body.queries) ? body.queries : [])
    .map((q) => String(q || "").trim())
    .filter(Boolean)
    .slice(0, 5)
  const parsed = {
    product: body.product || "",
    spec: body.spec || "",
    brands: Array.isArray(body.brands) ? body.brands : [],
    categories: Array.isArray(body.categories) ? body.categories : [],
  }

  if (!queries.length) {
    return {
      suppliers: [],
      status: "error",
      message: "Nenhuma consulta válida para pesquisar.",
      errors: [],
      queriedAt: new Date().toISOString(),
    }
  }

  const queriedAt = new Date().toISOString()
  const errors = []
  const hits = []

  const jobs = queries.map(async (query) => {
    try {
      let rows = await searchDuck(query)
      if (!rows.length) rows = await searchBing(query)
      return { query, rows }
    } catch (err) {
      errors.push({
        query,
        message: "Não conseguimos consultar esta fonte neste momento. A pesquisa continua com as demais.",
        detail: String(err?.message || err),
      })
      try {
        const rows = await searchBing(query)
        return { query, rows }
      } catch {
        return { query, rows: [] }
      }
    }
  })

  const settled = await Promise.all(jobs)
  settled.forEach((item) => {
    item.rows.forEach((row) => hits.push(row))
  })

  const byHost = new Map()
  hits.forEach((hit) => {
    const supplier = toSupplier(hit, parsed, queriedAt)
    if (!supplier) return
    const host = rootHost(supplier.website)
    const prev = byHost.get(host)
    if (!prev) {
      byHost.set(host, supplier)
      return
    }
    prev.evidence = [...(prev.evidence || []), ...(supplier.evidence || [])]
    prev.products = [...new Set([...(prev.products || []), ...(supplier.products || [])])]
    prev.brands = [...new Set([...(prev.brands || []), ...(supplier.brands || [])])]
    if (!prev.phone && supplier.phone) prev.phone = supplier.phone
    if (!prev.email && supplier.email) prev.email = supplier.email
  })

  const suppliers = [...byHost.values()].slice(0, 15)
  let status = "ok"
  let message =
    "Encontramos páginas atuais na internet. Recomendamos verificar disponibilidade e condição comercial direto com o fornecedor."
  if (!suppliers.length && errors.length) {
    status = "error"
    message =
      "Não conseguimos consultar as fontes neste momento. A pesquisa continua com o diretório e a memória da SS."
  } else if (!suppliers.length) {
    status = "empty"
    message = "Não encontramos fornecedores suficientes com evidências confiáveis nesta consulta à internet."
  } else if (errors.length) {
    status = "partial"
    message =
      "Algumas fontes não responderam. Mostramos o que foi possível confirmar nas demais, junto com o diretório."
  }

  return { suppliers, status, message, errors: errors.map((e) => e.message), queriedAt }
}
