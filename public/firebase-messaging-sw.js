/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js");
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyBMDNGHOYS0gxyj8lo1nWH9ZEZVWejlX_8",
  authDomain: "movigo-42feb.firebaseapp.com",
  projectId: "movigo-42feb",
  storageBucket: "movigo-42feb.firebasestorage.app",
  messagingSenderId: "673839718018",
  appId: "1:673839718018:web:2400d6668933cc71235e9b",
  measurementId: "G-DGSY9KKNQC",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload?.notification?.title || "MoviGO";
  const body =
    payload?.notification?.body || "Tienes una nueva notificacion.";

  self.registration.showNotification(title, {
    body,
    icon: "/favicon.png",
  });
});
