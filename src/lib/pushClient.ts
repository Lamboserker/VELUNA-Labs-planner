const VAPID_ENV_KEY = 'NEXT_PUBLIC_VAPID_PUBLIC_KEY';
const STORAGE_SUBSCRIPTION = 'lockscreen-push-subscription';
const SERVICE_WORKER_PATH = '/sw-push.js';

export type PushResult =
  | { status: 'enabled'; message?: string }
  | { status: 'blocked'; message?: string }
  | { status: 'error'; message?: string };

const getVapidKey = () => {
  if (typeof window === 'undefined') return null;
  return process.env[VAPID_ENV_KEY] || null;
};

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export async function ensurePushRegistration(): Promise<PushResult> {
  if (typeof window === 'undefined') {
    return { status: 'error', message: 'Client-Kontext erforderlich.' };
  }

  if (!('serviceWorker' in navigator)) {
    return { status: 'error', message: 'Service Worker nicht unterstützt.' };
  }

  if (!('PushManager' in window)) {
    return { status: 'error', message: 'Push API nicht verfügbar.' };
  }

  const registration = await navigator.serviceWorker
    .getRegistration(SERVICE_WORKER_PATH)
    .then(async (reg) => reg ?? navigator.serviceWorker.register(SERVICE_WORKER_PATH))
    .catch(() => null);

  if (!registration) {
    return { status: 'error', message: 'Service Worker konnte nicht registriert werden.' };
  }

  const vapidKey = getVapidKey();
  const existing = await registration.pushManager.getSubscription();
  if (existing) {
    window.localStorage.setItem(STORAGE_SUBSCRIPTION, JSON.stringify(existing.toJSON()));
    return { status: 'enabled', message: 'Lock-Screen Push aktiv (bestehendes Abo).' };
  }

  const subscribeOptions: PushSubscriptionOptionsInit = {
    userVisibleOnly: true,
    applicationServerKey: vapidKey ? urlBase64ToUint8Array(vapidKey) : undefined,
  };

  try {
    const subscription = await registration.pushManager.subscribe(subscribeOptions);
    window.localStorage.setItem(STORAGE_SUBSCRIPTION, JSON.stringify(subscription.toJSON()));
    // Hook: send subscription to backend for storage.
    return {
      status: 'enabled',
      message: vapidKey
        ? 'Lock-Screen Push aktiv.'
        : 'Aktiv ohne VAPID-Key — Backend-Bindung noch nötig.',
    };
  } catch (error) {
    if ((error as DOMException).name === 'NotAllowedError') {
      return { status: 'blocked', message: 'Push blockiert. Bitte Berechtigungen prüfen.' };
    }
    return { status: 'error', message: 'Push-Abo fehlgeschlagen.' };
  }
}

export async function removePushRegistration() {
  if (typeof window === 'undefined') return;
  try {
    const reg = await navigator.serviceWorker.getRegistration(SERVICE_WORKER_PATH);
    const subscription = await reg?.pushManager.getSubscription();
    await subscription?.unsubscribe();
  } catch {
    // noop
  }
  window.localStorage.removeItem(STORAGE_SUBSCRIPTION);
}
