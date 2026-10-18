import { useEffect, useState } from 'react'
import { Routes, Route, Link, useParams, useNavigate, useLocation } from 'react-router-dom'
import { listFolder, folderName, getJson, isFolder, isQuiz, clean, previewUrl, downloadUrl, getDone, markDone } from './lib.js'
import { AdminLogin, AdminDashboard } from './Admin.jsx'
import Chat from './Chat.jsx'
import {
  IconBook,
  IconGraduation,
  IconFolder,
  IconFile,
  IconCheck,
  IconCheckCircle,
  IconHeart,
  IconSearch,
  IconDownload,
  IconArrowLeft,
  IconBack,
  IconLightbulb,
  IconSun,
  IconMoon,
  IconTrophy,
  IconSparkles,
  IconRepeat,
  IconCompass,
  IconClose
} from './Icons.jsx'

// Theme hook and toggle
function useTheme() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('shaghaf_theme') || 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('shaghaf_theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'))
  }

  return { theme, toggleTheme }
}

// Navigation Header
const Navbar = ({ theme, toggleTheme }) => {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <header className="navbar">
      <div className="nav-inner">
        <Link to="/" className="brand">
          <span>شغف</span>
          <span className="brand-badge">منصة دراسية</span>
        </Link>
        <div className="nav-actions">
          <Link to="/" className={`nav-link ${isHome ? 'active' : ''}`}>
            الرئيسية
          </Link>
          <Link to="/browse" className={`nav-link ${location.pathname.startsWith('/browse') ? 'active' : ''}`}>
            المناهج
          </Link>
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label={theme === 'light' ? 'تفعيل الوضع الليلي' : 'تفعيل الوضع النهاري'}
            title={theme === 'light' ? 'تفعيل الوضع الليلي' : 'تفعيل الوضع النهاري'}
          >
            {theme === 'light' ? <IconMoon size={19} /> : <IconSun size={19} />}
          </button>
        </div>
      </div>
    </header>
  )
}

const Back = () => {
  const n = useNavigate()
  return (
    <button className="btn secondary" onClick={() => n(-1)}>
      <IconBack className="btn-icon-back" size={18} />
      <span>رجوع</span>
    </button>
  )
}

const Page = ({ eyebrow, title, children, showBack = true, topAction = null }) => (
  <div className="page">
    <div className="page-top-bar">
      {showBack ? <Back /> : <div />}
      {topAction}
    </div>
    {eyebrow && (
      <div className="eyebrow">
        <span className="eyebrow-dot" />
        <span>{eyebrow}</span>
      </div>
    )}
    {title && <h1 className="display">{title}</h1>}
    {children}
  </div>
)

const Grid = ({ children }) => <div className="grid">{children}</div>

const Cards = ({ to, name, icon, sub, done }) => {
  const renderIcon = () => {
    if (typeof icon === 'string') {
      if (icon === '📂') return <IconFolder size={24} />
      if (icon === '🎓') return <IconGraduation size={24} />
      if (icon === '📄') return <IconFile size={24} />
      if (icon === '📖') return <IconBook size={24} />
      if (icon === '📝') return <IconGraduation size={24} />
      return <IconBook size={24} />
    }
    return icon || <IconBook size={24} />
  }

  return (
    <Link to={to} className="card hover">
      <div className="ic">{renderIcon()}</div>
      <h3>
        <span className="card-title-text">{name}</span>
        {done && (
          <span className="done-badge">
            <IconCheck size={12} />
            <span>مكتمل</span>
          </span>
        )}
      </h3>
      {sub && <p className="muted">{sub}</p>}
    </Link>
  )
}

