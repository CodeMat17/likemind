"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"; // Ensure `sonner` is installed and configured

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    // Don't show if app is already installed (standalone mode)
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)"
    ).matches;
    if (isStandalone) return;

    const handler = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setShowDialog(true);
    };

    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then(() => console.log("✅ Service Worker registered"))
        .catch((err) =>
          console.error("❌ Service Worker registration failed:", err)
        );
    }

    // Listen for install prompt
    window.addEventListener("beforeinstallprompt", handler);

    // Optional: handle if user installs via browser UI
    window.addEventListener("appinstalled", () => {
      toast.success("App successfully installed!");
      setShowDialog(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        toast.success("Installation started");
      } else {
        toast.info("Installation dismissed");
      }
      setDeferredPrompt(null);
      setShowDialog(false);
    });
  };

  const handleAskLater = () => {
    setShowDialog(false);
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>LIKEMIND App</DialogTitle>
        </DialogHeader>
        <p>
          Install the LIKEMIND Finance App to your device for faster and
          offline access.
        </p>
        <DialogFooter className='mt-4'>
          <Button onClick={handleInstall}>Install</Button>
          <Button variant='ghost' onClick={handleAskLater}>
            Ask Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
