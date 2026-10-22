'use client';

import { useEffect, useState } from 'react';

export function UpdateBanner() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.ready.then((reg) => {
      // Already a waiting SW on load
      if (reg.waiting) { setWaiting(reg.waiting); return; }

      // Listen for a new SW that installs while the app is open
      reg.addEventListener('updatefound', () => {
        const newSw = reg.installing;
        if (!newSw) return;
        newSw.addEventListener('statechange', () => {
          if (newSw.state === 'installed' && navigator.serviceWorker.controller) {
            setWaiting(newSw);
          }
        });
      });
    });

    // After skipWaiting, reload all clients
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) { refreshing = true; window.location.reload(); }
    });
  }, []);

  if (!waiting) return null;

  function update() {
    waiting?.postMessage('SKIP_WAITING');
  }

  return (
    <div
      className="fixed bottom-20 left-0 right-0 flex justify-center px-4 z-50"
      style={{ pointerEvents: 'none' }}
    >
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl"
        style={{
          background:   'var(--accent)',
          color:        'var(--bg-deep)',
          pointerEvents: 'auto',
          maxWidth:     '380px',
          width:        '100%',
        }}
      >
        <span className="text-lg flex-shrink-0">🎳</span>
        <div className="flex-1">
          <p className="text-xs font-bold">Update available</p>
          <p className="text-[10px] opacity-80">Tap to get the latest version</p>
        </div>
        <button
          onClick={update}
          className="px-3 py-1.5 rounded-xl text-xs font-bold flex-shrink-0"
          style={{ background: 'var(--bg-deep)', color: 'var(--accent)' }}
        >
          Update
        </button>
      </div>
    </div>
  );
}
