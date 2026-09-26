import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { LayoutDashboard, Users, CalendarDays, BarChart3, Plus, Search, Bell, Settings2, ChevronLeft, Utensils, Droplets, Cookie, Check, X, Sparkles, ArrowUpLeft, Clock3, MoreHorizontal } from 'lucide-react'
import './styles.css'

const seed = {
  members: [
    { id: 1, name: 'مریم', role: 'مادر', age: 37, color: '#f39a7a', initials: 'م', goal: 'حفظ وزن' },
    { id: 2, name: 'امیر', role: 'پدر', age: 40, color: '#6d8bd9', initials: 'ا', goal: 'افزایش انرژی' },
    { id: 3, name: 'علی', role: 'کودک', age: 9, color: '#f2c94c', initials: 'ع', goal: 'رشد سالم' },
    { id: 4, name: 'سارا', role: 'نوجوان', age: 15, color: '#8fc8a7', initials: 'س', goal: 'حفظ وزن' }
  ],
  logs: [
    { id: 1, type: 'meal', title: 'قورمه‌سبزی با برنج', subtitle: 'ناهار · امروز، ۱۳:۲۰', members: ['مریم', 'امیر', 'علی'], icon: '🍲', tag: 'وعده اصلی' },
    { id: 2, type: 'snack', title: 'سیب و گردو', subtitle: 'میان‌وعده · امروز، ۱۶:۱۰', members: ['علی'], icon: '🍎', tag: 'میان‌وعده' },
    { id: 3, type: 'drink', title: 'آب', subtitle: 'امروز، ۱۱:۴۵', members: ['مریم', 'امیر'], icon: '💧', tag: 'نوشیدنی' },
    { id: 4, type: 'snack', title: 'بیسکویت', subtitle: 'دیروز، ۱۸:۳۰', members: ['سارا'], icon: '🍪', tag: 'تنقلات' }
  ],
  plan: [
    { day: 'شنبه', date: '۲۸ شهریور', meals: [{ time: 'صبحانه', title: 'نان، پنیر و گردو', icon: '🥖' }, { time: 'ناهار', title: 'قورمه‌سبزی با برنج', icon: '🍲' }, { time: 'شام', title: 'کوکو سبزی و ماست', icon: '🥗' }] },
    { day: 'یکشنبه', date: '۲۹ شهریور', meals: [{ time: 'صبحانه', title: 'املت گوجه', icon: '🍳' }, { time: 'ناهار', title: 'عدس‌پلو با کشمش', icon: '🍚' }, { time: 'شام', title: 'سوپ جو و سبزیجات', icon: '🥣' }] },
    { day: 'دوشنبه', date: '۳۰ شهریور', meals: [{ time: 'صبحانه', title: 'شیر و خرما', icon: '🥛' }, { time: 'ناهار', title: 'زرشک‌پلو با مرغ', icon: '🍗' }, { time: 'شام', title: 'سالاد شیرازی و تخم‌مرغ', icon: '🥗' }] }
  ]
}

function usePersistedState(key, initial) {
  const [value, setValue] = useState(() => { try { return JSON.parse(localStorage.getItem(key)) ?? initial } catch { return initial } })
  useEffect(() => localStorage.setItem(key, JSON.stringify(value)), [key, value])
  return [value, setValue]
}

