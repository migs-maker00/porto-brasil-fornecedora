import { useState } from "react"
import { parseNeed } from "../lib/parseNeed"
import { go } from "../lib/route"
import { createProcess } from "../lib/store"

export default function NewSearch({ initial = "" }) {
  const [text, setText] = useState(initial)
  const parsed = parseNeed(text)

  function submit(e) {
    e.preventDefault()
    if (!text.trim()) return
    const process = createProcess(text)
    go(`/app/pesquisa/${process.id}`)
  }

  return (
    <div>
      <p className="eyebrow">Nova pesquisa</p>
      <h1>O que você precisa cotar?</h1>
      <p className="lead">
        Escreva como veio o pedido. Marca é opcional. Dá para pesquisar mesmo incompleto.
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
      <p className="examples-label">Identificado</p>
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
      </dl>
      {parsed.missing.length ? (
        <p className="field-hint">
          Pode melhorar a pesquisa: {parsed.missing.join(", ")}. Não é obrigatório.
        </p>
      ) : null}
    </div>
  )
}
