import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import ToastContainer from './components/Toast';
import NotificationPopup from './components/NotificationPopup';
import FloatingButtons from './components/FloatingButtons';
import FloatingBottomNav from './components/FloatingBottomNav';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Services from './pages/Services';
import Gallery from './pages/Gallery';
import About from './pages/About';
import Contact from './pages/Contact';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import OrderTracking from './pages/OrderTracking';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Terms from './pages/Terms';
import WelcomeGate from './pages/WelcomeGate';
import Splash from './components/Splash';
import type { Page } from './types';

function getPageFromPath(path: string, isAdmin: boolean): { page: Page; orderId?: string } {
  // Normalise scanner-app quirks: trailing slashes and URL-encoded IDs.
  const clean = path.replace(/\/+$/, '');
  const decode = (s: string) => { try { return decodeURIComponent(s); } catch { return s; } };
  if (clean === '/manage-portal-9f3a') return { page: isAdmin ? 'admin' : 'admin-login' };
  if (clean.startsWith('/product/')) return { page: 'product-detail' };
  if (clean.startsWith('/order-success/')) return { page: 'order-success', orderId: decode(clean.replace('/order-success/', '')) };
  if (clean.startsWith('/track-order/')) return { page: 'order-tracking', orderId: decode(clean.replace('/track-order/', '')) };
  const routeMap: Record<string, Page> = {
    '/': 'home', '/splash': 'splash', '/products': 'products', '/services': 'services',
    '/gallery': 'gallery', '/about': 'about', '/contact': 'contact',
    '/checkout': 'checkout', '/terms': 'terms', '/track-order': 'order-tracking',
  };
  return { page: routeMap[clean] || routeMap[path] || 'home' };
}

// QR scans and shared invoice links (/track-order/<id>, /order-success/<id>,
// legacy ?track=<id>) must open the order page immediately — never gated
// behind the splash screen.
function isOrderDeepLink(): boolean {
  if (new URLSearchParams(window.location.search).has('track')) return true;
  return /^\/(track-order|order-success)\/.+/.test(window.location.pathname);
}


// If one page component throws, React would otherwise unmount the whole
// app and leave a blank screen. Catch it here so the user sees a recovery
// screen (and can go home) instead of nothing.
class PageErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) {
      return (
        <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24, textAlign: 'center' }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>Something went wrong on this page</h1>
          <p style={{ color: '#94a3b8', maxWidth: 420 }}>The page could not be shown. Your cart and orders are safe — go back to the home page or reload.</p>
          <button type="button" onClick={() => { this.setState({ failed: false }); window.location.href = '/'; }} style={{ background: '#f59e0b', color: '#000', fontWeight: 800, padding: '12px 24px', borderRadius: 12, border: 'none', cursor: 'pointer' }}>
            Go to Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const { currentPage, splashDismissed, isAdmin, setPage, setSelectedProductId, trackingOrderId, dismissSplash } = useApp();
  const [cartOpen, setCartOpen] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const path = window.location.pathname;

    // If coming from HTML splash page with ?entered=1, auto-dismiss React splash and clean URL
    if (params.get('entered') === '1' && !splashDismissed) {
      dismissSplash();
      window.history.replaceState({}, '', window.location.pathname);
    }

    // QR deep link (?track=<orderId>): open that order's tracking directly,
    // then upgrade the URL to the pretty path.
    const trackParam = params.get('track');
    if (trackParam) {
      dismissSplash(); // skip the splash gate — QR scans land straight on tracking
      setPage('order-tracking', trackParam);
      window.history.replaceState({}, '', `/track-order/${encodeURIComponent(trackParam)}`);
      return;
    }

