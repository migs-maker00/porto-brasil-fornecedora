import { useEffect, useState } from "react";
import { company } from "../data/site";
import { useLang } from "../LangContext";

function buildWhatsAppMessage(form, t, companyName) {
  const f = t.form;
  const lines = [
    `${f.waTitle} — ${companyName}`,
    `${f.waName}: ${form.nome}`,
    `${f.waCompany}: ${form.empresa}`,
    `${f.waEmail}: ${form.email}`,
    `${f.waPhone}: ${form.telefone}`,
    `${f.waType}: ${form.tipo}`,
    `${f.waProduct}: ${form.produto}`,
    `${f.waQty}: ${form.quantidade}`,
    `${f.waSpec}: ${form.especificacao}`,
    `${f.waDeadline}: ${form.prazo}`,
    `${f.waNotes}: ${form.observacoes || "—"}`,
    form.arquivo ? `${f.waFile}: ${form.arquivo}` : f.waNoFile,
  ];
  return lines.join("\n");
}

export default function QuoteForm() {
  const { lang, t } = useLang();
  const f = t.form;
  const [form, setForm] = useState(() => ({
    nome: "",
    empresa: "",
    email: "",
    telefone: "",
    tipo: f.types[0],
    produto: "",
    quantidade: "",
    especificacao: "",
    prazo: "",
    observacoes: "",
    arquivo: "",
  }));
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm((prev) => ({ ...prev, tipo: f.types[0] }));
  }, [lang]);

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setError("");
    setSent(false);
  }

  function onSubmit(e) {
    e.preventDefault();
    const required = [
      "nome",
      "empresa",
      "email",
      "telefone",
      "produto",
      "quantidade",
      "especificacao",
      "prazo",
    ];
    const missing = required.find((k) => !String(form[k]).trim());
    if (missing) {
      setError(f.error);
      return;
    }
    const text = encodeURIComponent(buildWhatsAppMessage(form, t, company.name));
    const url = `https://wa.me/${company.whatsapp}?text=${text}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setSent(true);
  }

  return (
    <form className="quote-form" onSubmit={onSubmit} noValidate>
      <div className="form-grid">
        <label>
          {f.name}
          <input
            value={form.nome}
            onChange={(e) => update("nome", e.target.value)}
            autoComplete="name"
            required
          />
        </label>
        <label>
          {f.company}
          <input
            value={form.empresa}
            onChange={(e) => update("empresa", e.target.value)}
            autoComplete="organization"
            required
          />
        </label>
        <label>
          {f.email}
          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            autoComplete="email"
            required
          />
        </label>
        <label>
          {f.phone}
          <input
            value={form.telefone}
            onChange={(e) => update("telefone", e.target.value)}
            autoComplete="tel"
            required
          />
        </label>
        <label className="full">
          {f.type}
          <select value={form.tipo} onChange={(e) => update("tipo", e.target.value)}>
            {f.types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label className="full">
          {f.product}
          <input
            value={form.produto}
            onChange={(e) => update("produto", e.target.value)}
            required
          />
        </label>
        <label>
          {f.qty}
          <input
            value={form.quantidade}
            onChange={(e) => update("quantidade", e.target.value)}
            required
          />
        </label>
        <label>
          {f.deadline}
          <input
            value={form.prazo}
            onChange={(e) => update("prazo", e.target.value)}
            placeholder={f.deadlinePh}
            required
          />
        </label>
        <label className="full">
          {f.spec}
          <textarea
            value={form.especificacao}
            onChange={(e) => update("especificacao", e.target.value)}
            rows={3}
            placeholder={f.specPh}
            required
          />
        </label>
        <label className="full">
          {f.notes}
          <textarea
            value={form.observacoes}
            onChange={(e) => update("observacoes", e.target.value)}
            rows={3}
          />
        </label>
        <label className="full">
          {f.file}
          <input
            type="file"
            accept=".pdf,.xls,.xlsx,.csv,.doc,.docx,.png,.jpg,.jpeg,.webp"
            onChange={(e) => update("arquivo", e.target.files?.[0]?.name || "")}
          />
          <span className="field-hint">{f.fileHint}</span>
        </label>
      </div>

      {error && (
        <p className="form-feedback bad" role="alert">
          {error}
        </p>
      )}
      {sent && (
        <p className="form-feedback ok" role="status">
          {f.sent}
        </p>
      )}

      <button type="submit" className="btn btn-primary btn-block">
        {t.quoteCta}
      </button>
    </form>
  );
}
