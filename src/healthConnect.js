import { registerPlugin } from "@capacitor/core";

// این پلاگین سمت اندروید (ir.ghadirb.familynutrition.HealthConnectPlugin) با
// androidx.health.connect پیاده‌سازی شده است. در وب/مرورگر پیاده‌سازی جایگزین
// زیر فقط پیام روشن می‌دهد، چون Health Connect یک قابلیت مخصوص اندروید است.
const HealthConnect = registerPlugin("HealthConnect", {
  web: () => ({
    async isAvailable() {
      return { available: false, status: -1 };
    },
    async hasPermissions() {
      return { granted: false };
    },
    async requestPermissions() {
      throw new Error("Health Connect فقط در نسخهٔ اندروید این برنامه در دسترس است.");
    },
    async readSummary() {
      throw new Error("Health Connect فقط در نسخهٔ اندروید این برنامه در دسترس است.");
    },
    async openHealthConnectSettings() {
      throw new Error("Health Connect فقط در نسخهٔ اندروید این برنامه در دسترس است.");
    },
  }),
});

export default HealthConnect;
