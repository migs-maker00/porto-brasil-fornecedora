import { useMemo, useState } from "react"
import { analyzeProposals } from "../lib/analyze"
import { CATEGORIES, SUPPLIER_TYPES } from "../lib/categories"
import { searchQueries } from "../lib/parseNeed"
import { go } from "../lib/route"
import { matchSuppliers, emptyField } from "../lib/searchSuppliers"
import { STATUSES, statusLabel } from "../lib/status"
import {
  addEvidence,
  addProposal,
  toggleFavorite,
  updateProcess,
  upsertSupplier,
  useWorkStore,
} from "../lib/store"
import { ParsedBox } from "./NewSearch"

export default function ProcessPage({ id }) {
  const data = useWorkStore()
  const process = data.processes.find((p) => p.id === id)
  const [tab, setTab] = useState("pesquisa")

  if (!process) {
    return (
      <div>
        <p>Processo não encontrado.</p>
        <button type="button" className="btn btn-secondary" onClick={() => go("/app")}>
          Dashboard
        </button>
      </div>
    )
  }

  const matches = matchSuppliers(data.suppliers, process.parsed)
  const favorites = data.suppliers.filter((s) => s.favorite)

  return (
    <div>
      <div className="work-head">
        <div>
          <p className="eyebrow">Processo #{process.ref}</p>
          <h1>{process.parsed.product || process.rawNeed}</h1>
          <p className="muted-note">{process.rawNeed}</p>
        </div>
        <label className="status-select">
          Status
          <select
            value={process.status}
            onChange={(e) => updateProcess(process.id, { status: e.target.value })}
          >
            {STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="work-tabs">
        {[
          ["pesquisa", "Pesquisa"],
          ["cotacao", "Cotação"],
          ["propostas", "Propostas"],
          ["analise", "Análise"],
          ["apresentacao", "Apresentação"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={tab === key ? "is-active" : ""}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "pesquisa" && (
        <SearchTab
          process={process}
          matches={matches}
          favorites={favorites}
          suppliers={data.suppliers}
        />
      )}
      {tab === "cotacao" && <QuoteTab process={process} suppliers={data.suppliers} />}
      {tab === "propostas" && <ProposalTab process={process} suppliers={data.suppliers} />}
      {tab === "analise" && <AnalysisTab process={process} suppliers={data.suppliers} />}
      {tab === "apresentacao" && (
        <PresentTab process={process} suppliers={data.suppliers} />
      )}
    </div>
  )
}

function SearchTab({ process, matches, favorites, suppliers }) {
  const queries = searchQueries(process.parsed)
  const relevantFav = favorites.filter((s) =>
    (s.categories || []).some((c) => process.parsed.categories.includes(c)),
  )

  function toggleSelect(id) {
    const set = new Set(process.selectedSupplierIds)
    if (set.has(id)) set.delete(id)
    else set.add(id)
    const ids = [...set]
    updateProcess(process.id, {
      selectedSupplierIds: ids,
      status: ids.length ? "selecionados" : matches.length ? "encontrados" : "pesquisando",
    })
  }

  return (
    <>
      <section className="work-panel">
        <ParsedBox parsed={process.parsed} />
        <label>
          Cliente / navio
          <input
            value={process.client}
            onChange={(e) => updateProcess(process.id, { client: e.target.value })}
            placeholder="Opcional"
          />
        </label>
      </section>

      <section className="work-panel">
        <h2>Consultas para a equipe</h2>
        <p className="muted-note">
          O sistema não inventa empresa, telefone ou preço. Use estas buscas e registre o que
          encontrar, com a fonte.
        </p>
        <ul className="query-list">
          {queries.map((q) => (
            <li key={q}>
              <code>{q}</code>
              <a
                className="text-link"
                href={`https://www.google.com/search?q=${encodeURIComponent(q)}`}
                target="_blank"
                rel="noreferrer"
              >
                Buscar
              </a>
            </li>
          ))}
        </ul>
      </section>

      {relevantFav.length ? (
        <section className="work-panel">
          <h2>Fornecedores frequentes nesta categoria</h2>
          <ul className="plain-list">
            {relevantFav.map((s) => (
              <li key={s.id}>{s.name}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="work-panel">
        <h2>Fornecedores na base</h2>
        {matches.length === 0 ? (
          <p className="muted-note">
            Nenhum fornecedor da base se encaixa ainda. Cadastre as empresas que a equipe
            encontrar.
          </p>
        ) : (
          matches.map((row) => (
            <article key={row.supplier.id} className="supplier-result">
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={process.selectedSupplierIds.includes(row.supplier.id)}
                  onChange={() => toggleSelect(row.supplier.id)}
                />
                <span>
                  <strong>{row.supplier.name}</strong>
                  <em>
                    {row.supplier.type} · {emptyField(row.supplier.location)}
                  </em>
                </span>
              </label>
              <p>
                Marcas: {row.supplier.brands?.length ? row.supplier.brands.join(" · ") : "Não informado"}
              </p>
              <p>Produto pesquisado: {process.parsed.spec || process.parsed.product}</p>
              <p>
                Produto específico:{" "}
                {row.reasons.some((r) => r.startsWith("Produto "))
                  ? "Encontrado na ficha"
                  : "Não informado"}
              </p>
              <div className="why-box">
                <p className="examples-label">Por que encontramos este fornecedor?</p>
                <ul>
                  {row.reasons.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
              <div className="hero-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => go(`/app/fornecedores/${row.supplier.id}`)}
                >
                  Ver fornecedor
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => toggleFavorite(row.supplier.id)}
                >
                  {row.supplier.favorite ? "Frequente" : "Marcar como frequente"}
                </button>
              </div>
            </article>
          ))
        )}
      </section>

      <AddSupplierForm
        parsed={process.parsed}
        onCreated={(id) => {
          if (!process.selectedSupplierIds.includes(id)) {
            updateProcess(process.id, {
              selectedSupplierIds: [...process.selectedSupplierIds, id],
              status: "selecionados",
            })
          }
        }}
      />

      {process.selectedSupplierIds.length ? (
        <p className="muted-note">
          {process.selectedSupplierIds.length} selecionado(s) para cotação.{" "}
          {suppliers.filter((s) => process.selectedSupplierIds.includes(s.id)).map((s) => s.name).join(", ")}
        </p>
      ) : null}
    </>
  )
}

function AddSupplierForm({ parsed, onCreated }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(() => ({
    name: "",
    type: "Distribuidor",
    location: "",
    phone: "",
    email: "",
    website: "",
    brands: parsed.brands.join(", "),
    products: parsed.spec || parsed.product,
    categories: parsed.categories[0] || "Peças",
    source: "",
    b2b: "nao_informado",
  }))

  function set(key, value) {
    setForm((c) => ({ ...c, [key]: value }))
  }

  function submit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.source.trim()) return
    const id = upsertSupplier({
      name: form.name.trim(),
      type: form.type,
      location: form.location.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      website: form.website.trim(),
      brands: splitList(form.brands),
      products: splitList(form.products),
      categories: [form.categories],
      b2b: form.b2b === "sim" ? true : form.b2b === "nao" ? false : null,
      evidence: [
        {
          field: "cadastro",
          value: form.name.trim(),
          source: form.source.trim(),
          confidence: "confirmado",
        },
      ],
    })
    if (form.brands.trim()) {
      addEvidence(id, {
        field: "marca",
        value: form.brands.trim(),
        source: form.source.trim(),
        confidence: "possivel",
      })
    }
    setOpen(false)
    onCreated?.(id)
  }

  if (!open) {
    return (
      <button type="button" className="btn btn-secondary" onClick={() => setOpen(true)}>
        Registrar fornecedor encontrado
      </button>
    )
  }

  return (
    <form className="work-panel" onSubmit={submit}>
      <h2>Registrar fornecedor</h2>
      <p className="muted-note">Só grave o que a equipe viu. Sem fonte, não cadastra.</p>
      <div className="form-grid">
        <label>
          Empresa *
          <input value={form.name} onChange={(e) => set("name", e.target.value)} required />
        </label>
        <label>
          Tipo
          <select value={form.type} onChange={(e) => set("type", e.target.value)}>
            {SUPPLIER_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label>
          Localização
          <input value={form.location} onChange={(e) => set("location", e.target.value)} />
        </label>
        <label>
          Telefone
          <input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        </label>
        <label>
          E-mail
          <input value={form.email} onChange={(e) => set("email", e.target.value)} />
        </label>
        <label>
          Site
          <input value={form.website} onChange={(e) => set("website", e.target.value)} />
        </label>
        <label>
          Marcas
          <input value={form.brands} onChange={(e) => set("brands", e.target.value)} />
        </label>
        <label>
          Produtos / códigos
          <input value={form.products} onChange={(e) => set("products", e.target.value)} />
        </label>
        <label>
          Categoria
          <select value={form.categories} onChange={(e) => set("categories", e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Atende B2B
          <select value={form.b2b} onChange={(e) => set("b2b", e.target.value)}>
            <option value="nao_informado">Não informado</option>
            <option value="sim">Sim</option>
            <option value="nao">Não</option>
          </select>
        </label>
        <label className="full">
          Fonte * (site, catálogo, ligação)
          <input
            value={form.source}
            onChange={(e) => set("source", e.target.value)}
            required
            placeholder="https://… ou descrição da fonte"
          />
        </label>
      </div>
      <div className="hero-actions">
        <button type="submit" className="btn btn-primary">
          Salvar na base
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

function splitList(value) {
  return String(value)
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function QuoteTab({ process, suppliers }) {
  const selected = suppliers.filter((s) => process.selectedSupplierIds.includes(s.id))

  function markSent() {
    updateProcess(process.id, {
      contactedSupplierIds: process.selectedSupplierIds,
      status: "aguardando",
    })
  }

  return (
    <section className="work-panel">
      <h2>Solicitar cotação</h2>
      {selected.length === 0 ? (
        <p className="muted-note">Selecione fornecedores na pesquisa primeiro.</p>
      ) : (
        <ul className="plain-list">
          {selected.map((s) => (
            <li key={s.id}>{s.name}</li>
          ))}
        </ul>
      )}
      <label>
        Mensagem
        <textarea
          rows={12}
          value={process.quoteMessage}
          onChange={(e) => updateProcess(process.id, { quoteMessage: e.target.value })}
        />
      </label>
      <div className="hero-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigator.clipboard.writeText(process.quoteMessage)}
        >
          Copiar mensagem
        </button>
        <button type="button" className="btn btn-primary" onClick={markSent} disabled={!selected.length}>
          Marcar cotação enviada
        </button>
      </div>
      <p className="field-hint">
        A mensagem é para a equipe colar no e-mail ou WhatsApp. O site não envia sozinho.
      </p>
    </section>
  )
}

function ProposalTab({ process, suppliers }) {
  const [form, setForm] = useState({
    supplierId: process.selectedSupplierIds[0] || "",
    brand: process.parsed.brands[0] || "",
    price: "",
    leadDays: "",
    payment: "",
    availability: "",
    freight: "",
    warranty: "",
    spec: process.parsed.spec,
  })

  function submit(e) {
    e.preventDefault()
    if (!form.supplierId) return
    addProposal(process.id, form)
    setForm((c) => ({ ...c, price: "", leadDays: "", payment: "", availability: "" }))
    if (process.status === "recebidas" || process.status === "aguardando") {
      updateProcess(process.id, { status: "recebidas" })
    }
  }

  const contacted = process.contactedSupplierIds?.length || process.selectedSupplierIds.length
  const answered = new Set(process.proposals.map((p) => p.supplierId)).size

  return (
    <>
      <div className="stat-grid">
        <article className="stat-card">
          <p>Fornecedores contatados</p>
          <strong>{contacted}</strong>
        </article>
        <article className="stat-card">
          <p>Respostas recebidas</p>
          <strong>{answered}</strong>
        </article>
        <article className="stat-card">
          <p>Aguardando</p>
          <strong>{Math.max(0, contacted - answered)}</strong>
        </article>
      </div>

      <form className="work-panel" onSubmit={submit}>
        <h2>Registrar proposta</h2>
        <p className="muted-note">Grave só o que o fornecedor enviou.</p>
        <div className="form-grid">
          <label>
            Fornecedor
            <select
              value={form.supplierId}
              onChange={(e) => setForm((c) => ({ ...c, supplierId: e.target.value }))}
              required
            >
              <option value="">Selecione</option>
              {suppliers
                .filter((s) => process.selectedSupplierIds.includes(s.id) || process.contactedSupplierIds?.includes(s.id))
                .concat(
                  suppliers.filter(
                    (s) =>
                      !process.selectedSupplierIds.includes(s.id) &&
                      !process.contactedSupplierIds?.includes(s.id),
                  ),
                )
                .filter((s, i, arr) => arr.findIndex((x) => x.id === s.id) === i)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
            </select>
          </label>
          <label>
            Marca
            <input
              value={form.brand}
              onChange={(e) => setForm((c) => ({ ...c, brand: e.target.value }))}
            />
          </label>
          <label>
            Preço (R$)
            <input
              value={form.price}
              onChange={(e) => setForm((c) => ({ ...c, price: e.target.value }))}
            />
          </label>
          <label>
            Prazo (dias)
            <input
              value={form.leadDays}
              onChange={(e) => setForm((c) => ({ ...c, leadDays: e.target.value }))}
            />
          </label>
          <label>
            Pagamento
            <input
              value={form.payment}
              onChange={(e) => setForm((c) => ({ ...c, payment: e.target.value }))}
            />
          </label>
          <label>
            Disponibilidade
            <input
              value={form.availability}
              onChange={(e) => setForm((c) => ({ ...c, availability: e.target.value }))}
            />
          </label>
        </div>
        <button type="submit" className="btn btn-primary">
          Incluir proposta
        </button>
      </form>

      {process.proposals.length ? (
        <div className="table-wrap">
          <table className="work-table">
            <thead>
              <tr>
                <th>Fornecedor</th>
                <th>Marca</th>
                <th>Preço</th>
                <th>Prazo</th>
                <th>Pagamento</th>
                <th>Disponibilidade</th>
              </tr>
            </thead>
            <tbody>
              {process.proposals.map((p) => (
                <tr key={p.id}>
                  <td>{suppliers.find((s) => s.id === p.supplierId)?.name || "Não informado"}</td>
                  <td>{p.brand || "Não informado"}</td>
                  <td>{p.price ? `R$ ${p.price}` : "Não informado"}</td>
                  <td>{p.leadDays ? `${p.leadDays} dias` : "Não informado"}</td>
                  <td>{p.payment || "Não informado"}</td>
                  <td>{p.availability || "Não informado"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </>
  )
}

function AnalysisTab({ process, suppliers }) {
  const text = useMemo(
    () => analyzeProposals(process.proposals, suppliers),
    [process.proposals, suppliers],
  )

  return (
    <section className="work-panel">
      <h2>Análise</h2>
      <p>{text}</p>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => updateProcess(process.id, { status: "analise" })}
      >
        Marcar em análise
      </button>
    </section>
  )
}

function PresentTab({ process, suppliers }) {
  function toggle(id) {
    const set = new Set(process.presentedIds)
    if (set.has(id)) set.delete(id)
    else set.add(id)
    updateProcess(process.id, { presentedIds: [...set] })
  }

  const shown = process.proposals.filter((p) =>
    process.presentedIds.length ? process.presentedIds.includes(p.id) : true,
  )

  return (
    <section className="present-page">
      <p className="eyebrow">Cotação — {process.parsed.product} {process.parsed.spec}</p>
      <h2>{process.client ? process.client : "Apresentação ao cliente"}</h2>
      <p className="muted-note">
        Foram recebidas {process.proposals.length} proposta(s). As opções abaixo são para decisão
        do cliente. A SS não aponta automaticamente a melhor.
      </p>

      {process.proposals.map((p, i) => (
        <label key={p.id} className="check-row">
          <input
            type="checkbox"
            checked={process.presentedIds.includes(p.id)}
            onChange={() => toggle(p.id)}
          />
          Incluir opção {i + 1} na apresentação
        </label>
      ))}

      {(process.presentedIds.length ? shown : []).map((p, i) => (
        <article key={p.id} className="present-card">
          <p className="examples-label">Opção {i + 1}</p>
          <dl className="parsed-grid">
            <div>
              <dt>Fornecedor</dt>
              <dd>{suppliers.find((s) => s.id === p.supplierId)?.name || "Não informado"}</dd>
            </div>
            <div>
              <dt>Marca</dt>
              <dd>{p.brand || "Não informado"}</dd>
            </div>
            <div>
              <dt>Preço</dt>
              <dd>{p.price ? `R$ ${p.price}` : "Não informado"}</dd>
            </div>
            <div>
              <dt>Prazo</dt>
              <dd>{p.leadDays ? `${p.leadDays} dias` : "Não informado"}</dd>
            </div>
            <div>
              <dt>Pagamento</dt>
              <dd>{p.payment || "Não informado"}</dd>
            </div>
          </dl>
        </article>
      ))}

      <div className="hero-actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => updateProcess(process.id, { status: "apresentado" })}
        >
          Marcar como apresentado
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => updateProcess(process.id, { status: "encerrado" })}
        >
          Encerrar processo
        </button>
      </div>
    </section>
  )
}

export function ProcessList({ title, filter }) {
  const { processes } = useWorkStore()
  const rows = processes.filter(filter)

  return (
    <div>
      <p className="eyebrow">{title}</p>
      <h1>{title}</h1>
      {rows.length === 0 ? (
        <p className="muted-note">Nada nesta lista.</p>
      ) : (
        <ul className="work-list">
          {rows.map((p) => (
            <li key={p.id}>
              <button type="button" onClick={() => go(`/app/pesquisa/${p.id}`)}>
                <strong>#{p.ref}</strong>
                <span>
                  {p.parsed?.product} {p.parsed?.spec} {p.client ? `· ${p.client}` : ""}
                </span>
                <em>{statusLabel(p.status)}</em>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

