import { Capacitor, registerPlugin } from "@capacitor/core";

// ---------------------------------------------------------------------
// خرید Premium از طریق مایکت
// مایکت اشتراک ندارد؛ سه «بسته زمانی مصرف‌شدنی» فروخته می‌شود. بعد از هر
// خرید، Worker امضای مایکت را تأیید و یک رسید امضاشده می‌دهد؛ سپس خرید
// consume می‌شود تا بسته دوباره قابل خرید باشد (تمدید).
// شناسه‌های محصول باید دقیقاً همین‌ها در پنل توسعه‌دهندگان مایکت ساخته شوند.
// ---------------------------------------------------------------------
const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "https://family-nutrition-companion-api.ghadir-baraty.workers.dev";

export const PLANS = [
  { sku: "premium_1m", days: 30, label: "ماهانه", fallbackPrice: "" },
  { sku: "premium_3m", days: 90, label: "سه‌ماهه", fallbackPrice: "" },
  { sku: "premium_12m", days: 365, label: "سالانه", fallbackPrice: "" },
];
const DAYS = Object.fromEntries(PLANS.map((p) => [p.sku, p.days]));
const DAY_MS = 86400000;

const MyketBilling = registerPlugin("MyketBilling");

export const billingSupported = () => Capacitor.isNativePlatform();

export function newInstallId() {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 32);
}

function decodeReceipt(receipt) {
  try {
    const body = String(receipt).split(".")[0].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      Array.from(atob(body), (c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0")).join(""),
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// تاریخ پایان Premium از روی رسیدها؛ هر بسته از پایان بستهٔ قبلی (یا زمان
// خرید، هر کدام دیرتر) شروع می‌شود. ترتیب و تکرار رسیدها اثری ندارد.
export function premiumUntil(data) {
  const seen = new Set();
  const items = [];
  for (const r of data?.iapReceipts || []) {
    const p = decodeReceipt(r);
    if (!p || p.installId !== data.installId || !DAYS[p.sku]) continue;
    if (seen.has(p.orderId)) continue;
    seen.add(p.orderId);
    items.push(p);
  }
  items.sort((a, b) => a.purchaseTime - b.purchaseTime);
  let until = 0;
  for (const p of items) {
    until = Math.max(until, p.purchaseTime) + DAYS[p.sku] * DAY_MS;
  }
  return until;
}

export function premiumDaysLeft(data) {
  const ms = premiumUntil(data) - Date.now();
  return ms > 0 ? Math.ceil(ms / DAY_MS) : 0;
}

async function post(path, body) {
  const r = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
  return j;
}

// خرید پرداخت‌شده را به سرور می‌دهد، رسید می‌گیرد و سپس consume می‌کند.
// مهم: consume فقط بعد از دریافت رسید انجام می‌شود، تا اگر شبکه قطع شد
// خرید در queryInventory بعدی دوباره برگردد و پولی از کاربر بی‌نتیجه نماند.
async function redeem(purchase) {
  const res = await post("/api/iap/verify", {
    originalJson: purchase.originalJson,
    signature: purchase.signature,
  });
  await MyketBilling.consume({ token: purchase.token });
  return res.receipt;
}

export async function loadStore() {
  if (!billingSupported()) return { status: "web", products: [], receipts: [] };
  const info = await MyketBilling.isAvailable().catch(() => ({}));
  if (!info.configured) return { status: "not_configured", products: [], receipts: [] };
  if (!info.myketInstalled) return { status: "no_myket", products: [], receipts: [] };
  try {
    const inv = await MyketBilling.queryInventory({ skus: PLANS.map((p) => p.sku) });
    const receipts = [];
    for (const pur of inv.pending || []) {
      if (!DAYS[pur.sku]) continue;
      try {
        receipts.push(await redeem(pur));
      } catch {
        /* در اجرای بعدی دوباره تلاش می‌شود */
      }
    }
    return { status: "ready", products: inv.products || [], receipts };
  } catch (e) {
    return { status: "error", error: e?.message || "", products: [], receipts: [] };
  }
}

export async function buyPlan(sku, installId) {
  const payload = `${installId}.${newInstallId().slice(0, 12)}`;
  const purchase = await MyketBilling.purchase({ sku, payload });
  return redeem(purchase);
}

// رسیدهای نامعتبر (مثلاً دست‌کاری‌شده) را دور می‌ریزد. اگر شبکه نبود، همان‌ها را نگه می‌دارد.
export async function filterValidReceipts(data) {
  const receipts = data?.iapReceipts || [];
  if (!receipts.length) return receipts;
  try {
    const r = await post("/api/iap/check", { installId: data.installId, receipts });
    return r.valid || [];
  } catch {
    return receipts;
  }
}
