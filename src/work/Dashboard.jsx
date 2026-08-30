import { go } from "../lib/route"
import { isOpenStatus, statusLabel } from "../lib/status"
import { useWorkStore } from "../lib/store"

function urgencyMark(value) {
  if (value === "urgente") return "Urgente"
  if (value === "alta") return "Alta"
  return "Normal"
}

export default function Dashboard() {
  const { processes, suppliers } = useWorkStore()
  const open = processes.filter((p) => isOpenStatus(p.status))
  const waiting = processes.filter((p) => p.status === "aguardando" || p.status === "enviada")
  const received = processes.filter((p) => p.status === "recebidas" || p.status === "analise")
  const analysis = processes.filter((p) => p.status === "analise")
  const urgent = open.filter((p) => p.urgency === "urgente" || p.urgency === "alta")
  const queue = [...open].sort((a, b) => rank(b.urgency) - rank(a.urgency)).slice(0, 12)
  const recentSuppliers = suppliers.slice(0, 5)

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
        <Stat label="Aguardando resposta" value={waiting.length} />
        <Stat label="Propostas recebidas" value={received.reduce((n, p) => n + p.proposals.length, 0)} />
        <Stat label="Urgente / alta" value={urgent.length} />
      </div>
      <p className="muted-note">Em análise: {analysis.length}</p>

      <section className="work-panel">
        <h2>Fila de pesquisas</h2>
        {queue.length === 0 ? (
          <p className="muted-note">Nenhuma pesquisa aberta.</p>
        ) : (
          <ul className="work-list">
            {queue.map((p) => (
              <li key={p.id}>
                <button type="button" onClick={() => go(`/app/pesquisa/${p.id}`)}>
                  <strong>#{p.ref}</strong>
                  <span>
                    {[p.ship, p.client, p.parsed?.product].filter(Boolean).join(" · ") || p.rawNeed}
                  </span>
                  <em>
                    {urgencyMark(p.urgency)} · {statusLabel(p.status)}
                  </em>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {recentSuppliers.length ? (
        <section className="work-panel">
          <h2>Últimos fornecedores na base</h2>
          <ul className="plain-list">
            {recentSuppliers.map((s) => (
              <li key={s.id}>
                <button type="button" className="text-link" onClick={() => go(`/app/fornecedores/${s.id}`)}>
                  {s.name}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}

function rank(urgency) {
  if (urgency === "urgente") return 2
  if (urgency === "alta") return 1
  return 0
}

function Stat({ label, value }) {
  return (
    <article className="stat-card">
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  )
}
