import React, { useState } from 'react'
import { MessageCircle, Send, Globe2, LoaderCircle } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://family-nutrition-companion-api.ghadir-baraty.workers.dev'

export function AiAssistant({ data, setData, notify }) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [sources, setSources] = useState([])
  const [loading, setLoading] = useState(false)
  const month = new Date().toISOString().slice(0, 7)
  const used = data.aiUsage?.month === month ? Number(data.aiUsage.count || 0) : 0
  const limit = data.premium ? 100 : 5
  const ask = async (e) => {
    e?.preventDefault()
    if (!question.trim() || loading) return
    if (used >= limit) { notify?.(data.premium ? 'سقف اعتبار ماهانه AI تکمیل شده است.' : 'اعتبار رایگان این ماه تمام شده است؛ Premium را فعال کنید.'); return }
    setLoading(true); setAnswer(''); setSources([])
    try {
      const response = await fetch(`${API_BASE}/api/ai/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question, family: { name: data.familyName, members: data.members, recentLogs: data.logs.slice(0, 25), plan: data.plan } }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'خطا در ارتباط با مدل')
      setAnswer(result.answer || 'پاسخی دریافت نشد.')
      setSources(result.sources || [])
      setData?.(d => ({ ...d, aiUsage: { month, count: used + 1 } }))
    } catch (err) { setAnswer(`خطا: ${err.message}`) } finally { setLoading(false) }
  }
  return <section className="panel ai-panel"><div className="ai-heading"><div className="ai-icon"><MessageCircle size={20}/></div><div><span className="pill purple">دستیار تغذیه</span><h3>از داده‌های واقعی خانواده بپرسید</h3><p>برای پرسش‌های روز و قیمت/اطلاعات تازه، Sonar با جستجوی وب استفاده می‌شود.</p></div><Globe2 className="ai-globe" size={18}/></div><div className="ai-quota">اعتبار این ماه: {used} از {limit} پرسش</div><form className="ai-form" onSubmit={ask}><input value={question} onChange={e=>setQuestion(e.target.value)} placeholder="مثلاً امشب با مواد موجود چه درست کنیم؟"/><button className="primary" disabled={loading}>{loading?<LoaderCircle className="spin" size={17}/>:<Send size={17}/>} بپرس</button></form>{answer&&<div className="ai-answer"><p>{answer}</p>{sources.length>0&&<div className="ai-sources"><b>منابع:</b>{sources.map((s,i)=><a key={i} href={s.url} target="_blank" rel="noreferrer">{s.title||s.url}</a>)}</div>}</div>}</section>
}
