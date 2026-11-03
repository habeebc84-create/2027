import { useApp } from '../context/AppContext';
import CursorRingField from './CursorRingField';

/**
 * Admin-portal-only background: the Cursor Ring Field.
 * Mounted once in App root like the old glow dots, but it renders
 * nothing on normal user pages (splash, gate, home, products, ...).
 * The field itself is transparent, so it sits over the admin pages'
 * own dark background without covering their content, and it never
 * captures pointer events. This replaces SiteCursorDots on admin
 * pages; that file is left in the repo unused for now.
 */
export default function AdminRingField() {
  const { currentPage } = useApp();
  const isAdminPage = currentPage === 'admin' || currentPage === 'admin-login';
  if (!isAdminPage) return null;
  return (
    <div className="admin-ring-field" aria-hidden="true">
      <CursorRingField
        background="transparent"
        colors={['#C6A875', '#F7F5F0', '#C2C1BD']}
        style={{ minWidth: 0, minHeight: 0 }}
      />
    </div>
  );
}
