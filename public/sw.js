// Service Worker سبک «تندرسا».
// فقط برای فعال‌سازی واقعی اعلان‌های مرورگر (registration.showNotification)
// استفاده می‌شود؛ فعلاً کش یا Push سرور ندارد.

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        if (clients.length > 0) {
          return clients[0].focus();
        }
        return self.clients.openWindow("/");
      }),
  );
});
