import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Package, Wrench, Images, Info, MessageCircle, PackageCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Page } from '../types';

type NavItem = {
  label: string;
  page: Page;
  path: string;
  Icon: typeof Package;
};

// Exactly the six destinations requested — do not rename or replace.
const NAV_ITEMS: NavItem[] = [
  { label: 'Products', page: 'products', path: '/products', Icon: Package },
  { label: 'Services', page: 'services', path: '/services', Icon: Wrench },
  { label: 'Gallery', page: 'gallery', path: '/gallery', Icon: Images },
  { label: 'About Us', page: 'about', path: '/about', Icon: Info },
  { label: 'Contact', page: 'contact', path: '/contact', Icon: MessageCircle },
  { label: 'Track Order', page: 'order-tracking', path: '/track-order', Icon: PackageCheck },
];

export default function FloatingBottomNav() {
  const { currentPage, setPage } = useApp();
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const activeIndex = NAV_ITEMS.findIndex((item) => item.page === currentPage);

  // Measure the active item so the pill can glide between items.
  const measure = () => {
    const el = activeIndex >= 0 ? itemRefs.current[activeIndex] : null;
    if (!el) {
      setIndicator(null);
      return;
    }
    setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  };

  useLayoutEffect(measure, [activeIndex, currentPage]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    window.addEventListener('resize', measure);
    // Fonts can settle after first paint and nudge label widths.
    const t = setTimeout(measure, 300);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  // Subtle background-opacity adjustment while scrolling.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (e: React.MouseEvent, page: Page) => {
    e.preventDefault();
    setPage(page);
  };

  return (
    <nav aria-label="Primary" className={`floating-bottom-nav ${scrolled ? 'is-scrolled' : ''}`}>
      <ul ref={listRef} className="floating-bottom-nav-list">
        {indicator && (
          <span
            aria-hidden="true"
            className="floating-bottom-nav-indicator"
            style={{ transform: `translateX(${indicator.left}px)`, width: indicator.width }}
          />
        )}
        {NAV_ITEMS.map((item, i) => {
          const isActive = i === activeIndex;
          return (
            <li key={item.page} className="floating-bottom-nav-item">
              <a
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                href={item.path}
                onClick={(e) => handleNav(e, item.page)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
                className={`floating-bottom-nav-link ${isActive ? 'is-active' : ''}`}
              >
                <item.Icon className="floating-bottom-nav-icon" strokeWidth={1.75} aria-hidden="true" />
                <span className="floating-bottom-nav-label">{item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
