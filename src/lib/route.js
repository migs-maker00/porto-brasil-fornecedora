export function currentPath() {
  const hash = window.location.hash.replace(/^#/, "") || "/"
  return hash.startsWith("/") ? hash : `/${hash}`
}

export function go(path) {
  window.location.hash = path.startsWith("/") ? path : `/${path}`
}

export function parsePath(path) {
  const clean = path.replace(/\/$/, "") || "/"
  if (clean === "/") return { name: "home" }
  if (clean === "/privacidade") return { name: "privacy" }
  if (clean === "/termos") return { name: "terms" }
  if (clean === "/app") return { name: "dashboard" }
  if (clean === "/app/pesquisa") return { name: "new-search" }
  const process = clean.match(/^\/app\/pesquisa\/([^/]+)$/)
  if (process) return { name: "process", id: process[1] }
  if (clean === "/app/pesquisas") return { name: "searches" }
  if (clean === "/app/fornecedores") return { name: "suppliers" }
  const supplier = clean.match(/^\/app\/fornecedores\/([^/]+)$/)
  if (supplier) return { name: "supplier", id: supplier[1] }
  if (clean === "/app/cotacoes") return { name: "quotes" }
  if (clean === "/app/propostas") return { name: "proposals" }
  if (clean === "/app/analises") return { name: "analyses" }
  if (clean === "/app/historico") return { name: "history" }
  return { name: "home" }
}
