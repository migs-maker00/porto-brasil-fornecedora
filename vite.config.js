import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { runLiveSearch } from './src/lib/harvestWeb.js'

function searchApi() {
  return {
    name: 'ss-search-api',
    configureServer(server) {
      server.middlewares.use('/api/search', (req, res, next) => {
        if (req.method === 'OPTIONS') {
          res.statusCode = 204
          res.end()
          return
        }
        if (req.method !== 'POST') {
          next()
          return
        }
        const chunks = []
        req.on('data', (c) => chunks.push(c))
        req.on('end', async () => {
          try {
            const body = JSON.parse(Buffer.concat(chunks).toString() || '{}')
            const result = await runLiveSearch(body)
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(result))
          } catch {
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 200
            res.end(
              JSON.stringify({
                suppliers: [],
                status: 'error',
                message:
                  'Não conseguimos consultar as fontes neste momento. A pesquisa continua com o diretório e a memória da SS.',
              }),
            )
          }
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), searchApi()],
})
