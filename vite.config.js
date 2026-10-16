import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
// Runs api/drive.js inside `npm run dev` so /api works locally.
export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))
  return { plugins: [react(), { name: 'dev-api', configureServer(server) {
    server.middlewares.use('/api/drive', async (req, res) => {
      const { default: handler } = await server.ssrLoadModule('/api/drive.js')
      req.query = Object.fromEntries(new URL(req.url, 'http://x').searchParams)
      res.status = c => { res.statusCode = c; return res }
      res.json = d => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(d)) }
      await handler(req, res)
    }) } }] }
})
