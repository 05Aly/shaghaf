import { useEffect, useRef, useState } from 'react'
import { supabase, deviceName } from './lib.js'
const sid = () => { let s = localStorage.getItem('shaghaf_sid'); if (!s) { s = crypto.randomUUID(); localStorage.setItem('shaghaf_sid', s) } return s }
export default function Chat() {
  const [open, setOpen] = useState(false), [msgs, setMsgs] = useState([]), [text, setText] = useState('')
  const end = useRef(), id = sid()
  useEffect(() => {
    supabase.from('messages').select('*').eq('session_id', id).order('created_at').then(({ data }) => setMsgs(data || []))
    const ch = supabase.channel('chat-' + id).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `session_id=eq.${id}` },
      p => setMsgs(m => m.some(x => x.id === p.new.id) ? m : [...m, p.new])).subscribe()
    return () => supabase.removeChannel(ch)
  }, [id])
  useEffect(() => end.current?.scrollIntoView({ behavior: 'smooth' }), [msgs, open])
  const send = async e => { e.preventDefault(); const body = text.trim(); if (!body) return; setText('')
    await supabase.from('messages').insert({ session_id: id, sender: 'student', body, device: deviceName() }) }
  return (<>
    <button className={"chat-fab btn" + (open ? " open" : "")} onClick={() => setOpen(!open)}>💬 الدعم</button>
    {open && <div className="chat-box card">
      <div className="chat-head" style={{display:"flex",justifyContent:"space-between"}}>الدعم الفني<button className="btn" onClick={() => setOpen(false)}>✕</button></div>
      <div className="chat-msgs">{msgs.length === 0 && <p className="muted">اكتب رسالتك وهنرد عليك في أقرب وقت</p>}
        {msgs.map(m => <div key={m.id} className={'bubble ' + m.sender}>{m.body}</div>)}<div ref={end} /></div>
      <form onSubmit={send} className="chat-form"><input className="input" value={text} onChange={e => setText(e.target.value)} placeholder="اكتب رسالة..." /><button className="btn violet">إرسال</button></form>
    </div>}
  </>)
}