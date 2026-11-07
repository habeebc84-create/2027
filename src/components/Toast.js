import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
export default function ToastContainer() {
    const { toasts } = useApp();
    if (toasts.length === 0)
        return null;
    return (_jsx("div", { className: "fixed top-20 right-4 z-[200] space-y-2", children: toasts.map(toast => (_jsxs("div", { className: `flex items-center space-x-2 px-4 py-3 rounded-xl text-xs font-bold shadow-2xl backdrop-blur-xl border animate-[slideIn_0.3s_ease-out] ${toast.type === 'error'
                ? 'bg-charcoal border-champagne text-ivory'
                : 'status-success'}`, children: [toast.type === 'error' ? (_jsx(AlertCircle, { className: "w-4 h-4 shrink-0" })) : (_jsx(CheckCircle, { className: "w-4 h-4 shrink-0" })), _jsx("span", { children: toast.message })] }, toast.id))) }));
}
