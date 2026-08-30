import { useState } from "react";
import { company } from "../data/site";
import { useLang } from "../LangContext";

function buildWhatsAppMessage(form, t, companyName) {
  const f = t.form;
  return [
    `${f.waTitle} — ${companyName}`,
    `${f.waName}: ${form.nome}`,
    `${f.waCompany}: ${form.empresa || "—"}`,
    `${f.waEmail}: ${form.email}`,
    `${f.waPhone}: ${form.telefone}`,
    `${f.waNeed}: ${form.need}`,
    `${f.waDeadline}: ${form.prazo || "—"}`,
    `${f.waNotes}: ${form.observacoes || "—"}`,
  ].join("\n");
}

export default function QuoteForm() {
  const { t } = useLang();
  const f = t.form;
  const [form, setForm] = useState({
    need: "",
    empresa: "",
    nome: "",
    email: "",
    telefone: "",
    prazo: "",
    observacoes: "",
  });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setError("");
    setSent(false);
  }

  function onSubmit(e) {
    e.preventDefault();
    const required = ["need", "nome", "email", "telefone"];
    if (required.some((k) => !String(form[k]).trim())) {
      setError(f.error);
      return;
    }
    const text = encodeURIComponent(buildWhatsAppMessage(form, t, company.name));
    window.open(`https://wa.me/${company.whatsapp}?text=${text}`, "_blank", "noopener,noreferrer");
    setSent(true);
  }

  return (
    <form className="quote-form" onSubmit={onSubmit} noValidate>
      <div className="form-grid">
        <label className="full">
          {f.need}
          <textarea
            value={form.need}
            onChange={(e) => update("need", e.target.value)}
            rows={4}
            placeholder={f.needPh}
            required
          />
        </label>
        <label>
          {f.company}
          <input
            value={form.empresa}
            onChange={(e) => update("empresa", e.target.value)}
            autoComplete="organization"
          />
        </label>
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
          {f.deadline}
          <input
            value={form.prazo}
            onChange={(e) => update("prazo", e.target.value)}
            placeholder={f.deadlinePh}
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
        {t.sendNeed}
      </button>
    </form>
  );
}
