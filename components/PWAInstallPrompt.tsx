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
import { toast } from "sonner";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

interface SafariNavigator extends Navigator {
  standalone?: boolean;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkInstallation = () => {
      // Check if PWA is already installed via localStorage
      if (localStorage.getItem('pwaInstalled') === 'true') {
        return true;
      }

      // Check standalone mode
      const isStandalone = 
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as SafariNavigator).standalone ||
        document.referrer.includes('android-app://') ||
        window.navigator.userAgent.includes('wv'); // Check for Android WebView

      // If detected as standalone, mark as installed
      if (isStandalone) {
        localStorage.setItem('pwaInstalled', 'true');
        return true;
      }

      return false;
    };

    // Check installation status immediately and on visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && checkInstallation()) {
        setShowDialog(false);
      }
    };

    if (checkInstallation()) {
      setShowDialog(false);
      return;
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

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

    // Handle successful installation
    window.addEventListener("appinstalled", () => {
      localStorage.setItem('pwaInstalled', 'true');
      toast.success("App successfully installed!");
      setShowDialog(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('appinstalled', () => {
        localStorage.setItem('pwaInstalled', 'true');
        setShowDialog(false);
        setDeferredPrompt(null);
      });
    };
  }, []);

  const handleInstall = () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        localStorage.setItem('pwaInstalled', 'true');
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
