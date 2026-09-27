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
      provider: "AvalAI",
      webModel: env.AVALAI_WEB_MODEL || "sonar",
    });
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
