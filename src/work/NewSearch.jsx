import { useState } from "react"
import { parseNeed } from "../lib/parseNeed"
import { go } from "../lib/route"
import { createProcess } from "../lib/store"

export default function NewSearch({ initial = "" }) {
  const [text, setText] = useState(initial)
  const [client, setClient] = useState("")
  const [ship, setShip] = useState("")
  const [requester, setRequester] = useState("")
  const [urgency, setUrgency] = useState("normal")
  const parsed = parseNeed(text)

  function submit(e) {
    e.preventDefault()
    if (!text.trim()) return
    const process = createProcess(text, {
      client,
      ship,
      requester,
      urgency: urgency === "normal" ? parsed.urgency : urgency,
    })
    go(`/app/pesquisa/${process.id}`)
  }

  return (
    <div>
      <p className="eyebrow">Nova pesquisa</p>
      <h1>Qual material precisa encontrar?</h1>
      <p className="lead">
        Em vez de vasculhar dezenas de empresas, o sistema aponta as 10–15 mais relevantes para
        contatar — diretório, memória da SS e pesquisa ao vivo. A equipe decide.
      </p>

      <form className="work-panel" onSubmit={submit}>
        <label>
          Necessidade
          <textarea
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ex.: 10 rolamentos 6317 ZZ C3"
            required
          />
        </label>
        <div className="form-grid">
          <label>
            Cliente
            <input value={client} onChange={(e) => setClient(e.target.value)} />
          </label>
          <label>
            Navio
            <input value={ship} onChange={(e) => setShip(e.target.value)} />
          </label>
          <label>
            Solicitante
            <input value={requester} onChange={(e) => setRequester(e.target.value)} />
          </label>
          <label>
            Urgência
            <select value={urgency} onChange={(e) => setUrgency(e.target.value)}>
              <option value="normal">Normal</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
          </label>
        </div>
        {text.trim() ? <ParsedBox parsed={parsed} /> : null}
        <button type="submit" className="btn btn-primary">
          Pesquisar fornecedores
        </button>
      </form>
    </div>
  )
}

export function ParsedBox({ parsed }) {
  return (
    <div className="parsed-box">
      <p className="examples-label">Identificado pelo assistente</p>
      <dl className="parsed-grid">
        <div>
          <dt>Produto</dt>
          <dd>{parsed.product || "Não informado"}</dd>
        </div>
        <div>
          <dt>Código / spec</dt>
          <dd>{parsed.spec || "Não informado"}</dd>
        </div>
        <div>
          <dt>Quantidade</dt>
          <dd>{parsed.quantity || "Não informado"}</dd>
        </div>
        <div>
          <dt>Marca</dt>
          <dd>{parsed.brands.length ? parsed.brands.join(" · ") : "Não informada"}</dd>
        </div>
        <div>
          <dt>Categoria</dt>
          <dd>{parsed.categories.join(" · ") || "Não informado"}</dd>
        </div>
        <div>
          <dt>Aplicação</dt>
          <dd>{parsed.application || "Não informado"}</dd>
        </div>
      </dl>
      {parsed.missing.length ? (
        <p className="field-hint">
          Pode melhorar a pesquisa: {parsed.missing.join(", ")}. Não é obrigatório.
        </p>
      ) : null}
    </div>
  )
}