    const result = getPageFromPath(path, isAdmin);
    if (result.page === 'product-detail') {
      const productId = path.replace('/product/', '');
      setSelectedProductId(productId);
      setPage('product-detail');
    } else if (result.page === 'order-success' && result.orderId) {
      dismissSplash(); // QR scans land straight on the order page
      setSuccessOrderId(result.orderId);
      setPage('order-success', result.orderId);
    } else if (result.page === 'order-tracking') {
      if (result.orderId) dismissSplash(); // QR scans land straight on tracking
      setPage('order-tracking', result.orderId);
    } else if (path !== '/') {
      setPage(result.page);
    }
  }, []); // eslint-disable-line

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const result = getPageFromPath(path, isAdmin);
      if (result.page === 'product-detail') {
        const productId = path.replace('/product/', '');
        setSelectedProductId(productId);
        setPage('product-detail');
      } else if (result.page === 'order-success' && result.orderId) {
        setSuccessOrderId(result.orderId);
        setPage('order-success', result.orderId);
      } else if (result.page === 'order-tracking') {
        // Passes undefined on plain /track-order so a stale QR order is cleared.
        setPage('order-tracking', result.orderId);
      } else {
        setPage(result.page);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAdmin, setPage, setSelectedProductId]);

  const isLoginPage = window.location.pathname === '/manage-portal-9f3a';
  // First paint on a QR deep link skips the splash gate; the mount effect
  // persists the dismissal so navigating away never re-shows it either.
  const deepLink = !isLoginPage && isOrderDeepLink();
  if (!splashDismissed && !isLoginPage && !deepLink) return <Splash />;

  const renderPage = () => {
    switch (currentPage) {
      case 'splash': return <Splash />;
      case 'welcome-gate': return <WelcomeGate onContinue={() => setPage('home')} onShopCategory={(cat) => { setPage('products'); }} />;
      case 'home': return <Home />;
      case 'products': return <Products />;
      case 'product-detail': return <ProductDetail />;
      case 'services': return <Services />;
      case 'gallery': return <Gallery />;
      case 'about': return <About />;
      case 'contact': return <Contact />;
      case 'checkout': return <Checkout onBackToCart={() => setCartOpen(true)} onOrderSuccess={(id) => { setSuccessOrderId(id); setPage('order-success', id); }} />;
      case 'order-success': return <OrderSuccess orderId={successOrderId || ''} />;
      case 'order-tracking': return <OrderTracking key={trackingOrderId || 'manual'} initialOrderId={trackingOrderId} />;
      case 'admin-login': return <AdminLogin />;
      case 'admin': return isAdmin ? <AdminDashboard /> : <AdminLogin />;
      case 'terms': return <Terms />;
      default: return <Home />;
    }
  };

  const hideNavPages: Page[] = ['checkout', 'admin-login', 'admin', 'product-detail', 'order-success', 'welcome-gate', 'splash'];
  const showNav = !hideNavPages.includes(currentPage);
  // Laptop (>=1024px): the top bar carries the navigation on every nav
  // page, so the bottom dock is not needed there. Phone/tablet: the top
  // bar stays home-only and the dock carries the navigation, as before.
  const [isLaptop, setIsLaptop] = useState(() => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const update = () => setIsLaptop(mq.matches);
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  const showTopBar = currentPage === 'home' || (isLaptop && showNav);

  return (
    <div className="min-h-screen">
      {showTopBar && <Navbar onCartClick={() => setCartOpen(true)} />}
      <div className={showTopBar ? 'pt-[92px]' : ''}>
        <PageErrorBoundary key={currentPage}>{renderPage()}</PageErrorBoundary>
      </div>
      {showNav && <Footer />}
      {showNav && <FloatingButtons />}
      {showNav && !cartOpen && <div className="lg:hidden"><ScrollAwareBottomNav /></div>}  {/* dock: phone/tablet only; laptop uses the merged top bar */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} onProceedToCheckout={() => { setCartOpen(false); setPage('checkout'); }} />
      <ToastContainer />
      {!isAdmin && <NotificationPopup />}
    </div>
  );
}

function ScrollAwareBottomNav() {
  // Apple-style bottom bar, shown on every screen size (phone, tablet
  // and desktop). It hides while scrolling down so page content stays
  // unobstructed, and comes back once scrolling stops — like a native
  // app bar.
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let rafId: number | null = null;
    let lastY = window.scrollY;
    let scrollTimer: ReturnType<typeof setTimeout> | null = null;

    const handleScroll = () => {
      const y = window.scrollY;

      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        rafId = null;
        lastY = window.scrollY;
      });

      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        // Scrolling has effectively stopped.
        setVisible(true);
      }, 150);

      // Hide while moving downward; keep hidden if already hidden and the
      // user keeps moving downward.
      if (y > 4 && y > lastY) {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimer) clearTimeout(scrollTimer);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <FloatingBottomNav visible={visible} />
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
