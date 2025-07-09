"use client";
import { useEffect } from "react";

export default function PWAInstaller() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then(() => console.log("✅ Service Worker registered"))
        .catch((err) => console.error("❌ SW registration failed", err));
    }
  }, []);

  return null;
}
