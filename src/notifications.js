import { Capacitor } from "@capacitor/core";

// شناسه‌های ثابت برای اعلان‌های محلی اندروید (هر یادآوری یک شناسهٔ اختصاصی
// دارد تا بشود آن را جداگانه لغو/به‌روزرسانی کرد).
const REMINDER_IDS = {
  breakfast: 9001,
  lunch: 9002,
  dinner: 9003,
  water: 9004,
  expiry: 9005,
};

export const DEFAULT_REMINDER_TIMES = {
  breakfast: "08:00",
  lunch: "13:00",
  dinner: "20:00",
  water: "11:30",
  expiry: "09:30",
};

const REMINDER_TEXT = {
  breakfast: ["یادآوری صبحانه", "وقت ثبت صبحانهٔ امروز رسیده است."],
  lunch: ["یادآوری ناهار", "وقت ثبت ناهار امروز رسیده است."],
  dinner: ["یادآوری شام", "وقت ثبت شام امروز رسیده است."],
  water: ["یادآوری آب", "یادتان نرود امروز آب کافی بنوشید."],
  expiry: ["بررسی موجودی", "برای موادی که نزدیک انقضا هستند سر بزنید."],
};

function isNative() {
  return Capacitor.isNativePlatform();
}

let swRegistrationPromise = null;
export function ensureServiceWorker() {
  if (isNative() || typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return Promise.resolve(null);
  }
  if (!swRegistrationPromise) {
    swRegistrationPromise = navigator.serviceWorker
      .register("/sw.js")
      .catch(() => null);
  }
  return swRegistrationPromise;
}

// وضعیت فعلی اجازهٔ اعلان: 'granted' | 'denied' | 'prompt' | 'unsupported'
export async function getNotificationStatus() {
  if (isNative()) {
    const { LocalNotifications } = await import(
      "@capacitor/local-notifications"
    );
    const p = await LocalNotifications.checkPermissions();
    return p.display;
  }
  if (typeof Notification === "undefined") return "unsupported";
  return Notification.permission === "default" ? "prompt" : Notification.permission;
}

export async function requestNotificationPermission() {
  if (isNative()) {
    const { LocalNotifications } = await import(
      "@capacitor/local-notifications"
    );
    const current = await LocalNotifications.checkPermissions();
    if (current.display === "granted") return true;
    if (current.display === "denied") return false;
    const res = await LocalNotifications.requestPermissions();
    return res.display === "granted";
  }
  if (typeof Notification === "undefined") return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  await ensureServiceWorker();
  const res = await Notification.requestPermission();
  return res === "granted";
}

export async function showNotification(title, body) {
  if (isNative()) {
    const { LocalNotifications } = await import(
      "@capacitor/local-notifications"
    );
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Math.floor(Date.now() % 1000000) + 1,
            title,
            body,
            schedule: { at: new Date(Date.now() + 500) },
          },
        ],
      });
    } catch {
      // اگر اجازه داده نشده باشد سکوت می‌کنیم؛ رابط کاربری وضعیت را نشان می‌دهد
    }
    return;
  }
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  try {
    const reg = await ensureServiceWorker();
    if (reg && reg.showNotification) {
      await reg.showNotification(title, { body, icon: "/icon.svg" });
      return;
    }
    new Notification(title, { body });
  } catch {
    // برخی مرورگرها (مثل کروم اندروید) بدون Service Worker اجازهٔ ساخت مستقیم نمی‌دهند؛
    // در آن صورت اعلان نمایش داده نمی‌شود ولی برنامه کار خودش را ادامه می‌دهد.
  }
}

// اعلان آزمایشی فوری؛ برخلاف showNotification خطاها را پنهان نمی‌کند تا
// دلیل واقعی مشکل (اگر باشد) به کاربر نشان داده شود.
export async function sendTestNotification() {
  if (isNative()) {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    const perm = await LocalNotifications.checkPermissions();
    if (perm.display !== "granted") {
      const res = await LocalNotifications.requestPermissions();
      if (res.display !== "granted") throw new Error("اجازهٔ اعلان داده نشده است.");
    }
    await LocalNotifications.schedule({
      notifications: [
        {
          id: 9999,
          title: "اعلان آزمایشی تندرسا",
          body: "اگر این پیام را می‌بینید، اعلان‌ها روی گوشی شما کار می‌کنند.",
          schedule: { at: new Date(Date.now() + 3000), allowWhileIdle: true },
        },
      ],
    });
    return;
  }
  if (typeof Notification === "undefined") throw new Error("اعلان در این مرورگر پشتیبانی نمی‌شود.");
  if (Notification.permission !== "granted") {
    const res = await Notification.requestPermission();
    if (res !== "granted") throw new Error("اجازهٔ اعلان داده نشده است.");
  }
  await showNotification("اعلان آزمایشی تندرسا", "اعلان‌ها کار می‌کنند.");
}

