import React, { useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
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
  RefreshCw,
} from "lucide-react";
import HealthConnect from "./healthConnect.js";
import {
  DEFAULT_REMINDER_TIMES,
  getNotificationStatus,
  requestNotificationPermission,
  syncReminderSchedule,
} from "./notifications.js";

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

const REMINDER_ROWS = [
  ["breakfast", "یادآوری صبحانه", "زمان پیشنهادی صبحانه"],
  ["lunch", "یادآوری ناهار", "زمان پیشنهادی ناهار"],
  ["dinner", "یادآوری شام", "زمان پیشنهادی شام"],
  ["water", "یادآوری آب", "یادآوری در طول روز"],
  ["expiry", "نزدیک شدن انقضا", "مواد غذایی نزدیک به انقضا"],
];

export function ReminderCenter({ data, setData, notify }) {
  const defaults = data.reminders || {
    breakfast: true,
    lunch: true,
    dinner: false,
    water: true,
    expiry: true,
  };
  const [reminders, setReminders] = useState(defaults);
  const [times, setTimes] = useState(data.reminderTimes || DEFAULT_REMINDER_TIMES);
  const [status, setStatus] = useState("checking"); // checking | granted | denied | prompt | unsupported
  const isNative =
    typeof Capacitor !== "undefined" && Capacitor.isNativePlatform
      ? Capacitor.isNativePlatform()
      : false;

  useEffect(() => setData((d) => ({ ...d, reminders })), [reminders]);
  useEffect(() => setData((d) => ({ ...d, reminderTimes: times })), [times]);

  useEffect(() => {
    getNotificationStatus().then(setStatus);
  }, []);

  // هر بار که یادآوری فعال یا زمان‌ها عوض شود، در صورتی که اجازه از قبل گرفته
  // شده، زمان‌بندی واقعی روی اندروید دوباره ساخته می‌شود.
  useEffect(() => {
    if (status === "granted") {
      syncReminderSchedule(reminders, times);
    }
  }, [reminders, times, status]);

  const toggle = (key) => setReminders((r) => ({ ...r, [key]: !r[key] }));
  const changeTime = (key, value) => setTimes((t) => ({ ...t, [key]: value }));

  const enableNotifications = async () => {
    const current = await getNotificationStatus();
    if (current === "unsupported") {
      notify("این دستگاه/مرورگر از اعلان پشتیبانی نمی‌کند.");
      setStatus("unsupported");
      return;
    }
    if (current === "granted") {
      notify("اعلان‌ها از قبل فعال است.");
      setStatus("granted");
      await syncReminderSchedule(reminders, times);
      return;
    }
    if (current === "denied") {
      notify(
        isNative
          ? "اجازهٔ اعلان قبلاً رد شده؛ برای فعال‌سازی باید از تنظیمات اندروید اجازه دهید."
          : "اجازهٔ اعلان قبلاً رد شده؛ برای فعال‌سازی باید از تنظیمات مرورگر اجازه دهید.",
      );
      setStatus("denied");
      return;
    }
    const granted = await requestNotificationPermission();
    setStatus(granted ? "granted" : "denied");
    if (granted) {
      notify("اعلان‌ها با موفقیت فعال شد.");
      await syncReminderSchedule(reminders, times);
    } else {
      notify("اجازهٔ اعلان داده نشد.");
    }
  };

  const statusLabel = {
    checking: "در حال بررسی وضعیت اعلان…",
    granted: isNative
      ? "اعلان‌های واقعی اندروید فعال است."
      : "اعلان‌های مرورگر فعال است (تا وقتی برنامه باز است ارسال می‌شود).",
    denied: "اجازهٔ اعلان داده نشده است.",
    prompt: "هنوز برای اعلان اجازه گرفته نشده است.",
    unsupported: "این دستگاه از اعلان پشتیبانی نمی‌کند.",
  }[status];

  return (
    <div className="page-body">
      <div className="report-head">
        <div>
          <span className="pill purple">یادآوری‌ها</span>
          <h2>کمک‌های کوچک، قابل تنظیم</h2>
          <p>هر اعلان را هر زمان خواستید خاموش کنید. {statusLabel}</p>
        </div>
        <BellRing size={45} color="#88689a" />
      </div>
      <div className="panel reminder-list">
        {REMINDER_ROWS.map(([k, title, desc]) => (
          <div className="reminder-row" key={k}>
            <button
              type="button"
              className="reminder-row-toggle"
              onClick={() => toggle(k)}
            >
              <div>
                <b>{title}</b>
                <small>{desc}</small>
              </div>
              <span className={reminders[k] ? "switch on" : "switch"}>
                <i />
              </span>
            </button>
            {reminders[k] && (
              <input
                type="time"
                className="reminder-time"
                value={times[k] || DEFAULT_REMINDER_TIMES[k]}
                onChange={(e) => changeTime(k, e.target.value)}
                aria-label={`ساعت ${title}`}
              />
            )}
          </div>
        ))}
        <button className="primary" onClick={enableNotifications}>
          <BellRing size={16} />
          {status === "granted" ? "به‌روزرسانی اعلان‌ها" : "فعال‌سازی اعلان‌ها"}
        </button>
        {!isNative && status === "granted" && (
          <p className="reminder-note">
            توجه: در نسخهٔ وب، اعلان‌ها فقط تا زمانی که این صفحه باز باشد ارسال
            می‌شوند. نسخهٔ اندروید اعلان‌ها را حتی وقتی برنامه بسته است هم
            ارسال می‌کند.
          </p>
        )}
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
  const isNative =
    typeof Capacitor !== "undefined" && Capacitor.isNativePlatform
      ? Capacitor.isNativePlatform()
      : false;
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
    } catch (e) {
      if (e?.name === "NotAllowedError" || e?.name === "SecurityError") {
        notify(
          isNative
            ? "دسترسی به میکروفون رد شده. از تنظیمات گوشی → برنامه‌ها → تندرسا → مجوزها، دسترسی میکروفون را فعال کنید و دوباره امتحان کنید."
            : "دسترسی به میکروفون رد شده؛ از تنظیمات مرورگر اجازه دهید.",
        );
      } else if (e?.name === "NotFoundError") {
        notify("میکروفونی روی این دستگاه پیدا نشد.");
      } else {
        notify("دسترسی به میکروفون داده نشد.");
      }
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
            {!isNative && (
              <button className="primary" onClick={listen}>
                <Mic size={16} /> مرورگر
              </button>
            )}
            <button
              className={recording ? "danger" : isNative ? "primary" : "secondary"}
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
  const isNative = Capacitor.isNativePlatform();
  const [checked, setChecked] = useState(false);
  const [available, setAvailable] = useState(false);
  const [granted, setGranted] = useState(false);
  const [summary, setSummary] = useState(null);
  const [busy, setBusy] = useState(false);

  const loadSummary = async () => {
    try {
      const sum = await HealthConnect.readSummary({ days: 1 });
      setSummary(sum);
    } catch (e) {
      notify(e?.message || "خواندن اطلاعات Health Connect ممکن نشد.");
    }
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!isNative) {
        if (alive) setChecked(true);
        return;
      }
      try {
        const av = await HealthConnect.isAvailable();
        if (!alive) return;
        setAvailable(!!av.available);
        if (av.available) {
          const g = await HealthConnect.hasPermissions();
          if (!alive) return;
          setGranted(!!g.granted);
          if (g.granted) await loadSummary();
        }
      } finally {
        if (alive) setChecked(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const connect = async () => {
    setBusy(true);
    try {
      const av = await HealthConnect.isAvailable();
      setAvailable(!!av.available);
      if (!av.available) {
        notify(
          "Health Connect روی این دستگاه نصب یا در دسترس نیست؛ از Play Store نصبش کنید.",
        );
        return;
      }
      const res = await HealthConnect.requestPermissions();
      setGranted(!!res.granted);
      if (res.granted) {
        notify("اتصال به Health Connect با رضایت شما برقرار شد.");
        await loadSummary();
      } else {
        notify("اجازهٔ دسترسی به Health Connect داده نشد.");
      }
    } catch (e) {
      notify(e?.message || "اتصال به Health Connect ممکن نشد.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="panel health-card">
      <HeartPulse size={23} />
      <div>
        <h3>Health Connect</h3>
        {!isNative ? (
          <p>اتصال به Health Connect فقط در نسخهٔ اندروید این برنامه در دسترس است.</p>
        ) : !checked ? (
          <p>در حال بررسی وضعیت Health Connect…</p>
        ) : !available ? (
          <p>Health Connect روی این دستگاه نصب نیست یا پشتیبانی نمی‌شود.</p>
        ) : granted ? (
          <>
            <p>اتصال با رضایت شما برقرار است؛ فقط دادهٔ زیر خوانده می‌شود.</p>
            {summary && (
              <ul className="health-summary">
                <li>گام‌های امروز: {Math.round(summary.steps || 0)}</li>
                <li>کالری سوزانده‌شده: {Math.round(summary.caloriesBurned || 0)}</li>
                {summary.latestWeightKg != null && (
                  <li>آخرین وزن ثبت‌شده: {summary.latestWeightKg} کیلوگرم</li>
                )}
              </ul>
            )}
          </>
        ) : (
          <p>
            در صورت تمایل و با رضایت صریح شما، اطلاعات گام، کالری و وزن از
            Health Connect خوانده می‌شود.
          </p>
        )}
      </div>
      {isNative && checked && available && granted && (
        <button onClick={loadSummary} disabled={busy}>
          <RefreshCw size={14} /> به‌روزرسانی
        </button>
      )}
      {isNative && checked && available && !granted && (
        <button onClick={connect} disabled={busy}>
          {busy ? "در حال اتصال…" : "اتصال"}
        </button>
      )}
      {!isNative && <span className="soon-badge">فقط اندروید</span>}
      {isNative && checked && !available && (
        <span className="soon-badge">نصب نشده</span>
      )}
    </div>
  );
}
