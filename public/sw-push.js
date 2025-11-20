self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data?.json() ?? {};
  } catch (e) {
    data = { title: 'Update', body: 'Neuer Fokus-Impuls' };
  }

  const title = data.title || 'Lock-Screen Update';
  const body = data.body || 'Bleib im Fokus – neue Phase startet.';
  const tag = data.tag || 'lockscreen-update';
  const icon = data.icon || '/icons/icon-192.png';
  const badge = data.badge || '/icons/icon-64.png';

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      tag,
      icon,
      badge,
      data,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/app/inbox';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
      return undefined;
    })
  );
});
