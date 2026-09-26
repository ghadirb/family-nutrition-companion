import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const staticRoot = fs.existsSync(path.join(root, 'dist')) ? path.join(root, 'dist') : root
const port = Number(process.env.PORT || 8787)
const key = process.env.AVALAI_API_KEY
const apiBase = process.env.AVALAI_BASE_URL || 'https://api.avalai.ir/v1'
const cheapModel = process.env.AVALAI_CHAT_MODEL || 'gpt-5.4-mini'
const webModel = process.env.AVALAI_WEB_MODEL || 'sonar'

function json(res, status, body) { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' }); res.end(JSON.stringify(body)) }
function readBody(req) { return new Promise((resolve, reject) => { let b=''; req.on('data', c => b += c); req.on('end', () => { try { resolve(JSON.parse(b || '{}')) } catch (e) { reject(e) } }) }) }
async function avalai(model, messages) {
  if (!key) throw new Error('AVALAI_API_KEY تنظیم نشده است.')
  const r = await fetch(`${apiBase}/chat/completions`, { method:'POST', headers:{ Authorization:`Bearer ${key}`, 'Content-Type':'application/json' }, body:JSON.stringify({ model, messages, temperature:0.2 }) })
  const body = await r.json().catch(() => ({})); if (!r.ok) throw new Error(body.error?.message || `AvalAI HTTP ${r.status}`)
  const rawSources = body.citations || body.sources || []
  const sources = rawSources.map((s) => typeof s === 'string' ? { url: s, title: s } : s).filter(s => s?.url)
  return { answer: body.choices?.[0]?.message?.content || '', sources }
}
const server = http.createServer(async (req,res) => {
  if (req.method === 'OPTIONS') { res.writeHead(204, {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type'}); return res.end() }
  if (req.url === '/api/health') return json(res,200,{ok:true,configured:Boolean(key),cheapModel,webModel})
  if (req.url === '/api/ai/chat' && req.method === 'POST') {
    try { const { question, family } = await readBody(req); const webNeeded = /امروز|جدید|قیمت|خبر|اینترنت|جستجو|تازه|بازار|قانون|منبع|current|latest|price|news|search/i.test(question || ''); const model = webNeeded ? webModel : cheapModel; const system = `تو دستیار تغذیه خانواده هستی. پاسخ پزشکی قطعی، تشخیص یا ایجاد احساس گناه ممنوع است. پاسخ را فارسی، کوتاه و عملی بده. داده خانواده را فقط برای شخصی‌سازی استفاده کن. ${webNeeded ? 'برای ادعاهای تازه، از جستجوی وب استفاده کن و منابع را در پاسخ ذکر کن.' : ''}`; let result; let usedModel=model; try { result = await avalai(model,[{role:'system',content:system},{role:'user',content:`سؤال: ${question}\nداده خانواده (ممکن است ناقص باشد): ${JSON.stringify(family)}`}]) } catch (error) { if (!webNeeded) throw error; result = await avalai(cheapModel,[{role:'system',content:`${system} سرویس جستجوی وب موقتاً در دسترس نیست؛ این محدودیت را شفاف بگو و ادعای تازه بدون منبع نساز.`},{role:'user',content:`سؤال: ${question}\nداده خانواده: ${JSON.stringify(family)}`}]); usedModel=cheapModel; result.answer=`سرویس جستجوی وب موقتاً در دسترس نبود؛ پاسخ زیر بدون راستی‌آزمایی زنده ارائه شده است.\n\n${result.answer}` } return json(res,200,{...result,model:usedModel,webSearch:webNeeded,webFallback:usedModel!==model}) } catch(e) { return json(res,500,{error:e.message}) }
  }
  if (req.url === '/api/ai/transcribe' && req.method === 'POST') {
    try {
      if (!key) throw new Error('AVALAI_API_KEY تنظیم نشده است.')
      const incoming = await req.formData(); const file = incoming.get('file')
      if (!file || typeof file.arrayBuffer !== 'function') return json(res,400,{error:'فایل صوتی ارسال نشده است.'})
      const body = new FormData(); body.append('file', new Blob([await file.arrayBuffer()], { type: file.type || 'audio/webm' }), file.name || 'voice.webm'); body.append('model', process.env.AVALAI_TRANSCRIBE_MODEL || 'gpt-4o-mini-transcribe'); body.append('language', 'fa')
      const response = await fetch(`${apiBase}/audio/transcriptions`, { method:'POST', headers:{ Authorization:`Bearer ${key}` }, body }); const result = await response.json().catch(()=>({})); if(!response.ok) throw new Error(result.error?.message || `AvalAI HTTP ${response.status}`)
      return json(res,200,{text:result.text||result.transcript||'',model:process.env.AVALAI_TRANSCRIBE_MODEL||'gpt-4o-mini-transcribe'})
    } catch(e) { return json(res,500,{error:e.message}) }
  }
  if (req.url === '/api/ai/search' && req.method === 'POST') { try { const { query } = await readBody(req); const result=await avalai(webModel,[{role:'system',content:'با جستجوی وب پاسخ دقیق فارسی بده و منابع را در پایان فهرست کن.'},{role:'user',content:query}]); return json(res,200,{...result,model:webModel}) } catch(e) { return json(res,500,{error:e.message}) } }
  if (req.url?.startsWith('/api/')) return json(res,404,{error:'Not found'})
  const file = req.url === '/' ? '/index.html' : req.url
  const safe = path.normalize(path.join(staticRoot, file)); if (!safe.startsWith(staticRoot)) return json(res,403,{error:'Forbidden'})
  fs.readFile(safe,(err,data)=>{ if(err) return json(res,404,{error:'Not found'}); const ext=path.extname(safe); const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json'}; res.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream'});res.end(data) })
})
server.listen(port,()=>console.log(`Family Nutrition Companion server listening on http://localhost:${port}`))
