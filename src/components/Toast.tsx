import { CheckCircle, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ToastContainer() {
  const { toasts } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[200] space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-xs font-bold shadow-2xl backdrop-blur-xl border animate-[slideIn_0.3s_ease-out] ${
            toast.type === 'error'
              ? 'bg-rose-500/20 border-rose-500/30 text-rose-300'
              : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