function Home() {
  return (
    <div className="page hero">
      <div className="eyebrow">
        <span className="eyebrow-dot" />
        <span>منصة تعليمية مجانية بالكامل</span>
      </div>
      <h1 className="display wordmark">شغف</h1>
      <p className="lead">
        منصتك الشاملة للدراسة والمذاكرة المنظمة. تجد هنا المناهج بالنظامين القديم والجديد،
        شروحات وافية ومراجعات مركزة واختبارات تفاعلية في مكان واحد، بدون أي تسجيل أو اشتراكات.
      </p>

      <div className="hero-cta">
        <Link to="/browse" className="btn primary big">
          <span>ابدأ الدراسة الآن</span>
          <span className="btn-icon btn-icon-forward">
            <IconArrowLeft size={18} />
          </span>
        </Link>
        <Link to="/browse" className="btn secondary big">
          <IconCompass size={18} />
          <span>استعراض المناهج والأقسام</span>
        </Link>
      </div>

      <div className="feature-pills">
        <div className="pill-item">
          <IconBook size={16} />
          <span>مناهج النظام القديم والجديد</span>
        </div>
        <div className="pill-item">
          <IconSparkles size={16} />
          <span>شروحات ومراجعات PDF مباشرة</span>
        </div>
        <div className="pill-item">
          <IconCheckCircle size={16} />
          <span>اختبارات تقييم فورية مجانية</span>
        </div>
      </div>

      <div className="card thanks">
        <div className="thanks-header">
          <div className="thanks-icon">
            <IconHeart size={20} />
          </div>
          <h3>رسالة شكر وتقدير</h3>
        </div>
        <p>
          شغف الجديدة هي منصة بديلة لهادف، وبنكمل رحلتهم بدالهم. بنشكرهم من قلبنا على تعبهم
          معانا في البداية، واحنا دلوقتي بنكمل وراهم بنفس الشغف ونسعى دائمًا لتقديم أفضل تجربة لجميع الطلاب.
        </p>
      </div>
    </div>
  )
}

const STEPS = ['النظام الدراسي', 'السنة الدراسية', 'الترم', 'المادة', 'القسم']

function Browse() {
  const ids = (useParams()['*'] || '').split('/').filter(Boolean)
  const depth = ids.length
  const cur = ids.at(-1) || ''
  const [items, setItems] = useState(null)
  const [name, setName] = useState('')
  const [err, setErr] = useState(false)
  const [q, setQ] = useState('')
  const [tick, setTick] = useState(0)

  useEffect(() => {
    setItems(null)
    setErr(false)
    setQ('')
    setName('')
    listFolder(cur)
      .then(setItems)
      .catch(() => setErr(true))
    if (depth) {
      folderName(cur)
        .then(setName)
        .catch(() => {})
    }
  }, [cur, tick])

  const review = /مراجع|review/i.test(name)
  const base = '/browse' + ids.map(i => '/' + i).join('')
  const match = f => f.name.toLowerCase().includes(q.trim().toLowerCase())
  const folders = (items?.filter(isFolder) || []).filter(match)
  const files = (items?.filter(f => !isFolder(f) && !isQuiz(f)) || []).filter(match)
  const hasFiles = items?.some(f => !isFolder(f) && !isQuiz(f))
  const done = getDone()

  const currentStepTitle = hasFiles ? (review ? 'المراجعات النهائية' : 'الدروس والشروحات') : STEPS[depth] || 'اختر القسم'

  return (
    <Page eyebrow={depth ? name : 'أقسام المناهج'} title={currentStepTitle}>
      {/* Steps trail indicator */}
      {depth > 0 && depth < STEPS.length && (
        <div className="steps-nav">
          {STEPS.slice(0, depth + 1).map((s, idx) => (
            <span key={idx} className={`step-chip ${idx === depth ? 'active' : ''}`}>
              {idx === depth ? (
                <IconCheckCircle size={14} />
              ) : (
                <span style={{ fontSize: '12px' }}>{idx + 1}</span>
              )}
              <span>{s}</span>
            </span>
          ))}
        </div>
      )}

      {items && items.length > 5 && (
        <div className="search-wrapper">
          <span className="search-icon-pos">
            <IconSearch size={18} />
          </span>
          <input
            className="input search"
            placeholder="ابحث بالاسم..."
            value={q}
            onChange={e => setQ(e.target.value)}
          />
          {q && (
            <button className="search-clear-btn" onClick={() => setQ('')} aria-label="مسح البحث">
              <IconClose size={16} />
            </button>
          )}
        </div>
      )}

      {err && (
        <div className="card" style={{ maxWidth: '520px', margin: '20px 0' }}>
          <p className="err">تعذر تحميل المحتوى. يرجى التأكد من الاتصال أو إعدادات الخدمة.</p>
          <button className="btn primary" onClick={() => setTick(tick + 1)}>
            <IconRepeat size={16} />
            <span>إعادة المحاولة</span>
          </button>
        </div>
      )}

      {!items && !err && (
        <Grid>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="card sk" />
          ))}
        </Grid>
      )}

      {items && items.length === 0 && (
        <p className="muted" style={{ padding: '30px 0', fontSize: '16px' }}>
          لا يوجد محتوى مدرج هنا حاليًا.
        </p>
      )}

      {items && items.length > 0 && !folders.length && !files.length && (
        <p className="muted" style={{ padding: '30px 0', fontSize: '16px' }}>
          لا توجد نتائج مطابقة لبحثك.
        </p>
      )}

      <Grid>
        {folders.map(f => (
          <Cards
            key={f.id}
            to={`${base}/${f.id}`}
            name={f.name}
            icon={depth === 4 ? <IconFolder size={24} /> : <IconGraduation size={24} />}
          />
        ))}
        {files.map(f => (
          <Cards
            key={f.id}
            to={`/lesson/${cur}/${f.id}${review ? '?r=1' : ''}`}
            name={clean(f.name)}
            icon={<IconFile size={24} />}
            done={done.includes(f.id)}
          />
        ))}
      </Grid>
    </Page>
  )
}

