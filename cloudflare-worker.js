const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json; charset=utf-8" },
  });
}

async function callAvalAI(env, model, messages) {
  if (!env.AVALAI_API_KEY)
    throw new Error(
      "AVALAI_API_KEY is not configured in Cloudflare Worker secrets.",
    );
  const response = await fetch(
    `${env.AVALAI_BASE_URL || "https://api.avalai.ir/v1"}/chat/completions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.AVALAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model, messages, temperature: 0.2 }),
    },
  );
  const body = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(body.error?.message || `AvalAI HTTP ${response.status}`);
  const raw = body.citations || body.sources || [];
  return {
    answer: body.choices?.[0]?.message?.content || "",
    sources: raw
      .map((s) => (typeof s === "string" ? { url: s, title: s } : s))
      .filter((s) => s?.url),
  };
}


// ---------------------------------------------------------------------
// خرید درون‌برنامه‌ای مایکت (Myket IAB)
// مایکت از اشتراک پشتیبانی نمی‌کند؛ بنابراین بسته‌های زمانی «مصرف‌شدنی»
// (۱/۳/۱۲ ماهه) فروخته می‌شود. Worker امضای خرید را با کلید عمومی مایکت
// (RSA / SHA1) تأیید می‌کند و یک رسید HMAC-امضاشده برمی‌گرداند.
// Secrets لازم: MYKET_PUBLIC_KEY (base64 کلید عمومی) و IAP_RECEIPT_SECRET
// ---------------------------------------------------------------------
const IAP_PACKAGE = "ir.ghadirb.familynutrition";
const IAP_PRODUCTS = {
  premium_1m: 30,
  premium_3m: 90,
  premium_12m: 365,
};

const enc = new TextEncoder();
const b64ToBytes = (b64) =>
  Uint8Array.from(atob(b64.replace(/\s+/g, "")), (c) => c.charCodeAt(0));
const bytesToB64Url = (bytes) =>
  btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
const b64UrlToBytes = (s) =>
  b64ToBytes(s.replace(/-/g, "+").replace(/_/g, "/"));

async function verifyMyketSignature(env, signedData, signature) {
  const key = await crypto.subtle.importKey(
    "spki",
    b64ToBytes(env.MYKET_PUBLIC_KEY),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-1" },
    false,
    ["verify"],
  );
  return crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    b64ToBytes(signature),
    enc.encode(signedData),
  );
}

async function hmacKey(env) {
  return crypto.subtle.importKey(
    "raw",
    enc.encode(env.IAP_RECEIPT_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function signReceipt(env, payload) {
  const body = bytesToB64Url(enc.encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(env), enc.encode(body));
  return `${body}.${bytesToB64Url(sig)}`;
}

async function readReceipt(env, receipt) {
  try {
    const [body, sig] = String(receipt || "").split(".");
    if (!body || !sig) return null;
    const ok = await crypto.subtle.verify(
      "HMAC",
      await hmacKey(env),
      b64UrlToBytes(sig),
      enc.encode(body),
    );
    if (!ok) return null;
    return JSON.parse(new TextDecoder().decode(b64UrlToBytes(body)));
  } catch {
    return null;
  }
}

async function handleIapVerify(request, env) {
  if (!env.MYKET_PUBLIC_KEY || !env.IAP_RECEIPT_SECRET)
    return json({ error: "سرویس خرید هنوز روی سرور تنظیم نشده است." }, 503);
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "درخواست نامعتبر است." }, 400);
  }
  const { originalJson, signature } = body || {};
  if (typeof originalJson !== "string" || typeof signature !== "string")
    return json({ error: "اطلاعات خرید ناقص است." }, 400);
  let valid = false;
  try {
    valid = await verifyMyketSignature(env, originalJson, signature);
  } catch {
    valid = false;
  }
  if (!valid) return json({ error: "امضای خرید معتبر نیست." }, 403);
  let p;
  try {
    p = JSON.parse(originalJson);
  } catch {
    return json({ error: "اطلاعات خرید نامعتبر است." }, 400);
  }
  const sku = p.productId;
  const days = IAP_PRODUCTS[sku];
  if (p.packageName !== IAP_PACKAGE || !days)
    return json({ error: "این خرید مربوط به این برنامه نیست." }, 403);
  if (Number(p.purchaseState || 0) !== 0)
    return json({ error: "خرید تکمیل‌نشده یا لغوشده است." }, 403);
  // شناسه نصب از developerPayload می‌آید که مایکت آن را امضا کرده است؛
  // بنابراین کلاینت نمی‌تواند رسید را برای شناسهٔ دیگری بگیرد.
  const installId = String(p.developerPayload || "").split(".")[0];
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(installId))
    return json({ error: "شناسهٔ نصب در خرید یافت نشد." }, 400);
  const receipt = await signReceipt(env, {
    v: 1,
    installId,
    sku,
    days,
    orderId: String(p.orderId || p.token || p.purchaseToken || ""),
    purchaseTime: Number(p.purchaseTime) || Date.now(),
  });
  return json({ ok: true, sku, days, installId, receipt });
}

async function handleIapCheck(request, env) {
  if (!env.IAP_RECEIPT_SECRET)
    return json({ error: "سرویس خرید هنوز روی سرور تنظیم نشده است." }, 503);
  const { installId, receipts } = await request.json().catch(() => ({}));
  const valid = [];
  for (const r of Array.isArray(receipts) ? receipts.slice(0, 50) : []) {
    const p = await readReceipt(env, r);
    if (p && p.installId === installId && IAP_PRODUCTS[p.sku]) valid.push(r);
  }
  return json({ ok: true, valid });
}

addEventListener("fetch", (event) =>
  event.respondWith(handle(event.request, event)),
);

async function handle(request, event) {
  const env = event?.env || globalThis;
  if (request.method === "OPTIONS")
    return new Response(null, { status: 204, headers: cors });
  const url = new URL(request.url);
  if (url.pathname === "/api/health")
    return json({
      ok: true,
      configured: Boolean(env.AVALAI_API_KEY),
      iapConfigured: Boolean(env.MYKET_PUBLIC_KEY && env.IAP_RECEIPT_SECRET),
      provider: "AvalAI",
      webModel: env.AVALAI_WEB_MODEL || "sonar",
    });
  if (url.pathname === "/api/iap/verify" && request.method === "POST")
    return handleIapVerify(request, env);
  if (url.pathname === "/api/iap/check" && request.method === "POST")
    return handleIapCheck(request, env);
  if (url.pathname === "/api/ai/transcribe" && request.method === "POST") {
    if (!env.AVALAI_API_KEY)
      return json({ error: "AVALAI_API_KEY is not configured." }, 500);
    try {
      const incoming = await request.formData();
      const file = incoming.get("file");
      if (!file) return json({ error: "فایل صوتی ارسال نشده است." }, 400);
      const fileBytes = await file.arrayBuffer();
      const fileName = file.name || "voice.webm";
      const fileType = file.type || "audio/webm";

      // ترتیب مدل‌های آنلاین AvalAI برای تبدیل صوت به متن. اگر مدل اول در
      // دسترس نبود یا خطا داد، خودکار مدل بعدی امتحان می‌شود تا ضبط صدا
      // همیشه جواب بدهد.
      const candidateModels = [
        env.AVALAI_TRANSCRIBE_MODEL,
        "gpt-4o-mini-transcribe",
        "gpt-4o-transcribe",
        "whisper-1",
      ].filter((m, i, arr) => m && arr.indexOf(m) === i);

      let lastError = "";
      for (const model of candidateModels) {
        const body = new FormData();
        body.append(
          "file",
          new File([fileBytes], fileName, { type: fileType }),
        );
        body.append("model", model);
        body.append("language", "fa");
        body.append("prompt", "این یک جملهٔ فارسی دربارهٔ غذا و مواد غذایی است.");
        body.append("temperature", "0");
        try {
          const response = await fetch(
            `${env.AVALAI_BASE_URL || "https://api.avalai.ir/v1"}/audio/transcriptions`,
            {
              method: "POST",
              headers: { Authorization: `Bearer ${env.AVALAI_API_KEY}` },
              body,
            },
          );
          const result = await response.json().catch(() => ({}));
          if (!response.ok) {
            lastError = result.error?.message || `AvalAI HTTP ${response.status}`;
            continue;
          }
          const text = result.text || result.transcript || "";
          if (!text) {
            lastError = "پاسخ خالی از مدل تبدیل صوت.";
            continue;
          }
          // خروجی چینی/ژاپنی/کره‌ای یعنی مدل صدا را اشتباه شناخته؛ مدل بعدی را امتحان کن.
          if (/[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/.test(text)) {
            lastError = "مدل متن نامعتبر (غیرفارسی) برگرداند.";
            continue;
          }
          return json({ text, model });
        } catch (e) {
          lastError = e.message;
        }
      }
      return json(
        { error: lastError || "هیچ‌یک از مدل‌های تبدیل صوت پاسخ ندادند." },
        502,
      );
    } catch (error) {
      return json({ error: error.message }, 500);
    }
  }
  if (url.pathname !== "/api/ai/chat" || request.method !== "POST")
    return json({ error: "Not found" }, 404);
  try {
    const { question, family } = await request.json();
    const webSearch =
      /امروز|جدید|قیمت|خبر|اینترنت|جستجو|تازه|بازار|قانون|منبع|current|latest|price|news|search/i.test(
        question || "",
      );
    const webModel = env.AVALAI_WEB_MODEL || "sonar";
    const chatModel = env.AVALAI_CHAT_MODEL || "gpt-5.4-mini";
    const system = `تو دستیار تغذیه خانواده هستی. پاسخ پزشکی قطعی، تشخیص یا ایجاد احساس گناه ممنوع است. پاسخ فارسی، کوتاه و عملی بده. ${webSearch ? "برای ادعاهای تازه از جستجوی وب استفاده کن و منابع را ذکر کن." : ""}`;
    let result;
    let model = webSearch ? webModel : chatModel;
    try {
      result = await callAvalAI(env, model, [
        { role: "system", content: system },
        {
          role: "user",
          content: `سؤال: ${question}\nداده خانواده: ${JSON.stringify(family || {})}`,
        },
      ]);
    } catch (error) {
      if (!webSearch) throw error;
      model = chatModel;
      result = await callAvalAI(env, model, [
        {
          role: "system",
          content: `${system} سرویس جستجوی وب موقتاً در دسترس نیست؛ پاسخ را بدون ادعای تازه ارائه کن.`,
        },
        {
          role: "user",
          content: `سؤال: ${question}\nداده خانواده: ${JSON.stringify(family || {})}`,
        },
      ]);
      result.answer = `سرویس جستجوی وب موقتاً در دسترس نبود؛ پاسخ زیر بدون ادعای تازه است.\n\n${result.answer}`;
    }
    return json({
      ...result,
      model,
      webSearch,
      webFallback: webSearch && model === chatModel,
    });
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}
