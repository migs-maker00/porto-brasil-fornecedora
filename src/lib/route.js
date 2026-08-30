import { isAppHost } from "./siteUrl"

export function currentPath() {
  if (isAppHost()) {
    const path = window.location.pathname.replace(/\/$/, "") || "/"
    const hash = window.location.hash.replace(/^#/, "")
    if (hash && hash !== "/") {
      const h = hash.startsWith("/") ? hash : `/${hash}`
      return h.startsWith("/app") ? h : `/app${h === "/" ? "" : h}`
    }
    return path === "/" ? "/app" : path.startsWith("/app") ? path : `/app${path}`
  }
  const hash = window.location.hash.replace(/^#/, "") || "/"
  return hash.startsWith("/") ? hash : `/${hash}`
}

export function go(path) {
  const next = path.startsWith("/") ? path : `/${path}`
  if (isAppHost()) {
    const intern = next.replace(/^\/app/, "") || "/"
    window.history.pushState({}, "", intern)
    window.dispatchEvent(new PopStateEvent("popstate"))
    return
  }
  window.location.hash = next
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
  return { name: "notfound" }
}
