import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { BarChart3, Package, ShoppingCart, Users, Settings, LogOut, TrendingUp, Edit, Trash2, Plus, Bell, FileText, Truck, Menu, Clock, Search, Filter, Globe, Lock, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { AdminPage, Product, Category, ContentBlock, OrderStatus, Notification, Achievement } from '../types';
import { ORDER_STATUSES } from '../types';
import { bustedImageSrc, compressImageFile } from '../lib/images';
import { changeAdminAuthPassword } from '../lib/adminAuth';
import { splitLaunchDateTime, joinLaunchDateTime } from '../lib/launch';

export default function AdminDashboard() {
  const ctx = useApp();
  const { logoutAdmin, products, orders, customers, deleteCustomer, categories, updateCategory, transportZones, contentBlocks, notifications, termsContent, siteSettings, updateSiteSettings, siteContent, updateSiteContent, updateOrderStatus, deleteOrder, deleteProduct, updateProduct, toggleProduct, deleteCategory, deleteTransportZone, deleteContentBlock, updateTermsContent, setPage, setAdminPage, adminPage, achievements, deleteAchievement, setOrderFinalDeliveryCharge, launchingSoon, setLaunchingSoon, launchDateTime, setLaunchDateTime } = ctx;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const totalRevenue = orders.reduce((a, o) => a + o.total, 0);
  const pendingOrders = orders.filter(o => ['placed', 'confirmed', 'processing', 'ready_dispatch'].includes(o.status));
  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  const unreadNotifs = notifications.filter(n => !n.read).length;

  const navItems: { id: AdminPage; label: string; icon: LucideIcon; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: Filter },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, badge: pendingOrders.length },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'content', label: 'Content & Ads', icon: Edit },
    { id: 'transport', label: 'Transport Fares', icon: Truck },
    { id: 'prices', label: 'Market Prices', icon: TrendingUp },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifs },
    { id: 'terms', label: 'Terms & Conditions', icon: FileText },
    { id: 'security', label: 'Security & Settings', icon: Settings },
  ];

  const Sidebar = () => (
    <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-obsidian/95 backdrop-blur-xl border-r border-gunmetal flex flex-col transition-transform shadow-2xl shadow-obsidian/60 lg:inset-y-4 lg:left-4 lg:rounded-3xl lg:border ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
      <div className="p-5 border-b border-gunmetal">
        <div className="flex items-center space-x-3">
          <img src={bustedImageSrc('/windows-h-logo.png')} alt="Logo" className="w-10 h-10 rounded-2xl border border-gunmetal bg-charcoal p-1" />
          <div>
            <div className="text-sm font-black text-ivory font-industrial">HSN COMMAND CENTER</div>
            <div className="text-[9px] text-silver font-bold uppercase tracking-wider">Admin Portal</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <button key={item.id} onClick={() => { setAdminPage(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold transition ${adminPage === item.id ? 'bg-gradient-to-r from-brand-500/20 to-brand-500/20 text-ivory border border-brand-500/30' : 'text-silver hover:text-ivory hover:bg-charcoal border border-transparent'}`}>
              <Icon className="w-4 h-4" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && <span className="btn-brand text-[9px] px-1.5 py-0.5 rounded-full">{item.badge}</span>}
            </button>
          );
        })}
      </nav>
      <div className="p-3 border-t border-gunmetal">
        <button onClick={() => { logoutAdmin(); setPage('home'); }} className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold text-brand-400 hover:text-brand-300 hover:bg-brand-500/10 transition">
          <LogOut className="w-4 h-4" /><span>Secure Logout</span>
        </button>
      </div>
    </aside>
  );

  const TopHeader = ({ title }: { title: string }) => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-3">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-xl bg-charcoal border border-gunmetal text-ivory"><Menu className="w-5 h-5" /></button>
        <h2 className="text-lg font-black text-ivory font-industrial">{title}</h2>
      </div>
      <div className="flex items-center space-x-3">
        <button className="hidden sm:flex items-center space-x-2 bg-charcoal border border-gunmetal text-silver px-3 py-2 rounded-2xl text-xs font-bold hover:bg-white/10 transition">
          <Globe className="w-3.5 h-3.5" /><span>Sync Database</span>
        </button>
        <div className="flex items-center space-x-2 bg-charcoal border border-gunmetal px-3 py-2 rounded-2xl">
          <div className="w-2 h-2 bg-brand-400 rounded-full animate-pulse" />
          <span className="text-xs font-bold text-silver">Admin Online</span>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (adminPage) {
      case 'overview': return <OverviewSection />;
      case 'analytics': return <AnalyticsSection />;
      case 'products': return <ProductsSection />;
      case 'categories': return <CategoriesSection />;
      case 'orders': return <OrdersSection />;
      case 'customers': return <CustomersSection />;
      case 'content': return <ContentSection />;
      case 'transport': return <TransportSection />;
      case 'prices': return <PricesSection />;
      case 'notifications': return <NotificationsSection />;
      case 'terms': return <TermsSection />;
      case 'security': return <SecuritySection />;
      default: return <OverviewSection />;
    }
  };

  // OVERVIEW
  const OverviewSection = () => (
    <div className="space-y-6">
      <TopHeader title="Overview" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `Rs.${totalRevenue.toLocaleString('en-IN')}`, sub: 'Live Tracking', icon: TrendingUp, color: 'from-brand-500 to-brand-600', trend: true },
          { label: 'Total Orders', value: orders.length, sub: `${orders.filter(o => new Date(o.date).toDateString() === new Date().toDateString()).length} Orders Today`, icon: ShoppingCart, color: 'from-brand-500 to-brand-600' },
          { label: 'Pending Dispatch', value: pendingOrders.length, sub: 'Requires Action', icon: Clock, color: 'from-brand-500 to-brand-600' },
          { label: 'Delivered', value: deliveredOrders.length, sub: `${orders.filter(o => o.status === 'cancelled').length} Cancelled`, icon: CheckCircle, color: 'from-success to-success' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-charcoal border border-gunmetal rounded-3xl p-5 hover:border-brand-500/30 transition">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}><Icon className={`w-5 h-5 ${stat.label === 'Delivered' ? 'text-ivory' : 'text-obsidian'}`} /></div>
                {stat.trend && <span className="text-[10px] font-bold text-brand-400 bg-brand-500/15 px-2 py-0.5 rounded-full">↗ Live</span>}
              </div>
              <div className="text-2xl font-black text-ivory">{stat.value}</div>
              <div className="text-[10px] text-silver mt-1">{stat.sub}</div>
            </div>
          );
        })}
      </div>
      <div className="bg-charcoal border border-gunmetal rounded-3xl p-6">
        <h3 className="text-sm font-bold text-ivory mb-4">Recent Orders</h3>
        {orders.length === 0 ? <p className="text-xs text-silver text-center py-8">No orders yet</p> : (
          <div className="space-y-3">
            {orders.slice(0, 5).map(o => (
              <div key={o.id} className="flex items-center justify-between bg-charcoal/50 p-3 rounded-2xl border border-gunmetal">
                <div>
                  <div className="text-xs font-bold text-ivory">{o.orderId} - {o.customer.name}</div>
                  <div className="text-[10px] text-silver">{o.customer.mobile} | {new Date(o.date).toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-ivory">Rs.{o.total.toLocaleString('en-IN')}</div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ORDER_STATUSES.find(s => s.key === o.status)?.color || ''}`}>{ORDER_STATUSES.find(s => s.key === o.status)?.label || o.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // ANALYTICS
  const AnalyticsSection = () => {
    const now = new Date();
    const today = orders.filter(o => new Date(o.date).toDateString() === now.toDateString());
    const thisWeek = orders.filter(o => { const d = new Date(o.date); const diff = (now.getTime() - d.getTime()) / 86400000; return diff <= 7; });
    const thisMonth = orders.filter(o => new Date(o.date).getMonth() === now.getMonth() && new Date(o.date).getFullYear() === now.getFullYear());
    // Top sellers computed from real order lines (units sold), not stock levels.
    const unitsByProduct = orders.flatMap(o => o.items.map(i => [i.product.name, i.quantity] as const))
      .reduce((acc, [name, qty]) => { acc[name] = (acc[name] || 0) + qty; return acc; }, {} as Record<string, number>);
    const bestSelling = Object.entries(unitsByProduct).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const lowStock = products.filter(p => p.stock < 50 && p.enabled);

    return (
      <div className="space-y-6">
        <TopHeader title="Analytics" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Today', revenue: today.reduce((a, o) => a + o.total, 0), orders: today.length },
            { label: 'This Week', revenue: thisWeek.reduce((a, o) => a + o.total, 0), orders: thisWeek.length },
            { label: 'This Month', revenue: thisMonth.reduce((a, o) => a + o.total, 0), orders: thisMonth.length },
          ].map((period, i) => (
            <div key={i} className="bg-charcoal border border-gunmetal rounded-3xl p-5">
              <div className="text-xs font-bold text-silver mb-2">{period.label}</div>
              <div className="text-xl font-black text-ivory">Rs.{period.revenue.toLocaleString('en-IN')}</div>
              <div className="text-[10px] text-silver mt-1">{period.orders} orders</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-charcoal border border-gunmetal rounded-3xl p-6">
            <h3 className="text-sm font-bold text-ivory mb-4">Order Status Breakdown</h3>
            {ORDER_STATUSES.map(s => {
              const count = orders.filter(o => o.status === s.key).length;
              const pct = orders.length > 0 ? (count / orders.length * 100) : 0;
              return (
                <div key={s.key} className="flex items-center justify-between py-2">
                  <span className="text-xs text-silver">{s.label}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 h-1.5 bg-charcoal rounded-full overflow-hidden"><div className="h-full bg-brand-500 rounded-full" style={{ width: `${pct}%` }} /></div>
                    <span className="text-xs font-bold text-ivory w-6 text-right">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="bg-charcoal border border-gunmetal rounded-3xl p-6">
            <h3 className="text-sm font-bold text-ivory mb-4">Low Stock Alert</h3>
            {lowStock.length === 0 ? <p className="text-xs text-silver text-center py-8">All products well stocked</p> : (
              <div className="space-y-3">
                {lowStock.map(p => (
                  <div key={p.id} className="flex items-center justify-between bg-brand-500/5 border border-brand-500/20 p-3 rounded-2xl">
                    <div className="flex items-center space-x-3">
                      <img src={p.image} alt="" className="w-8 h-8 rounded-xl object-cover" />
                      <div>
                        <div className="text-xs font-bold text-ivory line-clamp-1">{p.name}</div>
                        <div className="text-[10px] text-silver">{p.brand}</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-brand-400">{p.stock} left</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-charcoal border border-gunmetal rounded-3xl p-6 lg:col-span-2">
            <h3 className="text-sm font-bold text-ivory mb-4">Top Selling Products — Units Sold</h3>
            {bestSelling.length === 0 ? <p className="text-xs text-silver text-center py-8">No sales recorded yet</p> : (
              <div className="space-y-3">
                {bestSelling.map(([name, units], i) => {
                  const maxUnits = bestSelling[0][1] || 1;
                  return (
                    <div key={name} className="flex items-center space-x-3">
                      <span className="w-5 h-5 rounded-xl bg-brand text-[9px] font-black text-obsidian flex items-center justify-center shrink-0">{i + 1}</span>
                      <span className="w-36 sm:w-44 text-xs font-bold text-ivory line-clamp-1">{name}</span>
                      <div className="flex-1 h-3 bg-charcoal rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-brand-500 to-brand-500 rounded-full transition-all" style={{ width: `${(units / maxUnits) * 100}%` }} />
                      </div>
                      <span className="text-xs font-black text-ivory w-16 text-right">{units} units</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };  // PRODUCTS
  const ProductsSection = () => {
    const [search, setSearch] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editProd, setEditProd] = useState({ name: '', category: '', brand: '', price: 0, stock: 0, description: '', grade: '', unit: '', image: '' });
    const [newProd, setNewProd] = useState({ name: '', category: categories[0]?.name || '', brand: '', price: 0, stock: 0, description: '', grade: '', type: 'general', image: '' });
    const filtered = products.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase()));

    const handleAdd = () => {
      if (!newProd.name || !newProd.brand) return;
      const prod: Product = {
        id: `prod-${Date.now()}`, ...newProd, image: newProd.image || '/cement_banner_new.png', featured: false, enabled: true,
      };
      ctx.addProduct(prod);
      setNewProd({ name: '', category: categories[0]?.name || '', brand: '', price: 0, stock: 0, description: '', grade: '', type: 'general', image: '' });
      setShowAdd(false);
    };

    const startEdit = (p: Product) => {
      setEditingId(p.id);
      setEditProd({ name: p.name, category: p.category, brand: p.brand, price: p.price, stock: p.stock, description: p.description || '', grade: p.grade || '', unit: p.unit || '', image: p.image || '' });
    };

    const saveEdit = () => {
      if (!editingId) return;
      updateProduct(editingId, editProd);
      setEditingId(null);
    };

    return (
      <div className="space-y-6">
        <TopHeader title="Products" />
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-silver absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
              className="w-full bg-charcoal/50 border border-gunmetal/50 text-ivory pl-10 pr-4 py-2.5 rounded-2xl text-xs focus:outline-none focus:border-brand-500" />
          </div>
          <button onClick={() => { setShowAdd(!showAdd); setEditingId(null); }} className="flex items-center space-x-2 btn-brand px-4 py-2.5 rounded-2xl text-xs font-bold">
            <Plus className="w-3.5 h-3.5" /><span>Add Product</span>
          </button>
        </div>

        {showAdd && (
          <div className="bg-charcoal border border-brand-500/30 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-ivory">Add New Product</h3>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Product Name" value={newProd.name} onChange={e => setNewProd({ ...newProd, name: e.target.value })} className="bg-charcoal border border-gunmetal text-ivory px-3 py-2.5 rounded-2xl text-xs focus:outline-none focus:border-brand-500" />
              <select value={newProd.category} onChange={e => setNewProd({ ...newProd, category: e.target.value })} className="bg-charcoal border border-gunmetal text-ivory px-3 py-2.5 rounded-2xl text-xs focus:outline-none focus:border-brand-500">
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
              <input type="text" placeholder="Brand" value={newProd.brand} onChange={e => setNewProd({ ...newProd, brand: e.target.value })} className="bg-charcoal border border-gunmetal text-ivory px-3 py-2.5 rounded-2xl text-xs focus:outline-none focus:border-brand-500" />
              <input type="number" placeholder="Price" value={newProd.price || ''} onChange={e => setNewProd({ ...newProd, price: Number(e.target.value) })} className="bg-charcoal border border-gunmetal text-ivory px-3 py-2.5 rounded-2xl text-xs focus:outline-none focus:border-brand-500" />
              <input type="number" placeholder="Stock" value={newProd.stock || ''} onChange={e => setNewProd({ ...newProd, stock: Number(e.target.value) })} className="bg-charcoal border border-gunmetal text-ivory px-3 py-2.5 rounded-2xl text-xs focus:outline-none focus:border-brand-500" />
              <input type="text" placeholder="Grade" value={newProd.grade} onChange={e => setNewProd({ ...newProd, grade: e.target.value })} className="bg-charcoal border border-gunmetal text-ivory px-3 py-2.5 rounded-2xl text-xs focus:outline-none focus:border-brand-500" />
            </div>
            <textarea placeholder="Description" value={newProd.description} onChange={e => setNewProd({ ...newProd, description: e.target.value })} rows={2} className="w-full bg-charcoal border border-gunmetal text-ivory px-3 py-2.5 rounded-2xl text-xs focus:outline-none focus:border-brand-500 resize-none" />
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-xs font-bold text-silver mb-1">Product Image</label>
                <label className="block cursor-pointer bg-charcoal hover:bg-charcoal border border-dashed border-gunmetal hover:border-brand-500 rounded-2xl px-4 py-3 text-center transition">
                  <span className="text-xs font-bold text-silver flex items-center justify-center space-x-2"><ImageIcon className="w-4 h-4" /><span>{newProd.image ? 'Change Image' : 'Upload Image'}</span></span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => { setNewProd({ ...newProd, image: ev.target?.result as string }); };
                    reader.readAsDataURL(file);
                  }} />
                </label>
                {newProd.image && <img src={newProd.image} alt="Preview" className="w-16 h-16 object-cover rounded-xl mt-2 border border-gunmetal" />}
              </div>
            </div>
            <div className="flex space-x-3">
              <button onClick={handleAdd} className="btn-brand px-4 py-2 rounded-2xl text-xs font-bold">Save Product</button>
              <button onClick={() => setShowAdd(false)} className="bg-charcoal text-silver px-4 py-2 rounded-2xl text-xs font-bold">Cancel</button>
            </div>
          </div>
        )}

        {editingId && (
          <div className="bg-charcoal border border-brand-500/30 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-ivory">Edit Product</h3>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Product Name" value={editProd.name} onChange={e => setEditProd({ ...editProd, name: e.target.value })} className="bg-charcoal border border-gunmetal text-ivory px-3 py-2.5 rounded-2xl text-xs focus:outline-none focus:border-brand-500" />
              <select value={editProd.category} onChange={e => setEditProd({ ...editProd, category: e.target.value })} className="bg-charcoal border border-gunmetal text-ivory px-3 py-2.5 rounded-2xl text-xs focus:outline-none focus:border-brand-500">
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
              <input type="text" placeholder="Brand" value={editProd.brand} onChange={e => setEditProd({ ...editProd, brand: e.target.value })} className="bg-charcoal border border-gunmetal text-ivory px-3 py-2.5 rounded-2xl text-xs focus:outline-none focus:border-brand-500" />
              <input type="text" placeholder="Unit" value={editProd.unit} onChange={e => setEditProd({ ...editProd, unit: e.target.value })} className="bg-charcoal border border-gunmetal text-ivory px-3 py-2.5 rounded-2xl text-xs focus:outline-none focus:border-brand-500" />
              <input type="number" placeholder="Price (Rs.)" value={editProd.price || ''} onChange={e => setEditProd({ ...editProd, price: Number(e.target.value) })} className="bg-charcoal border border-gunmetal text-ivory px-3 py-2.5 rounded-2xl text-xs focus:outline-none focus:border-brand-500" />
              <input type="number" placeholder="Stock" value={editProd.stock || ''} onChange={e => setEditProd({ ...editProd, stock: Number(e.target.value) })} className="bg-charcoal border border-gunmetal text-ivory px-3 py-2.5 rounded-2xl text-xs focus:outline-none focus:border-brand-500" />
              <input type="text" placeholder="Grade" value={editProd.grade} onChange={e => setEditProd({ ...editProd, grade: e.target.value })} className="bg-charcoal border border-gunmetal text-ivory px-3 py-2.5 rounded-2xl text-xs focus:outline-none focus:border-brand-500" />
            </div>
            <textarea placeholder="Description" value={editProd.description} onChange={e => setEditProd({ ...editProd, description: e.target.value })} rows={3} className="w-full bg-charcoal border border-gunmetal text-ivory px-3 py-2.5 rounded-2xl text-xs focus:outline-none focus:border-brand-500 resize-none" />
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-xs font-bold text-silver mb-1">Product Image</label>
                <label className="block cursor-pointer bg-charcoal hover:bg-charcoal border border-dashed border-gunmetal hover:border-brand-500 rounded-2xl px-4 py-3 text-center transition">
                  <span className="text-xs font-bold text-silver flex items-center justify-center space-x-2"><ImageIcon className="w-4 h-4" /><span>{editProd.image ? 'Change Image' : 'Upload Image'}</span></span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => { setEditProd({ ...editProd, image: ev.target?.result as string }); };
                    reader.readAsDataURL(file);
                  }} />
                </label>
                {editProd.image && <img src={editProd.image} alt="Preview" className="w-16 h-16 object-cover rounded-xl mt-2 border border-gunmetal" />}
              </div>
            </div>
            <div className="flex space-x-3">
              <button onClick={saveEdit} className="btn-brand px-4 py-2 rounded-2xl text-xs font-bold">Save Changes</button>
              <button onClick={() => setEditingId(null)} className="bg-charcoal text-silver px-4 py-2 rounded-2xl text-xs font-bold">Cancel</button>
            </div>
          </div>
        )}

        <div className="bg-charcoal border border-gunmetal rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-gunmetal">
                <th className="text-left px-4 py-3 text-silver font-bold">Product</th>
                <th className="text-left px-4 py-3 text-silver font-bold hidden sm:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-silver font-bold">Price</th>
                <th className="text-left px-4 py-3 text-silver font-bold">Stock</th>
                <th className="text-left px-4 py-3 text-silver font-bold">Status</th>
                <th className="text-left px-4 py-3 text-silver font-bold">Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-b border-gunmetal/50 hover:bg-charcoal">
                    <td className="px-4 py-3"><div className="flex items-center space-x-3"><img src={p.image} alt="" className="w-9 h-9 rounded-xl object-cover" /><div><div className="font-bold text-ivory line-clamp-1 max-w-[200px]">{p.name}</div><div className="text-[10px] text-silver">{p.brand}</div></div></div></td>
                    <td className="px-4 py-3 text-silver hidden sm:table-cell">{p.category}</td>
                    <td className="px-4 py-3 font-bold text-ivory">Rs.{p.price}</td>
                    <td className="px-4 py-3"><span className={`font-bold ${p.stock < 50 ? 'text-brand-400' : 'text-silver'}`}>{p.stock}</span></td>
                    <td className="px-4 py-3"><button onClick={() => toggleProduct(p.id)} className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition ${p.enabled ? 'bg-success/20 text-success-foreground border-success/40' : 'bg-gunmetal/40 text-silver border-gunmetal'}`}>{p.enabled ? 'Active' : 'Off'}</button></td>
                    <td className="px-4 py-3"><div className="flex items-center space-x-2"><button onClick={() => startEdit(p)} className="text-silver hover:text-brand-400 transition"><Edit className="w-3.5 h-3.5" /></button><button onClick={() => { if (window.confirm(`Delete "${p.name}"?`)) deleteProduct(p.id); }} className="text-silver hover:text-brand-400 transition"><Trash2 className="w-3.5 h-3.5" /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // CATEGORIES
  const CategoriesSection = () => {
    const [newCatName, setNewCatName] = useState('');
    const [newCatImage, setNewCatImage] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editCat, setEditCat] = useState({ name: '', image: '', description: '' });

    const pickImage = (file: File | undefined, apply: (dataUrl: string) => void) => {
      if (!file) return;
      void compressImageFile(file).then(dataUrl => { if (dataUrl) apply(dataUrl); });
    };

    const handleAdd = () => {
      if (!newCatName.trim()) return;
      ctx.addCategory({ id: `cat-${Date.now()}`, name: newCatName.trim(), image: newCatImage || '/cement_banner_new.png', description: '', enabled: true });
      setNewCatName('');
      setNewCatImage('');
    };

    const startEdit = (c: Category) => { setEditingId(c.id); setEditCat({ name: c.name, image: c.image, description: c.description }); };
    const saveEdit = (id: string) => {
      if (!editCat.name.trim()) return;
      updateCategory(id, { name: editCat.name.trim(), image: editCat.image, description: editCat.description });
      setEditingId(null);
    };

    return (
      <div className="space-y-6">
        <TopHeader title="Categories" />
        {/* Add new category */}
        <div className="bg-charcoal border border-gunmetal rounded-3xl p-4">
          <h3 className="text-xs font-black text-ivory uppercase tracking-wider mb-3">Add New Category</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 space-y-3">
              <input type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Category name (e.g. TMT Steel Bars)" className="w-full bg-charcoal/50 border border-gunmetal/50 text-ivory px-4 py-2.5 rounded-2xl text-xs focus:outline-none focus:border-brand-500" />
              <label className="block cursor-pointer bg-charcoal hover:bg-charcoal border border-dashed border-gunmetal hover:border-brand-500 rounded-2xl px-4 py-3 text-center transition">
                <span className="text-xs font-bold text-silver flex items-center justify-center space-x-2"><ImageIcon className="w-4 h-4" /><span>{newCatImage ? 'Change Image' : 'Upload Category Image'}</span></span>
                <input type="file" accept="image/*" className="hidden" onChange={e => pickImage(e.target.files?.[0], setNewCatImage)} />
              </label>
            </div>
            <div className="flex sm:flex-col items-center justify-center gap-3">
              {newCatImage ? <img src={newCatImage} alt="Preview" className="w-20 h-20 object-cover rounded-2xl border border-gunmetal" /> : <div className="w-20 h-20 rounded-2xl border border-dashed border-gunmetal flex items-center justify-center text-slate-600"><ImageIcon className="w-6 h-6" /></div>}
              <button onClick={handleAdd} className="btn-brand px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 self-stretch justify-center"><Plus className="w-3.5 h-3.5" /><span>Add</span></button>
            </div>
          </div>
        </div>
        {/* Category grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(c => editingId === c.id ? (
            <div key={c.id} className="bg-charcoal border border-brand-500/40 rounded-3xl p-4 space-y-3 sm:col-span-2 lg:col-span-1">
              <input type="text" value={editCat.name} onChange={e => setEditCat({ ...editCat, name: e.target.value })} className="w-full bg-charcoal/50 border border-gunmetal/50 text-ivory px-3 py-2 rounded-2xl text-xs focus:outline-none focus:border-brand-500" />
              <input type="text" value={editCat.description} onChange={e => setEditCat({ ...editCat, description: e.target.value })} placeholder="Short description (optional)" className="w-full bg-charcoal/50 border border-gunmetal/50 text-ivory px-3 py-2 rounded-2xl text-xs focus:outline-none focus:border-brand-500" />
              <div className="flex items-center gap-3">
                <img src={editCat.image} alt="" className="w-12 h-12 rounded-2xl object-cover border border-gunmetal" />
                <label className="flex-1 cursor-pointer bg-charcoal hover:bg-charcoal border border-dashed border-gunmetal hover:border-brand-500 rounded-2xl px-3 py-2.5 text-center transition">
                  <span className="text-[10px] font-bold text-silver flex items-center justify-center space-x-2"><ImageIcon className="w-3.5 h-3.5" /><span>Change Image</span></span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => pickImage(e.target.files?.[0], img => setEditCat({ ...editCat, image: img }))} />
                </label>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => saveEdit(c.id)} className="flex-1 btn-brand px-3 py-2 rounded-2xl text-[10px] font-bold">Save</button>
                <button onClick={() => setEditingId(null)} className="flex-1 bg-charcoal text-silver px-3 py-2 rounded-2xl text-[10px] font-bold">Cancel</button>
              </div>
            </div>
          ) : (
            <div key={c.id} className="bg-charcoal border border-gunmetal rounded-3xl p-4 flex items-center justify-between hover:border-brand-500/30 transition">
              <div className="flex items-center space-x-3">
                <img src={c.image} alt="" className="w-10 h-10 rounded-2xl object-cover" />
                <div>
                  <div className="text-xs font-bold text-ivory">{c.name}</div>
                  <div className="text-[10px] text-silver">{products.filter(p => p.category === c.name).length} products</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={() => startEdit(c)} className="text-silver hover:text-brand-400" title="Edit"><Edit className="w-3.5 h-3.5" /></button>
                <button onClick={() => deleteCategory(c.id)} className="text-silver hover:text-brand-400" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ORDERS
  const OrdersSection = () => {
    const [filter, setFilter] = useState('all');
    const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);
    return (
      <div className="space-y-6">
        <TopHeader title="Orders" />
        <p className="text-sm font-bold text-ivory">{orders.length} order{orders.length === 1 ? '' : 's'} in total{filter !== 'all' ? ` — showing ${filtered.length} ${ORDER_STATUSES.find(s => s.key === filter)?.label || filter}` : ''}</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-2xl text-xs font-bold transition ${filter === 'all' ? 'bg-brand-500 text-obsidian border border-brand-500' : 'text-ivory border border-gunmetal bg-charcoal'}`}>All <span className="font-black">{orders.length}</span></button>
          {ORDER_STATUSES.slice(0, 6).map(s => {
            const count = orders.filter(o => o.status === s.key).length;
            return (
              <button key={s.key} onClick={() => setFilter(s.key)} className={`px-4 py-2 rounded-2xl text-xs font-bold transition ${filter === s.key ? 'bg-brand-500 text-obsidian border border-brand-500' : 'text-ivory border border-gunmetal bg-charcoal'}`}>{s.label} <span className="font-black">{count}</span></button>
            );
          })}
        </div>
        {filtered.length === 0 ? <p className="text-xs text-silver text-center py-12">No orders found</p> : (
          <div className="space-y-4">
            {filtered.map(o => (
              <div key={o.id} className="bg-charcoal border border-gunmetal rounded-3xl p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-bold text-ivory">{o.orderId}</div>
                    <div className="text-xs text-silver">{o.customer.name} | {o.customer.mobile} | {new Date(o.date).toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-ivory">Rs.{o.total.toLocaleString('en-IN')}</div>
                  </div>
                </div>
                <div className="text-xs text-silver">
                  <div>Items: {o.items.map(i => `${i.product.name} x${i.quantity}`).join(', ')}</div>
                  <div>Delivery: {o.deliveryLocation} | Payment: {o.paymentMode}</div>
                  <div>Address: {o.customer.address}, {o.customer.landmark}</div>
                  {o.customerLocation && (
                    <div className="mt-2 bg-brand-500/10 border border-brand-500/25 rounded-2xl p-2.5">
                      <div className="text-[10px] font-bold text-brand-300 mb-1">📍 Customer-shared delivery location:</div>
                      {/* BUILD 65 audit fix: a customer-supplied link must never
                          be rendered as-is — a javascript: link would run code
                          in the admin's browser. Only https links open. */}
                      {o.customerLocation.startsWith('https://') ? (
                        <a href={o.customerLocation} target="_blank" rel="noreferrer" className="text-[11px] text-brand-400 hover:text-brand-300 underline break-all line-clamp-1">Open on Google Maps →</a>
                      ) : (
                        <span className="text-[11px] text-silver break-all line-clamp-1">Shared location link was not a valid https link and was not opened.</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${ORDER_STATUSES.find(s => s.key === o.status)?.color || ''}`}>Current: {ORDER_STATUSES.find(s => s.key === o.status)?.label || o.status}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-silver">Update Status:</span>
                    <select value={o.status} onChange={e => updateOrderStatus(o.orderId, e.target.value as OrderStatus)} className="bg-charcoal border border-gunmetal text-ivory px-3 py-1.5 rounded-xl text-[10px] font-bold focus:outline-none focus:border-brand-500">
                      {ORDER_STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                    </select>
                  </div>
                  {o.deliveryMethod === 'delivery' && (
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold text-silver">Final Delivery (after location review):</span>
                      <input
                        type="number"
                        defaultValue={o.finalDeliveryCharge ?? o.deliveryCharge}
                        key={`${o.orderId}-${o.finalDeliveryCharge ?? o.deliveryCharge}`}
                        onBlur={e => { const v = Number(e.target.value); if (!Number.isNaN(v) && v !== (o.finalDeliveryCharge ?? o.deliveryCharge)) setOrderFinalDeliveryCharge(o.orderId, v); }}
                        className="w-24 bg-charcoal border border-gunmetal text-ivory px-2 py-1.5 rounded-xl text-[10px] font-bold focus:outline-none focus:border-brand-500"
                      />
                      <span className="text-[9px] text-silver">(original: Rs.{o.deliveryCharge})</span>
                    </div>
                  )}
                  <button onClick={() => { if (window.confirm(`Delete order ${o.orderId}? This cannot be undone.`)) deleteOrder(o.orderId); }} className="flex items-center space-x-1 text-[10px] font-bold text-brand-400 hover:text-brand-300 bg-brand-500/10 border border-brand-500/20 px-3 py-1.5 rounded-xl transition ml-auto">
                    <Trash2 className="w-3 h-3" /><span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // CUSTOMERS
  const CustomersSection = () => (
    <div className="space-y-6">
      <TopHeader title="Customers" />
      {customers.length === 0 ? <p className="text-xs text-silver text-center py-12">No customers yet. They will appear after first orders.</p> : (
        <div className="bg-charcoal border border-gunmetal rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-gunmetal">
                <th className="text-left px-4 py-3 text-silver font-bold">Customer</th>
                <th className="text-left px-4 py-3 text-silver font-bold hidden sm:table-cell">Mobile</th>
                <th className="text-left px-4 py-3 text-silver font-bold">Orders</th>
                <th className="text-left px-4 py-3 text-silver font-bold">Spending</th>
                <th className="text-left px-4 py-3 text-silver font-bold hidden sm:table-cell">Last Order</th>
                <th className="text-right px-4 py-3 text-silver font-bold">Action</th>
              </tr></thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id} className="border-b border-gunmetal/50 hover:bg-charcoal">
                    <td className="px-4 py-3"><div className="font-bold text-ivory">{c.name}</div></td>
                    <td className="px-4 py-3 text-silver hidden sm:table-cell">{c.mobile}</td>
                    <td className="px-4 py-3 font-bold text-ivory">{c.totalOrders}</td>
                    <td className="px-4 py-3 font-bold text-ivory">Rs.{c.totalSpending.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-silver hidden sm:table-cell">{new Date(c.lastOrder).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => { if (window.confirm(`Delete customer ${c.name}?`)) deleteCustomer(c.id); }} className="text-silver hover:text-brand-400 transition p-1.5 rounded-xl hover:bg-brand-500/10">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  // CONTENT & ADS
  const ContentSection = () => {
    const [showAdd, setShowAdd] = useState(false);
    const [newBlock, setNewBlock] = useState({ title: '', subtitle: '', type: 'banner' as ContentBlock['type'] });
    const [newAch, setNewAch] = useState<{ title: string; description: string; imageUrl: string; kind: Achievement['kind']; date: string }>({ title: '', description: '', imageUrl: '', kind: 'achievement', date: '' });
    const handleAdd = () => {
      if (!newBlock.title) return;
      ctx.addContentBlock({ id: `cb-${Date.now()}`, ...newBlock, active: true, order: contentBlocks.length + 1 });
      setNewBlock({ title: '', subtitle: '', type: 'banner' }); setShowAdd(false);
    };
    return (
      <div className="space-y-6">
        <TopHeader title="Content & Ads" />
        <div className="bg-charcoal border border-gunmetal rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-ivory">Front Page Photos (Splash / Landing)</h3>
          <p className="text-[10px] text-silver">Upload photos that appear on the landing page. The first image is the default. If multiple images are added, they rotate automatically every 5 seconds.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {(siteContent.frontPageImages || []).map((img, i) => (
              <div key={i} className="relative group rounded-2xl overflow-hidden border border-gunmetal">
                <img src={img} alt={`Front page ${i + 1}`} className="w-full aspect-video object-cover" />
                <div className="absolute top-1 left-1 bg-black/60 text-ivory text-[8px] font-bold px-1.5 py-0.5 rounded">#{i + 1}</div>
                <button onClick={() => {
                  const imgs = (siteContent.frontPageImages || []).filter((_: string, j: number) => j !== i);
                  updateSiteContent({ frontPageImages: imgs });
                }} className="absolute top-1 right-1 bg-obsidian/85 hover:bg-gunmetal text-ivory p-1 rounded-xl opacity-0 group-hover:opacity-100 transition"><Trash2 className="w-3 h-3" /></button>
              </div>
            ))}
          </div>
          <label className="block cursor-pointer bg-charcoal hover:bg-charcoal border border-dashed border-gunmetal hover:border-brand-500 rounded-2xl px-4 py-3 text-center transition">
            <span className="text-xs font-bold text-silver flex items-center justify-center space-x-2"><ImageIcon className="w-4 h-4" /><span>Add Front Page Photo</span></span>
            <input type="file" accept="image/*" className="hidden" onChange={async e => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (!file) return;
              const compressed = await compressImageFile(file);
              if (!compressed) return;
              const imgs = [...(siteContent.frontPageImages || []), compressed];
              updateSiteContent({ frontPageImages: imgs });
            }} />
          </label>
          <div className="bg-charcoal border border-gunmetal rounded-3xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-ivory">Homepage Hero Colour</h4>
            <p className="text-[10px] text-silver">The home hero behind the "HSN CEMENT AND STEEL" heading uses an Obsidian/Charcoal Steel canvas with a champagne glow — no image upload.</p>
            <div className="relative w-32 h-20 rounded-2xl overflow-hidden border border-gunmetal shrink-0">
              <div className="absolute inset-0" style={{ background: 'linear-gradient(120deg, var(--color-charcoal) 0%, var(--color-obsidian) 100%)' }} />
              <div className="absolute -top-6 -left-6 w-20 h-20 bg-brand-500/15 blur-[30px] rounded-full" />
              <div className="absolute top-1/3 -right-6 w-20 h-20 bg-brand-500/15 blur-[30px] rounded-full" />
              <span className="absolute bottom-1.5 left-2 text-[8px] font-bold text-ivory/80">Obsidian + champagne</span>
            </div>
          </div>
        </div>
        <div className="bg-charcoal border border-gunmetal rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-ivory">Entry Photos — Mobile (phones & tablets)</h3>
          <p className="text-[10px] text-silver">Photos shown on the entry screen before entering, on phones and tablets. If empty, the shared Front Page Photos above are used. If multiple images are added, they rotate automatically every 5 seconds.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {(siteContent.splashMobileImages || []).map((img, i) => (
              <div key={i} className="relative group rounded-2xl overflow-hidden border border-gunmetal">
                <img src={img} alt={`Mobile entry ${i + 1}`} className="w-full aspect-video object-cover" />
                <div className="absolute top-1 left-1 bg-black/60 text-ivory text-[8px] font-bold px-1.5 py-0.5 rounded">#{i + 1}</div>
                <button onClick={() => {
                  const imgs = (siteContent.splashMobileImages || []).filter((_: string, j: number) => j !== i);
                  updateSiteContent({ splashMobileImages: imgs });
                }} className="absolute top-1 right-1 bg-obsidian/85 hover:bg-gunmetal text-ivory p-1 rounded-xl opacity-0 group-hover:opacity-100 transition"><Trash2 className="w-3 h-3" /></button>
              </div>
            ))}
          </div>
          <label className="block cursor-pointer bg-charcoal hover:bg-charcoal border border-dashed border-gunmetal hover:border-brand-500 rounded-2xl px-4 py-3 text-center transition">
            <span className="text-xs font-bold text-silver flex items-center justify-center space-x-2"><ImageIcon className="w-4 h-4" /><span>Add Mobile Entry Photo</span></span>
            <input type="file" accept="image/*" className="hidden" onChange={async e => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (!file) return;
              const compressed = await compressImageFile(file);
              if (!compressed) return;
              const imgs = [...(siteContent.splashMobileImages || []), compressed];
              updateSiteContent({ splashMobileImages: imgs });
            }} />
          </label>
        </div>
        <div className="bg-charcoal border border-gunmetal rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-ivory">Entry Photos — Laptop (desktop)</h3>
          <p className="text-[10px] text-silver">Photos shown on the entry screen before entering, on laptops and desktops. If empty, the shared Front Page Photos above are used. If multiple images are added, they rotate automatically every 5 seconds.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {(siteContent.splashLaptopImages || []).map((img, i) => (
              <div key={i} className="relative group rounded-2xl overflow-hidden border border-gunmetal">
                <img src={img} alt={`Laptop entry ${i + 1}`} className="w-full aspect-video object-cover" />
                <div className="absolute top-1 left-1 bg-black/60 text-ivory text-[8px] font-bold px-1.5 py-0.5 rounded">#{i + 1}</div>
                <button onClick={() => {
                  const imgs = (siteContent.splashLaptopImages || []).filter((_: string, j: number) => j !== i);
                  updateSiteContent({ splashLaptopImages: imgs });
                }} className="absolute top-1 right-1 bg-obsidian/85 hover:bg-gunmetal text-ivory p-1 rounded-xl opacity-0 group-hover:opacity-100 transition"><Trash2 className="w-3 h-3" /></button>
              </div>
            ))}
          </div>
          <label className="block cursor-pointer bg-charcoal hover:bg-charcoal border border-dashed border-gunmetal hover:border-brand-500 rounded-2xl px-4 py-3 text-center transition">
            <span className="text-xs font-bold text-silver flex items-center justify-center space-x-2"><ImageIcon className="w-4 h-4" /><span>Add Laptop Entry Photo</span></span>
            <input type="file" accept="image/*" className="hidden" onChange={async e => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (!file) return;
              const compressed = await compressImageFile(file);
              if (!compressed) return;
              const imgs = [...(siteContent.splashLaptopImages || []), compressed];
              updateSiteContent({ splashLaptopImages: imgs });
            }} />
          </label>
        </div>
        <div className="bg-charcoal border border-gunmetal rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-ivory">Homepage Hero</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-[10px] font-bold text-silver block mb-1">Business Name</label><input type="text" value={siteContent.businessName} onChange={e => updateSiteContent({ businessName: e.target.value })} className="w-full bg-charcoal border border-gunmetal text-ivory px-3 py-2.5 rounded-2xl text-xs focus:outline-none focus:border-brand-500" /></div>
            <div><label className="text-[10px] font-bold text-silver block mb-1">Phone</label><input type="text" value={siteContent.phone} onChange={e => updateSiteContent({ phone: e.target.value })} className="w-full bg-charcoal border border-gunmetal text-ivory px-3 py-2.5 rounded-2xl text-xs focus:outline-none focus:border-brand-500" /></div>
            <div><label className="text-[10px] font-bold text-silver block mb-1">WhatsApp</label><input type="text" value={siteContent.whatsapp} onChange={e => updateSiteContent({ whatsapp: e.target.value })} className="w-full bg-charcoal border border-gunmetal text-ivory px-3 py-2.5 rounded-2xl text-xs focus:outline-none focus:border-brand-500" /></div>
            <div><label className="text-[10px] font-bold text-silver block mb-1">Address</label><input type="text" value={siteContent.address} onChange={e => updateSiteContent({ address: e.target.value })} className="w-full bg-charcoal border border-gunmetal text-ivory px-3 py-2.5 rounded-2xl text-xs focus:outline-none focus:border-brand-500" /></div>
          </div>
        </div>
        {/* Achievements & Contracts (shows in public Gallery) */}
        <div className="bg-charcoal border border-gunmetal rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-ivory">Achievements & Contracts (Public Gallery)</h3>
          <p className="text-[10px] text-silver">Upload completed project photos, government/contract awards, or contract documents. They appear in the Gallery page for all customers.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input type="text" placeholder="Title (e.g. Government School Supply Contract)" value={newAch.title} onChange={e => setNewAch({ ...newAch, title: e.target.value })} className="bg-charcoal border border-gunmetal text-ivory px-3 py-2.5 rounded-2xl text-xs focus:outline-none focus:border-brand-500" />
            <select value={newAch.kind} onChange={e => setNewAch({ ...newAch, kind: e.target.value as Achievement['kind'] })} className="bg-charcoal border border-gunmetal text-ivory px-3 py-2.5 rounded-2xl text-xs focus:outline-none focus:border-brand-500">
              <option value="achievement">🏆 Achievement</option>
              <option value="contract">📜 Contract</option>
              <option value="certificate">🎖️ Certificate</option>
            </select>
            <input type="text" placeholder="Date (optional, e.g. Jan 2026)" value={newAch.date} onChange={e => setNewAch({ ...newAch, date: e.target.value })} className="bg-charcoal border border-gunmetal text-ivory px-3 py-2.5 rounded-2xl text-xs focus:outline-none focus:border-brand-500" />
          </div>
          <textarea placeholder="Description (what was delivered, quantity, client name...)" value={newAch.description} onChange={e => setNewAch({ ...newAch, description: e.target.value })} rows={2} className="w-full bg-charcoal border border-gunmetal text-ivory px-3 py-2.5 rounded-2xl text-xs focus:outline-none focus:border-brand-500 resize-none" />
          <div className="flex flex-wrap items-center gap-3">
            <label className="block cursor-pointer bg-charcoal hover:bg-charcoal border border-dashed border-gunmetal hover:border-brand-500 rounded-2xl px-4 py-2.5 text-center transition">
              <span className="text-xs font-bold text-silver flex items-center space-x-2"><ImageIcon className="w-4 h-4" /><span>{newAch.imageUrl ? 'Photo ✓ Change' : 'Add Photo (required)'}</span></span>
              <input type="file" accept="image/*" className="hidden" onChange={async e => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (!file) return;
                const compressed = await compressImageFile(file);
                if (compressed) setNewAch(prev => ({ ...prev, imageUrl: compressed }));
              }} />
            </label>
            {newAch.imageUrl && <img src={newAch.imageUrl} alt="" className="w-14 h-14 object-cover rounded-xl border border-gunmetal" />}
            <button onClick={() => {
              if (!newAch.title.trim() || !newAch.imageUrl) return;
              ctx.addAchievement({ id: `ach-${Date.now()}`, title: newAch.title.trim(), description: newAch.description.trim(), imageUrl: newAch.imageUrl, kind: newAch.kind, date: newAch.date.trim() || undefined });
              setNewAch({ title: '', description: '', imageUrl: '', kind: 'achievement', date: '' });
            }} className="btn-brand px-4 py-2.5 rounded-2xl text-xs font-bold">Publish to Gallery</button>
          </div>
          {achievements.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {achievements.map(a => (
                <div key={a.id} className="flex items-center gap-3 bg-charcoal/50 border border-gunmetal rounded-2xl p-2.5">
                  <img src={a.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-ivory line-clamp-1">{a.kind === 'contract' ? '📜' : a.kind === 'certificate' ? '🎖️' : '🏆'} {a.title}</div>
                    <div className="text-[10px] text-silver line-clamp-1">{a.date || ''} {a.description}</div>
                  </div>
                  <button onClick={() => deleteAchievement(a.id)} className="text-silver hover:text-brand-400 shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-ivory">Banners & Promotions</h3>
          <button onClick={() => setShowAdd(!showAdd)} className="flex items-center space-x-2 btn-brand px-4 py-2 rounded-2xl text-xs font-bold"><Plus className="w-3.5 h-3.5" /><span>Add Banner</span></button>
        </div>
        {showAdd && (
          <div className="bg-charcoal border border-brand-500/30 rounded-3xl p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Title" value={newBlock.title} onChange={e => setNewBlock({ ...newBlock, title: e.target.value })} className="bg-charcoal border border-gunmetal text-ivory px-3 py-2 rounded-2xl text-xs focus:outline-none focus:border-brand-500" />
              <input type="text" placeholder="Subtitle" value={newBlock.subtitle || ''} onChange={e => setNewBlock({ ...newBlock, subtitle: e.target.value })} className="bg-charcoal border border-gunmetal text-ivory px-3 py-2 rounded-2xl text-xs focus:outline-none focus:border-brand-500" />
            </div>
            <div className="flex space-x-3">
              <button onClick={handleAdd} className="btn-brand px-4 py-2 rounded-2xl text-xs font-bold">Save</button>
              <button onClick={() => setShowAdd(false)} className="bg-charcoal text-silver px-4 py-2 rounded-2xl text-xs font-bold">Cancel</button>
            </div>
          </div>
        )}
        <div className="space-y-3">
          {contentBlocks.length === 0 ? <p className="text-xs text-silver text-center py-8">No banners yet</p> : contentBlocks.map(b => (
            <div key={b.id} className="bg-charcoal border border-gunmetal rounded-3xl p-4 flex items-center justify-between">
              <div><div className="text-xs font-bold text-ivory">{b.title}</div><div className="text-[10px] text-silver">{b.subtitle} | {b.type}</div></div>
              <div className="flex items-center space-x-2">
                <button onClick={() => ctx.toggleContentBlock(b.id)} className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${b.active ? 'bg-brand-500/20 text-brand-400' : 'bg-brand-500/20 text-brand-400'}`}>{b.active ? 'Active' : 'Off'}</button>
                <button onClick={() => deleteContentBlock(b.id)} className="text-silver hover:text-brand-400"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // TRANSPORT FARES
  const TransportSection = () => {
    const [showAdd, setShowAdd] = useState(false);
    const [newZone, setNewZone] = useState({ name: '', mandal: '', charge: 0, estimatedTime: 'Same day' });
    const handleAdd = () => {
      if (!newZone.name) return;
      ctx.addTransportZone({ id: `tz-${Date.now()}`, ...newZone, enabled: true });
      setNewZone({ name: '', mandal: '', charge: 0, estimatedTime: 'Same day' }); setShowAdd(false);
    };
    return (
      <div className="space-y-6">
        <TopHeader title="Transport Fares" />
        <div className="flex items-center justify-between">
          <p className="text-xs text-silver">Manage delivery zones and charges</p>
          <button onClick={() => setShowAdd(!showAdd)} className="flex items-center space-x-2 btn-brand px-4 py-2 rounded-2xl text-xs font-bold"><Plus className="w-3.5 h-3.5" /><span>Add Zone</span></button>
        </div>
        {showAdd && (
          <div className="bg-charcoal border border-brand-500/30 rounded-3xl p-4 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <input type="text" placeholder="Zone Name" value={newZone.name} onChange={e => setNewZone({ ...newZone, name: e.target.value })} className="bg-charcoal border border-gunmetal text-ivory px-3 py-2 rounded-2xl text-xs focus:outline-none focus:border-brand-500" />
              <input type="text" placeholder="Mandal" value={newZone.mandal} onChange={e => setNewZone({ ...newZone, mandal: e.target.value })} className="bg-charcoal border border-gunmetal text-ivory px-3 py-2 rounded-2xl text-xs focus:outline-none focus:border-brand-500" />
              <input type="number" placeholder="Charge (Rs.)" value={newZone.charge || ''} onChange={e => setNewZone({ ...newZone, charge: Number(e.target.value) })} className="bg-charcoal border border-gunmetal text-ivory px-3 py-2 rounded-2xl text-xs focus:outline-none focus:border-brand-500" />
              <input type="text" placeholder="Est. Time" value={newZone.estimatedTime} onChange={e => setNewZone({ ...newZone, estimatedTime: e.target.value })} className="bg-charcoal border border-gunmetal text-ivory px-3 py-2 rounded-2xl text-xs focus:outline-none focus:border-brand-500" />
            </div>
            <div className="flex space-x-3">
              <button onClick={handleAdd} className="btn-brand px-4 py-2 rounded-2xl text-xs font-bold">Save</button>
              <button onClick={() => setShowAdd(false)} className="bg-charcoal text-silver px-4 py-2 rounded-2xl text-xs font-bold">Cancel</button>
            </div>
          </div>
        )}
        <div className="bg-charcoal border border-gunmetal rounded-3xl overflow-hidden">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-gunmetal">
              <th className="text-left px-4 py-3 text-silver font-bold">Zone</th>
              <th className="text-left px-4 py-3 text-silver font-bold">Mandal</th>
              <th className="text-left px-4 py-3 text-silver font-bold">Charge</th>
              <th className="text-left px-4 py-3 text-silver font-bold hidden sm:table-cell">Est. Time</th>
              <th className="text-left px-4 py-3 text-silver font-bold">Actions</th>
            </tr></thead>
            <tbody>
              {transportZones.map(z => (
                <tr key={z.id} className="border-b border-gunmetal/50 hover:bg-charcoal">
                  <td className="px-4 py-3 font-bold text-ivory">{z.name}</td>
                  <td className="px-4 py-3 text-silver">{z.mandal}</td>
                  <td className="px-4 py-3 font-bold text-ivory">{z.charge === 0 ? 'FREE' : `Rs.${z.charge}`}</td>
                  <td className="px-4 py-3 text-silver hidden sm:table-cell">{z.estimatedTime}</td>
                  <td className="px-4 py-3"><button onClick={() => deleteTransportZone(z.id)} className="text-silver hover:text-brand-400"><Trash2 className="w-3.5 h-3.5" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // MARKET PRICES (Daily Market Price Index on the Home page)
  const PricesSection = () => {
    const [draft, setDraft] = useState(() => ({
      cement: ctx.marketPrices.cement.map(t => ({ ...t })),
      steel: ctx.marketPrices.steel.map(t => ({ ...t })),
    }));
    const inputCls = "bg-charcoal border border-gunmetal text-ivory px-3 py-2 rounded-2xl text-xs focus:outline-none focus:border-brand-500 w-full";
    const setTier = (group: 'cement' | 'steel', idx: number, field: string, value: string) =>
      setDraft(d => ({ ...d, [group]: d[group].map((t, i) => i === idx ? { ...t, [field]: value } : t) }));
    const addTier = (group: 'cement' | 'steel') =>
      setDraft(d => ({ ...d, [group]: [...d[group], { range: '', label: '', price: '₹', unit: group === 'cement' ? '/ bag' : '/ kg' }] }));
    const removeTier = (group: 'cement' | 'steel', idx: number) =>
      setDraft(d => ({ ...d, [group]: d[group].filter((_, i) => i !== idx) }));
    const handleSave = () => {
      const clean = (rows: typeof draft.cement) => rows.filter(t => t.range.trim() || t.label.trim() || t.price.replace('₹', '').trim());
      ctx.updateMarketPrices({ cement: clean(draft.cement), steel: clean(draft.steel) });
    };
    const lastUpdated = ctx.marketPrices.updatedAt
      ? new Date(ctx.marketPrices.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      : 'Never (showing default rates)';
    const renderGroup = (group: 'cement' | 'steel', title: string, unitHint: string) => (
      <div className="bg-charcoal border border-gunmetal rounded-3xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-black text-ivory font-industrial">{title}</h4>
          <button onClick={() => addTier(group)} className="flex items-center space-x-1.5 bg-charcoal border border-gunmetal text-ivory px-3 py-1.5 rounded-xl text-[11px] font-bold hover:bg-white/10 transition"><Plus className="w-3 h-3" /><span>Add Price</span></button>
        </div>
        <div className="hidden sm:grid grid-cols-[1.2fr_1.2fr_0.8fr_0.7fr_auto] gap-2 text-[10px] font-bold text-silver uppercase px-1">
          <span>Quantity Range</span><span>Tier Label</span><span>Price</span><span>Unit</span><span></span>
        </div>
        {draft[group].map((tier, i) => (
          <div key={i} className="grid grid-cols-2 sm:grid-cols-[1.2fr_1.2fr_0.8fr_0.7fr_auto] gap-2 items-center">
            <input type="text" placeholder="e.g. 1 - 49 Bags" value={tier.range} onChange={e => setTier(group, i, 'range', e.target.value)} className={inputCls} />
            <input type="text" placeholder="e.g. Standard Retail" value={tier.label} onChange={e => setTier(group, i, 'label', e.target.value)} className={inputCls} />
            <input type="text" placeholder="₹380" value={tier.price} onChange={e => setTier(group, i, 'price', e.target.value)} className={inputCls} />
            <input type="text" placeholder={unitHint} value={tier.unit} onChange={e => setTier(group, i, 'unit', e.target.value)} className={inputCls} />
            <button onClick={() => removeTier(group, i)} className="text-silver hover:text-brand-400 justify-self-end" aria-label="Delete price row"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
        {draft[group].length === 0 && <p className="text-xs text-silver text-center py-4">No prices — tap "Add Price" to add one</p>}
      </div>
    );
    return (
      <div className="space-y-6">
        <TopHeader title="Market Prices" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-silver">These prices appear on the Home page in the <span className="text-ivory font-bold">Daily Market Price Index — Wholesale Tiered Pricing Table</span>. Saving stamps the "Rates Updated" date as today and syncs to all devices. Last updated: <span className="text-ivory font-bold">{lastUpdated}</span></p>
          <button onClick={handleSave} className="shrink-0 btn-brand px-5 py-2.5 rounded-2xl text-xs font-bold">Save Prices</button>
        </div>
        {renderGroup('cement', 'Cement Bags (OPC 53 / PPC 50kg)', '/ bag')}
        {renderGroup('steel', 'TMT Steel Bars (6mm - 32mm Fe 550D)', '/ kg')}
      </div>
    );
  };

  // NOTIFICATIONS
  const NotificationsSection = () => {
    const [showAdd, setShowAdd] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [newType, setNewType] = useState('announcement');

    const handleAdd = () => {
      if (!newTitle.trim() || !newContent.trim()) return;
      const notif: Notification = {
        id: `notif-${Date.now()}`,
        title: newTitle.trim(),
        content: newContent.trim(),
        type: newType,
        active: true,
        read: false,
        createdAt: new Date().toISOString(),
      };
      ctx.addNotification(notif);
      setNewTitle('');
      setNewContent('');
      setShowAdd(false);
    };

    const handleEdit = (id: string, title: string, content: string) => {
      setEditingId(id);
      setNewTitle(title);
      setNewContent(content);
    };

    const handleSaveEdit = () => {
      if (!editingId || !newTitle.trim() || !newContent.trim()) return;
      ctx.updateNotification(editingId, { title: newTitle.trim(), content: newContent.trim() });
      setEditingId(null);
      setNewTitle('');
      setNewContent('');
    };

    return (
      <div className="space-y-6">
        <TopHeader title="Notifications" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <p className="text-xs text-silver">{unreadNotifs} unread</p>
            <span className="text-xs text-slate-600">|</span>
            <p className="text-xs text-silver">{notifications.filter(n => n.active).length} active</p>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => ctx.clearNotifications()} className="text-xs font-bold text-silver hover:text-ivory border border-gunmetal px-3 py-1.5 rounded-xl transition">Mark All Read</button>
            <button onClick={() => { setShowAdd(!showAdd); setEditingId(null); setNewTitle(''); setNewContent(''); }} className="flex items-center space-x-2 btn-brand px-4 py-2 rounded-2xl text-xs font-bold">
              <Plus className="w-3.5 h-3.5" /><span>New Alert</span>
            </button>
          </div>
        </div>

        {showAdd && (
          <div className="bg-charcoal border border-brand-500/30 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-ivory">Create Notification Alert</h3>
            <input type="text" placeholder="Title (e.g. Flash Sale, Price Drop, Holiday Notice)" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full bg-charcoal border border-gunmetal text-ivory px-4 py-2.5 rounded-2xl text-xs focus:outline-none focus:border-brand-500" />
            <textarea placeholder="Message content for customers..." value={newContent} onChange={e => setNewContent(e.target.value)} rows={3} className="w-full bg-charcoal border border-gunmetal text-ivory px-4 py-2.5 rounded-2xl text-xs focus:outline-none focus:border-brand-500 resize-none" />
            <select value={newType} onChange={e => setNewType(e.target.value)} className="bg-charcoal border border-gunmetal text-ivory px-4 py-2.5 rounded-2xl text-xs focus:outline-none focus:border-brand-500">
              <option value="announcement">📢 Announcement</option>
              <option value="offer">🏷️ Offer / Sale</option>
              <option value="update">🔄 Price Update</option>
              <option value="alert">⚠️ Alert</option>
            </select>
            <div className="flex space-x-3">
              <button onClick={handleAdd} className="btn-brand px-4 py-2 rounded-2xl text-xs font-bold">Publish Alert</button>
              <button onClick={() => setShowAdd(false)} className="bg-charcoal text-silver px-4 py-2 rounded-2xl text-xs font-bold">Cancel</button>
            </div>
          </div>
        )}

        {editingId && (
          <div className="bg-charcoal border border-brand-500/30 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-ivory">Edit Notification</h3>
            <input type="text" placeholder="Title" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full bg-charcoal border border-gunmetal text-ivory px-4 py-2.5 rounded-2xl text-xs focus:outline-none focus:border-brand-500" />
            <textarea placeholder="Message" value={newContent} onChange={e => setNewContent(e.target.value)} rows={3} className="w-full bg-charcoal border border-gunmetal text-ivory px-4 py-2.5 rounded-2xl text-xs focus:outline-none focus:border-brand-500 resize-none" />
            <div className="flex space-x-3">
              <button onClick={handleSaveEdit} className="btn-brand px-4 py-2 rounded-2xl text-xs font-bold">Save Changes</button>
              <button onClick={() => { setEditingId(null); setNewTitle(''); setNewContent(''); }} className="bg-charcoal text-silver px-4 py-2 rounded-2xl text-xs font-bold">Cancel</button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {notifications.length === 0 ? <p className="text-xs text-silver text-center py-12">No notifications yet. Create your first alert above!</p> : notifications.map(n => (
            <div key={n.id} className={`bg-charcoal border rounded-3xl p-4 transition hover:border-brand-500/30 ${n.read ? 'border-gunmetal' : 'border-brand-500/30'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 cursor-pointer" onClick={() => ctx.markNotificationRead(n.id)}>
                  <div className="flex items-center space-x-2 mb-1">
                    {!n.read && <div className="w-2 h-2 bg-brand-400 rounded-full shrink-0" />}
                    <div className="text-xs font-bold text-ivory">{n.title}</div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-brand-500/20 text-brand-400 font-bold border border-brand-500/20">{n.type}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${n.active !== false ? 'bg-brand-500/20 text-brand-400 border border-brand-500/20' : 'bg-slate-500/20 text-silver border border-slate-500/20'}`}>{n.active !== false ? 'Active' : 'Hidden'}</span>
                  </div>
                  <div className="text-[10px] text-silver pl-4">{n.content}</div>
                  {n.createdAt && <div className="text-[10px] text-silver mt-1 pl-4">{new Date(n.createdAt).toLocaleString()}</div>}
                </div>
                <div className="flex items-center space-x-1 shrink-0">
                  <button onClick={() => ctx.updateNotification(n.id, { active: n.active === false ? true : false })} className={`text-[10px] px-2 py-1 rounded-xl font-bold transition ${n.active !== false ? 'bg-brand-500/20 text-brand-400 hover:bg-brand-500/30' : 'bg-slate-500/20 text-silver hover:bg-slate-500/30'}`}>{n.active !== false ? 'Hide' : 'Show'}</button>
                  <button onClick={() => handleEdit(n.id, n.title, n.content)} className="text-silver hover:text-brand-400 transition p-1"><Edit className="w-3.5 h-3.5" /></button>
                  <button onClick={() => { if (window.confirm(`Delete notification "${n.title}"?`)) ctx.deleteNotification(n.id); }} className="text-silver hover:text-brand-400 transition p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // TERMS
  const TermsSection = () => {
    const [editing, setEditing] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    return (
      <div className="space-y-6">
        <TopHeader title="Terms & Conditions" />
        <div className="space-y-4">
          {termsContent.map(t => (
            <div key={t.id} className="bg-charcoal border border-gunmetal rounded-3xl p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-ivory">{t.title}</h3>
                <button onClick={() => { setEditing(editing === t.id ? null : t.id); setEditContent(t.content); }} className="text-xs font-bold text-brand-400 hover:text-brand-300">{editing === t.id ? 'Cancel' : 'Edit'}</button>
              </div>
              {editing === t.id ? (
                <div className="space-y-3">
                  <textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={6} className="w-full bg-charcoal border border-gunmetal text-ivory px-4 py-3 rounded-2xl text-xs focus:outline-none focus:border-brand-500 resize-none" />
                  <button onClick={() => { updateTermsContent(t.id, editContent); setEditing(null); }} className="btn-brand px-4 py-2 rounded-2xl text-xs font-bold">Save Changes</button>
                </div>
              ) : (
                <p className="text-xs text-silver leading-relaxed">{t.content}</p>
              )}
              <div className="text-[10px] text-slate-600 mt-2">Last updated: {new Date(t.lastUpdated).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // SECURITY
  const SecuritySection = () => (
    <div className="space-y-6">
      <TopHeader title="Security & Settings" />
      <div className="bg-charcoal border border-gunmetal rounded-3xl p-6 space-y-6">
        <h3 className="text-sm font-bold text-ivory border-b border-gunmetal pb-3">Business Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Business Name', key: 'businessName' as const, val: siteSettings.businessName },
            { label: 'Phone', key: 'phone' as const, val: siteSettings.phone },
            { label: 'WhatsApp', key: 'whatsapp' as const, val: siteSettings.whatsapp },
            { label: 'Email', key: 'email' as const, val: siteSettings.email },
            { label: 'Address', key: 'address' as const, val: siteSettings.address },
            { label: 'Business Hours', key: 'businessHours' as const, val: siteSettings.businessHours },
            { label: 'GST Number', key: 'gstNumber' as const, val: siteSettings.gstNumber },
          ].map(f => (
            <div key={f.key}>
              <label className="text-[10px] font-bold text-silver uppercase block mb-1">{f.label}</label>
              <input type="text" value={f.val} onChange={e => updateSiteSettings({ [f.key]: e.target.value })} className="w-full bg-charcoal/50 border border-gunmetal rounded-2xl px-3 py-2.5 text-xs text-ivory focus:outline-none focus:border-brand-500 transition" />
            </div>
          ))}
        </div>
      </div>
      <div className="bg-charcoal border border-gunmetal rounded-3xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-ivory border-b border-gunmetal pb-3">Launching Soon Poster</h3>
        <p className="text-xs text-silver">When ON, normal visitors see only the full-page “Launching Soon” poster and cannot open any page. The admin portal itself is never blocked. Set the opening date and time below — the poster countdown follows it on every device.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-silver uppercase block mb-1">Opening date</label>
            <input type="date" value={splitLaunchDateTime(launchDateTime).date} onChange={e => { if (e.target.value) setLaunchDateTime(joinLaunchDateTime(e.target.value, splitLaunchDateTime(launchDateTime).time)); }} className="w-full bg-charcoal/50 border border-gunmetal rounded-2xl px-3 py-2.5 text-xs text-ivory focus:outline-none focus:border-brand-500 transition" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-silver uppercase block mb-1">Opening time (IST)</label>
            <input type="time" value={splitLaunchDateTime(launchDateTime).time} onChange={e => { if (e.target.value) setLaunchDateTime(joinLaunchDateTime(splitLaunchDateTime(launchDateTime).date, e.target.value)); }} className="w-full bg-charcoal/50 border border-gunmetal rounded-2xl px-3 py-2.5 text-xs text-ivory focus:outline-none focus:border-brand-500 transition" />
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 bg-charcoal/50 border border-gunmetal rounded-2xl px-4 py-3">
          <span className="text-xs font-bold text-ivory">{launchingSoon ? 'Poster is ON — website closed to visitors' : 'Poster is OFF — website open'}</span>
          <button type="button" onClick={() => setLaunchingSoon(!launchingSoon)} className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition ${launchingSoon ? 'bg-brand-500 text-obsidian' : 'bg-white/10 border border-gunmetal text-ivory'}`}>
            {launchingSoon ? 'Remove poster' : 'Show poster'}
          </button>
        </div>
      </div>
      <div className="bg-charcoal border border-gunmetal rounded-3xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-ivory border-b border-gunmetal pb-3">Admin Account</h3>
        <div className="space-y-3">
          <div><label className="text-xs font-bold text-silver block mb-1.5">Email</label><div className="bg-charcoal/50 border border-gunmetal rounded-2xl px-3 py-2.5 text-xs text-ivory">habeebc84@gmail.com</div></div>
          <div><label className="text-xs font-bold text-silver block mb-1.5">Password</label>
            <div className="flex space-x-2">
              <input type="password" value="Encrypted •••" disabled className="flex-1 bg-charcoal/50 border border-gunmetal rounded-2xl px-3 py-2.5 text-xs text-ivory" />
              <button onClick={async () => { const np = prompt('Enter new password (min 6 chars):'); if (np && np.length >= 6) { try { await changeAdminAuthPassword(np); alert('Password updated in Supabase Auth'); } catch (e) { alert('Password change failed: ' + (e instanceof Error ? e.message : String(e))); } } else if (np) { alert('Password must be at least 6 characters'); } }} className="bg-white/10 border border-gunmetal text-ivory px-4 py-2 rounded-2xl text-xs font-bold hover:bg-white/20 transition">Change</button>
            </div>
          </div>
        </div>
        <div className="bg-brand-500/10 border border-brand-500/20 rounded-2xl p-4 text-xs text-brand-300">
          <p className="font-bold mb-1"><Lock className="w-3.5 h-3.5 inline mr-1" />Security Note</p>
          <p>Keep your credentials secure. Admin access controls the entire store management system.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-dashboard min-h-screen relative z-10">
      <Sidebar />
      {sidebarOpen && <div className="fixed inset-0 bg-obsidian/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className="lg:ml-[18rem] p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </div>
    </div>
  );
}
