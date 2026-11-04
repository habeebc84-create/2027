/**
 * Decorative admin-portal atmosphere: a still cement/charcoal slab.
 * The old champagne orbs and the outer vignette were light effects, so
 * they are gone — this layer is only the concrete texture, one matte
 * seam and a grain wash. No animation, no glow, and it never captures
 * pointer events.
 */
export default function AdminLoginBackground() {
  return (
    <div className="admin-login-bg" aria-hidden="true">
      <div className="admin-cement-seam" />
      <div className="admin-cement-grain" />
    </div>
  );
}
