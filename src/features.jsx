import React, { useState } from "react";
import {
  Crown,
  Lock,
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import { premiumUntil, premiumDaysLeft } from "./billing.js";

// ---------------------------------------------------------------------
// Real free / Premium gatekeeping
// ---------------------------------------------------------------------
// Free tier limits (kept out of hard-coded feature checks so the caller
// can always see exactly what is enforced and where).
export const FREE_MEMBER_LIMIT = 2;

// Premium یعنی: بستهٔ خریداری‌شدهٔ معتبر (رسید امضاشدهٔ مایکت) که هنوز
// تمام نشده، یا دورهٔ آزمایشی فعال. فلگ قدیمی data.premium دیگر اثری ندارد.
export function isPremiumActive(data) {
  if (!data) return false;
  if (premiumUntil(data) > Date.now()) return true;
  if (data.trialEndsAt && new Date(data.trialEndsAt).getTime() > Date.now())
    return true;
  return false;
}

export function isPaidPremium(data) {
  return premiumUntil(data) > Date.now();
}

export { premiumDaysLeft };

export function trialDaysLeft(data) {
  if (!data?.trialEndsAt) return 0;
  const ms = new Date(data.trialEndsAt).getTime() - Date.now();
  return ms > 0 ? Math.ceil(ms / 86400000) : 0;
}

// Wraps a Premium-only feature. Renders the real content only when the
// account is actually Premium/trialing; otherwise shows a locked card
// with a real call-to-action instead of just a cosmetic badge.
export function PremiumGate({ data, title, desc, onUpgrade, children }) {
  if (isPremiumActive(data)) return <>{children}</>;
  return (
    <div className="panel lock-card">
      <div className="lock-icon">
        <Lock size={20} />
      </div>
      <div>
        <span className="pill gold">امکان Premium</span>
        <h3>{title}</h3>
        <p>{desc}</p>
      </div>
      <button className="primary" onClick={onUpgrade}>
        <Crown size={15} /> ارتقا به Premium
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------
// Recipe bank: ingredients per dish at a base serving count, used to
// power "مواد اولیه، تعداد نفرات" in the meal plan (section 3 و 10).
// ---------------------------------------------------------------------
export const recipeBank = {
  "قورمه‌سبزی": {
    baseServings: 4,
    ingredients: [
      { name: "گوشت خورشتی", amount: 300, unit: "g" },
      { name: "سبزی قورمه", amount: 400, unit: "g" },
      { name: "لوبیا قرمز", amount: 100, unit: "g" },
      { name: "لیمو عمانی", amount: 3, unit: "" },
      { name: "برنج", amount: 3, unit: "cup" },
    ],
  },
  "قرمه‌سبزی با گوشت": {
    baseServings: 4,
    ingredients: [
      { name: "گوشت خورشتی", amount: 350, unit: "g" },
      { name: "سبزی قورمه", amount: 400, unit: "g" },
      { name: "لوبیا قرمز", amount: 100, unit: "g" },
      { name: "برنج", amount: 3, unit: "cup" },
    ],
  },
  "عدس‌پلو": {
    baseServings: 4,
    ingredients: [
      { name: "برنج", amount: 3, unit: "cup" },
      { name: "عدس", amount: 1, unit: "cup" },
      { name: "خرما یا کشمش", amount: 100, unit: "g" },
      { name: "پیاز", amount: 1, unit: "" },
    ],
  },
  "زرشک‌پلو با مرغ": {
    baseServings: 4,
    ingredients: [
      { name: "مرغ", amount: 1, unit: "" },
      { name: "برنج", amount: 3, unit: "cup" },
      { name: "زرشک", amount: 3, unit: "tbsp" },
      { name: "زعفران دم‌کرده", amount: 2, unit: "tbsp" },
    ],
  },
  "کوکو سبزی": {
    baseServings: 4,
    ingredients: [
      { name: "تخم‌مرغ", amount: 6, unit: "" },
      { name: "سبزی کوکو", amount: 300, unit: "g" },
      { name: "آرد", amount: 2, unit: "tbsp" },
    ],
  },
  "نان و پنیر و گردو": {
    baseServings: 4,
    ingredients: [
      { name: "نان", amount: 4, unit: "" },
      { name: "پنیر", amount: 200, unit: "g" },
      { name: "گردو", amount: 100, unit: "g" },
    ],
  },
  "فسنجان": {
    baseServings: 4,
    ingredients: [
      { name: "مرغ", amount: 1, unit: "" },
      { name: "گردوی چرخ‌کرده", amount: 400, unit: "g" },
      { name: "رب انار", amount: 250, unit: "g" },
    ],
  },
  "قیمه": {
    baseServings: 4,
    ingredients: [
      { name: "گوشت خورشتی", amount: 300, unit: "g" },
      { name: "لپه", amount: 150, unit: "g" },
      { name: "سیب‌زمینی", amount: 2, unit: "" },
      { name: "برنج", amount: 3, unit: "cup" },
    ],
  },
  "جوجه‌کباب": {
    baseServings: 4,
    ingredients: [
      { name: "سینه مرغ", amount: 600, unit: "g" },
      { name: "ماست", amount: 200, unit: "g" },
      { name: "زعفران", amount: 1, unit: "tsp" },
    ],
  },
  "کباب کوبیده": {
    baseServings: 4,
    ingredients: [
      { name: "گوشت چرخ‌کرده", amount: 600, unit: "g" },
      { name: "پیاز رنده‌شده", amount: 1, unit: "" },
    ],
  },
  "آش رشته": {
    baseServings: 4,
    ingredients: [
      { name: "رشته آش", amount: 200, unit: "g" },
      { name: "لوبیا و عدس", amount: 200, unit: "g" },
      { name: "سبزی آش", amount: 400, unit: "g" },
      { name: "کشک", amount: 100, unit: "g" },
    ],
  },
  "آبگوشت": {
    baseServings: 4,
    ingredients: [
      { name: "گوشت با استخوان", amount: 400, unit: "g" },
      { name: "نخود و لوبیا", amount: 150, unit: "g" },
      { name: "سیب‌زمینی", amount: 2, unit: "" },
      { name: "گوجه‌فرنگی", amount: 2, unit: "" },
    ],
  },
};

export function scaledAmount(amount, servings, baseServings) {
  const ratio = (Number(servings) || 1) / (Number(baseServings) || 1);
  const v = (Number(amount) || 0) * ratio;
  return Math.round(v * 100) / 100;
}

// ---------------------------------------------------------------------
// Real "create a family" flow (section 1 و 4): name -> members -> review,
// instead of the old rename-only modal.
// ---------------------------------------------------------------------
const memberPalette = [
  "#f39a7a",
  "#6d8bd9",
  "#f2c94c",
  "#8fc8a7",
  "#c9a7e8",
  "#e79ab0",
  "#7ec8c0",
];
function emptyMemberDraft() {
  return {
    name: "",
    role: "عضو خانواده",
    age: "",
    gender: "",
    height: "",
    weight: "",
    activity: "متوسط",
    goal: "حفظ وزن",
  };
}

export function FamilyCreateWizard({ close, onCreate, isPremium }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [members, setMembers] = useState([]);
  const [draft, setDraft] = useState(emptyMemberDraft());
  const limitReached = !isPremium && members.length >= FREE_MEMBER_LIMIT;

  const addMember = () => {
    if (!draft.name.trim() || limitReached) return;
    setMembers((m) => [
      ...m,
      {
        ...draft,
        name: draft.name.trim(),
        id: Date.now(),
        color: memberPalette[m.length % memberPalette.length],
        initials: draft.name.trim()[0] || "؟",
      },
    ]);
    setDraft(emptyMemberDraft());
  };
  const removeMember = (id) =>
    setMembers((m) => m.filter((x) => x.id !== id));

  return (
    <div className="modal-backdrop">
      <div className="modal wizard-modal">
        <button className="close" onClick={close}>
          <X size={18} />
        </button>
        <div className="wizard-steps">
          {["نام خانواده", "اعضا", "بازبینی"].map((s, i) => (
            <span
              key={s}
              className={i === step ? "active" : i < step ? "done" : ""}
            >
              {i + 1}. {s}
            </span>
          ))}
        </div>
        {step === 0 && (
          <div>
            <h2>ایجاد خانواده جدید</h2>
            <p className="modal-sub">
              این یک شروع تازه است؛ پس از تأیید نهایی، اعضا و برنامه فعلی با
              خانواده جدید جایگزین می‌شوند (پشتیبان قبلی را می‌توانید از
              بخش «پشتیبان و تنظیمات» بگیرید).
            </p>
            <label>
              نام خانواده
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثلاً خانواده احمدی"
              />
            </label>
            <button
              className="primary full"
              disabled={!name.trim()}
              onClick={() => setStep(1)}
            >
              ادامه <ArrowLeft size={16} />
            </button>
          </div>
        )}
        {step === 1 && (
          <div>
            <h2>افزودن اعضا</h2>
            <p className="modal-sub">
              {isPremium
                ? "بدون محدودیت در تعداد عضو."
                : `نسخه رایگان تا ${FREE_MEMBER_LIMIT} عضو را پشتیبانی می‌کند.`}
            </p>
            <div className="two-fields">
              <label>
                نام
                <input
                  value={draft.name}
                  onChange={(e) =>
                    setDraft({ ...draft, name: e.target.value })
                  }
                />
              </label>
              <label>
                نقش
                <select
                  value={draft.role}
                  onChange={(e) =>
                    setDraft({ ...draft, role: e.target.value })
                  }
                >
                  <option>عضو خانواده</option>
                  <option>مادر</option>
                  <option>پدر</option>
                  <option>کودک</option>
                  <option>نوجوان</option>
                </select>
              </label>
            </div>
            <div className="two-fields">
              <label>
                سن
                <input
                  value={draft.age}
                  onChange={(e) =>
                    setDraft({ ...draft, age: e.target.value })
                  }
                />
              </label>
              <label>
                جنسیت
                <input
                  value={draft.gender}
                  onChange={(e) =>
                    setDraft({ ...draft, gender: e.target.value })
                  }
                />
              </label>
            </div>
            <button
              type="button"
              className="secondary full"
              disabled={!draft.name.trim() || limitReached}
              onClick={addMember}
            >
              <Plus size={15} /> افزودن به لیست
            </button>
            {limitReached && (
              <p className="lock-hint">
                برای افزودن عضو بیشتر از {FREE_MEMBER_LIMIT} نفر، Premium را
                فعال کنید.
              </p>
            )}
            <div className="wizard-member-list">
              {members.map((m) => (
                <div className="wizard-member-row" key={m.id}>
                  <span className="avatar tiny" style={{ background: m.color }}>
                    {m.initials}
                  </span>
                  <b>{m.name}</b>
                  <small>
                    {m.role}
                    {m.age ? ` · ${m.age} سال` : ""}
                  </small>
                  <button type="button" onClick={() => removeMember(m.id)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              {!members.length && (
                <p className="empty-hint">هنوز عضوی اضافه نشده است.</p>
              )}
            </div>
            <div className="wizard-nav">
              <button onClick={() => setStep(0)}>
                <ArrowRight size={15} /> قبلی
              </button>
              <button
                className="primary"
                disabled={!members.length}
                onClick={() => setStep(2)}
              >
                بازبینی <ArrowLeft size={15} />
              </button>
            </div>
          </div>
        )}
        {step === 2 && (
          <div>
            <h2>بازبینی نهایی</h2>
            <p className="modal-sub">
              خانواده «{name}» با {members.length} عضو ساخته می‌شود.
            </p>
            <div className="wizard-member-list">
              {members.map((m) => (
                <div className="wizard-member-row" key={m.id}>
                  <span className="avatar tiny" style={{ background: m.color }}>
                    {m.initials}
                  </span>
                  <b>{m.name}</b>
                  <small>{m.role}</small>
                </div>
              ))}
            </div>
            <div className="wizard-nav">
              <button onClick={() => setStep(1)}>
                <ArrowRight size={15} /> قبلی
              </button>
              <button
                className="primary"
                onClick={() => onCreate({ familyName: name.trim(), members })}
              >
                ساخت خانواده <Check size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Per-person analysis (section 15) و تحلیل تنقلات (section 16) — بر
// اساس روند زمانی واقعیِ محاسبه‌شده از data.logs، نه اعداد ثابت.
// ---------------------------------------------------------------------
const snackCategories = [
  { key: "sweet", label: "خوراکی شیرین", match: ["شکلات", "بستنی", "کیک", "بیسکویت", "کلوچه"] },
  { key: "salty", label: "تنقلات شور", match: ["چیپس", "پفک"] },
  { key: "drink", label: "نوشیدنی شیرین", match: ["نوشابه", "آبمیوه"] },
  { key: "fruit", label: "میوه", match: ["سیب", "موز", "میوه", "خرما"] },
  { key: "nuts", label: "آجیل و خشکبار", match: ["آجیل"] },
];
function categorize(title) {
  const t = title || "";
  for (const c of snackCategories) if (c.match.some((k) => t.includes(k))) return c;
  return { key: "other", label: "سایر تنقلات" };
}
function weekKey(iso) {
  const d = new Date(iso);
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${week}`;
}

export function MemberAnalysis({ member, data }) {
  const logs = data.logs.filter((l) => l.members.includes(member.name));
  const eaten = logs.filter((l) => {
    const en = (l.entries || []).find((e) => e.member === member.name);
    return en?.status === "خورد";
  });
  const missed = logs.filter((l) => {
    const en = (l.entries || []).find((e) => e.member === member.name);
    return en?.status === "نخورد";
  });
  const titleCounts = {};
  eaten.forEach((l) => (titleCounts[l.title] = (titleCounts[l.title] || 0) + 1));
  const sortedTitles = Object.entries(titleCounts).sort((a, b) => b[1] - a[1]);
  const most = sortedTitles.slice(0, 5);
  const least = sortedTitles.filter((x) => x[1] === 1).slice(0, 3);
  const missedByMeal = {};
  missed.forEach((l) => (missedByMeal[l.meal] = (missedByMeal[l.meal] || 0) + 1));
  const snackCount = eaten.filter((l) => l.type === "snack").length;
  const variety = new Set(eaten.map((l) => l.title)).size;
  const now = new Date();
  const weeks = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const wk = weekKey(d.toISOString());
    if (!weeks.includes(wk)) weeks.push(wk);
  }
  const trend = weeks.map((w) => ({
    week: w,
    count: eaten.filter((l) => weekKey(l.date) === w).length,
  }));
  const maxTrend = Math.max(1, ...trend.map((t) => t.count));
  const kidMode = member.role === "کودک";
  return (
    <div className="panel member-analysis">
      <div className="section-head compact">
        <div>
          <h3>تحلیل {member.name}</h3>
          <p>بر اساس {logs.length} ثبت واقعی</p>
        </div>
      </div>
      <div className="analysis-grid">
        <div>
          <b>{most[0]?.[0] || "—"}</b>
          <span>پرتکرارترین غذا</span>
        </div>
        <div>
          <b>{variety}</b>
          <span>تنوع غذایی</span>
        </div>
        <div>
          <b>{snackCount}</b>
          <span>تنقلات ثبت‌شده</span>
        </div>
        <div>
          <b>{missed.length}</b>
          <span>وعده «نخورد»</span>
        </div>
      </div>
      {kidMode ? (
        <p className="kid-note">
          🌟 {member.name} تا امروز {variety} غذای متنوع را امتحان کرده! هر
          ثبت، یک قدم خوب رو به جلوست.
        </p>
      ) : (
        <>
          <h4>غذاهای پرتکرار</h4>
          {most.length ? (
            <ul className="chip-list">
              {most.map(([t, c]) => (
                <li key={t}>
                  {t} <b>×{c}</b>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-hint">هنوز داده کافی ثبت نشده است.</p>
          )}
          {least.length > 0 && (
            <>
              <h4>غذاهای کمتر مصرف‌شده</h4>
              <ul className="chip-list muted">
                {least.map(([t]) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </>
          )}
          <h4>وعده‌های حذف‌شده</h4>
          {Object.keys(missedByMeal).length ? (
            <ul className="chip-list">
              {Object.entries(missedByMeal).map(([m, c]) => (
                <li key={m}>
                  {m} <b>×{c}</b>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-hint">وعده حذف‌شده‌ای ثبت نشده.</p>
          )}
        </>
      )}
      <h4>روند ۶ هفته اخیر</h4>
      <div className="real-bars">
        {trend.map((t, i) => (
          <div className="real-bar-row" key={t.week}>
            <span>هفته {i + 1}</span>
            <div>
              <i
                style={{
                  width: (t.count / maxTrend) * 100 + "%",
                  background: "#8bb98a",
                }}
              />
            </div>
            <b>{t.count}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SnackAnalysis({ data }) {
  const now = Date.now();
  const inRange = (iso, fromDays, toDays) => {
    const diff = (now - new Date(iso).getTime()) / 86400000;
    return diff >= fromDays && diff < toDays;
  };
  const snackLogs = data.logs.filter((l) => l.type === "snack" || l.type === "drink");
  const last30 = snackLogs.filter((l) => inRange(l.date, 0, 30));
  const prev30 = snackLogs.filter((l) => inRange(l.date, 30, 60));
  const countBy = (list) => {
    const m = {};
    list.forEach((l) => {
      const c = categorize(l.title);
      m[c.label] = (m[c.label] || 0) + 1;
    });
    return m;
  };
  const curr = countBy(last30);
  const prevC = countBy(prev30);
  const labels = [...new Set([...Object.keys(curr), ...Object.keys(prevC)])];
  return (
    <div className="panel snack-analysis">
      <div className="section-head compact">
        <div>
          <h3>تحلیل تنقلات (۳۰ روز اخیر)</h3>
          <p>مقایسه با ۳۰ روز پیش از آن</p>
        </div>
      </div>
      {labels.length ? (
        <div className="compare-list">
          {labels.map((l) => {
            const c = curr[l] || 0,
              p = prevC[l] || 0;
            const diff = c - p;
            return (
              <div className="compare-row" key={l}>
                <span>{l}</span>
                <b>{c} بار</b>
                <small className={diff > 0 ? "up" : diff < 0 ? "down" : ""}>
                  {p
                    ? diff === 0
                      ? "بدون تغییر نسبت به قبل"
                      : diff > 0
                        ? `${diff}+ نسبت به ماه قبل`
                        : `${diff} نسبت به ماه قبل`
                    : "بدون سابقه قبلی"}
                </small>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="empty-hint">در ۳۰ روز اخیر تنقلاتی ثبت نشده است.</p>
      )}
      <p className="gentle-inline">
        این آمار فقط برای اطلاع‌رسانی است، نه قضاوت؛ هر چه ثبت‌ها کامل‌تر
        باشند، این تحلیل دقیق‌تر می‌شود.
      </p>
    </div>
  );
}
