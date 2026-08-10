import { useState } from 'react'
import { company, requestTypes } from '../data/site'

function buildWhatsAppMessage(form) {
  const lines = [
    `Solicitação de cotação — ${company.name}`,
    `Nome: ${form.nome}`,
    `Empresa: ${form.empresa}`,
    `E-mail: ${form.email}`,
    `Telefone: ${form.telefone}`,
    `Tipo: ${form.tipo}`,
    `Produto/material: ${form.produto}`,
    `Quantidade: ${form.quantidade}`,
    `Especificação: ${form.especificacao}`,
    `Prazo/urgência: ${form.prazo}`,
    `Observações: ${form.observacoes || '—'}`,
    form.arquivo ? `Arquivo informado: ${form.arquivo}` : 'Arquivo: não anexado (enviar na conversa se necessário)',
  ]
  return lines.join('\n')
}

const initial = {
  nome: '',
  empresa: '',
  email: '',
  telefone: '',
  tipo: requestTypes[0],
  produto: '',
  quantidade: '',
  especificacao: '',
  prazo: '',
  observacoes: '',
  arquivo: '',
}

export default function QuoteForm() {
  const [form, setForm] = useState(initial)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
    setError('')
    setSent(false)
  }

  function onSubmit(e) {
    e.preventDefault()
    const required = ['nome', 'empresa', 'email', 'telefone', 'produto', 'quantidade', 'especificacao', 'prazo']
    const missing = required.find((k) => !String(form[k]).trim())
    if (missing) {
      setError('Preencha os campos obrigatórios para continuar.')
      return
    }
    const text = encodeURIComponent(buildWhatsAppMessage(form))
    const url = `https://wa.me/${company.whatsapp}?text=${text}`
    window.open(url, '_blank', 'noopener,noreferrer')
    setSent(true)
  }

  return (
    <form className="quote-form" onSubmit={onSubmit} noValidate>
      <div className="form-grid">
        <label>
          Nome *
          <input value={form.nome} onChange={(e) => update('nome', e.target.value)} autoComplete="name" required />
        </label>
        <label>
          Empresa *
          <input value={form.empresa} onChange={(e) => update('empresa', e.target.value)} autoComplete="organization" required />
        </label>
        <label>
          E-mail *
          <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} autoComplete="email" required />
        </label>
        <label>
          Telefone *
          <input value={form.telefone} onChange={(e) => update('telefone', e.target.value)} autoComplete="tel" required />
        </label>
        <label className="full">
          Tipo de solicitação *
          <select value={form.tipo} onChange={(e) => update('tipo', e.target.value)}>
            {requestTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
        <label className="full">
          Produto / material *
          <input value={form.produto} onChange={(e) => update('produto', e.target.value)} required />
        </label>
        <label>
          Quantidade *
          <input value={form.quantidade} onChange={(e) => update('quantidade', e.target.value)} required />
        </label>
        <label>
          Prazo / urgência *
          <input value={form.prazo} onChange={(e) => update('prazo', e.target.value)} placeholder="Ex.: 48h, esta semana" required />
        </label>
        <label className="full">
          Especificação *
          <textarea
            value={form.especificacao}
            onChange={(e) => update('especificacao', e.target.value)}
            rows={3}
            placeholder="Medida, material, norma, marca, uso…"
            required
          />
        </label>
        <label className="full">
          Observações
          <textarea value={form.observacoes} onChange={(e) => update('observacoes', e.target.value)} rows={3} />
        </label>
        <label className="full">
          Arquivo (lista, PDF, planilha ou imagem)
          <input
            type="file"
            accept=".pdf,.xls,.xlsx,.csv,.doc,.docx,.png,.jpg,.jpeg,.webp"
            onChange={(e) => update('arquivo', e.target.files?.[0]?.name || '')}
          />
          <span className="field-hint">
            O envio abre o WhatsApp com os dados preenchidos. Se precisar anexar o arquivo, envie na conversa em seguida.
          </span>
        </label>
      </div>

      {error && <p className="form-feedback bad" role="alert">{error}</p>}
      {sent && (
        <p className="form-feedback ok" role="status">
          Solicitação montada. Se o WhatsApp não abriu, use o botão novamente ou ligue para a equipe.
        </p>
      )}

      <button type="submit" className="btn btn-primary btn-block">
        Solicitar cotação
      </button>
    </form>
  )
}
