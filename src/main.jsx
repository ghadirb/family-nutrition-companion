import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Capacitor } from "@capacitor/core";
import { App as CapApp } from "@capacitor/app";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  BarChart3,
  Plus,
  Search,
  Bell,
  Settings2,
  ChevronLeft,
  ChevronRight,
  Utensils,
  Droplets,
  Cookie,
  Check,
  X,
  Sparkles,
  Download,
  Upload,
  Trash2,
  Edit3,
  Crown,
} from "lucide-react";
import "./styles.css";
import { AiAssistant } from "./ai.jsx";
import {
  ShoppingList,
  Inventory,
  ReminderCenter,
  CaptureCenter,
  ReportActions,
  HealthConnectCard,
} from "./advanced.jsx";
import {
  FREE_MEMBER_LIMIT,
  isPremiumActive,
  trialDaysLeft,
  PremiumGate,
  recipeBank,
  scaledAmount,
  FamilyCreateWizard,
  MemberAnalysis,
  SnackAnalysis,
} from "./features.jsx";

const foodBank = [
  {
    id: 1,
    name: "قورمه‌سبزی",
    aliases: "قرمه سبزی قورمه سبزی قرمه‌سبزی",
    group: "غذای اصلی",
    icon: "🍲",
  },
  {
    id: 2,
    name: "عدس‌پلو",
    aliases: "عدس پلو عدسپلو",
    group: "غذای اصلی",
    icon: "🍚",
  },
  {
    id: 3,
    name: "زرشک‌پلو با مرغ",
    aliases: "زرشک پلو مرغ زرشکپلو",
    group: "غذای اصلی",
    icon: "🍗",
  },
  {
    id: 4,
    name: "کوکو سبزی",
    aliases: "کوکو کوکوسبزی",
    group: "غذای اصلی",
    icon: "🥗",
  },
  {
    id: 5,
    name: "نان و پنیر و گردو",
    aliases: "صبحانه نان پنیر گردو",
    group: "صبحانه",
    icon: "🥖",
  },
  { id: 6, name: "سیب", aliases: "میوه", group: "میان‌وعده", icon: "🍎" },
  { id: 7, name: "آب", aliases: "نوشیدنی آب", group: "نوشیدنی", icon: "💧" },
  {
    id: 8,
    name: "بستنی",
    aliases: "تنقلات شیرین",
    group: "تنقلات",
    icon: "🍦",
  },
  {
    id: 9,
    name: "فسنجان",
    aliases: "خورش فسنجون فسنجون",
    group: "غذای اصلی",
    icon: "🍲",
  },
  {
    id: 10,
    name: "قیمه",
    aliases: "خورش قیمه قیمه بادمجان",
    group: "غذای اصلی",
    icon: "🍛",
  },
  {
    id: 11,
    name: "قرمه‌سبزی با گوشت",
    aliases: "قورمه گوشت",
    group: "غذای اصلی",
    icon: "🍲",
  },
  {
    id: 12,
    name: "باقالی‌پلو با ماهیچه",
    aliases: "باقالی پلو ماهیچه",
    group: "غذای اصلی",
    icon: "🍚",
  },
  {
    id: 13,
    name: "استامبولی‌پلو",
    aliases: "استانبولی پلو استامبولی",
    group: "غذای اصلی",
    icon: "🍚",
  },
  {
    id: 14,
    name: "لوبیا پلو",
    aliases: "لوبیاپلو",
    group: "غذای اصلی",
    icon: "🍚",
  },
  {
    id: 15,
    name: "کباب کوبیده",
    aliases: "کباب کوبیده",
    group: "غذای اصلی",
    icon: "🍢",
  },
  {
    id: 16,
    name: "جوجه‌کباب",
    aliases: "جوجه کباب جوجه‌ کباب",
    group: "غذای اصلی",
    icon: "🍗",
  },
  {
    id: 17,
    name: "خورش کرفس",
    aliases: "کرفس خورش کرفس",
    group: "غذای اصلی",
    icon: "🍲",
  },
  {
    id: 18,
    name: "خورش بامیه",
    aliases: "بامیه",
    group: "غذای اصلی",
    icon: "🍲",
  },
  { id: 19, name: "آش رشته", aliases: "آش", group: "غذای اصلی", icon: "🍜" },
  {
    id: 20,
    name: "دلمه برگ مو",
    aliases: "دلمه",
    group: "غذای اصلی",
    icon: "🫑",
  },
  {
    id: 21,
    name: "کشک بادمجان",
    aliases: "کشک و بادمجان",
    group: "پیش‌غذا",
    icon: "🍆",
  },
  {
    id: 22,
    name: "میرزا قاسمی",
    aliases: "میرزاقاسمی",
    group: "پیش‌غذا",
    icon: "🍆",
  },
  {
    id: 23,
    name: "ماست و خیار",
    aliases: "ماست خیار",
    group: "مخلفات",
    icon: "🥒",
  },
  {
    id: 24,
    name: "سالاد شیرازی",
    aliases: "سالاد شیراز",
    group: "مخلفات",
    icon: "🥗",
  },
  {
    id: 25,
    name: "آبگوشت",
    aliases: "دیزی آب گوشت",
    group: "غذای اصلی",
    icon: "🍲",
  },
  {
    id: 26,
    name: "حلیم",
    aliases: "حلیم بادمجان",
    group: "صبحانه",
    icon: "🥣",
  },
  {
    id: 27,
    name: "نیمرو",
    aliases: "تخم مرغ نیمرو",
    group: "صبحانه",
    icon: "🍳",
  },
  { id: 28, name: "عدسی", aliases: "سوپ عدس", group: "صبحانه", icon: "🍲" },
  { id: 29, name: "موز", aliases: "میوه", group: "میان‌وعده", icon: "🍌" },
  {
    id: 30,
    name: "خرما",
    aliases: "خرما و گردو",
    group: "میان‌وعده",
    icon: "🌴",
  },
  {
    id: 31,
    name: "چیپس",
    aliases: "چیپس سیب زمینی",
    group: "تنقلات",
    icon: "🍟",
  },
  { id: 32, name: "پفک", aliases: "پفک نمکی", group: "تنقلات", icon: "🧡" },
  { id: 33, name: "آجیل", aliases: "آجیل مخلوط", group: "تنقلات", icon: "🥜" },
  {
    id: 34,
    name: "شکلات",
    aliases: "شکلات تخته‌ای",
    group: "تنقلات",
    icon: "🍫",
  },
  {
    id: 35,
    name: "بیسکویت",
    aliases: "کلوچه بیسکوییت",
    group: "تنقلات",
    icon: "🍪",
  },
  {
    id: 36,
    name: "نوشابه",
    aliases: "نوشیدنی گاز‌دار کوکا",
    group: "نوشیدنی",
    icon: "🥤",
  },
  { id: 37, name: "آبمیوه", aliases: "آب میوه", group: "نوشیدنی", icon: "🧃" },
  { id: 38, name: "چای", aliases: "چایی", group: "نوشیدنی", icon: "🍵" },
  { id: 39, name: "شیر", aliases: "شیر گاو", group: "نوشیدنی", icon: "🥛" },
];
const seed = {
  familyName: "خانواده کریمی",
  premium: false,
  members: [
    {
      id: 1,
      name: "مریم",
      role: "مادر",
      age: 37,
      gender: "زن",
      height: 165,
      weight: 68,
      activity: "متوسط",
      goal: "حفظ وزن",
      likes: "سبزیجات، ماهی",
      dislikes: "نوشابه",
      notes: "",
      color: "#f39a7a",
      initials: "م",
    },
    {
      id: 2,
      name: "امیر",
      role: "پدر",
      age: 40,
      gender: "مرد",
      height: 180,
      weight: 84,
      activity: "زیاد",
      goal: "افزایش انرژی",
      likes: "کباب، برنج",
      dislikes: "",
      notes: "",
      color: "#6d8bd9",
      initials: "ا",
    },
    {
      id: 3,
      name: "علی",
      role: "کودک",
      age: 9,
      gender: "پسر",
      height: 132,
      weight: 31,
      activity: "زیاد",
      goal: "رشد سالم",
      likes: "ماکارونی، سیب",
      dislikes: "سبزی پخته",
      notes: "",
      color: "#f2c94c",
      initials: "ع",
    },
    {
      id: 4,
      name: "سارا",
      role: "نوجوان",
      age: 15,
      gender: "دختر",
      height: 160,
      weight: 52,
      activity: "متوسط",
      goal: "حفظ وزن",
      likes: "سالاد، مرغ",
      dislikes: "",
      notes: "",
      color: "#8fc8a7",
      initials: "س",
    },
  ],
  plan: [
    {
      id: 1,
      day: "شنبه",
      date: "۲۸ شهریور",
      meals: [
        { id: 11, time: "صبحانه", title: "نان، پنیر و گردو", icon: "🥖" },
        { id: 12, time: "ناهار", title: "قورمه‌سبزی با برنج", icon: "🍲" },
        { id: 13, time: "شام", title: "کوکو سبزی و ماست", icon: "🥗" },
      ],
    },
    {
      id: 2,
      day: "یکشنبه",
      date: "۲۹ شهریور",
      meals: [
        { id: 21, time: "صبحانه", title: "املت گوجه", icon: "🍳" },
        { id: 22, time: "ناهار", title: "عدس‌پلو با کشمش", icon: "🍚" },
        { id: 23, time: "شام", title: "سوپ جو و سبزیجات", icon: "🥣" },
      ],
    },
    {
      id: 3,
      day: "دوشنبه",
      date: "۳۰ شهریور",
      meals: [
        { id: 31, time: "صبحانه", title: "شیر و خرما", icon: "🥛" },
        { id: 32, time: "ناهار", title: "زرشک‌پلو با مرغ", icon: "🍗" },
        { id: 33, time: "شام", title: "سالاد شیرازی و تخم‌مرغ", icon: "🥗" },
      ],
    },
    {
      id: 4,
      day: "سه‌شنبه",
      date: "۳۱ شهریور",
      meals: [
        { id: 41, time: "صبحانه", title: "پنیر و گردو و خیار", icon: "🧀" },
        { id: 42, time: "ناهار", title: "فسنجان با برنج", icon: "🍯" },
        { id: 43, time: "شام", title: "آش رشته", icon: "🍜" },
      ],
    },
    {
      id: 5,
      day: "چهارشنبه",
      date: "۱ مهر",
      meals: [
        { id: 51, time: "صبحانه", title: "تخم‌مرغ آب‌پز و نان", icon: "🥚" },
        { id: 52, time: "ناهار", title: "قیمه با برنج", icon: "🍛" },
        { id: 53, time: "شام", title: "کوکو سیب‌زمینی و ماست", icon: "🥔" },
      ],
    },
    {
      id: 6,
      day: "پنجشنبه",
      date: "۲ مهر",
      meals: [
        { id: 61, time: "صبحانه", title: "نان و عسل و گردو", icon: "🍯" },
        { id: 62, time: "ناهار", title: "جوجه‌کباب با برنج", icon: "🍢" },
        { id: 63, time: "شام", title: "آبگوشت", icon: "🍲" },
      ],
    },
    {
      id: 7,
      day: "جمعه",
      date: "۳ مهر",
      meals: [
        { id: 71, time: "صبحانه", title: "نیمرو و گوجه", icon: "🍳" },
        { id: 72, time: "ناهار", title: "کباب کوبیده با برنج", icon: "🍢" },
        { id: 73, time: "شام", title: "سبزی‌پلو و ماهی", icon: "🐟" },
      ],
    },
  ],
  logs: [
    {
      id: 1,
      type: "meal",
      title: "قورمه‌سبزی با برنج",
      meal: "ناهار",
      date: isoDaysAgo(0),
      time: "۱۳:۲۰",
      entries: [
        { member: "مریم", status: "خورد", amount: "۱ سهم" },
        { member: "امیر", status: "خورد", amount: "۱.۵ سهم" },
        { member: "علی", status: "خورد", amount: "نصف سهم" },
        { member: "سارا", status: "نخورد", amount: null },
      ],
      members: ["مریم", "امیر", "علی", "سارا"],
      icon: "🍲",
      tag: "وعده اصلی",
    },
    {
      id: 2,
      type: "snack",
      title: "سیب و گردو",
      meal: "میان‌وعده",
      date: isoDaysAgo(0),
      time: "۱۶:۱۰",
      entries: [{ member: "علی", status: "خورد", amount: "متوسط" }],
      members: ["علی"],
      icon: "🍎",
      tag: "میان‌وعده",
    },
    {
      id: 3,
      type: "drink",
      title: "آب",
      meal: "نوشیدنی",
      date: isoDaysAgo(0),
      time: "۱۱:۴۵",
      entries: [
        { member: "مریم", status: "خورد", amount: "۱ لیوان" },
        { member: "امیر", status: "خورد", amount: "۱ لیوان" },
      ],
      members: ["مریم", "امیر"],
      icon: "💧",
      tag: "نوشیدنی",
    },
    {
      id: 4,
      type: "snack",
      title: "بیسکویت",
      meal: "تنقلات",
      date: isoDaysAgo(1),
      time: "۱۸:۳۰",
      entries: [{ member: "سارا", status: "خورد", amount: "کم" }],
      members: ["سارا"],
      icon: "🍪",
      tag: "تنقلات",
    },
    {
      id: 5,
      type: "meal",
      title: "زرشک‌پلو با مرغ",
      meal: "ناهار",
      date: isoDaysAgo(6),
      time: "۱۳:۱۰",
      entries: [
        { member: "مریم", status: "خورد", amount: "۱ سهم" },
        { member: "امیر", status: "خورد", amount: "۱.۵ سهم" },
        { member: "علی", status: "نخورد", amount: null },
        { member: "سارا", status: "خورد", amount: "۱ سهم" },
      ],
      members: ["مریم", "امیر", "علی", "سارا"],
      icon: "🍗",
      tag: "وعده اصلی",
    },
  ],
};
function isoDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}
// Real logging streak: number of consecutive days, counting back from today,
// that have at least one log entry. Replaces the previous hardcoded "۶ روز".
function loggingStreak(logs) {
  const loggedDays = new Set((logs || []).map((l) => (l.date || "").slice(0, 10)));
  let streak = 0;
  for (let i = 0; i < 3650; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    if (!loggedDays.has(d.toISOString().slice(0, 10))) break;
    streak++;
  }
  return streak;
}
// Which of the last 7 days (ش ی د س چ پ ج = شنبه..جمعه) had at least one log.
function weekLogMap(logs) {
  const loggedDays = new Set((logs || []).map((l) => (l.date || "").slice(0, 10)));
  const map = Array(7).fill(false);
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    if (loggedDays.has(d.toISOString().slice(0, 10))) {
      map[(d.getDay() + 1) % 7] = true;
    }
  }
  return map;
}
function relativeDate(iso) {
  if (!iso) return "";
  const d = new Date(iso),
    now = new Date();
  const diff = Math.floor(
    (new Date(now.toDateString()) - new Date(d.toDateString())) / 86400000,
  );
  if (diff <= 0) return "امروز";
  if (diff === 1) return "دیروز";
  if (diff < 7) return `${diff} روز پیش`;
  return d.toLocaleDateString("fa-IR");
}
function entryFor(l, name) {
  return (l.entries || []).find((e) => e.member === name);
}
function usePersistedState(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? initial;
    } catch {
      return initial;
    }
  });
  useEffect(
    () => localStorage.setItem(key, JSON.stringify(value)),
    [key, value],
  );
  return [value, setValue];
}
function norm(s) {
  return (s || "")
    .replace(/[‌\s-]/g, "")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .toLowerCase();
}

