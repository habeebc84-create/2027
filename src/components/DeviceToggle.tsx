import { motion, AnimatePresence } from 'framer-motion';

type DeviceMode = 'auto' | 'mobile' | 'desktop';

interface DeviceToggleProps {
  mode: DeviceMode;
  onToggle: (mode: DeviceMode) => void;
}

const DeviceToggle = ({ mode, onToggle }: DeviceToggleProps) => {
  const devices: { mode: DeviceMode; label: string; icon: React.ReactNode }[] = [
    {
      mode: 'auto',
      label: 'Auto',
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="4" ry="4" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
      ),
    },
    {
      mode: 'mobile',
      label: 'Mobile',
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
          <path d="M17 14V4a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2z" />
          <path d="M12 14v-2m0 4h.01" />
        </svg>
      ),
    },
    {
      mode: 'desktop',
      label: 'Desktop',
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ),
    },
  ];

  return (
    <div
      className="inline-flex rounded-full border border-white/20 bg-white/10 px-1.5 py-1 shadow-lg backdrop-blur-md"
      role="tablist"
      aria-label="Device mode"
    >
      {devices.map((device) => {
        const active = mode === device.mode;
        return (
          <button
            key={device.mode}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={device.label}
            onClick={() => onToggle(device.mode)}
            className={`relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
              active
                ? 'bg-white/20 text-white shadow-inner'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="relative">
              {device.icon}
              {active && (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full bg-white/10"
                  style={{ animation: 'pulse-dot 1.6s ease-in-out infinite' }}
                />
              )}
            </span>
            <span className="tracking-wide">{device.label}</span>
            <AnimatePresence>
              {active && (
                <motion.span
                  layoutId="device-check"
                  className="ml-0.5 text-blue-500"
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.4 }}
                  transition={{ duration: 0.15 }}
                >
                  ✓
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        );
      })}
    </div>
  );
};

export default DeviceToggle;
