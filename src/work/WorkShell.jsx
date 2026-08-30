import { go } from "../lib/route"
import { openPublicSite } from "../lib/siteUrl"
import Logo from "../components/Logo"

const NAV = [
  { path: "/app", label: "Dashboard" },
  { path: "/app/pesquisa", label: "Nova pesquisa" },
  { path: "/app/pesquisas", label: "Pesquisas" },
  { path: "/app/fornecedores", label: "Fornecedores" },
  { path: "/app/cotacoes", label: "Cotações" },
  { path: "/app/propostas", label: "Propostas" },
  { path: "/app/analises", label: "Análises" },
  { path: "/app/historico", label: "Histórico" },
]

export default function WorkShell({ route, children }) {
  const active = route.name

  return (
    <div className="work-shell">
      <aside className="work-side">
        <div className="work-brand">
          <Logo href="#/app" />
          <p>Área da equipe</p>
        </div>
        <nav aria-label="Área da equipe">
          {NAV.map((item) => (
            <button
              key={item.path}
              type="button"
              className={isActive(active, item.path) ? "is-active" : ""}
              onClick={() => go(item.path)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <button type="button" className="work-back" onClick={() => openPublicSite()}>
          Voltar ao site
        </button>
      </aside>
      <div className="work-body">
        <header className="work-top">
          <p>SS Comércio e Serviços · pesquisa e cotação</p>
        </header>
        <div className="work-content">{children}</div>
      </div>
    </div>
  )
}

function isActive(name, path) {
  const map = {
    "/app": "dashboard",
    "/app/pesquisa": "new-search",
    "/app/pesquisas": "searches",
    "/app/fornecedores": "suppliers",
    "/app/cotacoes": "quotes",
    "/app/propostas": "proposals",
    "/app/analises": "analyses",
    "/app/historico": "history",
  }
  if (name === "process" && path === "/app/pesquisas") return true
  if (name === "supplier" && path === "/app/fornecedores") return true
  return map[path] === name
}