function App() {
  const [tab, setTab] = useState('home')
  const [data, setData] = usePersistedState('nutrition-data', seed)
  const [showQuick, setShowQuick] = useState(false)
  const [showMember, setShowMember] = useState(false)
  const [toast, setToast] = useState('')
  const [selectedMember, setSelectedMember] = useState(null)
  const [query, setQuery] = useState('')

  const notify = (message) => { setToast(message); setTimeout(() => setToast(''), 2600) }
  const addLog = (entry) => { setData(d => ({ ...d, logs: [{ ...entry, id: Date.now() }, ...d.logs] })); setShowQuick(false); notify('ثبت شد؛ ممنون که پیگیر تغذیه خانواده هستید.') }
  const addMember = (member) => { setData(d => ({ ...d, members: [...d.members, { ...member, id: Date.now(), initials: member.name?.[0] || '؟' }] })); setShowMember(false); notify('عضو جدید اضافه شد.') }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">✦</div><div><strong>تغذیه‌یار</strong><span>خانواده</span></div></div>
      <div className="family-switch"><div className="family-avatar">خ</div><div><b>خانواده کریمی</b><small>۴ عضو فعال</small></div><ChevronLeft size={16}/></div>
      <nav>{[['home','داشبورد',LayoutDashboard],['members','اعضای خانواده',Users],['plan','برنامه غذایی',CalendarDays],['reports','گزارش‌ها',BarChart3]].map(([id,label,Icon]) => <button key={id} className={tab===id?'active':''} onClick={() => setTab(id)}><Icon size={19}/><span>{label}</span>{id==='home'&&<i>۳</i>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="tip"><Sparkles size={17}/><p><b>یادآوری کوچک</b><br/>امروز آب بیشتری بنوشید.</p></div><button className="settings"><Settings2 size={18}/> تنظیمات</button><div className="profile-mini"><div className="user-avatar">ک</div><div><b>کاربر خانواده</b><small>حساب رایگان</small></div><MoreHorizontal size={17}/></div></div>
    </aside>
    <main className="content">
      <header className="topbar"><div><p className="eyebrow">شنبه، ۲۸ شهریور ۱۴۰۴</p><h1>{tab==='home'?'صبح بخیر، خانواده کریمی 🌿':tab==='members'?'اعضای خانواده':tab==='plan'?'برنامه غذایی':'گزارش‌های تغذیه'}</h1></div><div className="top-actions"><button className="icon-btn"><Bell size={19}/><span className="dot"/></button><button className="quick-btn" onClick={()=>setShowQuick(true)}><Plus size={18}/> ثبت سریع</button></div></header>
      {tab==='home' && <Dashboard data={data} setTab={setTab} setShowQuick={setShowQuick} setSelectedMember={setSelectedMember} query={query} setQuery={setQuery}/>} 
      {tab==='members' && <Members data={data} setSelectedMember={setSelectedMember} setShowMember={setShowMember}/>} 
      {tab==='plan' && <Plan data={data} onAdd={()=>notify('برنامه پیشنهادی برای شما آماده شد؛ قابل ویرایش است.')}/>} 
      {tab==='reports' && <Reports data={data}/>} 
    </main>
    {showQuick && <QuickAdd members={data.members} onClose={()=>setShowQuick(false)} onSave={addLog}/>} 
    {showMember && <MemberModal onClose={()=>setShowMember(false)} onSave={addMember}/>} 
    {selectedMember && <MemberDetail member={selectedMember} data={data} onClose={()=>setSelectedMember(null)}/>} 
    {toast && <div className="toast"><Check size={17}/>{toast}</div>}
  </div>
}

function Dashboard({data,setTab,setShowQuick,setSelectedMember,query,setQuery}) {
  return <div className="page-body"><section className="hero-grid"><div className="hero-card"><div><span className="pill green">● امروز</span><h2>با هم بهتر می‌خوریم</h2><p>ثبت‌های امروز را کامل کنید تا تصویر دقیق‌تری از عادت‌های خانواده داشته باشید.</p><button className="primary" onClick={()=>setShowQuick(true)}>ثبت اولین وعده <ArrowUpLeft size={16}/></button></div><div className="hero-illustration">🥗<span>🍎</span><i>✦</i></div></div><div className="streak-card"><div className="card-heading"><span>پیوستگی ثبت</span><MoreHorizontal size={18}/></div><div className="streak-number">۶ <small>روز</small></div><div className="streak-days">{['ش','ی','د','س','چ','پ','ج'].map((d,i)=><div key={d} className={i<6?'done':''}><span>{d}</span><b>{i<6?'✓':''}</b></div>)}</div><p>یک قدم کوچک، یک عادت ماندگار.</p></div></section>
    <section className="section-head"><div><h3>امروز در یک نگاه</h3><p>وضعیت ثبت‌های خانواده</p></div><button className="text-btn" onClick={()=>setTab('reports')}>گزارش کامل <ChevronLeft size={16}/></button></section>
    <section className="stats-grid"><Stat icon={<Utensils/>} tone="orange" value="۴" label="وعده ثبت‌شده" hint="از ۶ وعده برنامه‌ریزی‌شده"/><Stat icon={<Cookie/>} tone="purple" value="۲" label="میان‌وعده" hint="در محدوده معمول خانواده"/><Stat icon={<Droplets/>} tone="blue" value="۶" label="لیوان آب" hint="۲ لیوان تا هدف روزانه"/></section>
    <div className="columns"><section className="panel activity"><div className="section-head compact"><div><h3>آخرین فعالیت‌ها</h3><p>آنچه امروز و دیروز ثبت شده</p></div><button className="icon-btn soft" onClick={()=>setShowQuick(true)}><Plus size={18}/></button></div>{data.logs.filter(l=>l.title.includes(query)||!query).slice(0,4).map(l=><div className="activity-row" key={l.id}><div className={'log-icon '+l.type}>{l.icon}</div><div className="activity-main"><b>{l.title}</b><span>{l.subtitle}</span><small>{l.members.join('، ')}</small></div><span className="tag">{l.tag}</span></div>)}</section><section className="panel family-progress"><div className="section-head compact"><div><h3>اعضای خانواده</h3><p>پیشرفت ثبت امروز</p></div><button className="text-btn" onClick={()=>setTab('members')}>همه <ChevronLeft size={15}/></button></div>{data.members.map(m=><button className="member-row" key={m.id} onClick={()=>setSelectedMember(m)}><div className="avatar" style={{background:m.color}}>{m.initials}</div><div><b>{m.name}</b><span>{m.role} · {m.age} سال</span></div><div className="progress"><span style={{width:(m.id===3?62:m.id===4?38:84)+'%'}}/></div><small>{m.id===3?'۳ از ۵':'۵ از ۶'}</small></button>)}</section></div>
    <section className="panel insight"><div className="insight-icon"><Sparkles size={21}/></div><div><span className="pill purple">بینش این هفته</span><h3>تنوع غذایی خانواده رو به بهتر شدن است</h3><p>این هفته ۳ گروه غذایی بیشتر از هفته قبل ثبت شده. ادامه بدهید؛ روند خوب و قابل پایداری دارید.</p></div><ChevronLeft className="insight-arrow" size={20}/></section>
  </div>
}
function Stat({icon,tone,value,label,hint}){return <div className="stat-card"><div className={'stat-icon '+tone}>{icon}</div><div className="stat-copy"><b>{value}</b><strong>{label}</strong><span>{hint}</span></div></div>}

function Members({data,setSelectedMember,setShowMember}){return <div className="page-body"><div className="toolbar"><div className="search-box"><Search size={18}/><input placeholder="جستجوی عضو خانواده..."/></div><button className="primary" onClick={()=>setShowMember(true)}><Plus size={17}/> افزودن عضو</button></div><div className="members-grid">{data.members.map(m=><button className="member-card" key={m.id} onClick={()=>setSelectedMember(m)}><div className="member-card-top"><div className="avatar large" style={{background:m.color}}>{m.initials}</div><span className="status-dot">فعال</span></div><h3>{m.name}</h3><p>{m.role} · {m.age} سال</p><div className="member-meta"><span>هدف</span><b>{m.goal}</b></div><div className="mini-progress"><span style={{width:'72%'}}/></div><small>پیشرفت ثبت این هفته <b>۷۲٪</b></small></button>)}</div></div>}
function Plan({data,onAdd}){return <div className="page-body"><div className="plan-banner"><div><span className="pill green">برنامه هفتگی</span><h2>غذاهای این هفته، با سلیقه شما</h2><p>پیشنهادها با توجه به ترجیحات خانواده آماده شده‌اند و کاملاً قابل ویرایش هستند.</p></div><button className="primary" onClick={onAdd}><Sparkles size={17}/> پیشنهاد هوشمند</button></div><div className="week-tabs"><button className="selected">این هفته</button><button>هفته قبل</button><button>تقویم</button></div><div className="plan-list">{data.plan.map((day,i)=><div className="day-card" key={day.day}><div className="day-label"><b>{day.day}</b><span>{day.date}</span>{i===0&&<em>امروز</em>}</div><div className="meal-list">{day.meals.map(meal=><div className="meal-card" key={meal.time}><span className="meal-time">{meal.time}</span><div className="meal-food"><span className="food-emoji">{meal.icon}</span><b>{meal.title}</b></div><button className="edit-dot">•••</button></div>)}</div></div>)}</div></div>}
function Reports({data}){return <div className="page-body"><div className="report-head"><div><span className="pill purple">گزارش خانواده</span><h2>روندهای کوچک، تغییرهای واقعی</h2><p>خلاصه‌ای از ثبت‌های ۷ روز گذشته</p></div><select><option>۷ روز گذشته</option><option>۳۰ روز گذشته</option></select></div><div className="report-grid"><div className="panel chart-panel"><div className="section-head compact"><div><h3>تعداد ثبت وعده‌ها</h3><p>مقایسه با هفته قبل <b className="positive">+۱۸٪</b></p></div></div><div className="chart"><div className="y-labels"><span>۶</span><span>۴</span><span>۲</span><span>۰</span></div><div className="bars">{[4,5,3,6,4,5,4].map((v,i)=><div className="bar-wrap" key={i}><div className="bar" style={{height:v*13+'%'}}/><span>{['ش','ی','د','س','چ','پ','ج'][i]}</span></div>)}</div></div></div><div className="panel groups-panel"><div className="section-head compact"><div><h3>گروه‌های غذایی</h3><p>سهم ثبت‌شده در این هفته</p></div></div>{[['میوه و سبزیجات','#78bd8d','۸۲٪'],['غلات و حبوبات','#f0b35c','۶۷٪'],['پروتئین','#8d9fe2','۵۸٪'],['لبنیات','#e78c92','۴۶٪']].map(x=><div className="group-row" key={x[0]}><span>{x[0]}</span><div><i style={{width:x[2],background:x[1]}}/></div><b>{x[2]}</b></div>)}</div></div><div className="panel gentle-note"><Sparkles size={19}/><p><b>یادتان باشد:</b> گزارش‌ها برای شناختن الگوها هستند، نه قضاوت کردن. هر ثبت کوچک به تصمیم‌های بهتر کمک می‌کند.</p></div></div>}

function QuickAdd({members,onClose,onSave}){const [kind,setKind]=useState('meal');const [title,setTitle]=useState('');const [who,setWho]=useState(members.slice(0,2).map(m=>m.name));return <div className="modal-backdrop"><div className="modal quick-modal"><button className="close" onClick={onClose}><X size={18}/></button><div className="modal-title"><div className="modal-symbol">＋</div><div><h2>ثبت سریع</h2><p>یک ثبت ساده برای شروع</p></div></div><div className="type-tabs">{[['meal','🍲','غذا'],['snack','🍪','تنقلات'],['drink','💧','نوشیدنی']].map(t=><button className={kind===t[0]?'chosen':''} onClick={()=>setKind(t[0])} key={t[0]}><span>{t[1]}</span>{t[2]}</button>)}</div><label>چه چیزی ثبت کنیم؟<input autoFocus value={title} onChange={e=>setTitle(e.target.value)} placeholder={kind==='meal'?'مثلاً عدس‌پلو':'مثلاً یک عدد موز'}/></label><label>چه کسی؟<div className="people-select">{members.map(m=><button type="button" className={who.includes(m.name)?'picked':''} onClick={()=>setWho(w=>w.includes(m.name)?w.filter(n=>n!==m.name):[...w,m.name])} key={m.id}><span className="avatar tiny" style={{background:m.color}}>{m.initials}</span>{m.name}<Check size={14}/></button>)}</div></label><label>مقدار تقریبی<div className="amounts">{['کم','متوسط','زیاد','۱ سهم'].map((a,i)=><button className={i===1?'selected':''} key={a}>{a}</button>)}</div></label><button className="primary full" onClick={()=>onSave({type:kind,title:title||'ثبت بدون نام',subtitle:'امروز، همین حالا',members:who.length?who:['خانواده'],icon:kind==='meal'?'🍲':kind==='snack'?'🍪':'💧',tag:kind==='meal'?'وعده اصلی':kind==='snack'?'تنقلات':'نوشیدنی'})}>ثبت کن <Check size={17}/></button></div></div>}
function MemberModal({onClose,onSave}){const [name,setName]=useState('');const [role,setRole]=useState('عضو خانواده');return <div className="modal-backdrop"><div className="modal"><button className="close" onClick={onClose}><X size={18}/></button><h2>افزودن عضو خانواده</h2><p className="modal-sub">اطلاعات پایه را وارد کنید؛ بعداً قابل ویرایش است.</p><label>نام<input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="مثلاً نازنین"/></label><label>نقش<select value={role} onChange={e=>setRole(e.target.value)}><option>عضو خانواده</option><option>مادر</option><option>پدر</option><option>کودک</option><option>نوجوان</option></select></label><label>سن<input type="number" placeholder="مثلاً ۲۸"/></label><button className="primary full" onClick={()=>name&&onSave({name,role,age:28,color:'#c9a7e8',goal:'حفظ وزن'})}>افزودن عضو <Plus size={17}/></button></div></div>}
function MemberDetail({member,data,onClose}){return <div className="modal-backdrop"><div className="modal detail-modal"><button className="close" onClick={onClose}><X size={18}/></button><div className="detail-profile"><div className="avatar large" style={{background:member.color}}>{member.initials}</div><div><span className="pill green">پروفایل تغذیه‌ای</span><h2>{member.name}</h2><p>{member.role} · {member.age} سال · هدف: {member.goal}</p></div></div><div className="detail-stats"><div><b>۸۴٪</b><span>ثبت این هفته</span></div><div><b>۱۲</b><span>وعده ثبت‌شده</span></div><div><b>۶</b><span>غذای متنوع</span></div></div><h3>آخرین ثبت‌ها</h3>{data.logs.filter(l=>l.members.includes(member.name)).slice(0,3).map(l=><div className="detail-log" key={l.id}><span>{l.icon}</span><div><b>{l.title}</b><small>{l.subtitle}</small></div><em>{l.tag}</em></div>)}</div></div>}

createRoot(document.getElementById('root')).render(<App />)
