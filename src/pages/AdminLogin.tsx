import { useState, useEffect } from 'react';
import { Lock, Mail, Eye, EyeOff, Timer } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { bustedImageSrc } from '../lib/images';
import AdminLoginBackground from '../components/AdminLoginBackground';

const LOCK_KEY = 'hsn_admin_login_lock';

interface LockState {
  attempts: number; // failed credential attempts so far
  until: number; // timestamp (ms) until which login is locked; 0 = unlocked
  lastFail?: number; // timestamp (ms) of the most recent failed attempt
}

// A failure streak only feeds the escalating cooldown while failures stay
// recent; after a quiet gap the next wrong attempt starts the timer at 10s again.
const ATTEMPT_DECAY_MS = 5 * 60 * 1000;

function readLock(): LockState {
  try {
    const raw = localStorage.getItem(LOCK_KEY);
    if (!raw) return { attempts: 0, until: 0 };
    const parsed = JSON.parse(raw) as Partial<LockState>;
    return { attempts: parsed.attempts ?? 0, until: parsed.until ?? 0, lastFail: parsed.lastFail ?? 0 };
  } catch {
    return { attempts: 0, until: 0 };
  }
}

export default function AdminLogin() {
  const { loginAdmin, setPage, siteSettings } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [lock, setLock] = useState<LockState>(() => {
    const l = readLock();
    if (l.until > Date.now()) return l;
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
    const err = await loginAdmin(email, password);
    setSubmitting(false);
    if (!err) {
      // Reset the streak AND persist it immediately — the component unmounts
      // right after setPage('admin'), which can skip the persistence effect and
      // leak old attempts into the next login session.
      const cleared: LockState = { attempts: 0, until: 0, lastFail: 0 };
      setLock(cleared);
      try { localStorage.setItem(LOCK_KEY, JSON.stringify(cleared)); } catch { /* storage unavailable */ }
      setPage('admin');
    } else {
      const next = lock.attempts + 1;
      if (next >= 2) {
        // 2nd failure -> 10s, 3rd -> 20s, 4th -> 30s, ...
        const secs = (next - 1) * 10;
        setLock({ attempts: next, until: Date.now() + secs * 1000, lastFail: Date.now() });
      } else {
        setLock({ attempts: next, until: 0, lastFail: Date.now() });
        setError(err);
      }
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-obsidian">
      <AdminLoginBackground />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={bustedImageSrc(siteSettings.logo || '/windows-h-logo.png')} alt="HSN Logo" className="w-16 h-16 rounded-3xl object-contain border border-gunmetal bg-obsidian/60 p-1.5 shadow-lg shadow-obsidian/60 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-ivory font-industrial">Admin Portal</h1>
          <p className="text-silver text-[11px] font-bold tracking-[0.18em] mt-1.5">HSN CEMENT & STEEL</p>
          <p className="text-silver text-xs mt-1">Authorized personnel only</p>
        </div>

        <div className="admin-login-card bg-charcoal/80 border border-gunmetal/80 rounded-[2rem] p-8 backdrop-blur-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-brand-500/10 border border-brand-500/30 text-brand-400 px-4 py-3 rounded-2xl text-xs font-bold text-center">
                {error}
              </div>
            )}
            {locked && (
              <div className="bg-brand-500/10 border border-brand-500/30 text-brand-300 px-4 py-3 rounded-2xl text-xs font-bold text-center space-y-1">
                <p className="flex items-center justify-center space-x-2">
                  <Timer className="w-4 h-4 animate-pulse" />
                  <span>Too many failed attempts. Try again in {remaining}s</span>
                </p>
                <p className="text-[10px] text-brand-400/80 font-semibold">Each further wrong attempt adds 10 seconds</p>
              </div>
            )}
            <div>
              <label className="text-xs font-bold text-silver block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-silver absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={locked}
                  placeholder="admin@hsncement.com"
                  className="w-full bg-obsidian border border-gunmetal text-ivory pl-10 pr-4 py-3 rounded-2xl text-sm focus:outline-none focus:border-brand-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-silver block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-silver absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={locked}
                  placeholder="Enter admin password"
                  className="w-full bg-obsidian border border-gunmetal text-ivory pl-10 pr-10 py-3 rounded-2xl text-sm focus:outline-none focus:border-brand-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-silver hover:text-ivory transition">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={locked}
              className="w-full btn-brand font-black py-3 rounded-2xl text-sm transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {locked ? `Locked — wait ${remaining}s` : submitting ? 'Verifying…' : 'Authenticate'}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-silver mt-4">
          This login uses Supabase Auth. The admin user must exist in Supabase → Authentication → Users, with Auto Confirm on.
        </p>
      </div>
      </div>
    </div>
  );
}
