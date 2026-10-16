import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { supabase } from './lib.js'
import { IconTrash } from './Icons.jsx'

export function useSession() {
  const [s, setS] = useState(undefined)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setS(data.session))
    const { data } = supabase.auth.onAuthStateChange((_, x) => setS(x))
    return () => data.subscription.unsubscribe()
  }, [])
  return s
}

export function AdminLogin() {
  const s = useSession()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  if (s) return <Navigate to="/dashboard/admin" replace />

  const go = async e => {
    e.preventDefault()
    setBusy(true)
    setErr('')
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw })
    setBusy(false)
    if (error) setErr('بيانات الدخول غير صحيحة')
    else nav('/dashboard/admin')
  }

  return (
    <div className="center">
      <form onSubmit={go} className="card modal">
        <h2 className="display-sm">لوحة تحكم المشرف</h2>
        <input
          className="input"
          type="email"
          placeholder="البريد الإلكتروني"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          className="input"
          type="password"
          placeholder="كلمة المرور"
          value={pw}
          onChange={e => setPw(e.target.value)}
          required
        />
        {err && <p className="err">{err}</p>}
        <button className="btn primary" disabled={busy}>
          {busy ? 'جاري التحقق...' : 'تسجيل الدخول'}
        </button>
      </form>
    </div>
  )
}

export function AdminDashboard() {
  const s = useSession()
  const [msgs, setMsgs] = useState([])
  const [cur, setCur] = useState(null)
  const [text, setText] = useState('')
  const end = useRef()

  useEffect(() => {
    if (!s) return
    supabase.from('messages').select('*').order('created_at').then(({ data }) => setMsgs(data || []))
    const ch = supabase.channel('admin').on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages' },
      p => setMsgs(m => m.some(x => x.id === p.new.id) ? m : [...m, p.new])
    ).subscribe()
    return () => supabase.removeChannel(ch)
  }, [s])

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, cur])

  if (s === undefined) return <div className="center muted">جاري التحميل...</div>
  if (!s) return <Navigate to="/" replace />

  const sessions = {}
  msgs.forEach(m => {
    ;(sessions[m.session_id] ||= []).push(m)
  })
  const list = Object.entries(sessions).sort((a, b) => b[1].at(-1).id - a[1].at(-1).id)

  const send = async e => {
    e.preventDefault()
    if (!text.trim() || !cur) return
    await supabase.from('messages').insert({ session_id: cur, sender: 'admin', body: text.trim() })
    setText('')
  }

  const del = async () => {
    if (!confirm('هل أنت متأكد من حذف هذه المحادثة نهائيًا؟')) return
    await supabase.from('messages').delete().eq('session_id', cur)
    setMsgs(m => m.filter(x => x.session_id !== cur))
    setCur(null)
  }

  const label = ([id, ms]) => `${ms.find(x => x.device)?.device || 'مستخدم'} · ${id.slice(0, 4)}`

  return (
    <div className="admin">
      <aside className="card">
        <h3>المحادثات ({list.length})</h3>
        {list.map(x => (
          <button key={x[0]} className={'sess ' + (cur === x[0] ? 'on' : '')} onClick={() => setCur(x[0])}>
            <b>
              <span>{label(x)}</span>
              {x[1].at(-1).sender === 'student' && <span className="chat-badge-dot" style={{ position: 'static' }} />}
            </b>
            <span className="muted">{x[1].at(-1).body.slice(0, 32)}</span>
          </button>
        ))}
        <button className="btn" onClick={() => supabase.auth.signOut()} style={{ marginTop: 'auto' }}>
          تسجيل الخروج
        </button>
      </aside>

      <main className="card chat-pane">
        {!cur ? (
          <p className="muted pad" style={{ margin: 'auto' }}>
            اختر محادثة لعرض تفاصيلها والرد عليها
          </p>
        ) : (
          <>
            <div className="chat-head">
              <span>{label([cur, sessions[cur]])}</span>
              <button className="btn" onClick={del} style={{ padding: '6px 12px', minHeight: '34px' }}>
                <IconTrash size={15} />
                <span>حذف</span>
              </button>
            </div>
            <div className="chat-msgs">
              {sessions[cur].map(m => (
                <div key={m.id} className={'bubble ' + (m.sender === 'admin' ? 'student' : 'admin')}>
                  {m.body}
                </div>
              ))}
              <div ref={end} />
            </div>
            <form onSubmit={send} className="chat-form">
              <input
                className="input"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="اكتب ردك هنا..."
              />
              <button className="btn primary">إرسال الرد</button>
            </form>
          </>
        )}
      </main>
    </div>
  )
}
