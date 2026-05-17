function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeToPush(saveSubscriptionMutation: (sub: any) => void) {
  if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("[WebPushClient] Push notifications are not supported in this browser.");
    return;
  }

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!publicKey) {
    console.warn("[WebPushClient] VAPID public key is missing in client environment.");
    return;
  }

  try {
    // 1. Register Service Worker
    const registration = await navigator.serviceWorker.register("/sw.js");
    
    // 2. Request permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("[WebPushClient] Notification permission denied by user.");
      return;
    }

    // 3. Subscribe to Push Manager
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    console.log("[WebPushClient] Web Push subscribed successfully:", subscription);

    // 4. Save subscription in DB
    const subJSON = subscription.toJSON();
    if (subJSON.endpoint && subJSON.keys?.p256dh && subJSON.keys?.auth) {
      saveSubscriptionMutation({
        endpoint: subJSON.endpoint,
        keys: {
          p256dh: subJSON.keys.p256dh,
          auth: subJSON.keys.auth,
        },
      });
    }
  } catch (error) {
    console.error("[WebPushClient] Error subscribing to Web Push:", error);
  }
}
