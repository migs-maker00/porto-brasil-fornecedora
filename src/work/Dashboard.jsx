import { go } from "../lib/route"
import { isOpenStatus, statusLabel } from "../lib/status"
import { useWorkStore } from "../lib/store"

export default function Dashboard() {
  const { processes } = useWorkStore()
  const open = processes.filter((p) => isOpenStatus(p.status))
  const waiting = processes.filter((p) => p.status === "aguardando" || p.status === "enviada")
  const received = processes.filter((p) => p.status === "recebidas" || p.status === "analise")
  const analysis = processes.filter((p) => p.status === "analise")
  const recent = processes.slice(0, 8)

  return (
    <div>
      <div className="work-head">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>O que precisa ser feito agora</h1>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => go("/app/pesquisa")}>
          Nova pesquisa
        </button>
      </div>

      <div className="stat-grid">
        <Stat label="Pesquisas abertas" value={open.length} />
        <Stat label="Cotações aguardando resposta" value={waiting.length} />
        <Stat label="Propostas recebidas" value={received.reduce((n, p) => n + p.proposals.length, 0)} />
        <Stat label="Processos em análise" value={analysis.length} />
      </div>

      <section className="work-panel">
        <h2>Pesquisas recentes</h2>
        {recent.length === 0 ? (
          <p className="muted-note">Nenhuma pesquisa ainda. Comece pelo pedido do cliente.</p>
        ) : (
          <ul className="work-list">
            {recent.map((p) => (
              <li key={p.id}>
                <button type="button" onClick={() => go(`/app/pesquisa/${p.id}`)}>
                  <strong>#{p.ref}</strong>
                  <span>{p.parsed?.product || p.rawNeed}</span>
                  <em>{statusLabel(p.status)}</em>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <article className="stat-card">
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  )
}
