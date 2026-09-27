import React, { useEffect, useRef, useState } from "react";
import {
  Plus,
  Trash2,
  Check,
  BellRing,
  CalendarClock,
  Package,
  ShoppingCart,
  Mic,
  Camera,
  Printer,
  HeartPulse,
  X,
  Sparkles,
} from "lucide-react";

const defaultShopping = [
  { id: 1, title: "برنج", amount: "۲ کیلو", group: "خشکبار", done: false },
  {
    id: 2,
    title: "مرغ",
    amount: "۱.۵ کیلو",
    group: "گوشت و پروتئین",
    done: false,
  },
  { id: 3, title: "عدس", amount: "۵۰۰ گرم", group: "خشکبار", done: true },
  {
    id: 4,
    title: "سیب و سبزیجات",
    amount: "۱ کیلو",
    group: "میوه و سبزی",
    done: false,
  },
];
const defaultInventory = [
  {
    id: 1,
    title: "شیر",
    quantity: "۲ لیتر",
    expiry: "2026-09-28",
    category: "لبنیات",
  },
  { id: 2, title: "برنج", quantity: "۳ کیلو", expiry: "", category: "خشکبار" },
  {
    id: 3,
    title: "تخم‌مرغ",
    quantity: "۱۲ عدد",
    expiry: "2026-10-02",
    category: "پروتئین",
  },
];

function useDataField(data, setData, key, fallback) {
  const value = data[key] || fallback;
  const setValue = (next) =>
    setData((d) => ({
      ...d,
      [key]: typeof next === "function" ? next(d[key] || fallback) : next,
    }));
  return [value, setValue];
}

