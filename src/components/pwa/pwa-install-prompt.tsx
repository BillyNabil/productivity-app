'use client';

import { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if running as installed app
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    // Check for iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show iOS prompt after delay
    if (isIOSDevice && !localStorage.getItem('pwa-ios-prompt-dismissed')) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 5000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    if (isIOS) {
      localStorage.setItem('pwa-ios-prompt-dismissed', 'true');
    }
  };

  if (!showPrompt) return null;

  if (isIOS) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-linear-to-t from-black/90 to-black/70 border-t border-white/10 p-4 z-50 animate-in slide-in-from-bottom-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-white">Add to Home Screen</h3>
            <button
              onClick={handleDismiss}
              className="text-white/60 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-white/70 text-sm mb-4">
            1. Tap the Share button <span className="inline-block">↗️</span>
          </p>
          <p className="text-white/70 text-sm mb-4">
            2. Select "Add to Home Screen"
          </p>
          <button
            onClick={handleDismiss}
            className="w-full px-4 py-2 bg-black hover:bg-black border-2  text-white rounded-lg font-medium transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-linear-to-r from-black to-black rounded-lg shadow-lg p-4 z-50 animate-in slide-in-from-bottom-4 md:max-w-sm md:right-auto border-2">
      <div className="flex items-start gap-3">
        <Download className="w-5 h-5 text-white shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-white mb-1">Install Productivity Hub</h3>
          <p className="text-white/90 text-sm">Get quick access to your productivity tools on any device</p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-white/80 hover:text-white transition-colors shrink-0"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={handleDismiss}
          className="flex-1 px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded font-medium transition-colors text-sm"
        >
          Maybe Later
        </button>
        <button
          onClick={handleInstall}
          className="flex-1 px-3 py-2 bg-white text-black hover:bg-white/90 rounded font-medium transition-colors text-sm"
        >
          Install
        </button>
      </div>
    </div>
  );
}