function Lesson() {
  const { folder, file } = useParams()
  const r = new URLSearchParams(useLocation().search).get('r')
  const [quiz, setQuiz] = useState(null)
  const [name, setName] = useState('')

  useEffect(() => {
    listFolder(folder)
      .then(fs => {
        const n = clean(fs.find(x => x.id === file)?.name || '')
        setName(n)
        setQuiz(
          fs.find(
            x => isQuiz(x) && x.name.replace(/\.quiz\.json$/i, '').trim().toLowerCase() === n.trim().toLowerCase()
          ) || false
        )
      })
      .catch(() => setQuiz(false))
  }, [folder, file])

  const qt = r ? 'اختبار شامل على المنهج' : 'اختبار تقييم الدرس'

  return (
    <Page eyebrow={r ? 'مراجعة نهائية' : 'شرح ومذاكرة'} title={name || 'جاري التحميل...'}>
      <Grid>
        <Cards
          to={`/view/${file}`}
          name={r ? 'مطالعة المراجعة (PDF)' : 'عرض الدرس والشرح (PDF)'}
          icon={<IconBook size={24} />}
          sub="تصفح محتوى المذكرة كاملًا أونلاين أو تحميلها لجهازك"
        />
        {quiz ? (
          <Cards
            to={`/quiz/${quiz.id}`}
            name={qt}
            icon={<IconGraduation size={24} />}
            sub="اختبر استيعابك للمحتوى مع تصحيح فوري وشرح الإجابات"
          />
        ) : (
          <div className="card dim">
            <div className="ic">
              <IconGraduation size={24} />
            </div>
            <h3>{qt}</h3>
            <p className="muted">{quiz === null ? 'جاري الفحص...' : 'سيتوفر الاختبار قريبًا'}</p>
          </div>
        )}
      </Grid>
    </Page>
  )
}

function View() {
  const { file } = useParams()
  useEffect(() => markDone(file), [file])

  const topDownloadAction = (
    <a className="btn primary" href={downloadUrl(file)} download target="_blank" rel="noreferrer">
      <IconDownload size={18} />
      <span>تحميل الملف</span>
    </a>
  )

  return (
    <div className="page wide">
      <div className="page-top-bar">
        <Back />
        {topDownloadAction}
      </div>

      <div className="pdf-container">
        <iframe className="pdf" src={previewUrl(file)} title="عرض الملف" allow="autoplay" />
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <a className="btn primary big" href={downloadUrl(file)} target="_blank" rel="noreferrer">
          <IconDownload size={20} />
          <span>تحميل نسخة PDF المباشرة</span>
        </a>
      </div>
    </div>
  )
}

