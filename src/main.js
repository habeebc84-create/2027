import { jsx as _jsx } from "react/jsx-runtime";
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from "./App.js";
createRoot(document.getElementById('root')).render(_jsx(StrictMode, { children: _jsx(App, {}) }));
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // BUILD 71: visible update prompt, not a silent reload.
        // BUILD 74: it is a popup at the TOP of the website, not a bottom
        // banner — the bottom bar was easy to miss behind the phone's
        // bottom dock / cart drawer. Phones (installed app / phone browser)
        // can sit resumed for days on an old build: the old code re-checked
        // only every 30 minutes, auto-reloaded silently on normal pages,
        // and did NOTHING at all on checkout/admin pages (to protect typed
        // data) — so those pages simply never synced, with no message
        // telling the user why. Now: when a new version is found, a popup
        // at the top says "Update available — update to latest version"
        // on every page, and the user taps "Update now" to reload. Nothing
        // reloads on its own, so typed checkout/admin data is never lost
        // without the user choosing it.
        const showUpdateBanner = () => {
            if (document.getElementById('hsn-update-banner'))
                return;
            const banner = document.createElement('div');
            banner.id = 'hsn-update-banner';
            banner.setAttribute('role', 'alert');
            banner.setAttribute('aria-live', 'polite');
            banner.style.cssText =
                /* BUILD 75 mobile: sit below the phone notch / status bar
                   (safe-area-inset-top) instead of a fixed 12px that could
                   sit under it, and use the safe-area on the sides too so
                   the popup never touches a curved screen edge. */
                'position:fixed;top:max(12px, env(safe-area-inset-top));left:50%;transform:translateX(-50%);' +
                    'width:calc(100% - 24px - env(safe-area-inset-left) - env(safe-area-inset-right));max-width:640px;z-index:9999;' +
                    'display:flex;align-items:center;gap:8px;flex-wrap:wrap;' +
                    'background:#C6A875;color:#0B0C0E;border-radius:16px;' +
                    'padding:12px 14px;box-shadow:0 12px 32px rgba(0,0,0,0.45);' +
                    'font-family:system-ui,sans-serif;font-size:14px;font-weight:700;';
            const text = document.createElement('span');
            text.textContent = 'Update available — update to latest version';
            text.style.cssText = 'flex:1 1 140px;';
            const updateBtn = document.createElement('button');
            updateBtn.type = 'button';
            updateBtn.textContent = 'Update now';
            updateBtn.style.cssText =
                'background:#0B0C0E;color:#F7F5F0;border:none;border-radius:12px;' +
                    'padding:10px 16px;font-weight:800;font-size:14px;cursor:pointer;';
            updateBtn.addEventListener('click', () => {
                window.location.reload();
            });
            const laterBtn = document.createElement('button');
            laterBtn.type = 'button';
            laterBtn.textContent = 'Later';
            laterBtn.setAttribute('aria-label', 'Dismiss update notification');
            laterBtn.style.cssText =
                'background:transparent;color:#0B0C0E;border:1px solid #0B0C0E;' +
                    'border-radius:12px;padding:10px 14px;font-weight:700;font-size:14px;cursor:pointer;';
            laterBtn.addEventListener('click', () => {
                banner.remove();
            });
            banner.appendChild(text);
            banner.appendChild(updateBtn);
            banner.appendChild(laterBtn);
            document.body.appendChild(banner);
        };
        navigator.serviceWorker
            .register('/sw.js', { updateViaCache: 'none' })
            .then((registration) => {
            // Re-check often on mobile: on foreground, on focus, and every
            // 60 seconds while open (was 30 minutes — far too slow for a
            // phone that stays open on one page).
            const checkForUpdate = () => {
                registration.update().catch(() => {
                    // Update check is best-effort; the app works without it.
                });
            };
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden)
                    checkForUpdate();
            });
            window.addEventListener('focus', checkForUpdate);
            window.setInterval(checkForUpdate, 60 * 1000);
            // A waiting worker means a new version is downloaded but the
            // running page is still old code — show the banner, don't reload.
            if (registration.waiting)
                showUpdateBanner();
            registration.addEventListener('updatefound', () => {
                const worker = registration.installing;
                if (!worker)
                    return;
                worker.addEventListener('statechange', () => {
                    if (worker.state === 'installed' && navigator.serviceWorker.controller) {
                        showUpdateBanner();
                    }
                });
            });
        })
            .catch(() => {
            // Installability is an enhancement; the app still works without it.
        });
        // When a new service worker takes control, the running page is still
        // the old code. Previously this auto-reloaded once (and never on
        // checkout/admin, and never twice in a session). Now it just shows
        // the banner, so the user chooses when to update. On a first visit
        // there is no previous controller yet, so no banner is needed.
        const hadController = !!navigator.serviceWorker.controller;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!hadController)
                return;
            showUpdateBanner();
        });
    });
}
