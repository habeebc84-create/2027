import { useState, useEffect } from 'react';
import { Lock, Mail, Eye, EyeOff, Shield, Timer } from 'lucide-react';
import { useApp } from '../context/AppContext';

const LOCK_KEY = 'hsn_admin_login_lock';

interface LockState {
  attempts: number; // failed credential attempts so far
  until: number; // timestamp (ms) until which login is locked; 0 = unlocked
}

function readLock(): LockState {
  try {
    const raw = localStorage.getItem(LOCK_KEY);
    if (!raw) return { attempts: 0, until: 0 };
    const parsed = JSON.parse(raw) as Partial<LockState>;
    return { attempts: parsed.attempts ?? 0, until: parsed.until ?? 0 };
  } catch {
    return { attempts: 0, until: 0 };
  }
}

export default function AdminLogin() {
  const { loginAdmin, setPage } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [lock, setLock] = useState<LockState>(() => {
    const l = readLock();
    // Expired locks start fresh (attempts kept so escalation continues)
    return l.until > Date.now() ? l : { attempts: l.attempts, until: 0 };
  });
  const [now, setNow] = useState(Date.now());

  const remaining = lock.until > now ? Math.ceil((lock.until - now) / 1000) : 0;
  const locked = remaining > 0;

  // Persist so refreshing the page cannot bypass the cooldown
  useEffect(() => {
    try {
      localStorage.setItem(LOCK_KEY, JSON.stringify(lock));
    } catch {
      /* storage unavailable */
    }
  }, [lock]);

  // Live countdown while locked
  useEffect(() => {
    if (!locked) return;
    const iv = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(iv);
  }, [locked]);

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (locked || submitting) return;
    setError('');
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    setSubmitting(true);
    const success = await loginAdmin(email, password);
    setSubmitting(false);
    if (success) {
      setLock({ attempts: 0, until: 0 });
      setPage('admin');
    } else {
      const next = lock.attempts + 1;
      if (next >= 2) {
        // 2nd failure -> 10s, 3rd -> 20s, 4th -> 30s, ...
        const secs = (next - 1) * 10;
        setLock({ attempts: next, until: Date.now() + secs * 1000 });
      } else {
        setLock({ attempts: next, until: 0 });
        setError('Invalid credentials. Access denied.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative z-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white font-industrial">Admin Portal</h1>
          <p className="text-slate-400 text-xs mt-1">Authorized personnel only</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-xl text-xs font-bold text-center">
                {error}
              </div>
            )}
            {locked && (
              <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 px-4 py-3 rounded-xl text-xs font-bold text-center space-y-1">
                <p className="flex items-center justify-center space-x-2">
                  <Timer className="w-4 h-4 animate-pulse" />
                  <span>Too many failed attempts. Try again in {remaining}s</span>
                </p>
                <p className="text-[10px] text-amber-400/80 font-semibold">Each further wrong attempt adds 10 seconds</p>
              </div>
            )}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={locked}
                  placeholder="admin@hsncement.com"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={locked}
                  placeholder="Enter admin password"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 pl-10 pr-10 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={locked}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-black py-3 rounded-xl text-sm transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-500 disabled:hover:to-indigo-600"
            >
              {locked ? `Locked — wait ${remaining}s` : submitting ? 'Verifying…' : 'Authenticate'}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-slate-500 mt-4">
          Contact site owner for credentials
        </p>
      </div>
    </div>
  );
}