function App() {
  const [tab, _setTab] = useState("home"),
    [tabStack, setTabStack] = useState([]),
    [data, setData] = usePersistedState("nutrition-data", seed),
    [modal, setModal] = useState(null),
    [toast, setToast] = useState(""),
    [selected, setSelected] = useState(null),
    [query, setQuery] = useState(""),
    [collapsed, setCollapsed] = useState(
      () => localStorage.getItem("sidebar-collapsed") === "1",
    );
  const setTab = (id) => {
    _setTab((cur) => {
      if (cur !== id) setTabStack((st) => [...st, cur]);
      return id;
    });
  };
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", collapsed ? "1" : "0");
  }, [collapsed]);
  // Hardware back button (Android): close modals/details first, then step
  // back through visited tabs, and only exit the app from the dashboard
  // with nothing else open. Without this, Capacitor's default behaviour
  // exits the app immediately because tab/modal changes never touch the
  // WebView history.
  const backStateRef = useRef();
  backStateRef.current = { modal, selected, tab, tabStack };
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let lastBackAt = 0;
    const listenerPromise = CapApp.addListener("backButton", () => {
      const { modal, selected, tab, tabStack } = backStateRef.current;
      if (modal) {
        setModal(null);
        return;
      }
      if (selected) {
        setSelected(null);
        return;
      }
      if (tab !== "home") {
        setTabStack((st) => {
          const prev = st.length ? st[st.length - 1] : "home";
          _setTab(prev);
          return st.slice(0, -1);
        });
        return;
      }
      const now = Date.now();
      if (now - lastBackAt < 2000) {
        CapApp.exitApp();
      } else {
        lastBackAt = now;
        notify("برای خروج، دوباره دکمه برگشت را بزنید");
      }
    });
    return () => {
      listenerPromise.then((h) => h.remove());
    };
  }, []);
  const notify = (m) => {
    setToast(m);
    setTimeout(() => setToast(""), 2500);
  };
  const saveLog = (e) => {
    setData((d) => ({ ...d, logs: [{ ...e, id: Date.now() }, ...d.logs] }));
    setModal(null);
    notify("ثبت با موفقیت ذخیره شد.");
  };
  const saveMember = (m) => {
    if (!m.id && !isPremiumActive(data) && data.members.length >= FREE_MEMBER_LIMIT) {
      notify(
        `نسخه رایگان حداکثر ${FREE_MEMBER_LIMIT} عضو را پشتیبانی می‌کند؛ برای افزودن بیشتر Premium را فعال کنید.`,
      );
      return;
    }
    setData((d) => ({
      ...d,
      members: m.id
        ? d.members.map((x) => (x.id === m.id ? m : x))
        : [
            ...d.members,
            {
              ...m,
              id: Date.now(),
              color: "#c9a7e8",
              initials: m.name?.[0] || "؟",
            },
          ],
    }));
    setModal(null);
    setSelected(null);
    notify(m.id ? "پروفایل ویرایش شد." : "عضو جدید اضافه شد.");
  };
  const createFamily = ({ familyName, members }) => {
    setData((d) => ({
      ...d,
      familyName,
      members,
      familyCreated: true,
      plan: [],
      logs: [],
      shopping: [],
      inventory: [],
    }));
    setModal(null);
    notify(`خانواده «${familyName}» ساخته شد.`);
  };
  const startTrial = () => {
    if (data.trialUsed) {
      notify("دوره آزمایشی قبلاً استفاده شده است.");
      return;
    }
    setData((d) => ({
      ...d,
      trialEndsAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      trialUsed: true,
    }));
    notify("۷ روز Premium آزمایشی فعال شد.");
  };
  const delMember = (id) => {
    setData((d) => ({ ...d, members: d.members.filter((m) => m.id !== id) }));
    setSelected(null);
    notify("عضو حذف شد.");
  };
  const exportData = async () => {
    const json = JSON.stringify(data, null, 2);
    const fileName = `nutrition-backup-${new Date().toISOString().slice(0, 10)}.json`;
    if (Capacitor.isNativePlatform()) {
      // A plain <a download> click is silently swallowed by the Android
      // WebView, which is why the old flow said "دانلود شد" with no real
      // file anywhere. Instead we write the file to app storage and open
      // the native share/save sheet so the user sees exactly which file it
      // is and picks where it goes (Files, Drive, Bluetooth, ...).
      try {
        const { uri } = await Filesystem.writeFile({
          path: fileName,
          data: json,
          directory: Directory.Cache,
          encoding: "utf8",
        });
        await Share.share({
          title: "نسخه پشتیبان تغذیه‌یار خانواده",
          text: fileName,
          url: uri,
          dialogTitle: "ذخیره یا اشتراک‌گذاری نسخه پشتیبان",
        });
        notify(`نسخه پشتیبان ساخته شد: ${fileName}`);
      } catch (err) {
        notify("ساخت نسخه پشتیبان با خطا مواجه شد.");
      }
      return;
    }
    const blob = new Blob([json], { type: "application/json" }),
      a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
    notify(`نسخه پشتیبان دانلود شد: ${fileName}`);
  };
  const importData = (file) => {
    const r = new FileReader();
    r.onload = () => {
      try {
        setData(JSON.parse(r.result));
        notify("پشتیبان بازیابی شد.");
      } catch {
        notify("فایل پشتیبان معتبر نیست.");
      }
    };
    r.readAsText(file);
  };
  return (
    <div className={"app-shell" + (collapsed ? " sidebar-collapsed" : "")}>
      <aside className={"sidebar" + (collapsed ? " collapsed" : "")}>
        <button
          type="button"
          className="sidebar-toggle"
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? "بزرگ کردن منو" : "کوچک کردن منو"}
        >
          {collapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
        <div className="brand">
          <div className="brand-mark">✦</div>
          <div>
            <strong>تغذیه‌یار</strong>
            <span>خانواده</span>
          </div>
        </div>
        <button className="family-switch" onClick={() => setModal("family")}>
          <div className="family-avatar">خ</div>
          <div>
            <b>{data.familyName}</b>
            <small>{data.members.length} عضو فعال</small>
          </div>
          <ChevronLeft size={16} />
        </button>
        <nav>
          {[
            ["home", "داشبورد", LayoutDashboard],
            ["members", "اعضای خانواده", Users],
            ["plan", "برنامه غذایی", CalendarDays],
            ["reports", "گزارش‌ها", BarChart3],
            ["assistant", "دستیار AI", Sparkles],
          ].map(([id, label, Icon]) => (
            <button
              key={id}
              className={tab === id ? "active" : ""}
              onClick={() => setTab(id)}
              title={label}
            >
              <Icon size={19} />
              <span>{label}</span>
            </button>
          ))}
          {/* Always-visible entry point for settings/backup/family-name.
              Unlike .family-switch and .sidebar-bottom, this button lives
              inside <nav> so it is NOT hidden by the mobile CSS rule that
              turns the sidebar into a bottom bar, keeping it reachable on
              phones where the sidebar options used to disappear. */}
          <button onClick={() => setModal("backup")} title="تنظیمات">
            <Settings2 size={19} />
            <span>تنظیمات</span>
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="tip">
            <Sparkles size={17} />
            <p>
              <b>یادآوری کوچک</b>
              <br />
              هر ثبت، یک قدم رو به جلوست.
            </p>
          </div>
          <button className="settings" onClick={() => setModal("backup")}>
            <Settings2 size={18} /> پشتیبان و تنظیمات
          </button>
          <div className="profile-mini">
            <div className="user-avatar">ک</div>
            <div>
              <b>کاربر خانواده</b>
              <small>
                {isPremiumActive(data)
                  ? data.premium
                    ? "Premium"
                    : `Premium آزمایشی · ${trialDaysLeft(data)} روز مانده`
                  : "حساب رایگان"}
              </small>
            </div>
            {isPremiumActive(data) && <Crown size={16} color="#b18538" />}
          </div>
        </div>
      </aside>
      <main className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">شنبه، ۲۸ شهریور ۱۴۰۴</p>
            <h1>
              {tab === "home"
                ? `صبح بخیر، ${data.familyName} 🌿`
                : tab === "members"
                  ? "اعضای خانواده"
                  : tab === "plan"
                    ? "برنامه غذایی"
                    : "گزارش‌های تغذیه"}
            </h1>
          </div>
          <div className="top-actions">
            <button className="icon-btn">
              <Bell size={19} />
            </button>
            <button className="quick-btn" onClick={() => setModal("quick")}>
              <Plus size={18} /> ثبت سریع
            </button>
          </div>
        </header>
        {tab === "home" && (
          <Dashboard
            data={data}
            setTab={setTab}
            openQuick={() => setModal("quick")}
            select={setSelected}
          />
        )}{" "}
        {tab === "members" && (
          <Members
            data={data}
            select={setSelected}
            open={() => setModal("member")}
            query={query}
            setQuery={setQuery}
          />
        )}{" "}
        {tab === "plan" && (
          <Plan data={data} setData={setData} notify={notify} setTab={setTab} />
        )}{" "}
        {tab === "reports" && (
          <div className="page-body">
            <Reports data={data} openUpgrade={() => setModal("backup")} />
            <PremiumGate
              data={data}
              title="گزارش PDF"
              desc="خروجی چاپ‌شده/PDF از گزارش‌ها بخشی از امکانات Premium است."
              onUpgrade={() => setModal("backup")}
            >
              <ReportActions notify={notify} />
            </PremiumGate>
            <ReminderCenter data={data} setData={setData} notify={notify} />
          </div>
        )}{" "}
        {tab === "shopping" && (
          <PremiumGate
            data={data}
            title="لیست خرید هوشمند"
            desc="تبدیل برنامه غذایی به لیست خرید گروه‌بندی‌شده، امکان Premium است."
            onUpgrade={() => setModal("backup")}
          >
            <ShoppingList data={data} setData={setData} notify={notify} />
          </PremiumGate>
        )}{" "}
        {tab === "inventory" && (
          <PremiumGate
            data={data}
            title="موجودی خانه و تاریخ انقضا"
            desc="ثبت موجودی خانه و اعلان انقضا بخشی از امکانات Premium است."
            onUpgrade={() => setModal("backup")}
          >
            <Inventory data={data} setData={setData} notify={notify} />
          </PremiumGate>
        )}{" "}
        {tab === "assistant" && (
          <div className="page-body">
            <AiAssistant data={data} setData={setData} notify={notify} />
            <PremiumGate
              data={data}
              title="ثبت صوتی پیشرفته و عکس غذا"
              desc="تبدیل صدا به متن با AvalAI و تشخیص عکس غذا، امکانات Premium هستند."
              onUpgrade={() => setModal("backup")}
            >
              <CaptureCenter notify={notify} />
            </PremiumGate>
            <HealthConnectCard notify={notify} />
          </div>
        )}
      </main>
      {modal === "quick" && (
        <QuickAdd
          members={data.members}
          close={() => setModal(null)}
          save={saveLog}
        />
      )}{" "}
      {modal === "member" && (
        <MemberModal
          initial={selected}
          close={() => setModal(null)}
          save={saveMember}
        />
      )}{" "}
      {modal === "family" && (
        <FamilyModal
          data={data}
          close={() => setModal(null)}
          save={(x) => {
            setData((d) => ({ ...d, ...x }));
            setModal(null);
            notify("اطلاعات خانواده ذخیره شد.");
          }}
          openWizard={() => setModal("familyWizard")}
        />
      )}{" "}
      {modal === "familyWizard" && (
        <FamilyCreateWizard
          close={() => setModal(null)}
          isPremium={isPremiumActive(data)}
          onCreate={createFamily}
        />
      )}{" "}
      {modal === "backup" && (
        <BackupModal
          data={data}
          close={() => setModal(null)}
          exportData={exportData}
          importData={importData}
          startTrial={startTrial}
          openFamily={() => setModal("family")}
          premiumOn={() => {
            setData((d) => ({ ...d, premium: true }));
            notify("حالت Premium فعال شد (نسخه نمایشی؛ اتصال پرداخت واقعی در مرحله بعد).");
          }}
        />
      )}{" "}
      {selected && modal !== "member" && (
        <MemberDetail
          member={selected}
          data={data}
          close={() => setSelected(null)}
          edit={() => setModal("member")}
          del={delMember}
          upgrade={() => setModal("backup")}
        />
      )}{" "}
      {toast && (
        <div className="toast">
          <Check size={17} />
          {toast}
        </div>
      )}
    </div>
  );
}

