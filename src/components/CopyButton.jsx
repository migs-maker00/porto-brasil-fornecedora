import { useState } from "react"
import { copyText } from "../lib/clipboard"

export default function CopyButton({ text, children, className = "btn btn-ghost" }) {
  const [msg, setMsg] = useState("")

  async function onClick() {
    const ok = await copyText(text)
    setMsg(ok ? "Copiado." : "Não foi possível copiar.")
    window.setTimeout(() => setMsg(""), 2000)
  }

  return (
    <span className="copy-wrap">
      <button type="button" className={className} onClick={onClick}>
        {children}
      </button>
      {msg ? <span className="field-hint">{msg}</span> : null}
    </span>
  )
}
