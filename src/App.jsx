import { useEffect, useState } from 'react'
import { Routes, Route, Link, useParams, useNavigate, useLocation } from 'react-router-dom'
import { ROOT, listFolder, folderName, getJson, isFolder, isQuiz, clean, previewUrl, downloadUrl } from './lib.js'
import { AdminLogin, AdminDashboard } from './Admin.jsx'
import Chat from './Chat.jsx'

const Back = () => { const n = useNavigate(); return <button className="btn" onClick={() => n(-1)}>← رجوع</button> }
const Page = ({ eyebrow, title, children }) => <div className="page"><Back /><div className="eyebrow">{eyebrow}</div><h1 className="display">{title}</h1>{children}</div>
const Grid = ({ children }) => <div className="grid">{children}</div>
const Cards = ({ to, name, icon = '📘', sub }) => <Link to={to} className="card hover"><div className="ic">{icon}</div><h3>{name}</h3>{sub && <p className="muted">{sub}</p>}</Link>

function Home() {
  return <div className="page hero">
    <div className="eyebrow">منصة تعليمية</div>
    <h1 className="display wordmark">شغف</h1>
    <p className="lead">منصة بتساعدك في الدراسة والمذاكرة، عليها المنهج بالنظام القديم والجديد، شروحات ومراجعات واختبارات في مكان واحد.</p>
    <Link to="/browse" className="btn violet big">ابدأ الدراسة</Link>
    <div className="card thanks"><h3>رسالة شكر 💜</h3>
      <p>شغف الجديدة هي منصة بديلة لشغف الأولى، وبنكمل رحلتكم بدالهم. بنشكرهم من قلبنا على تعبهم معانا في البداية، واحنا دلوقتي بنكمل وراهم بنفس الشغف.</p></div>
  </div>
}

const STEPS = ['اختر النظام', 'اختر السنة الدراسية', 'اختر الترم', 'اختر المادة', 'اختر القسم']
function Browse() {
  const ids = (useParams()['*'] || '').split('/').filter(Boolean), depth = ids.length
  const cur = ids.at(-1) || ROOT, [items, setItems] = useState(null), [name, setName] = useState(''), [err, setErr] = useState(false)
  useEffect(() => { setItems(null); setErr(false)
    listFolder(cur).then(setItems).catch(() => setErr(true)); if (depth) folderName(cur).then(setName) }, [cur])
  const review = /مراجع|review/i.test(name), base = '/browse/' + ids.join('/')
  const folders = items?.filter(isFolder) || [], files = items?.filter(f => !isFolder(f) && !isQuiz(f)) || []
  return <Page eyebrow={depth ? name : 'شغف'} title={files.length ? (review ? 'المراجعات' : 'الدروس') : STEPS[depth] || 'اختر'}>
    {err && <p className="err">تعذر تحميل المحتوى، تأكد من إعدادات Drive.</p>}
    {!items && !err && <p className="muted">جاري التحميل...</p>}
    <Grid>
      {folders.map(f => <Cards key={f.id} to={`${base.replace(/\/$/, '')}/${f.id}`} name={f.name} icon={depth === 4 ? '📂' : '🎓'} />)}
      {files.map(f => <Cards key={f.id} to={`/lesson/${cur}/${f.id}${review ? '?r=1' : ''}`} name={clean(f.name)} icon="📄" />)}
    </Grid></Page>
}

function Lesson() {
  const { folder, file } = useParams(), r = new URLSearchParams(useLocation().search).get('r')
  const [quiz, setQuiz] = useState(null), [name, setName] = useState('')
  useEffect(() => { listFolder(folder).then(fs => { const f = fs.find(x => x.id === file); setName(clean(f?.name || ''))
    setQuiz(fs.find(x => isQuiz(x) && x.name.replace(/\.quiz\.json$/i, '').toLowerCase() === clean(f?.name || '').toLowerCase()) || false) }) }, [folder, file])
  return <Page eyebrow={r ? 'مراجعة' : 'درس'} title={name}>
    <Grid>
      <Cards to={`/view/${file}`} name={r ? 'فتح المراجعة' : 'فتح الدرس'} icon="📖" />
      {quiz ? <Cards to={`/quiz/${quiz.id}`} name={r ? 'اختبار على المنهج كله' : 'اختبار على الدرس'} icon="📝" /> :
        <div className="card dim"><div className="ic">📝</div><h3>{r ? 'اختبار على المنهج كله' : 'اختبار على الدرس'}</h3><p className="muted">{quiz === null ? '...' : 'قريبًا'}</p></div>}
    </Grid></Page>
}

const View = () => { const { file } = useParams()
  return <div className="page wide"><Back /><iframe className="pdf" src={previewUrl(file)} title="pdf" allow="autoplay" />
    <a className="btn violet big" href={downloadUrl(file)}>⬇ تحميل الملف</a></div> }

function Quiz() {
  const { qid } = useParams(), [qs, setQs] = useState(null), [i, setI] = useState(0), [pick, setPick] = useState(null), [score, setScore] = useState(0)
  useEffect(() => { getJson(qid).then(d => setQs(Array.isArray(d) ? d : d.questions)) }, [qid])
  if (!qs) return <Page eyebrow="اختبار" title="..."></Page>
  if (i >= qs.length) return <Page eyebrow="النتيجة" title={`${score} / ${qs.length}`}><button className="btn violet" onClick={() => { setI(0); setScore(0); setPick(null) }}>إعادة الاختبار</button></Page>
  const q = qs[i], next = () => { setI(i + 1); setPick(null) }
  return <Page eyebrow={`سؤال ${i + 1} من ${qs.length}`} title={q.q}>
    <div className="opts">{q.options.map((o, k) => <button key={k} disabled={pick !== null}
      className={'btn opt ' + (pick !== null ? (k === q.answer ? 'ok' : k === pick ? 'bad' : '') : '')}
      onClick={() => { setPick(k); if (k === q.answer) setScore(score + 1) }}>{o}</button>)}</div>
    {pick !== null && <button className="btn violet" onClick={next}>{i + 1 === qs.length ? 'عرض النتيجة' : 'التالي'}</button>}</Page>
}

export default function App() {
  const admin = useLocation().pathname.startsWith('/dashboard/admin')
  return <><div className="grid-bg" />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/browse/*" element={<Browse />} />
      <Route path="/lesson/:folder/:file" element={<Lesson />} />
      <Route path="/view/:file" element={<View />} />
      <Route path="/quiz/:qid" element={<Quiz />} />
      <Route path="/dashboard/admin/login" element={<AdminLogin />} />
      <Route path="/dashboard/admin" element={<AdminDashboard />} />
      <Route path="*" element={<Home />} />
    </Routes>{!admin && <Chat />}</>
}
