'use client';

import { useEffect, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(() =>
    typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches ||
      // @ts-expect-error iOS Safari
      window.navigator.standalone === true),
  );
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    /* 1) Registrar Service Worker (directo, sin esperar 'load') */
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => console.log('✅ SW registrado:', reg.scope))
        .catch((err) => console.warn('⚠️ SW registro falló:', err));
    }

    /* 3) Capturar beforeinstallprompt */
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowBanner(true), 3000);
    };

    const onInstalled = () => {
      setInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  if (installed || !showBanner || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 p-1 shadow-2xl">
      <div className="rounded-xl bg-[#0B0B14] p-4 flex items-center gap-3">
        <div className="text-3xl">👀</div>
        <div className="flex-1">
          <p className="text-white font-semibold text-sm">Instala Chismólogo</p>
          <p className="text-white/60 text-xs">Acceso rápido desde tu pantalla</p>
        </div>
        <button
          onClick={handleInstall}
          className="px-4 py-2 rounded-full bg-white text-purple-700 font-semibold text-sm hover:scale-105 transition"
        >
          Instalar
        </button>
        <button
          onClick={() => setShowBanner(false)}
          aria-label="Cerrar"
          className="text-white/60 hover:text-white text-lg leading-none px-1"
        >
          ×
        </button>
      </div>
    </div>
  );
}