import { useState, useEffect } from 'react';
import { X, Megaphone, Tag, RefreshCw, AlertTriangle, Bell } from 'lucide-react';
import { useApp } from '../context/AppContext';

const typeConfig: Record<string, { icon: any; color: string; bg: string; border: string }> = {
  announcement: { icon: Megaphone, color: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/30' },
  offer: { icon: Tag, color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30' },
  update: { icon: RefreshCw, color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30' },
  alert: { icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-500/15', border: 'border-rose-500/30' },
  order: { icon: Bell, color: 'text-purple-400', bg: 'bg-purple-500/15', border: 'border-purple-500/30' },
};

export default function NotificationPopup() {
  const { notifications, markNotificationRead } = useApp();
  const [showPanel, setShowPanel] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const activeNotifications = notifications.filter(n => n.active !== false && n.type !== 'order');

  // Auto-show panel once after 3 seconds if there are unread notifications
  useEffect(() => {
    const unread = activeNotifications.find(n => !n.read && !dismissedIds.has(n.id));
    if (unread && !showPanel) {
      const timer = setTimeout(() => setShowPanel(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [activeNotifications, dismissedIds, showPanel]);

  const dismissNotification = (notifId: string) => {
    setDismissedIds(prev => new Set(prev).add(notifId));
    markNotificationRead(notifId);
  };

  if (activeNotifications.length === 0) return null;

  return (
    <>
      {/* Backdrop */}
      {showPanel && (
        <div className="fixed inset-0 bg-slate-950/40 z-[80] backdrop-blur-sm transition-opacity" onClick={() => setShowPanel(false)} />
      )}

      {/* Left side notification panel - always renders, slides in */}
      <div className={`fixed inset-y-0 left-0 z-[85] w-[420px] max-w-[92vw] bg-slate-950/98 backdrop-blur-xl border-r border-white/10 flex flex-col transition-transform duration-300 ease-out ${showPanel ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Notifications & Alerts</h3>
              <p className="text-[10px] text-slate-400">{activeNotifications.filter(n => !n.read).length} unread · {activeNotifications.length} total</p>
            </div>
          </div>
          <button onClick={() => setShowPanel(false)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeNotifications.length === 0 ? (
            <div className="text-center py-16">
              <Bell className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <p className="text-sm text-slate-500 font-bold">No notifications yet</p>
            </div>
          ) : (
            activeNotifications.map(n => {
              const config = typeConfig[n.type] || typeConfig.announcement;
              const Icon = config.icon;
              const isDismissed = dismissedIds.has(n.id);
              return (
                <div
                  key={n.id}
                  onClick={() => dismissNotification(n.id)}
                  className={`bg-white/5 border rounded-2xl p-4 cursor-pointer transition hover:border-purple-500/30 ${n.read || isDismissed ? 'border-white/5 opacity-70' : 'border-purple-500/20'}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-11 h-11 rounded-xl ${config.bg} border ${config.border} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        {!n.read && !isDismissed && <div className="w-2 h-2 bg-purple-400 rounded-full shrink-0 animate-pulse" />}
                        <div className="text-sm font-bold text-white truncate">{n.title}</div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 font-bold border border-purple-500/20 shrink-0">{n.type}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{n.content}</p>
                      {n.createdAt && (
                        <div className="text-[10px] text-slate-500 mt-2">
                          {new Date(n.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
