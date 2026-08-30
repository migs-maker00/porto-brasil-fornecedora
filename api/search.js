import { runLiveSearch } from "../src/lib/harvestWeb.js"

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.status(204).end()
    return
  }
  if (req.method !== "POST") {
    res.status(405).json({
      suppliers: [],
      status: "error",
      message: "Use POST para pesquisar.",
    })
    return
  }

  try {
    const result = await runLiveSearch(req.body || {})
    res.status(200).json(result)
  } catch {
    res.status(200).json({
      suppliers: [],
      status: "error",
      message:
        "Não conseguimos consultar as fontes neste momento. A pesquisa continua com o diretório e a memória da SS.",
      errors: [],
    })
  }
}