export function ShoppingList({ data, setData, notify }) {
  const [items, setItems] = useDataField(
    data,
    setData,
    "shopping",
    defaultShopping,
  );
  const [title, setTitle] = useState(""),
    [amount, setAmount] = useState(""),
    [group, setGroup] = useState("سایر");
  const add = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setItems((list) => [
      ...list,
      {
        id: Date.now(),
        title: title.trim(),
        amount: amount || "مقدار دلخواه",
        group,
        done: false,
      },
    ]);
    setTitle("");
    setAmount("");
    notify("موردی به لیست خرید اضافه شد.");
  };
  const toggle = (id) =>
    setItems((list) =>
      list.map((x) => (x.id === id ? { ...x, done: !x.done } : x)),
    );
  const remove = (id) => setItems((list) => list.filter((x) => x.id !== id));
  return (
    <div className="page-body">
      <div className="plan-banner shopping-banner">
        <div>
          <span className="pill green">لیست خرید هوشمند</span>
          <h2>خریدها را ساده‌تر مدیریت کنید</h2>
          <p>موارد برنامه غذایی را بررسی، تغییر و علامت‌گذاری کنید.</p>
        </div>
        <ShoppingCart size={58} color="#73a57f" />
      </div>
      <form className="add-inline" onSubmit={add}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="مثلاً ماست، موز یا مرغ"
        />
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="مقدار"
        />
        <select value={group} onChange={(e) => setGroup(e.target.value)}>
          <option>میوه و سبزی</option>
          <option>گوشت و پروتئین</option>
          <option>لبنیات</option>
          <option>خشکبار</option>
          <option>تنقلات</option>
          <option>سایر</option>
        </select>
        <button className="primary">
          <Plus size={16} /> افزودن
        </button>
      </form>
      <div className="shopping-grid">
        {[
          "میوه و سبزی",
          "گوشت و پروتئین",
          "لبنیات",
          "خشکبار",
          "تنقلات",
          "سایر",
        ].map((g) => (
          <section className="panel shopping-group" key={g}>
            <h3>{g}</h3>
            {items
              .filter((x) => x.group === g)
              .map((item) => (
                <div
                  className={"shopping-item " + (item.done ? "is-done" : "")}
                  key={item.id}
                >
                  <button
                    className="check-item"
                    onClick={() => toggle(item.id)}
                  >
                    {item.done && <Check size={14} />}
                  </button>
                  <div>
                    <b>{item.title}</b>
                    <small>{item.amount}</small>
                  </div>
                  <button
                    className="remove-item"
                    onClick={() => remove(item.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
          </section>
        ))}
      </div>
    </div>
  );
}

export function Inventory({ data, setData, notify }) {
  const [items, setItems] = useDataField(
    data,
    setData,
    "inventory",
    defaultInventory,
  );
  const [form, setForm] = useState({
    title: "",
    quantity: "",
    expiry: "",
    category: "سایر",
  });
  const add = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setItems((list) => [
      ...list,
      { ...form, id: Date.now(), title: form.title.trim() },
    ]);
    setForm({ title: "", quantity: "", expiry: "", category: "سایر" });
    notify("موجودی خانه ثبت شد.");
  };
  const remove = (id) => setItems((list) => list.filter((x) => x.id !== id));
  const daysLeft = (expiry) =>
    expiry ? Math.ceil((new Date(expiry) - new Date()) / 86400000) : null;
  return (
    <div className="page-body">
      <div className="plan-banner inventory-banner">
        <div>
          <span className="pill green">موجودی خانه</span>
          <h2>از چیزهایی که دارید بهتر استفاده کنید</h2>
          <p>تاریخ انقضا اختیاری است؛ مواد نزدیک به انقضا را زودتر ببینید.</p>
        </div>
        <Package size={58} color="#c9955e" />
      </div>
      <form className="inventory-form" onSubmit={add}>
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="نام ماده غذایی"
        />
        <input
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          placeholder="مقدار تقریبی"
        />
        <input
          type="date"
          value={form.expiry}
          onChange={(e) => setForm({ ...form, expiry: e.target.value })}
        />
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          <option>سایر</option>
          <option>میوه و سبزی</option>
          <option>پروتئین</option>
          <option>لبنیات</option>
          <option>خشکبار</option>
        </select>
        <button className="primary">
          <Plus size={16} /> ثبت موجودی
        </button>
      </form>
      <div className="inventory-grid">
        {items.map((item) => {
          const left = daysLeft(item.expiry);
          return (
            <div
              className={
                "inventory-card " +
                (left !== null && left <= 2 ? "expiring" : "")
              }
              key={item.id}
            >
              <div className="inventory-top">
                <span className="inventory-emoji">🥫</span>
                <button onClick={() => remove(item.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
              <h3>{item.title}</h3>
              <p>
                {item.quantity || "مقدار ثبت نشده"} · {item.category}
              </p>
              {left !== null ? (
                <span className="expiry">
                  {left < 0
                    ? "منقضی شده"
                    : left === 0
                      ? "امروز منقضی می‌شود"
                      : `${left} روز تا انقضا`}
                </span>
              ) : (
                <span className="expiry neutral">تاریخ انقضا ثبت نشده</span>
              )}
            </div>
          );
        })}
      </div>
      <div className="panel inventory-insight">
        <Sparkles size={18} />
        <p>
          با این موجودی می‌توانید غذاهایی مثل عدس‌پلو، املت، سوپ سبزیجات و خوراک
          تخم‌مرغ آماده کنید.
        </p>
      </div>
    </div>
  );
}

export function ReminderCenter({ data, setData, notify }) {
  const defaults = data.reminders || {
    breakfast: true,
    lunch: true,
    dinner: false,
    water: true,
    expiry: true,
  };
  const [reminders, setReminders] = useState(defaults);
  useEffect(() => setData((d) => ({ ...d, reminders })), [reminders]);
  const toggle = (key) => setReminders((r) => ({ ...r, [key]: !r[key] }));
  const ask = async () => {
    const isNative =
      typeof window !== "undefined" &&
      window.Capacitor &&
      typeof window.Capacitor.isNativePlatform === "function" &&
      window.Capacitor.isNativePlatform();
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        notify("اعلان‌های مرورگر از قبل فعال است.");
        return;
      }
      if (Notification.permission === "denied") {
        notify(
          "اجازه اعلان قبلاً رد شده؛ برای فعال‌سازی باید از تنظیمات مرورگر/دستگاه اجازه دهید.",
        );
        return;
      }
      const p = await Notification.requestPermission();
      notify(
        p === "granted" ? "اجازه اعلان فعال شد." : "اجازه اعلان داده نشد.",
      );
    } else if (isNative) {
      notify(
        "اعلان‌های پوش واقعی در نسخهٔ اندروید هنوز وصل نشده و در به‌روزرسانی بعدی اضافه می‌شود؛ تا آن زمان یادآوری‌ها همین‌جا ذخیره می‌مانند.",
      );
    } else {
      notify("این مرورگر از اعلان پشتیبانی نمی‌کند.");
    }
  };
  return (
    <div className="page-body">
      <div className="report-head">
        <div>
          <span className="pill purple">یادآوری‌ها</span>
          <h2>کمک‌های کوچک، قابل تنظیم</h2>
          <p>هر اعلان را هر زمان خواستید خاموش کنید.</p>
        </div>
        <BellRing size={45} color="#88689a" />
      </div>
      <div className="panel reminder-list">
        {[
          ["breakfast", "یادآوری صبحانه", "زمان پیشنهادی صبحانه"],
          ["lunch", "یادآوری ناهار", "زمان پیشنهادی ناهار"],
          ["dinner", "یادآوری شام", "زمان پیشنهادی شام"],
          ["water", "یادآوری آب", "یادآوری در طول روز"],
          ["expiry", "نزدیک شدن انقضا", "مواد غذایی نزدیک به انقضا"],
        ].map(([k, title, desc]) => (
          <button className="reminder-row" key={k} onClick={() => toggle(k)}>
            <div>
              <b>{title}</b>
              <small>{desc}</small>
            </div>
            <span className={reminders[k] ? "switch on" : "switch"}>
              <i />
            </span>
          </button>
        ))}
        <button className="primary" onClick={ask}>
          <BellRing size={16} /> فعال‌سازی اعلان‌های مرورگر
        </button>
      </div>
    </div>
  );
}

function parseVoiceText(text) {
  const match = text.match(
    /(.+?)[،,؛]\s*(.+?)(?:\s+و\s+(.+?))?\s*(\d+(?:[./]\d+)?)?\s*(عدد|کیلو|گرم|لیوان|سهم|قاشق)?/i,
  );
  if (!match) return null;
  return {
    member: match[1].trim(),
    item: match[2].trim(),
    secondItem: match[3]?.trim() || "",
    quantity: match[4] ? `${match[4]} ${match[5] || "واحد"}` : "۱ واحد",
  };
}

export function CaptureCenter({ notify }) {
  const [voice, setVoice] = useState(""),
    [photo, setPhoto] = useState(""),
    [recording, setRecording] = useState(false),
    [busy, setBusy] = useState(false),
    [parsed, setParsed] = useState(null);
  const recorder = useRef(null);
  const chunks = useRef([]);
  const updateVoice = (text) => {
    setVoice(text);
    setParsed(parseVoiceText(text));
  };
  const listen = () => {
    const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Speech) return notify("مرورگر شما ثبت صوتی را پشتیبانی نمی‌کند.");
    const rec = new Speech();
    rec.lang = "fa-IR";
    rec.onresult = (e) => updateVoice(e.results[0][0].transcript);
    rec.onerror = () => notify("ثبت صوتی انجام نشد.");
    rec.start();
  };
  const record = async () => {
    if (recording) {
      recorder.current?.stop();
      setRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunks.current = [];
      const r = new MediaRecorder(stream);
      recorder.current = r;
      r.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
      r.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks.current, {
          type: r.mimeType || "audio/webm",
        });
        const form = new FormData();
        form.append("file", blob, "voice.webm");
        setBusy(true);
        try {
          const base =
            import.meta.env.VITE_API_BASE_URL ||
            "https://family-nutrition-companion-api.ghadir-baraty.workers.dev";
          const response = await fetch(`${base}/api/ai/transcribe`, {
            method: "POST",
            body: form,
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || "خطا در تبدیل صدا");
          setVoice(result.text || "");
          notify("صدا با مدل AvalAI به متن تبدیل شد؛ قبل از ثبت بررسی کنید.");
        } catch (e) {
          notify(e.message);
        } finally {
          setBusy(false);
        }
      };
      r.start();
      setRecording(true);
    } catch {
      notify("دسترسی به میکروفون داده نشد.");
    }
  };
  return (
    <div className="page-body">
      <div className="section-head">
        <div>
          <h3>ثبت پیشرفته</h3>
          <p>نتیجه همیشه قبل از ذخیره قابل ویرایش است.</p>
        </div>
      </div>
      <div className="capture-grid">
        <section className="panel capture-card">
          <div className="capture-icon">
            <Mic size={22} />
          </div>
          <h3>ثبت صوتی</h3>
          <p>مثلاً بگویید: «علی، موز، ۱ عدد» یا «مریم، یک لیوان شیر خورد».</p>
          <div className="capture-buttons">
            <button className="primary" onClick={listen}>
              <Mic size={16} /> مرورگر
            </button>
            <button
              className={recording ? "danger" : "secondary"}
              onClick={record}
              disabled={busy}
            >
              {busy
                ? "در حال تبدیل..."
                : recording
                  ? "توقف ضبط"
                  : "AvalAI Transcribe"}
            </button>
          </div>
          {voice && (
            <div className="capture-result">
              <b>متن استخراج‌شده</b>
              <textarea
                value={voice}
                onChange={(e) => updateVoice(e.target.value)}
              />
              {parsed && (
                <div className="parsed-voice">
                  <span>
                    عضو: <b>{parsed.member}</b>
                  </span>
                  <span>
                    خوراکی: <b>{parsed.item}</b>
                    {parsed.secondItem && ` و ${parsed.secondItem}`}
                  </span>
                  <span>
                    مقدار: <b>{parsed.quantity}</b>
                  </span>
                </div>
              )}
              <button
                onClick={() =>
                  notify(
                    parsed
                      ? "اطلاعات صوتی ساختاربندی شد؛ برای ثبت نهایی از ثبت سریع استفاده کنید."
                      : "متن صوتی برای بررسی آماده است.",
                  )
                }
              >
                تأیید برای ثبت
              </button>
            </div>
          )}
        </section>
        <section className="panel capture-card">
          <div className="capture-icon peach">
            <Camera size={22} />
          </div>
          <h3>ثبت عکس غذا</h3>
          <p>
            عکس را انتخاب کنید؛ نتیجه تشخیص همیشه باید توسط کاربر اصلاح و تأیید
            شود.
          </p>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => setPhoto(e.target.files?.[0]?.name || "")}
          />
          {photo && (
            <div className="capture-result">
              <b>{photo}</b>
              <p>عکس برای تحلیل آینده آماده است.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export function ReportActions({ notify }) {
  return (
    <div className="panel report-actions">
      <div>
        <h3>خروجی گزارش</h3>
        <p>برای ذخیره PDF، گزینه چاپ مرورگر را روی Save as PDF بگذارید.</p>
      </div>
      <button
        className="primary"
        onClick={() => {
          window.print();
          notify("پنجره چاپ/PDF باز شد.");
        }}
      >
        <Printer size={16} /> چاپ / PDF
      </button>
    </div>
  );
}
export function HealthConnectCard({ notify }) {
  return (
    <div className="panel health-card">
      <HeartPulse size={23} />
      <div>
        <h3>Health Connect</h3>
        <p>
          اتصال به داده‌های سلامتی Android هنوز به این نسخه وصل نشده و در
          به‌روزرسانی بعدی اضافه می‌شود؛ بدون رضایت صریح شما فعال نخواهد شد.
        </p>
      </div>
      <span className="soon-badge">به‌زودی</span>
    </div>
  );
}
