import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        // Installed apps can sit resumed in the background for days and
        // never re-check for a new version — that left phones stuck on
        // old builds (everything up to BUILD 34) even though the live
        // site was already updated. So: re-check whenever the app
        // becomes visible again and every 30 minutes while open.
        const checkForUpdate = () => {
          registration.update().catch(() => {
            // Update check is best-effort; the app works without it.
          });
        };
        document.addEventListener('visibilitychange', () => {
          if (!document.hidden) checkForUpdate();
        });
        window.setInterval(checkForUpdate, 30 * 60 * 1000);
      })
      .catch(() => {
        // Installability is an enhancement; the app still works without it.
      });

    // When a new service worker takes control, the running page is still
    // the old code. Reload once so the user actually gets the new
    // version — except on pages with unsaved form state (checkout and
    // the admin portal), where a reload would lose what was typed.
    // Only reload for an UPDATE: on a first visit there is no previous
    // controller yet, and reloading then would just flash the page.
    const hadController = !!navigator.serviceWorker.controller;
    let swReloaded = false;
    try {
      swReloaded = window.sessionStorage.getItem('hsn-sw-reloaded') === '1';
    } catch {
      swReloaded = false;
    }
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController || swReloaded) return;
      const path = window.location.pathname || '';
      if (path.includes('checkout') || path.includes('manage-portal') || path.includes('admin')) return;
      try {
        window.sessionStorage.setItem('hsn-sw-reloaded', '1');
      } catch {
        // Storage unavailable; still reload once via the flag above.
      }
      swReloaded = true;
      window.location.reload();
    });
  });
}
