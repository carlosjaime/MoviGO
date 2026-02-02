import { getMessaging, getToken, isSupported, onMessage } from "firebase/messaging";

import { getFirebaseApp } from "@/lib/firebase";

export const registerWebPushNotifications = async () => {
  const app = getFirebaseApp();
  if (!app) return null;

  const supported = await isSupported();
  if (!supported) return null;

  const vapidKey = process.env.EXPO_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) return null;

  try {
    if ("serviceWorker" in navigator) {
      await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    }
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const messaging = getMessaging(app);
    const token = await getToken(messaging, { vapidKey });

    onMessage(messaging, (payload) => {
      const title = payload?.notification?.title || "MoviGO";
      const body =
        payload?.notification?.body || "Tienes una nueva notificacion.";
      new Notification(title, { body });
    });

    return token;
  } catch {
    return null;
  }
};
