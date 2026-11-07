import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Lock, Mail, Eye, EyeOff, Timer } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { requestAdminPasswordReset, ADMIN_EMAIL } from '../lib/adminAuth';
import { bustedImageSrc } from '../lib/images';
import AdminLoginBackground from '../components/AdminLoginBackground';
const LOCK_KEY = 'hsn_admin_login_lock';
// A failure streak only feeds the escalating cooldown while failures stay
// recent; after a quiet gap the next wrong attempt starts the timer at 10s again.
const ATTEMPT_DECAY_MS = 5 * 60 * 1000;
function readLock() {
    try {
        const raw = localStorage.getItem(LOCK_KEY);
        if (!raw)
            return { attempts: 0, until: 0 };
        const parsed = JSON.parse(raw);
        return { attempts: parsed.attempts ?? 0, until: parsed.until ?? 0, lastFail: parsed.lastFail ?? 0 };
    }
    catch {
        return { attempts: 0, until: 0 };
    }
}
export default function AdminLogin() {
    const { loginAdmin, setPage, siteSettings } = useApp();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [lock, setLock] = useState(() => {
        const l = readLock();
        if (l.until > Date.now())
            return l;
        // Expired lock: keep past attempts only while failures are recent, so a
        // stale streak never inflates a fresh cooldown (always restarts at 10s).
        const stale = !l.lastFail || Date.now() - l.lastFail > ATTEMPT_DECAY_MS;
        return { attempts: stale ? 0 : l.attempts, until: 0, lastFail: l.lastFail ?? 0 };
    });
    const [now, setNow] = useState(Date.now());
    const remaining = lock.until > now ? Math.ceil((lock.until - now) / 1000) : 0;
    const locked = remaining > 0;
    // Persist so refreshing the page cannot bypass the cooldown
    useEffect(() => {
        try {
            localStorage.setItem(LOCK_KEY, JSON.stringify(lock));
        }
        catch {
            /* storage unavailable */
        }
    }, [lock]);
    // Live countdown while locked
    useEffect(() => {
        if (!locked)
            return;
        const iv = setInterval(() => setNow(Date.now()), 250);
        return () => clearInterval(iv);
    }, [locked]);
    const [submitting, setSubmitting] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    const [resetError, setResetError] = useState('');
    const handleForgotPassword = async () => {
        if (resetting)
            return;
        setResetError('');
        setResetSent(false);
        setResetting(true);
        const err = await requestAdminPasswordReset();
        setResetting(false);
        if (err)
            setResetError(err);
        else
            setResetSent(true);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (locked || submitting)
            return;
        setError('');
        if (!email || !password) {
            setError('Please enter email and password');
            return;
        }
        setSubmitting(true);
        const err = await loginAdmin(email, password);
        setSubmitting(false);
        if (!err) {
            // Reset the streak AND persist it immediately — the component unmounts
            // right after setPage('admin'), which can skip the persistence effect and
            // leak old attempts into the next login session.
            const cleared = { attempts: 0, until: 0, lastFail: 0 };
            setLock(cleared);
            try {
                localStorage.setItem(LOCK_KEY, JSON.stringify(cleared));
            }
            catch { /* storage unavailable */ }
            setPage('admin');
        }
        else {
            const next = lock.attempts + 1;
            if (next >= 2) {
                // 2nd failure -> 10s, 3rd -> 20s, 4th -> 30s, ...
                const secs = (next - 1) * 10;
                setLock({ attempts: next, until: Date.now() + secs * 1000, lastFail: Date.now() });
            }
            else {
                setLock({ attempts: next, until: 0, lastFail: Date.now() });
                setError(err);
            }
        }
    };
    return (_jsxs("div", { className: "relative min-h-screen overflow-hidden bg-obsidian", children: [_jsx(AdminLoginBackground, {}), _jsx("div", { className: "relative z-10 flex min-h-screen items-center justify-center px-4 py-10", children: _jsxs("div", { className: "w-full max-w-md", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("img", { src: bustedImageSrc(siteSettings.logo || '/windows-h-logo.png'), alt: "HSN Logo", className: "w-16 h-16 rounded-3xl object-contain border border-gunmetal bg-obsidian/60 p-1.5 shadow-lg shadow-obsidian/60 mx-auto mb-4" }), _jsx("h1", { className: "text-2xl font-black text-ivory font-industrial", children: "Admin Portal" }), _jsx("p", { className: "text-silver text-[11px] font-bold tracking-[0.18em] mt-1.5", children: "HSN CEMENT & STEEL" }), _jsx("p", { className: "text-silver text-xs mt-1", children: "Authorized personnel only" })] }), _jsx("div", { className: "admin-login-card bg-charcoal/80 border border-gunmetal/80 rounded-[2rem] p-8 backdrop-blur-2xl", children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [error && (_jsx("div", { className: "bg-brand-500/10 border border-brand-500/30 text-brand-400 px-4 py-3 rounded-2xl text-xs font-bold text-center", children: error })), locked && (_jsxs("div", { className: "bg-brand-500/10 border border-brand-500/30 text-brand-300 px-4 py-3 rounded-2xl text-xs font-bold text-center space-y-1", children: [_jsxs("p", { className: "flex items-center justify-center space-x-2", children: [_jsx(Timer, { className: "w-4 h-4 animate-pulse" }), _jsxs("span", { children: ["Too many failed attempts. Try again in ", remaining, "s"] })] }), _jsx("p", { className: "text-[10px] text-brand-400/80 font-semibold", children: "Each further wrong attempt adds 10 seconds" })] })), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-bold text-silver block mb-1.5", children: "Email Address" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "w-4 h-4 text-silver absolute left-3 top-1/2 -translate-y-1/2" }), _jsx("input", { type: "email", value: email, onChange: e => setEmail(e.target.value), disabled: locked, placeholder: "admin@hsncement.com", className: "w-full bg-obsidian border border-gunmetal text-ivory pl-10 pr-4 py-3 rounded-2xl text-sm focus:outline-none focus:border-brand-500 transition disabled:opacity-50 disabled:cursor-not-allowed" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-bold text-silver block mb-1.5", children: "Password" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "w-4 h-4 text-silver absolute left-3 top-1/2 -translate-y-1/2" }), _jsx("input", { type: showPassword ? 'text' : 'password', value: password, onChange: e => setPassword(e.target.value), disabled: locked, placeholder: "Enter admin password", className: "w-full bg-obsidian border border-gunmetal text-ivory pl-10 pr-10 py-3 rounded-2xl text-sm focus:outline-none focus:border-brand-500 transition disabled:opacity-50 disabled:cursor-not-allowed" }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3 top-1/2 -translate-y-1/2 text-silver hover:text-ivory transition", children: showPassword ? _jsx(EyeOff, { className: "w-4 h-4" }) : _jsx(Eye, { className: "w-4 h-4" }) })] })] }), _jsx("button", { type: "submit", disabled: locked, className: "w-full btn-brand font-black py-3 rounded-2xl text-sm transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed", children: locked ? `Locked — wait ${remaining}s` : submitting ? 'Verifying…' : 'Authenticate' }), _jsx("button", { type: "button", onClick: handleForgotPassword, disabled: resetting, className: "w-full text-center text-xs font-bold text-silver hover:text-ivory transition disabled:opacity-50 disabled:cursor-not-allowed", children: resetting ? 'Sending reset link…' : 'Forgot password? Send reset link to mail' }), resetSent && (_jsxs("div", { className: "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-2xl text-xs font-bold text-center", children: ["Reset link sent to ", ADMIN_EMAIL, ". Check your inbox (and spam), click the link \u2014 it opens the admin dashboard \u2014 then go to Security & Settings > Change to set your new password."] })), resetError && (_jsx("div", { className: "bg-brand-500/10 border border-brand-500/30 text-brand-400 px-4 py-3 rounded-2xl text-xs font-bold text-center", children: resetError }))] }) })] }) })] }));
}