function Dashboard({ data, setTab, openQuick, select }) {
  const meals = data.logs.filter((l) => l.type === "meal").length;
  const streak = loggingStreak(data.logs);
  const weekMap = weekLogMap(data.logs);
  return (
    <div className="page-body">
      <section className="hero-grid">
        <div className="hero-card">
          <div>
            <span className="pill green">● امروز</span>
            <h2>با هم بهتر می‌خوریم</h2>
            <p>
              ثبت‌های امروز را کامل کنید تا تصویر دقیق‌تری از عادت‌های خانواده
              داشته باشید.
            </p>
            <button className="primary" onClick={openQuick}>
              ثبت وعده <Plus size={16} />
            </button>
          </div>
          <div className="hero-illustration">
            🥗<span>🍎</span>
          </div>
        </div>
        <div className="streak-card">
          <div className="card-heading">
            <span>پیوستگی ثبت</span>
          </div>
          <div className="streak-number">
            {streak} <small>روز</small>
          </div>
          <div className="streak-days">
            {["ش", "ی", "د", "س", "چ", "پ", "ج"].map((d, i) => (
              <div key={d} className={weekMap[i] ? "done" : ""}>
                <span>{d}</span>
                <b>{weekMap[i] ? "✓" : ""}</b>
              </div>
            ))}
          </div>
          <p>یک قدم کوچک، یک عادت ماندگار.</p>
        </div>
      </section>
      <section className="section-head">
        <div>
          <h3>امروز در یک نگاه</h3>
          <p>بر اساس ثبت‌های واقعی</p>
        </div>
        <button className="text-btn" onClick={() => setTab("reports")}>
          گزارش کامل <ChevronLeft size={16} />
        </button>
      </section>
      <section className="stats-grid">
        <Stat
          icon={<Utensils />}
          tone="orange"
          value={meals}
          label="وعده ثبت‌شده"
          hint={`${data.plan.reduce((a, d) => a + d.meals.length, 0)} وعده در برنامه`}
        />
        <Stat
          icon={<Cookie />}
          tone="purple"
          value={data.logs.filter((l) => l.type === "snack").length}
          label="میان‌وعده و تنقلات"
          hint="از ثبت‌های واقعی"
        />
        <Stat
          icon={<Droplets />}
          tone="blue"
          value={data.logs.filter((l) => l.type === "drink").length}
          label="نوشیدنی"
          hint="آب و سایر نوشیدنی‌ها"
        />
      </section>
      <div className="columns">
        <section className="panel activity">
          <div className="section-head compact">
            <div>
              <h3>آخرین فعالیت‌ها</h3>
              <p>ثبت‌های واقعی شما</p>
            </div>
            <button className="icon-btn soft" onClick={openQuick}>
              <Plus size={18} />
            </button>
          </div>
          {data.logs.slice(0, 4).map((l) => (
            <div className="activity-row" key={l.id}>
              <div className={"log-icon " + l.type}>{l.icon}</div>
              <div className="activity-main">
                <b>{l.title}</b>
                <span>
                  {l.meal} · {relativeDate(l.date)}، {l.time}
                </span>
                <small>
                  {(l.entries || [])
                    .map(
                      (e) =>
                        `${e.member}: ${e.status === "خورد" ? e.amount : "نخورد"}`,
                    )
                    .join("، ")}
                </small>
              </div>
              <span className="tag">{l.tag}</span>
            </div>
          ))}
        </section>
        <section className="panel family-progress">
          <div className="section-head compact">
            <div>
              <h3>اعضای خانواده</h3>
              <p>برای مشاهده پروفایل انتخاب کنید</p>
            </div>
            <button className="text-btn" onClick={() => setTab("members")}>
              همه <ChevronLeft size={15} />
            </button>
          </div>
          {data.members.map((m) => (
            <button className="member-row" key={m.id} onClick={() => select(m)}>
              <div className="avatar" style={{ background: m.color }}>
                {m.initials}
              </div>
              <div>
                <b>{m.name}</b>
                <span>
                  {m.role} · {m.age} سال
                </span>
              </div>
              <div className="progress">
                <span
                  style={{
                    width:
                      Math.min(
                        100,
                        25 +
                          data.logs.filter((l) => l.members.includes(m.name))
                            .length *
                            18,
                      ) + "%",
                  }}
                />
              </div>
            </button>
          ))}
        </section>
      </div>
      <section className="panel insight">
        <div className="insight-icon">
          <Sparkles size={21} />
        </div>
        <div>
          <span className="pill purple">بینش این هفته</span>
          <h3>گزارش‌ها از روی ثبت‌های واقعی ساخته می‌شوند</h3>
          <p>هرچه ثبت‌ها کامل‌تر باشند، پیشنهادهای آینده دقیق‌تر خواهند بود.</p>
        </div>
      </section>
    </div>
  );
}
function Stat({ icon, tone, value, label, hint }) {
  return (
    <div className="stat-card">
      <div className={"stat-icon " + tone}>{icon}</div>
      <div className="stat-copy">
        <b>{value}</b>
        <strong>{label}</strong>
        <span>{hint}</span>
      </div>
    </div>
  );
}

