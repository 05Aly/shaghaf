// Vercel Serverless Function: the Drive key and root folder never reach the browser.
const API = 'https://www.googleapis.com/drive/v3/files'
export default async function handler(req, res) {
  const { op, id } = req.query
  const key = process.env.DRIVE_API_KEY
  if (!key) return res.status(500).json({ error: 'server not configured' })
  const fid = id || process.env.DRIVE_ROOT_FOLDER_ID
  if (!/^[\w-]+$/.test(fid || '')) return res.status(400).json({ error: 'bad id' })
  let url
  if (op === 'list') {
    const q = encodeURIComponent(`'${fid}' in parents and trashed=false`)
    url = `${API}?q=${q}&fields=files(id,name,mimeType)&orderBy=name_natural&pageSize=200&key=${key}`
  } else if (op === 'name') url = `${API}/${fid}?fields=name&key=${key}`
  else if (op === 'json') url = `${API}/${fid}?alt=media&key=${key}`
  else return res.status(400).json({ error: 'bad op' })
  try {
    const r = await fetch(url)
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
    return res.status(r.status).json(await r.json())
  } catch { return res.status(502).json({ error: 'drive unreachable' }) }
}