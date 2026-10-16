import { useEffect, useRef, useState } from 'react'
import { supabase, deviceName } from './lib.js'
import { IconChat, IconClose, IconSend } from './Icons.jsx'

const sid = () => {
  let s = localStorage.getItem('shaghaf_sid')
  if (!s) {
    s = crypto.randomUUID()
    localStorage.setItem('shaghaf_sid', s)
  }
  return s
}

export default function Chat() {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState([])
  const [text, setText] = useState('')
  const [unread, setUnread] = useState(false)
  const end = useRef()
  const openRef = useRef(false)
  const id = sid()

  openRef.current = open

  useEffect(() => {
    supabase.from('messages').select('*').eq('session_id', id).order('created_at').then(({ data }) => setMsgs(data || []))
    const ch = supabase.channel('chat-' + id).on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `session_id=eq.${id}` },
      p => {
        setMsgs(m => m.some(x => x.id === p.new.id) ? m : [...m, p.new])
        if (p.new.sender === 'admin' && !openRef.current) setUnread(true)
      }
    ).subscribe()
    return () => supabase.removeChannel(ch)
  }, [id])

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, open])

  const send = async e => {
    e.preventDefault()
    const body = text.trim()
    if (!body) return
    setText('')
    await supabase.from('messages').insert({ session_id: id, sender: 'student', body, device: deviceName() })
  }

  return (
    <>
      <button
        className={'chat-fab' + (open ? ' open' : '')}
        onClick={() => { setOpen(!open); setUnread(false) }}
        title="الدعم والمساعدة"
        aria-label="الدعم والمساعدة"
      >
        {open ? <IconClose size={24} /> : <IconChat size={24} />}
        {unread && <i className="chat-badge-dot" />}
      </button>

      {open && (
        <div className="chat-box">
          <div className="chat-head">
            <div className="chat-head-info">
              <span className="chat-status-dot" />
              <span>فريق الدعم الفني</span>
            </div>
            <button className="chat-close-btn" onClick={() => setOpen(false)} aria-label="إغلاق">
              <IconClose size={18} />
            </button>
          </div>

          <div className="chat-msgs">
            {msgs.length === 0 && (
              <p className="muted" style={{ textAlign: 'center', margin: 'auto 0' }}>
                اكتب استفسارك أو مشكلتك وسيقوم فريق الدعم بالرد عليك بأسرع وقت.
              </p>
            )}
            {msgs.map(m => (
              <div key={m.id} className={'bubble ' + m.sender}>
                {m.body}
              </div>
            ))}
            <div ref={end} />
          </div>

          <form onSubmit={send} className="chat-form">
            <input
              className="input"
              maxLength={1000}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="اكتب رسالتك هنا..."
            />
            <button className="btn primary" type="submit">
              <IconSend size={15} />
              <span>إرسال</span>
            </button>
          </form>
        </div>
      )}
    </>
  )
}
