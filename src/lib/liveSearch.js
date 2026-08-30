import { searchQueries } from "./parseNeed"

export async function fetchLiveSuppliers(parsed) {
  const queries = searchQueries(parsed).slice(0, 5)
  try {
    const res = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        queries,
        product: parsed.product,
        spec: parsed.spec,
        brands: parsed.brands,
        categories: parsed.categories,
      }),
    })
    if (!res.ok) {
      return {
        suppliers: [],
        status: "error",
        message:
          "Não conseguimos consultar as fontes neste momento. A pesquisa continua com o diretório e a memória da SS.",
      }
    }
    return await res.json()
  } catch {
    return {
      suppliers: [],
      status: "error",
      message:
        "Não conseguimos consultar as fontes neste momento. A pesquisa continua com o diretório e a memória da SS.",
    }
  }
}
