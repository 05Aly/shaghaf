import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { supabase } from './lib.js'
export function useSession() {
  const [s, setS] = useState(undefined)
  useEffect(() => { supabase.auth.getSession().then(({ data }) => setS(data.session))
    const { data } = supabase.auth.onAuthStateChange((_, x) => setS(x)); return () => data.subscription.unsubscribe() }, [])
  return s
}
export function AdminLogin() {
  const s = useSession(), nav = useNavigate(), [email, setEmail] = useState(''), [pw, setPw] = useState(''), [err, setErr] = useState('')
  if (s) return <Navigate to="/dashboard/admin" replace />
  const go = async e => { e.preventDefault(); const { error } = await supabase.auth.signInWithPassword({ email, password: pw })
    if (error) setErr('بيانات الدخول غير صحيحة'); else nav('/dashboard/admin') }
  return <div className="center"><form onSubmit={go} className="card modal">
    <h2 className="display-sm">دخول الأدمن</h2>
    <input className="input" type="email" placeholder="الإيميل" value={email} onChange={e => setEmail(e.target.value)} required />
    <input className="input" type="password" placeholder="الباسورد" value={pw} onChange={e => setPw(e.target.value)} required />
    {err && <p className="err">{err}</p>}<button className="btn violet">دخول</button></form></div>
}
export function AdminDashboard() {
  const s = useSession(), [msgs, setMsgs] = useState([]), [cur, setCur] = useState(null), [text, setText] = useState(''), end = useRef()
  useEffect(() => { if (!s) return
    supabase.from('messages').select('*').order('created_at').then(({ data }) => setMsgs(data || []))
    const ch = supabase.channel('admin').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' },
      p => setMsgs(m => m.some(x => x.id === p.new.id) ? m : [...m, p.new])).subscribe()
    return () => supabase.removeChannel(ch) }, [s])
  useEffect(() => end.current?.scrollIntoView({ behavior: 'smooth' }), [msgs, cur])
  if (s === undefined) return <div className="center muted">...</div>
  if (!s) return <Navigate to="/" replace />
  const sessions = {}; msgs.forEach(m => { (sessions[m.session_id] ||= []).push(m) })
  const list = Object.entries(sessions).sort((a, b) => b[1].at(-1).id - a[1].at(-1).id)
  const send = async e => { e.preventDefault(); if (!text.trim() || !cur) return
    await supabase.from('messages').insert({ session_id: cur, sender: 'admin', body: text.trim() }); setText('') }
  const label = ([id, ms]) => `${ms.find(x => x.device)?.device || 'جهاز'} · ${id.slice(0, 4)}`
  return <div className="admin">
    <aside className="card"><h3>المحادثات</h3>
      {list.map(x => <button key={x[0]} className={'sess ' + (cur === x[0] ? 'on' : '')} onClick={() => setCur(x[0])}>
        <b>{label(x)}</b><span className="muted">{x[1].at(-1).body.slice(0, 30)}</span></button>)}
      <button className="btn" onClick={() => supabase.auth.signOut()}>تسجيل خروج</button></aside>
    <main className="card chat-pane">
      {!cur ? <p className="muted">اختار محادثة</p> : <>
        <div className="chat-msgs">{sessions[cur].map(m => <div key={m.id} className={'bubble ' + (m.sender === 'admin' ? 'student' : 'admin')}>{m.body}</div>)}<div ref={end} /></div>
        <form onSubmit={send} className="chat-form"><input className="input" value={text} onChange={e => setText(e.target.value)} placeholder="اكتب ردك..." /><button className="btn violet">رد</button></form></>}
    </main></div>
}
