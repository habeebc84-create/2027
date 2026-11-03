import CursorRingField from './originkit/CursorRingField';

/**
 * Decorative admin-dashboard atmosphere: the same champagne cursor-ring field
 * used behind the login card, kept subtle so the data tables stay readable.
 */
export default function AdminDashboardBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <CursorRingField
        background="transparent"
        colors={['#C6A875', '#F7F5F0', '#0B0C0E']}
        density={180}
        dotSize={80}
        speed={3}
        cameraDistance={160}
        ring={{ radius: 14, width: 10, push: 0, turbulence: 0 }}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />
    </div>
  );
}
