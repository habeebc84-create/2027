import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import ToastContainer from './components/Toast';
import NotificationPopup from './components/NotificationPopup';
import FloatingButtons from './components/FloatingButtons';
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
  if (path === '/manage-portal-9f3a') return { page: isAdmin ? 'admin' : 'admin-login' };
  if (path.startsWith('/product/')) return { page: 'product-detail' };
  if (path.startsWith('/order-success/')) return { page: 'order-success', orderId: path.replace('/order-success/', '') };
  if (path.startsWith('/track-order/')) return { page: 'order-tracking', orderId: path.replace('/track-order/', '') };
  const routeMap: Record<string, Page> = {
    '/': 'home', '/splash': 'splash', '/products': 'products', '/services': 'services',
    '/gallery': 'gallery', '/about': 'about', '/contact': 'contact',
    '/checkout': 'checkout', '/terms': 'terms', '/track-order': 'order-tracking',
  };
  return { page: routeMap[path] || 'home' };
}

function AppContent() {
  const { currentPage, splashDismissed, isAdmin, setPage, setSelectedProductId, dismissSplash } = useApp();
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

    const result = getPageFromPath(path, isAdmin);
    if (result.page === 'product-detail') {
      const productId = path.replace('/product/', '');
      setSelectedProductId(productId);
      setPage('product-detail');
    } else if (result.page === 'order-success' && result.orderId) {
      setSuccessOrderId(result.orderId);
      setPage('order-success');
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
      } else if (result.page === 'order-success' && result.orderId) {
        setSuccessOrderId(result.orderId);
      }
      setPage(result.page);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAdmin, setPage, setSelectedProductId]);

  const isLoginPage = window.location.pathname === '/manage-portal-9f3a';
  if (!splashDismissed && !isLoginPage) return <Splash />;

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
      case 'checkout': return <Checkout onBackToCart={() => setCartOpen(true)} onOrderSuccess={(id) => { setSuccessOrderId(id); setPage('order-success'); }} />;
      case 'order-success': return <OrderSuccess orderId={successOrderId || ''} />;
      case 'order-tracking': return <OrderTracking />;
      case 'admin-login': return <AdminLogin />;
      case 'admin': return isAdmin ? <AdminDashboard /> : <AdminLogin />;
      case 'terms': return <Terms />;
      default: return <Home />;
    }
  };

  const hideNavPages: Page[] = ['checkout', 'admin-login', 'admin', 'product-detail', 'order-success', 'welcome-gate', 'splash'];
  const showNav = !hideNavPages.includes(currentPage);

  return (
    <div className="min-h-screen">
      {showNav && <Navbar onCartClick={() => setCartOpen(true)} />}
      <div className={showNav ? 'pt-[64px]' : ''}>
        {renderPage()}
      </div>
      {showNav && <Footer />}
      {showNav && <FloatingButtons />}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} onProceedToCheckout={() => { setCartOpen(false); setPage('checkout'); }} />
      <ToastContainer />
      {!isAdmin && <NotificationPopup />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
