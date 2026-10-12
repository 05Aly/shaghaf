import { createClient } from '@supabase/supabase-js'
export const ROOT = ''
export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL || 'http://localhost', import.meta.env.VITE_SUPABASE_ANON_KEY || 'x')
const call = async (op, id = '') => {
  const r = await fetch(`/api/drive?op=${op}&id=${encodeURIComponent(id)}`)
  if (!r.ok) throw new Error('drive'); return r.json()
}
export const listFolder = async id => (await call('list', id)).files
export const folderName = async id => (await call('name', id)).name || ''
export const getJson = id => call('json', id)
export const isFolder = f => f.mimeType === 'application/vnd.google-apps.folder'
export const isQuiz = f => /\.quiz\.json$/i.test(f.name)
export const clean = n => n.replace(/\.pdf$/i, '')
export const previewUrl = id => `https://drive.google.com/file/d/${id}/preview`
export const downloadUrl = id => `https://drive.google.com/uc?export=download&id=${id}`
export const deviceName = () => { const u = navigator.userAgent
  return /iPhone|iPad/.test(u) ? 'iPhone' : /Android/.test(u) ? 'Android' : /Mac/.test(u) ? 'Mac' : /Windows/.test(u) ? 'Windows' : 'جهاز' }