function Members({ data, select, open, query, setQuery }) {
  const list = data.members.filter((m) => norm(m.name).includes(norm(query)));
  const atLimit =
    !isPremiumActive(data) && data.members.length >= FREE_MEMBER_LIMIT;
  return (
    <div className="page-body">
      <div className="toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجوی عضو خانواده..."
          />
        </div>
        <button
          className="primary"
          onClick={open}
          disabled={atLimit}
          title={
            atLimit
              ? `نسخه رایگان تا ${FREE_MEMBER_LIMIT} عضو را پشتیبانی می‌کند`
              : ""
          }
        >
          <Plus size={17} /> افزودن عضو
        </button>
      </div>
      {atLimit && (
        <p className="lock-hint">
          به سقف {FREE_MEMBER_LIMIT} عضو نسخه رایگان رسیده‌اید؛ برای افزودن
          عضو بیشتر Premium را فعال کنید.
        </p>
      )}
      <div className="members-grid">
        {list.map((m) => (
          <button className="member-card" key={m.id} onClick={() => select(m)}>
            <div className="member-card-top">
              <div className="avatar large" style={{ background: m.color }}>
                {m.photo ? <img src={m.photo} alt="" /> : m.initials}
              </div>
              <span className="status-dot">فعال</span>
            </div>
            <h3>{m.name}</h3>
            <p>
              {m.role} · {m.age} سال · {m.activity}
            </p>
            <div className="member-meta">
              <span>هدف</span>
              <b>{m.goal}</b>
            </div>
            <div className="mini-progress">
              <span style={{ width: "72%" }} />
            </div>
            <small>مشاهده جزئیات و سابقه</small>
          </button>
        ))}
      </div>
    </div>
  );
}