function Quiz() {
  const { qid } = useParams()
  const [qs, setQs] = useState(null)
  const [i, setI] = useState(0)
  const [pick, setPick] = useState(null)
  const [score, setScore] = useState(0)
  const [err, setErr] = useState(false)

  useEffect(() => {
    getJson(qid)
      .then(d => {
        const a = Array.isArray(d) ? d : d.questions
        if (!a?.length) throw new Error('Empty quiz')
        setQs(a)
      })
      .catch(() => setErr(true))
  }, [qid])

  if (err) {
    return (
      <Page eyebrow="اختبار تقييمي" title="تعذر تحميل الاختبار">
        <div className="card" style={{ maxWidth: '520px' }}>
          <p className="err">تأكد من صحة ملف الاختبار والتنسيق المطلوب (JSON).</p>
          <Back />
        </div>
      </Page>
    )
  }

  if (!qs) {
    return <Page eyebrow="اختبار تقييمي" title="جاري تجهيز الأسئلة..."></Page>
  }

  // Finished Quiz Screen
  if (i >= qs.length) {
    const p = Math.round((score / qs.length) * 100)
    const isTop = p >= 85
    const isPass = p >= 60

    return (
      <Page eyebrow="نتيجة الاختبار" title="ملخص التقييم">
        <div className="card result-card">
          <div className="result-icon-wrap">
            {isTop ? <IconTrophy size={36} /> : isPass ? <IconCheckCircle size={36} /> : <IconRepeat size={36} />}
          </div>
          <div className="result-score">
            {score} / {qs.length}
          </div>
          <p className="lead2" style={{ color: 'var(--text-title)', fontWeight: 600 }}>
            نسبة النجاح: {p}%
          </p>
          <p className="lead" style={{ marginBottom: '28px' }}>
            {isTop
              ? 'ممتاز جدًا! أداء رائع واستيعاب كامل للمحتوى.'
              : isPass
              ? 'مستوى جيد جدًا! راجع الأسئلة التي تعثرت بها وأعد الاختبار لتصل للدرجة النهائية.'
              : 'تحتاج إلى مراجعة إضافية للدرس. أعد المحاولة وستحقق نتيجة أفضل بالتأكيد.'}
          </p>
          <button
            className="btn primary big"
            onClick={() => {
              setI(0)
              setScore(0)
              setPick(null)
            }}
          >
            <IconRepeat size={18} />
            <span>إعادة الاختبار من البداية</span>
          </button>
        </div>
      </Page>
    )
  }

  const q = qs[i]
  const optionLetters = ['أ', 'ب', 'ج', 'د', 'هـ']

  return (
    <Page eyebrow={`السؤال ${i + 1} من ${qs.length}`} title={q.q}>
      <div className="bar">
        <i style={{ width: `${(i / qs.length) * 100}%` }} />
      </div>

      <div className="opts">
        {q.options.map((o, k) => (
          <button
            key={k}
            disabled={pick !== null}
            className={'opt ' + (pick !== null ? (k === q.answer ? 'ok' : k === pick ? 'bad' : '') : '')}
            onClick={() => {
              setPick(k)
              if (k === q.answer) setScore(score + 1)
            }}
          >
            <span className="opt-index">{optionLetters[k] || k + 1}</span>
            <span>{o}</span>
          </button>
        ))}
      </div>

      {pick !== null && q.explain && (
        <div className="explain-box">
          <IconLightbulb className="explain-icon" size={20} />
          <div>
            <strong>توضيح الإجابة: </strong>
            <span>{q.explain}</span>
          </div>
        </div>
      )}

      {pick !== null && (
        <button
          className="btn primary big"
          style={{ marginTop: '8px' }}
          onClick={() => {
            setI(i + 1)
            setPick(null)
          }}
        >
          <span>{i + 1 === qs.length ? 'عرض النتيجة النهائية' : 'السؤال التالي'}</span>
          <span className="btn-icon btn-icon-forward">
            <IconArrowLeft size={18} />
          </span>
        </button>
      )}
    </Page>
  )
}

export default function App() {
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const admin = location.pathname.startsWith('/dashboard/admin')

  return (
    <>
      <div className="grid-bg" />
      {!admin && <Navbar theme={theme} toggleTheme={toggleTheme} />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/browse/*" element={<Browse />} />
        <Route path="/lesson/:folder/:file" element={<Lesson />} />
        <Route path="/view/:file" element={<View />} />
        <Route path="/quiz/:qid" element={<Quiz />} />
        <Route path="/dashboard/admin/login" element={<AdminLogin />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
        <Route path="*" element={<Home />} />
      </Routes>
      {!admin && <Chat />}
    </>
  )
}