// روی اندروید: زمان‌بندی واقعی اعلان‌های تکرارشوندهٔ روزانه در سطح سیستم‌عامل
// (با AlarmManager)، که حتی وقتی برنامه بسته باشد هم فعال می‌مانند.
export async function syncReminderSchedule(reminders, times) {
  if (!isNative()) return;
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  const allIds = Object.values(REMINDER_IDS).map((id) => ({ id }));
  try {
    await LocalNotifications.cancel({ notifications: allIds });
  } catch {
    // اگر چیزی برای لغو نبود، مشکلی نیست
  }
  const toSchedule = [];
  for (const key of Object.keys(REMINDER_IDS)) {
    if (!reminders?.[key]) continue;
    const time = times?.[key] || DEFAULT_REMINDER_TIMES[key];
    const [hour, minute] = time.split(":").map(Number);
    const [title, body] = REMINDER_TEXT[key];
    toSchedule.push({
      id: REMINDER_IDS[key],
      title,
      body,
      schedule: { on: { hour, minute }, allowWhileIdle: true },
    });
  }
  if (toSchedule.length) {
    await LocalNotifications.schedule({ notifications: toSchedule });
  }
}

// حلقهٔ سبک برای وب/PWA: هر ۳۰ ثانیه بررسی می‌کند که آیا زمان یکی از
// یادآوری‌های فعال رسیده یا نه. محدودیت واقعی: تا وقتی تب/برنامه باز است کار
// می‌کند؛ برای اعلان وقتی برنامه کاملاً بسته است به یک سرویس Push نیاز است.
let webLoopHandle = null;
export function startWebReminderLoop(getState) {
  if (isNative() || webLoopHandle) return () => {};
  webLoopHandle = setInterval(() => {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const state = getState() || {};
    const reminders = state.reminders || {};
    const reminderTimes = state.reminderTimes || {};
    const now = new Date();
    const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes(),
    ).padStart(2, "0")}`;
    for (const key of Object.keys(REMINDER_IDS)) {
      if (!reminders[key]) continue;
      const time = reminderTimes[key] || DEFAULT_REMINDER_TIMES[key];
      if (time !== hhmm) continue;
      const flagKey = `reminder-fired-${key}-${now.toDateString()}`;
      if (localStorage.getItem(flagKey)) continue;
      localStorage.setItem(flagKey, "1");
      const [title, body] = REMINDER_TEXT[key];
      if (key === "expiry") {
        checkExpiryAndNotify(state.inventory, true);
      } else {
        showNotification(title, body);
      }
    }
  }, 30000);
  return () => {
    clearInterval(webLoopHandle);
    webLoopHandle = null;
  };
}

// بررسی واقعی موجودی خانه و اطلاع‌رسانی برای موادی که تا ۲ روز دیگر منقضی
// می‌شوند؛ محتوای اعلان بر اساس دادهٔ واقعی ثبت‌شده توسط کاربر ساخته می‌شود.
export async function checkExpiryAndNotify(inventory, force = false) {
  if (!Array.isArray(inventory) || !inventory.length) return;
  const now = Date.now();
  const soon = inventory.filter((item) => {
    if (!item.expiry) return false;
    const diffDays = Math.ceil((new Date(item.expiry).getTime() - now) / 86400000);
    return diffDays >= 0 && diffDays <= 2;
  });
  if (!soon.length) return;
  const flagKey = `expiry-notified-${new Date().toDateString()}`;
  if (!force && localStorage.getItem(flagKey)) return;
  localStorage.setItem(flagKey, "1");
  const names = soon.map((i) => i.title).slice(0, 3).join("، ");
  await showNotification(
    "نزدیک شدن تاریخ انقضا",
    `${names}${soon.length > 3 ? " و موارد دیگر" : ""} به‌زودی منقضی می‌شوند.`,
  );
}

export { REMINDER_IDS };

// ---------------------------------------------------------------------
// یادآوری پایان Premium (اعلان محلی اندروید؛ ۳ روز و ۱ روز قبل از پایان)
// فقط اگر کاربر قبلاً اجازهٔ اعلان داده باشد زمان‌بندی می‌شود؛ اینجا هرگز
// درخواست مجوز نمی‌کنیم (مجوزها فقط در لحظهٔ استفاده گرفته می‌شوند).
// با هر تمدید (تغییر تاریخ پایان) دوباره زمان‌بندی می‌شود و قبلی‌ها لغو می‌شوند.
// ---------------------------------------------------------------------
const PREMIUM_REMINDER_IDS = [9010, 9011];

export async function schedulePremiumExpiryReminders(untilMs) {
  if (!isNative()) return;
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    await LocalNotifications.cancel({
      notifications: PREMIUM_REMINDER_IDS.map((id) => ({ id })),
    });
    if (!untilMs || untilMs <= Date.now()) return;
    const perm = await LocalNotifications.checkPermissions();
    if (perm.display !== "granted") return;
    const DAY = 86400000;
    const items = [
      { id: PREMIUM_REMINDER_IDS[0], at: untilMs - 3 * DAY, body: "Premium شما تا ۳ روز دیگر تمام می‌شود. برای ادامهٔ دسترسی به امکانات پیشرفته، بستهٔ جدید تهیه کنید." },
      { id: PREMIUM_REMINDER_IDS[1], at: untilMs - 1 * DAY, body: "Premium شما فردا تمام می‌شود. برای تمدید از بخش «پشتیبان و حساب» اقدام کنید." },
    ]
      .filter((n) => n.at > Date.now() + 60000)
      .map((n) => ({
        id: n.id,
        title: "تندرسا · پایان Premium",
        body: n.body,
        schedule: { at: new Date(n.at), allowWhileIdle: true },
      }));
    if (items.length) await LocalNotifications.schedule({ notifications: items });
  } catch {
    // زمان‌بندی اعلان نباید هیچ بخشی از برنامه را خراب کند
  }
}
