"use client";
import { useEffect } from "react";

export default function PWAInstaller() {
  useEffect(() => {
    // Check if service worker is already registered
    if (!navigator.serviceWorker) return;

    navigator.serviceWorker.getRegistrations().then((registrations) => {
      // If service worker is already registered, don't register again
      if (registrations.length > 0) {
        console.log("✅ Service Worker already registered");
        return;
      }

      // Register service worker if not already registered
      navigator.serviceWorker
        .register("/service-worker.js")
        .then(() => {
          console.log("✅ Service Worker registered");
          // Set initial installation state
          if (!localStorage.getItem('pwaInstalled')) {
            localStorage.setItem('pwaInstalled', 'false');
          }
        })
        .catch((err) => console.error("❌ SW registration failed", err));
    });
  }, []);

  return null;
}
