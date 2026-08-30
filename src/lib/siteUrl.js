export function isAppHost(hostname = typeof window === "undefined" ? "" : window.location.hostname) {
  return hostname === "app.sscomercio.com.br" || hostname.startsWith("app.")
}

export function publicSiteUrl() {
  const fromEnv = import.meta.env.VITE_PUBLIC_SITE_URL
  if (fromEnv) return String(fromEnv).replace(/\/$/, "")
  if (typeof window === "undefined") return "https://porto-brasil-fornecedora.vercel.app"
  if (isAppHost()) return "https://sscomercio.com.br"
  return window.location.origin
}

export function appSiteUrl() {
  const fromEnv = import.meta.env.VITE_APP_SITE_URL
  if (fromEnv) return String(fromEnv).replace(/\/$/, "")
  if (typeof window === "undefined") return ""
  if (isAppHost()) return window.location.origin
  return `${window.location.origin}/#/app`
}

export function openPublicSite() {
  if (isAppHost()) {
    window.location.href = `${publicSiteUrl()}/`
    return
  }
  window.location.hash = "/"
}
