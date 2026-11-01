/**
 * Decorative admin-login atmosphere. The interactive dot field is rendered
 * once for the whole app by SiteCursorDots; this layer only adds the soft
 * champagne orbs and vignette behind the login card.
 */
export default function AdminLoginBackground() {
  return (
    <div className="admin-login-bg" aria-hidden="true">
      <div className="admin-login-orb admin-login-orb-a" />
      <div className="admin-login-orb admin-login-orb-b" />
      <div className="admin-login-orb admin-login-orb-c" />
      <div className="admin-login-vignette" />
    </div>
  );
}
