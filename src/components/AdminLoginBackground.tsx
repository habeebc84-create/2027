import CursorRingField from './originkit/CursorRingField';

/**
 * Decorative admin-login atmosphere. The interactive dot field is rendered
 * once for the whole app by SiteCursorDots; this layer adds the champagne
 * cursor-ring field behind the soft orbs and vignette.
 */
export default function AdminLoginBackground() {
  return (
    <div className="admin-login-bg" aria-hidden="true">
      <div className="absolute inset-0">
        <CursorRingField
          background="transparent"
          colors={['#C6A875', '#F7F5F0', '#0B0C0E']}
          density={220}
          dotSize={90}
          speed={4}
          cameraDistance={160}
          ring={{ radius: 14, width: 10, push: 0, turbulence: 0 }}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        />
      </div>
      <div className="admin-login-orb admin-login-orb-a" />
      <div className="admin-login-orb admin-login-orb-b" />
      <div className="admin-login-orb admin-login-orb-c" />
      <div className="admin-login-vignette" />
    </div>
  );
}
