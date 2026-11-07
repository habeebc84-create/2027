import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { X, Megaphone, Tag, RefreshCw, AlertTriangle, Bell } from 'lucide-react';
import { useApp } from '../context/AppContext';
const typeConfig = {
    announcement: { icon: Megaphone, color: 'text-brand-400', bg: 'bg-brand-500/15', border: 'border-brand-500/30' },
    offer: { icon: Tag, color: 'text-brand-400', bg: 'bg-brand-500/15', border: 'border-brand-500/30' },
    update: { icon: RefreshCw, color: 'text-brand-400', bg: 'bg-brand-500/15', border: 'border-brand-500/30' },
    alert: { icon: AlertTriangle, color: 'text-brand-400', bg: 'bg-brand-500/15', border: 'border-brand-500/30' },
    order: { icon: Bell, color: 'text-brand-400', bg: 'bg-brand-500/15', border: 'border-brand-500/30' },
};
export default function NotificationPopup() {
    // `read` is the shared "team has handled this alert" flag (synced to every
    // device). The popup must NOT use it: once the admin marks an alert read on
    // the dashboard, the announcement would stop popping for visitors. Instead
    // the popup tracks a per-device "seen" record, so every phone/laptop gets
    // the popup once on its own — and again if the alert is edited.
    const { notifications, isNotificationSeen, markNotificationSeen, currentPage } = useApp();
    const [showPanel, setShowPanel] = useState(false);
    const [autoShown, setAutoShown] = useState(false);
    const [dismissedIds, setDismissedIds] = useState(new Set());
    // BUILD 80 security fix: never show inquiries to visitors. New
    // inquiries are type 'inquiry' (see Contact), and older ones already
    // synced to the cloud still carry type 'announcement' with an
    // "Inquiry: <name>" title — filter those out too, so a name + mobile
    // number can never pop up on a visitor's Home page again. Admin
    // inquiries still appear in the admin dashboard, which lists all types.
    const activeNotifications = notifications.filter(n => n.active !== false && n.type !== 'order' && n.type !== 'inquiry' && !n.title.startsWith('Inquiry:'));
    // Auto-show panel once after 3 seconds, but ONLY on the Home page.
    // It used to pop up on every page — including Products — 3s after
    // load, covering the screen (92vw + full backdrop) and swallowing
    // the tap the user meant for Add-to-cart or the cart button. On
    // shopping pages it must never auto-open; the panel stays reachable
    // from Home, where it auto-shows once per session.
    // It must not re-open after the user closes it: closing is not a
    // dismissal, so without this flag the effect would re-arm every time.
    useEffect(() => {
        if (currentPage !== 'home')
            return;
        const unread = activeNotifications.find(n => !isNotificationSeen(n) && !dismissedIds.has(n.id));
        if (unread && !showPanel && !autoShown) {
            const timer = setTimeout(() => { setShowPanel(true); setAutoShown(true); }, 3000);
            return () => clearTimeout(timer);
        }
    }, [activeNotifications, dismissedIds, showPanel, autoShown, currentPage, isNotificationSeen]);
    // Close the panel (and its full-screen backdrop) whenever the page
    // changes. The panel used to travel with the user from Home to
    // Products: its backdrop sits above the cart bubble, so the first
    // tap on the cart did nothing except dismiss the popup — the exact
    // "cart button doesn't work" feeling. Navigating must dismiss it.
    // autoShown stays set, so it still only auto-pops once per session.
    useEffect(() => {
        setShowPanel(false);
    }, [currentPage]);
    const dismissNotification = (id) => {
        const target = notifications.find(n => n.id === id);
        setDismissedIds(prev => new Set(prev).add(id));
        if (target)
            markNotificationSeen(target);
    };
    if (activeNotifications.length === 0)
        return null;
    return (_jsx(_Fragment, { children: _jsxs("div", { className: `fixed inset-y-0 left-0 z-[85] w-[420px] max-w-[85vw] bg-obsidian/98 backdrop-blur-xl border-r border-gunmetal flex flex-col transition-transform duration-300 ease-out ${showPanel ? 'translate-x-0' : '-translate-x-full'}`, children: [_jsxs("div", { className: "p-5 border-b border-gunmetal flex items-center justify-between shrink-0", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-brand flex items-center justify-center", children: _jsx(Bell, { className: "w-5 h-5 text-obsidian" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-black text-ivory", children: "Notifications & Alerts" }), _jsxs("p", { className: "text-[10px] text-silver", children: [activeNotifications.filter(n => !isNotificationSeen(n)).length, " unread \u00B7 ", activeNotifications.length, " total"] })] })] }), _jsx("button", { onClick: () => setShowPanel(false), className: "p-2 rounded-xl bg-charcoal hover:bg-white/10 text-silver hover:text-ivory transition", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsx("div", { className: "flex-1 overflow-y-auto p-4 space-y-3", children: activeNotifications.length === 0 ? (_jsxs("div", { className: "text-center py-16", children: [_jsx(Bell, { className: "w-12 h-12 text-slate-700 mx-auto mb-3" }), _jsx("p", { className: "text-sm text-silver font-bold", children: "No notifications yet" })] })) : (activeNotifications.map(n => {
                        const config = typeConfig[n.type] || typeConfig.announcement;
                        const Icon = config.icon;
                        const isDismissed = dismissedIds.has(n.id) || isNotificationSeen(n);
                        return (_jsx("div", { onClick: () => dismissNotification(n.id), className: `bg-charcoal border rounded-2xl p-4 cursor-pointer transition hover:border-brand-500/30 ${isDismissed ? 'border-gunmetal opacity-70' : 'border-brand-500/20'}`, children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx("div", { className: `w-11 h-11 rounded-xl ${config.bg} border ${config.border} flex items-center justify-center shrink-0`, children: _jsx(Icon, { className: `w-5 h-5 ${config.color}` }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-1", children: [!isDismissed && _jsx("div", { className: "w-2 h-2 bg-brand-400 rounded-full shrink-0 animate-pulse" }), _jsx("div", { className: "text-sm font-bold text-ivory truncate", children: n.title }), _jsx("span", { className: "text-[9px] px-1.5 py-0.5 rounded-full bg-brand-500/20 text-brand-400 font-bold border border-brand-500/20 shrink-0", children: n.type })] }), _jsx("p", { className: "text-xs text-silver leading-relaxed", children: n.content }), n.createdAt && (_jsx("div", { className: "text-[10px] text-silver mt-2", children: new Date(n.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }))] })] }) }, n.id));
                    })) })] }) }));
}