function Plan({ data, setData, notify, setTab }) {
  const [edit, setEdit] = useState(null),
    [search, setSearch] = useState("");
  const save = (dayId, m) => {
    setData((d) => ({
      ...d,
      plan: d.plan.map((day) =>
        day.id === dayId
          ? {
              ...day,
              meals: day.meals.some((x) => x.id === m.id)
                ? day.meals.map((x) => (x.id === m.id ? m : x))
                : [...day.meals, m],
            }
          : day,
      ),
    }));
    setEdit(null);
    notify("برنامه غذایی ذخیره شد.");
  };
  const remove = (dayId, id) =>
    setData((d) => ({
      ...d,
      plan: d.plan.map((day) =>
        day.id === dayId
          ? { ...day, meals: day.meals.filter((m) => m.id !== id) }
          : day,
      ),
    }));
  const results = foodBank.filter((f) =>
    norm(f.name + " " + f.aliases).includes(norm(search)),
  );
  const suggestSmart = () => {
    const usedTitles = new Set(
      data.plan.flatMap((d) => d.meals.map((m) => m.title)),
    );
    const slots = ["صبحانه", "ناهار", "شام"];
    let target = null;
    for (const day of data.plan) {
      const missing = slots.find(
        (s) => !day.meals.some((m) => m.time === s),
      );
      if (missing) {
        target = { day, slot: missing };
        break;
      }
    }
    if (!target) {
      // همه روزها کامل‌اند؛ پرتکرارترین غذای هفته را با یک گزینهٔ تازه جایگزین کن
      const counts = {};
      data.plan.forEach((d) =>
        d.meals.forEach((m) => (counts[m.title] = (counts[m.title] || 0) + 1)),
      );
      const [repeated] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0] || [];
      const day = data.plan.find((d) => d.meals.some((m) => m.title === repeated));
      const meal = day?.meals.find((m) => m.title === repeated);
      if (!day || !meal) {
        notify("همهٔ وعده‌های این هفته پر و متنوع است؛ چیزی برای پیشنهاد نیست.");
        return;
      }
      target = { day, slot: meal.time, replaceId: meal.id };
    }
    const group = target.slot === "صبحانه" ? "صبحانه" : "غذای اصلی";
    const candidates = foodBank.filter(
      (f) => f.group === group && !usedTitles.has(f.name),
    );
    const pick = candidates[Math.floor(Math.random() * candidates.length)] ||
      foodBank.find((f) => f.group === group);
    if (!pick) {
      notify("موردی برای پیشنهاد در بانک غذا پیدا نشد.");
      return;
    }
    const recipe = recipeBank[pick.name];
    const baseServings = recipe?.baseServings || data.members.length || 4;
    const newMeal = {
      id: Date.now(),
      time: target.slot,
      title: pick.name,
      icon: pick.icon,
      description: "پیشنهاد خودکار بر اساس بانک غذا و تنوع هفته.",
      suggestedTime: "",
      baseServings,
      servings: data.members.length || baseServings,
      ingredients: recipe?.ingredients || [],
      substitutes: {},
    };
    setData((d) => ({
      ...d,
      plan: d.plan.map((day) =>
        day.id === target.day.id
          ? {
              ...day,
              meals: target.replaceId
                ? day.meals.map((m) => (m.id === target.replaceId ? newMeal : m))
                : [...day.meals, newMeal],
            }
          : day,
      ),
    }));
    notify(
      `برای ${target.day.day}، ${target.slot} «${pick.name}» پیشنهاد و اضافه شد.`,
    );
  };
  return (
    <div className="page-body">
      <div className="plan-banner">
        <div>
          <span className="pill green">برنامه هفتگی قابل ویرایش</span>
          <h2>غذاهای این هفته، با سلیقه شما</h2>
          <p>هر وعده را ویرایش، حذف یا جایگزین کنید.</p>
        </div>
        <div className="plan-banner-actions">
          <button className="primary" onClick={suggestSmart}>
            <Sparkles size={17} /> پیشنهاد هوشمند
          </button>
          <button className="secondary" onClick={() => setTab?.("shopping")}>
            🛒 لیست خرید
          </button>
          <button className="secondary" onClick={() => setTab?.("inventory")}>
            📦 موجودی خانه
          </button>
        </div>
      </div>
      <div className="food-search">
        <Search size={16} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="جستجو در بانک غذای ایرانی؛ مثل قورمه سبزی یا قرمه سبزی"
        />
        {search && (
          <div className="food-results">
            {results.slice(0, 5).map((f) => {
              const recipe = recipeBank[f.name];
              return (
                <button
                  key={f.id}
                  onClick={() => {
                    const baseServings = recipe?.baseServings || data.members.length || 4;
                    setEdit({
                      dayId: data.plan[0].id,
                      meal: {
                        id: Date.now(),
                        time: "وعده سفارشی",
                        title: f.name,
                        icon: f.icon,
                        description: "",
                        suggestedTime: "",
                        baseServings,
                        servings: data.members.length || baseServings,
                        ingredients: recipe?.ingredients || [],
                        substitutes: {},
                      },
                    });
                    setSearch("");
                  }}
                >
                  {f.icon} {f.name}
                  <small>{f.group}</small>
                </button>
              );
            })}
          </div>
        )}
      </div>
      <div className="plan-list">
        {data.plan.map((day, i) => (
          <div className="day-card" key={day.id}>
            <div className="day-label">
              <b>{day.day}</b>
              <span>{day.date}</span>
              {i === 0 && <em>امروز</em>}
              <button
                className="add-day-meal"
                onClick={() =>
                  setEdit({
                    dayId: day.id,
                    meal: {
                      id: Date.now(),
                      time: "وعده سفارشی",
                      title: "",
                      icon: "🍽️",
                      description: "",
                      suggestedTime: "",
                      baseServings: data.members.length || 4,
                      servings: data.members.length || 4,
                      ingredients: [],
                      substitutes: {},
                    },
                  })
                }
              >
                <Plus size={13} /> وعده جدید
              </button>
            </div>
            <div className="meal-list">
              {day.meals.map((meal) => {
                const subCount = Object.keys(meal.substitutes || {}).length;
                const ingCount = (meal.ingredients || []).length;
                return (
                  <div className="meal-card" key={meal.id}>
                    <span className="meal-time">
                      {meal.time}
                      {meal.suggestedTime ? ` · ${meal.suggestedTime}` : ""}
                    </span>
                    <div className="meal-food">
                      <span className="food-emoji">{meal.icon}</span>
                      <b>{meal.title}</b>
                    </div>
                    {(meal.servings || ingCount > 0 || subCount > 0) && (
                      <div className="meal-extra">
                        {meal.servings && (
                          <span>
                            <Users size={11} /> {meal.servings} نفر
                          </span>
                        )}
                        {ingCount > 0 && <span>{ingCount} ماده اولیه</span>}
                        {subCount > 0 && (
                          <span className="sub-badge">{subCount} جایگزین</span>
                        )}
                      </div>
                    )}
                    <div className="meal-actions">
                      <button onClick={() => setEdit({ dayId: day.id, meal })}>
                        <Edit3 size={13} />
                      </button>
                      <button onClick={() => remove(day.id, meal.id)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {edit && (
        <MealEditor
          meal={edit.meal}
          members={data.members}
          close={() => setEdit(null)}
          save={(m) => save(edit.dayId, m)}
        />
      )}
    </div>
  );
}
function daysBetween(iso) {
  if (!iso) return 999;
  return Math.floor((new Date() - new Date(iso)) / 86400000);
}
function Reports({ data, openUpgrade }) {
  const [view, setView] = useState("family");
  const [person, setPerson] = useState(data.members[0]?.name || "");
  const entries = data.logs.flatMap((l) =>
    (l.entries || []).map((e) => ({ ...e, log: l })),
  );
  const thisWeek = data.logs.filter((l) => daysBetween(l.date) < 7);
  const lastWeek = data.logs.filter(
    (l) => daysBetween(l.date) >= 7 && daysBetween(l.date) < 14,
  );
  const groups = [
    ["وعده اصلی", data.logs.filter((l) => l.type === "meal").length, "#78bd8d"],
    ["تنقلات", data.logs.filter((l) => l.type === "snack").length, "#e7a25f"],
    ["نوشیدنی", data.logs.filter((l) => l.type === "drink").length, "#8d9fe2"],
    ["نخورد", entries.filter((e) => e.status === "نخورد").length, "#e78c92"],
  ];
  const max = Math.max(1, ...groups.map((g) => g[1]));
  const titleCounts = thisWeek.reduce((a, l) => {
    a[l.title] = (a[l.title] || 0) + 1;
    return a;
  }, {});
  const repeated = Object.values(titleCounts).filter((n) => n > 1).length;
  const weekMeals = thisWeek.filter((l) => l.type === "meal").length,
    lastWeekMeals = lastWeek.filter((l) => l.type === "meal").length;
  const sentences = [
    `این هفته ${thisWeek.length} ثبت واقعی داشته‌اید (هفته قبل: ${lastWeek.length} ثبت).`,
    `از این تعداد ${weekMeals} وعده اصلی ثبت شده${lastWeek.length ? ` (هفته قبل ${lastWeekMeals} وعده).` : "."}`,
    repeated > 0
      ? `${repeated} غذای تکراری در این هفته وجود داشته است.`
      : "در این هفته غذای تکراری‌ای ثبت نشده است.",
  ];
  return (
    <div className="page-body">
      <div className="report-head">
        <div>
          <span className="pill purple">گزارش خانواده</span>
          <h2>روندهای کوچک، تغییرهای واقعی</h2>
          <p>محاسبه‌شده از {data.logs.length} ثبت واقعی شما</p>
        </div>
        <span className="report-total">
          {entries.filter((e) => e.status === "خورد").length}
          <small>ثبت خورده‌شده</small>
        </span>
      </div>
      <div className="week-tabs">
        {[
          ["family", "گزارش خانواده"],
          ["person", "تحلیل هر فرد"],
          ["snack", "تحلیل تنقلات"],
        ].map(([id, label]) => (
          <button
            key={id}
            className={view === id ? "selected" : ""}
            onClick={() => setView(id)}
          >
            {label}
          </button>
        ))}
      </div>
      {view !== "family" && (
        <PremiumGate
          data={data}
          title={view === "person" ? "تحلیل هر فرد" : "تحلیل تنقلات"}
          desc="تحلیل پیشرفته و روند زمانی بخشی از امکانات Premium است."
          onUpgrade={openUpgrade}
        >
          {view === "person" ? (
            <div>
              <div className="person-picker">
                {data.members.map((mm) => (
                  <button
                    key={mm.id}
                    className={person === mm.name ? "picked" : ""}
                    onClick={() => setPerson(mm.name)}
                  >
                    <span className="avatar tiny" style={{ background: mm.color }}>
                      {mm.initials}
                    </span>
                    {mm.name}
                  </button>
                ))}
              </div>
              {data.members.find((mm) => mm.name === person) && (
                <MemberAnalysis
                  member={data.members.find((mm) => mm.name === person)}
                  data={data}
                />
              )}
            </div>
          ) : (
            <SnackAnalysis data={data} />
          )}
        </PremiumGate>
      )}
      {view === "family" && (
        <>
      <div className="panel simple-report">
        <Sparkles size={18} />
        <ul>
          {sentences.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>
      <div className="report-grid">
        <div className="panel chart-panel">
          <div className="section-head compact">
            <div>
              <h3>تفکیک ثبت‌ها</h3>
              <p>وضعیت وعده‌ها و خوراکی‌ها</p>
            </div>
          </div>
          <div className="real-bars">
            {groups.map((g) => (
              <div className="real-bar-row" key={g[0]}>
                <span>{g[0]}</span>
                <div>
                  <i
                    style={{
                      width: (g[1] / max) * 100 + "%",
                      background: g[2],
                    }}
                  />
                </div>
                <b>{g[1]}</b>
              </div>
            ))}
          </div>
        </div>
        <div className="panel groups-panel">
          <div className="section-head compact">
            <div>
              <h3>اعضای فعال</h3>
              <p>بر اساس تعداد ثبت</p>
            </div>
          </div>
          {data.members.map((m) => {
            const n = data.logs.filter((l) =>
              l.members.includes(m.name),
            ).length;
            return (
              <div className="group-row" key={m.id}>
                <span>{m.name}</span>
                <div>
                  <i
                    style={{
                      width: Math.min(100, n * 25) + "%",
                      background: m.color,
                    }}
                  />
                </div>
                <b>{n}</b>
              </div>
            );
          })}
        </div>
      </div>
      <div className="panel gentle-note">
        <Sparkles size={19} />
        <p>
          <b>تفسیر خنثی:</b> ثبت «نخورد» هم داده ارزشمند است و به شناخت ترجیحات
          خانواده کمک می‌کند؛ هدف، قضاوت نیست.
        </p>
      </div>
        </>
      )}
    </div>
  );
}

const quickAmounts = [
  "چند لقمه",
  "کم",
  "متوسط",
  "زیاد",
  "نصف سهم",
  "۱ سهم",
  "۱.۵ سهم",
  "مقدار سفارشی",
];
function QuickAdd({ members, close, save }) {
  const [kind, setKind] = useState("meal"),
    [title, setTitle] = useState(""),
    [meal, setMeal] = useState("ناهار"),
    [time, setTime] = useState(new Date().toTimeString().slice(0, 5)),
    [entries, setEntries] = useState(() => {
      const e = {};
      members
        .slice(0, 2)
        .forEach((m) => (e[m.id] = { status: "خورد", amount: "۱ سهم" }));
      return e;
    });
  const chooseKind = (k) => {
    setKind(k);
    setMeal(k === "drink" ? "نوشیدنی" : k === "snack" ? "میان‌وعده" : "ناهار");
  };
  const setStatus = (id, st) =>
    setEntries((e) => {
      const cur = e[id];
      const n = { ...e };
      if (cur && cur.status === st) {
        delete n[id];
      } else {
        n[id] = { status: st, amount: cur?.amount || "۱ سهم" };
      }
      return n;
    });
  const setAmount = (id, amount) =>
    setEntries((e) => ({ ...e, [id]: { ...e[id], amount } }));
  const chosenCount = Object.keys(entries).length;
  const doSave = () => {
    const list = members
      .filter((m) => entries[m.id])
      .map((m) => ({
        member: m.name,
        status: entries[m.id].status,
        amount: entries[m.id].status === "خورد" ? entries[m.id].amount : null,
      }));
    save({
      type: kind,
      title: title || "ثبت بدون نام",
      meal,
      date: new Date().toISOString(),
      time,
      entries: list,
      members: list.map((x) => x.member),
      icon: kind === "meal" ? "🍲" : kind === "snack" ? "🍪" : "💧",
      tag:
        kind === "meal" ? "وعده اصلی" : kind === "snack" ? "تنقلات" : "نوشیدنی",
    });
  };
  return (
    <div className="modal-backdrop">
      <div className="modal quick-modal">
        <button className="close" onClick={close}>
          <X size={18} />
        </button>
        <div className="modal-title">
          <div className="modal-symbol">
            {kind === "meal" ? "🍲" : kind === "snack" ? "🍪" : "💧"}
          </div>
          <div>
            <h2>ثبت سریع واقعی</h2>
            <p>یک غذا، چند نفر، سهم متفاوت — برای هرکس جداگانه ثبت کنید.</p>
          </div>
        </div>
        <div className="type-tabs">
          {[
            ["meal", "🍲", "غذا"],
            ["snack", "🍪", "تنقلات"],
            ["drink", "💧", "نوشیدنی"],
          ].map((t) => (
            <button
              type="button"
              className={kind === t[0] ? "chosen" : ""}
              onClick={() => chooseKind(t[0])}
              key={t[0]}
            >
              <span>{t[1]}</span>
              {t[2]}
            </button>
          ))}
        </div>
        <label>
          {kind === "meal"
            ? "نام غذا"
            : kind === "snack"
              ? "نام تنقلات"
              : "نام نوشیدنی"}
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              kind === "meal"
                ? "مثلاً عدس‌پلو، قورمه‌سبزی..."
                : kind === "snack"
                  ? "مثلاً چیپس، بستنی، خرما..."
                  : "مثلاً آب، دوغ، آبمیوه..."
            }
          />
        </label>
        <div className="two-fields">
          <label>
            وعده
            <select value={meal} onChange={(e) => setMeal(e.target.value)}>
              <option>صبحانه</option>
              <option>میان‌وعده</option>
              <option>ناهار</option>
              <option>شام</option>
              <option>نوشیدنی</option>
            </select>
          </label>
          <label>
            ساعت
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </label>
        </div>
        <label>
          چه کسی و چقدر؟
          <div className="portion-rows">
            {members.map((m) => {
              const en = entries[m.id];
              return (
                <div className="portion-row" key={m.id}>
                  <div className="portion-who">
                    <span
                      className="avatar tiny"
                      style={{ background: m.color }}
                    >
                      {m.initials}
                    </span>
                    {m.name}
                  </div>
                  <div className="status-tabs compact-tabs">
                    <button
                      type="button"
                      className={en?.status === "خورد" ? "selected" : ""}
                      onClick={() => setStatus(m.id, "خورد")}
                    >
                      خورد
                    </button>
                    <button
                      type="button"
                      className={en?.status === "نخورد" ? "selected muted" : ""}
                      onClick={() => setStatus(m.id, "نخورد")}
                    >
                      نخورد
                    </button>
                  </div>
                  {en?.status === "خورد" && (
                    <select
                      className="portion-amount"
                      value={en.amount}
                      onChange={(e) => setAmount(m.id, e.target.value)}
                    >
                      {quickAmounts.map((a) => (
                        <option key={a}>{a}</option>
                      ))}
                    </select>
                  )}
                </div>
              );
            })}
          </div>
        </label>
        <button
          className="primary full"
          disabled={!chosenCount}
          onClick={doSave}
        >
          ثبت کن برای {chosenCount || 0} نفر <Check size={17} />
        </button>
      </div>
    </div>
  );
}

function ageFromBirth(b) {
  if (!b) return "";
  const d = new Date(b);
  if (isNaN(d)) return "";
  let a = new Date().getFullYear() - d.getFullYear();
  const m = new Date().getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && new Date().getDate() < d.getDate())) a--;
  return a >= 0 ? a : "";
}
function MemberModal({ close, save, initial }) {
  const [f, setF] = useState(
    initial || {
      name: "",
      role: "عضو خانواده",
      age: "",
      birthDate: "",
      gender: "",
      height: "",
      weight: "",
      activity: "متوسط",
      goal: "حفظ وزن",
      likes: "",
      dislikes: "",
      allergies: "",
      diet: "",
      notes: "",
      photo: "",
    },
  );
  const u = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const onPhoto = (file) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => u("photo", r.result);
    r.readAsDataURL(file);
  };
  return (
    <div className="modal-backdrop">
      <div className="modal member-form">
        <button className="close" onClick={close}>
          <X size={18} />
        </button>
        <h2>{initial ? "ویرایش پروفایل" : "افزودن عضو خانواده"}</h2>
        <p className="modal-sub">
          اطلاعات برای شخصی‌سازی پیشنهادهاست و قابل اصلاح است.
        </p>
        <div className="photo-row">
          <div className="photo-preview">
            {f.photo ? (
              <img src={f.photo} alt="" />
            ) : (
              <span>{f.name?.[0] || "؟"}</span>
            )}
          </div>
          <label className="photo-upload">
            عکس اختیاری
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onPhoto(e.target.files?.[0])}
            />
          </label>
          {f.photo && (
            <button
              type="button"
              className="text-btn"
              onClick={() => u("photo", "")}
            >
              حذف عکس
            </button>
          )}
        </div>
        <div className="form-grid">
          {[
            ["name", "نام"],
            ["gender", "جنسیت"],
            ["height", "قد (سانتی‌متر)"],
            ["weight", "وزن (کیلوگرم)"],
          ].map(([k, l]) => (
            <label key={k}>
              {l}
              <input
                value={f[k] || ""}
                onChange={(e) => u(k, e.target.value)}
              />
            </label>
          ))}
          <label>
            تاریخ تولد (اختیاری)
            <input
              type="date"
              value={f.birthDate || ""}
              onChange={(e) => {
                u("birthDate", e.target.value);
                const a = ageFromBirth(e.target.value);
                if (a !== "") u("age", a);
              }}
            />
          </label>
          <label>
            سن{f.birthDate ? " (از تاریخ تولد)" : ""}
            <input
              value={f.age || ""}
              onChange={(e) => u("age", e.target.value)}
              disabled={!!f.birthDate}
            />
          </label>
        </div>
        <label>
          نقش
          <select value={f.role} onChange={(e) => u("role", e.target.value)}>
            <option>عضو خانواده</option>
            <option>مادر</option>
            <option>پدر</option>
            <option>کودک</option>
            <option>نوجوان</option>
          </select>
        </label>
        <label>
          سطح فعالیت
          <select
            value={f.activity}
            onChange={(e) => u("activity", e.target.value)}
          >
            <option>کم</option>
            <option>متوسط</option>
            <option>زیاد</option>
          </select>
        </label>
        <label>
          هدف
          <select value={f.goal} onChange={(e) => u("goal", e.target.value)}>
            <option>حفظ وزن</option>
            <option>کاهش وزن</option>
            <option>افزایش وزن</option>
            <option>رشد سالم</option>
            <option>افزایش انرژی</option>
          </select>
        </label>
        <label>
          غذاهای مورد علاقه
          <input
            value={f.likes}
            onChange={(e) => u("likes", e.target.value)}
            placeholder="مثلاً ماهی، میوه"
          />
        </label>
        <label>
          غذاهای مورد علاقه‌نداشته
          <input
            value={f.dislikes}
            onChange={(e) => u("dislikes", e.target.value)}
            placeholder="مثلاً نوشابه"
          />
        </label>
        <label>
          حساسیت‌های غذایی
          <input
            value={f.allergies || ""}
            onChange={(e) => u("allergies", e.target.value)}
            placeholder="مثلاً بادام زمینی، لبنیات"
          />
        </label>
        <label>
          رژیم خاص (در صورت وجود)
          <input
            value={f.diet || ""}
            onChange={(e) => u("diet", e.target.value)}
            placeholder="مثلاً کم‌نمک، گیاه‌خواری"
          />
        </label>
        <label>
          توضیحات اختیاری
          <textarea
            value={f.notes}
            onChange={(e) => u("notes", e.target.value)}
            placeholder="یادداشت اختیاری"
          />
        </label>
        <button
          className="primary full"
          disabled={!f.name}
          onClick={() => save(f)}
        >
          {initial ? "ذخیره تغییرات" : "افزودن عضو"} <Check size={17} />
        </button>
      </div>
    </div>
  );
}
function FamilyModal({ data, close, save, openWizard }) {
  const [name, setName] = useState(data.familyName);
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <button className="close" onClick={close}>
          <X size={18} />
        </button>
        <h2>خانواده</h2>
        <p className="modal-sub">
          نام خانواده فعلی را ویرایش کنید، یا یک خانواده کاملاً جدید بسازید.
        </p>
        <label>
          نام خانواده
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <button
          className="primary full"
          onClick={() => save({ familyName: name.trim() })}
        >
          ذخیره نام <Check size={17} />
        </button>
        <button className="secondary full" onClick={openWizard}>
          <Plus size={16} /> ایجاد خانواده جدید (اعضا از صفر)
        </button>
      </div>
    </div>
  );
}
function BackupModal({ close, exportData, importData, data, premiumOn, startTrial, openFamily }) {
  const ref = React.useRef();
  const active = isPremiumActive(data);
  const trialing = active && !data.premium;
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <button className="close" onClick={close}>
          <X size={18} />
        </button>
        <h2>پشتیبان و حساب</h2>
        <button className="family-switch" onClick={openFamily} style={{ width: "100%", marginBottom: 14 }}>
          <div className="family-avatar">خ</div>
          <div>
            <b>{data.familyName}</b>
            <small>ویرایش نام خانواده</small>
          </div>
          <ChevronLeft size={16} />
        </button>
        <p className="modal-sub">
          برای انتقال داده بین دستگاه‌ها از Export/Import استفاده کنید.
        </p>
        <div className="backup-actions">
          <button onClick={exportData}>
            <Download size={17} /> دریافت Backup
          </button>
          <button onClick={() => ref.current.click()}>
            <Upload size={17} /> بازیابی از فایل
          </button>
          <p className="modal-sub" style={{ margin: "-6px 0 0", fontSize: 12 }}>
            «بازیابی از فایل» پنجرهٔ انتخاب فایل را باز می‌کند؛ فایل Backup
            (json.) را انتخاب کنید تا اطلاعات بازگردانده شود.
          </p>
          <input
            ref={ref}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => {
              if (e.target.files[0]) importData(e.target.files[0]);
              e.target.value = "";
            }}
          />
        </div>
        <div className="premium-box">
          <Crown size={20} />
          <div>
            <b>
              {data.premium
                ? "Premium فعال است"
                : trialing
                  ? `Premium آزمایشی · ${trialDaysLeft(data)} روز مانده`
                  : "حساب رایگان"}
            </b>
            <p>
              {active
                ? "امکانات پیشرفته (AI، لیست خرید، موجودی، تحلیل و ...) فعال است."
                : `تا ${FREE_MEMBER_LIMIT} عضو، ثبت غذا/تنقلات/نوشیدنی و گزارش ساده رایگان است.`}
            </p>
          </div>
          {!active && (
            <button onClick={data.trialUsed ? premiumOn : startTrial}>
              {data.trialUsed ? "فعال‌سازی نمایشی" : "۷ روز رایگان"}
            </button>
          )}
        </div>
        {!active && data.trialUsed && (
          <p className="lock-hint">
            دوره آزمایشی رایگان قبلاً استفاده شده؛ فعال‌سازی نمایشی فقط برای
            بررسی امکانات است تا اتصال پرداخت واقعی (اشتراک ماهانه/سه‌ماهه/سالانه) تکمیل شود.
          </p>
        )}
      </div>
    </div>
  );
}
function MealEditor({ meal, members, close, save }) {
  const [m, setM] = useState({
    description: "",
    suggestedTime: "",
    baseServings: meal.servings || (members?.length ?? 4) || 4,
    servings: meal.servings || (members?.length ?? 4) || 4,
    ingredients: [],
    substitutes: {},
    ...meal,
  });
  const [newIng, setNewIng] = useState({ name: "", amount: "", unit: "" });
  const [subMember, setSubMember] = useState(members?.[0]?.name || "");
  const [subText, setSubText] = useState("");

  const addIngredient = () => {
    if (!newIng.name.trim()) return;
    setM((x) => ({
      ...x,
      ingredients: [
        ...(x.ingredients || []),
        { ...newIng, name: newIng.name.trim(), amount: Number(newIng.amount) || 0 },
      ],
    }));
    setNewIng({ name: "", amount: "", unit: "" });
  };
  const removeIngredient = (i) =>
    setM((x) => ({
      ...x,
      ingredients: x.ingredients.filter((_, idx) => idx !== i),
    }));
  const addSubstitute = () => {
    if (!subMember || !subText.trim()) return;
    setM((x) => ({
      ...x,
      substitutes: { ...x.substitutes, [subMember]: subText.trim() },
    }));
    setSubText("");
  };
  const removeSubstitute = (name) =>
    setM((x) => {
      const s = { ...x.substitutes };
      delete s[name];
      return { ...x, substitutes: s };
    });

  return (
    <div className="modal-backdrop">
      <div className="modal meal-editor-modal">
        <button className="close" onClick={close}>
          <X size={18} />
        </button>
        <h2>ویرایش وعده</h2>
        <p className="modal-sub">
          «یک غذا، چند نفر، سهم متفاوت» — مواد اولیه و تعداد نفرات را تنظیم
          کنید و در صورت نیاز برای یک عضو خاص جایگزین تعیین کنید.
        </p>
        <div className="two-fields">
          <label>
            نام غذا
            <input
              value={m.title}
              onChange={(e) => setM({ ...m, title: e.target.value })}
            />
          </label>
          <label>
            نام وعده
            <input
              value={m.time}
              onChange={(e) => setM({ ...m, time: e.target.value })}
            />
          </label>
        </div>
        <div className="two-fields">
          <label>
            زمان پیشنهادی (اختیاری)
            <input
              type="time"
              value={m.suggestedTime || ""}
              onChange={(e) => setM({ ...m, suggestedTime: e.target.value })}
            />
          </label>
          <label>
            ایموجی
            <input
              value={m.icon}
              onChange={(e) => setM({ ...m, icon: e.target.value })}
            />
          </label>
        </div>
        <label>
          توضیحات
          <textarea
            value={m.description || ""}
            onChange={(e) => setM({ ...m, description: e.target.value })}
            placeholder="یادداشت اختیاری درباره این وعده"
          />
        </label>
        <label>
          تعداد نفرات
          <input
            type="number"
            min="1"
            value={m.servings}
            onChange={(e) =>
              setM({ ...m, servings: Number(e.target.value) || 1 })
            }
          />
        </label>
        <div className="ingredient-block">
          <span className="field-label">
            مواد اولیه (برای {m.baseServings} نفر پایه)
          </span>
          {(m.ingredients || []).length > 0 && (
            <div className="ingredient-list">
              {m.ingredients.map((ing, i) => (
                <div className="ingredient-row" key={i}>
                  <span>{ing.name}</span>
                  <b>
                    {scaledAmount(ing.amount, m.servings, m.baseServings)}{" "}
                    {ing.unit}
                  </b>
                  <small>(پایه: {ing.amount} {ing.unit})</small>
                  <button type="button" onClick={() => removeIngredient(i)}>
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="ingredient-add">
            <input
              placeholder="نام ماده"
              value={newIng.name}
              onChange={(e) => setNewIng({ ...newIng, name: e.target.value })}
            />
            <input
              placeholder="مقدار"
              value={newIng.amount}
              onChange={(e) => setNewIng({ ...newIng, amount: e.target.value })}
            />
            <input
              placeholder="واحد"
              value={newIng.unit}
              onChange={(e) => setNewIng({ ...newIng, unit: e.target.value })}
            />
            <button type="button" onClick={addIngredient}>
              <Plus size={13} />
            </button>
          </div>
        </div>
        {members?.length > 0 && (
          <div className="substitute-block">
            <span className="field-label">جایگزینی غذا برای یک عضو خاص</span>
            {Object.keys(m.substitutes || {}).length > 0 && (
              <div className="substitute-list">
                {Object.entries(m.substitutes).map(([name, alt]) => (
                  <div className="substitute-row" key={name}>
                    <b>{name}</b>
                    <span>به‌جای این وعده: {alt}</span>
                    <button type="button" onClick={() => removeSubstitute(name)}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="substitute-add">
              <select
                value={subMember}
                onChange={(e) => setSubMember(e.target.value)}
              >
                {members.map((mm) => (
                  <option key={mm.id}>{mm.name}</option>
                ))}
              </select>
              <input
                placeholder="غذای جایگزین، مثلاً تخم‌مرغ آب‌پز"
                value={subText}
                onChange={(e) => setSubText(e.target.value)}
              />
              <button type="button" onClick={addSubstitute}>
                <Plus size={13} />
              </button>
            </div>
          </div>
        )}
        <button className="primary full" onClick={() => save(m)}>
          ذخیره وعده <Check size={17} />
        </button>
      </div>
    </div>
  );
}
function MemberDetail({ member, data, close, edit, del, upgrade }) {
  const logs = data.logs.filter((l) => l.members.includes(member.name));
  return (
    <div className="modal-backdrop">
      <div className="modal detail-modal">
        <button className="close" onClick={close}>
          <X size={18} />
        </button>
        <div className="detail-profile">
          <div className="avatar large" style={{ background: member.color }}>
            {member.photo ? <img src={member.photo} alt="" /> : member.initials}
          </div>
          <div>
            <span className="pill green">پروفایل تغذیه‌ای</span>
            <h2>{member.name}</h2>
            <p>
              {member.role} · {member.age} سال · هدف: {member.goal}
            </p>
          </div>
        </div>
        <div className="detail-stats">
          <div>
            <b>{logs.length}</b>
            <span>ثبت مرتبط</span>
          </div>
          <div>
            <b>{member.weight || "—"}</b>
            <span>وزن (کیلو)</span>
          </div>
          <div>
            <b>{member.height || "—"}</b>
            <span>قد (سانتی‌متر)</span>
          </div>
        </div>
        <p className="detail-copy">
          <b>ترجیحات:</b> {member.likes || "ثبت نشده"}
          <br />
          <b>غذاهای مورد علاقه‌نداشته:</b> {member.dislikes || "ثبت نشده"}
          <br />
          <b>حساسیت‌های غذایی:</b> {member.allergies || "ثبت نشده"}
          <br />
          <b>رژیم خاص:</b> {member.diet || "ثبت نشده"}
        </p>
        <h3>آخرین ثبت‌ها</h3>
        {logs.slice(0, 3).map((l) => {
          const en = entryFor(l, member.name);
          return (
            <div className="detail-log" key={l.id}>
              <span>{l.icon}</span>
              <div>
                <b>{l.title}</b>
                <small>
                  {l.meal} · {en?.status === "خورد" ? en.amount : "نخورد"} ·{" "}
                  {relativeDate(l.date)}
                </small>
              </div>
              <em>{l.time}</em>
            </div>
          );
        })}
        <div className="detail-actions">
          <button className="primary" onClick={edit}>
            <Edit3 size={15} /> ویرایش
          </button>
          <button className="danger" onClick={() => del(member.id)}>
            <Trash2 size={15} /> حذف عضو
          </button>
        </div>
        <PremiumGate
          data={data}
          title="تحلیل کامل این عضو"
          desc="روند مصرف، غذاهای پرتکرار/کم‌تکرار و وعده‌های حذف‌شده در طول زمان — امکان Premium است."
          onUpgrade={upgrade}
        >
          <MemberAnalysis member={member} data={data} />
        </PremiumGate>
      </div>
    </div>
  );
}
createRoot(document.getElementById("root")).render(<App />);
