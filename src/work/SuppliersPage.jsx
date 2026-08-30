import { useState } from "react"
import { CATEGORIES } from "../lib/categories"
import { go } from "../lib/route"
import { emptyField } from "../lib/searchSuppliers"
import { toggleFavorite, useWorkStore } from "../lib/store"

export default function SuppliersPage() {
  const { suppliers } = useWorkStore()
  const [cat, setCat] = useState("")
  const [q, setQ] = useState("")
  const rows = suppliers.filter((s) => {
    if (cat && !(s.categories || []).includes(cat)) return false
    if (q && !`${s.name} ${(s.brands || []).join(" ")}`.toLowerCase().includes(q.toLowerCase())) {
      return false
    }
    return true
  })

  return (
    <div>
      <div className="work-head">
        <div>
          <p className="eyebrow">Base</p>
          <h1>Fornecedores</h1>
        </div>
      </div>
      <div className="work-filters">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Nome ou marca"
        />
        <select value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="">Todas as categorias</option>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      {rows.length === 0 ? (
        <p className="muted-note">
          A base começa vazia. As empresas entram quando a equipe registra uma pesquisa.
        </p>
      ) : (
        <ul className="work-list">
          {rows.map((s) => (
            <li key={s.id}>
              <button type="button" onClick={() => go(`/app/fornecedores/${s.id}`)}>
                <strong>{s.name}</strong>
                <span>
                  {s.type} · {(s.brands || []).join(", ") || "Marca não informada"}
                </span>
                <em>{s.favorite ? "Frequente" : emptyField(s.location)}</em>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function SupplierPage({ id }) {
  const { suppliers, processes } = useWorkStore()
  const s = suppliers.find((item) => item.id === id)
  if (!s) return <p>Fornecedor não encontrado.</p>

  const history = processes.filter(
    (p) =>
      p.selectedSupplierIds.includes(id) ||
      p.contactedSupplierIds?.includes(id) ||
      p.proposals.some((q) => q.supplierId === id),
  )

  return (
    <div>
      <p className="eyebrow">{s.type}</p>
      <h1>{s.name}</h1>
      <button type="button" className="btn btn-ghost" onClick={() => toggleFavorite(s.id)}>
        {s.favorite ? "Fornecedor frequente" : "Marcar como frequente"}
      </button>

      <section className="work-panel">
        <dl className="parsed-grid">
          <div>
            <dt>Localização</dt>
            <dd>{emptyField(s.location)}</dd>
          </div>
          <div>
            <dt>Telefone</dt>
            <dd>{emptyField(s.phone)}</dd>
          </div>
          <div>
            <dt>E-mail</dt>
            <dd>{emptyField(s.email)}</dd>
          </div>
          <div>
            <dt>Site</dt>
            <dd>
              {s.website ? (
                <a href={s.website} target="_blank" rel="noreferrer">
                  {s.website}
                </a>
              ) : (
                "Não informado"
              )}
            </dd>
          </div>
          <div>
            <dt>Marcas</dt>
            <dd>{s.brands?.length ? s.brands.join(" · ") : "Não informado"}</dd>
          </div>
          <div>
            <dt>Categorias</dt>
            <dd>{s.categories?.length ? s.categories.join(" · ") : "Não informado"}</dd>
          </div>
          <div>
            <dt>Produtos</dt>
            <dd>{s.products?.length ? s.products.join(" · ") : "Não informado"}</dd>
          </div>
          <div>
            <dt>B2B</dt>
            <dd>{s.b2b === true ? "Sim" : s.b2b === false ? "Não" : "Não informado"}</dd>
          </div>
        </dl>
        {s.notes ? <p>{s.notes}</p> : null}
      </section>

      <section className="work-panel">
        <h2>Evidências</h2>
        {(s.evidence || []).length === 0 ? (
          <p className="muted-note">Nenhuma evidência registrada.</p>
        ) : (
          <ul className="plain-list">
            {(s.evidence || []).map((e) => (
              <li key={e.id || e.source}>
                <strong>{e.field}</strong>: {e.value} · {e.source} · {e.confidence}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="work-panel">
        <h2>Cotações anteriores</h2>
        {history.length === 0 ? (
          <p className="muted-note">Ainda sem histórico com este fornecedor.</p>
        ) : (
          <ul className="work-list">
            {history.map((p) => (
              <li key={p.id}>
                <button type="button" onClick={() => go(`/app/pesquisa/${p.id}`)}>
                  <strong>#{p.ref}</strong>
                  <span>{p.parsed?.product} {p.parsed?.spec}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
