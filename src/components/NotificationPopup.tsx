import { useState, useEffect } from 'react';
import { Bell, X, ChevronRight, Megaphone, Tag, RefreshCw, AlertTriangle } from 'lucide-react';
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
  const [isOpen, setIsOpen] = useState(false);
  const [showFirstAlert, setShowFirstAlert] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [hasShownSession, setHasShownSession] = useState(false);

  const activeNotifications = notifications.filter(n => n.active !== false && n.type !== 'order');
  const unreadCount = activeNotifications.filter(n => !n.read).length;

  // Auto-show the first unread notification as a popup after 3 seconds
  useEffect(() => {
    if (hasShownSession) return;
    const unread = activeNotifications.find(n => !n.read && !dismissedAlerts.has(n.id));
    if (unread) {
      const timer = setTimeout(() => {
        setShowFirstAlert(true);
        setHasShownSession(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [activeNotifications, dismissedAlerts, hasShownSession]);

  const firstAlert = activeNotifications.find(n => !n.read && !dismissedAlerts.has(n.id));

  const dismissFirstAlert = (notifId: string) => {
    setDismissedAlerts(prev => new Set(prev).add(notifId));
    markNotificationRead(notifId);
    setShowFirstAlert(false);
  };

  // Don't show anything if no active notifications
  if (activeNotifications.length === 0) return null;

  return (
    <>
      {/* Floating bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-5 z-50 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30 flex items-center justify-center hover:scale-110 transition-transform"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-slate-950">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Auto popup - first unread notification slides in from right */}
      {showFirstAlert && firstAlert && (
        <div className="fixed top-4 right-4 z-[90] w-[340px] max-w-[calc(100vw-2rem)] animate-slide-in-right">
          <div className="bg-slate-900/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-2xl shadow-purple-500/10 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-4 py-2.5 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-purple-400 animate-pulse" />
                <span className="text-xs font-black text-white uppercase tracking-wider">Store Alert</span>
              </div>
              <button onClick={() => dismissFirstAlert(firstAlert.id)} className="text-slate-400 hover:text-white transition p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-start space-x-3">
                {(() => {
                  const config = typeConfig[firstAlert.type] || typeConfig.announcement;
                  const Icon = config.icon;
                  return (
                    <div className={`w-10 h-10 rounded-xl ${config.bg} border ${config.border} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>
                  );
                })()}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white mb-1">{firstAlert.title}</div>
                  <div className="text-xs text-slate-300 leading-relaxed">{firstAlert.content}</div>
                  {firstAlert.createdAt && (
                    <div className="text-[10px] text-slate-500 mt-2">
                      {new Date(firstAlert.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => dismissFirstAlert(firstAlert.id)}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold py-2 rounded-xl transition flex items-center justify-center space-x-2"
              >
                <span>Dismiss</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Side panel - all notifications */}
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-slate-950/50 z-[80] backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-[85] w-[380px] max-w-[90vw] bg-slate-950/98 backdrop-blur-xl border-l border-white/10 flex flex-col animate-slide-panel">
            {/* Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Notifications</h3>
                  <p className="text-[10px] text-slate-400">{unreadCount} unread alerts</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notifications list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeNotifications.length === 0 ? (
                <div className="text-center py-16">
                  <Bell className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">No notifications yet</p>
                </div>
              ) : (
                activeNotifications.map(n => {
                  const config = typeConfig[n.type] || typeConfig.announcement;
                  const Icon = config.icon;
                  return (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`bg-white/5 border rounded-xl p-4 cursor-pointer transition hover:border-purple-500/30 ${n.read ? 'border-white/5 opacity-70' : 'border-purple-500/20'}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-9 h-9 rounded-lg ${config.bg} border ${config.border} flex items-center justify-center shrink-0`}>
                          <Icon className={`w-4 h-4 ${config.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-0.5">
                            {!n.read && <div className="w-1.5 h-1.5 bg-purple-400 rounded-full shrink-0" />}
                            <div className="text-xs font-bold text-white truncate">{n.title}</div>
                          </div>
                          <div className="text-[10px] text-slate-400 line-clamp-2">{n.content}</div>
                          {n.createdAt && (
                            <div className="text-[9px] text-slate-600 mt-1">
                              {new Date(n.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
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
      )}
    </>
  );
}
