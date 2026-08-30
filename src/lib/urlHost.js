export function rootHost(website) {
  try {
    const host = new URL(website).hostname.replace(/^www\./i, "").toLowerCase()
    const parts = host.split(".")
    if (parts.length >= 3 && ["com.br", "org.br", "net.br"].includes(parts.slice(-2).join("."))) {
      return parts.slice(-3).join(".")
    }
    if (parts.length >= 2) return parts.slice(-2).join(".")
    return host
  } catch {
    return ""
  }
}

export function nameFromHost(website) {
  const host = rootHost(website)
  const base = host.split(".")[0] || ""
  if (!base) return ""
  return base.charAt(0).toUpperCase() + base.slice(1)
}
