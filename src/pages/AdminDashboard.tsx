import { useState } from 'react';
import { BarChart3, Package, ShoppingCart, Users, Settings, LogOut, TrendingUp, Edit, Trash2, Plus, Eye, Shield, Bell, FileText, Truck, ChevronDown, X, Menu, MapPin, Clock, Star, Search, Filter, Globe, Lock, Mail, Phone, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { AdminPage, Product, Category, TransportZone, ContentBlock, OrderStatus, Notification } from '../types';
import { ORDER_STATUSES } from '../types';

export default function AdminDashboard() {
  const ctx = useApp();
  const { logoutAdmin, products, orders, customers, deleteCustomer, categories, transportZones, contentBlocks, notifications, termsContent, siteSettings, updateSiteSettings, siteContent, updateSiteContent, updateOrderStatus, deleteOrder, deleteProduct, updateProduct, toggleProduct, deleteCategory, deleteTransportZone, deleteContentBlock, updateTermsContent, setPage, setAdminPage, adminPage } = ctx;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const totalRevenue = orders.reduce((a, o) => a + o.total, 0);
  const pendingOrders = orders.filter(o => ['placed', 'confirmed', 'processing', 'ready_dispatch'].includes(o.status));
  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  const unreadNotifs = notifications.filter(n => !n.read).length;

  const navItems: { id: AdminPage; label: string; icon: any; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: Filter },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, badge: pendingOrders.length },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'content', label: 'Content & Ads', icon: Edit },
    { id: 'transport', label: 'Transport Fares', icon: Truck },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifs },
    { id: 'terms', label: 'Terms & Conditions', icon: FileText },
    { id: 'security', label: 'Security & Settings', icon: Settings },
  ];

  const Sidebar = () => (
    <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-950/95 backdrop-blur-xl border-r border-white/10 flex flex-col transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <img src="/windows-h-logo.png" alt="Logo" className="w-10 h-10 rounded-xl border border-white/10 bg-slate-900 p-1" />
          <div>
            <div className="text-sm font-black text-white font-industrial">HSN COMMAND CENTER</div>
            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Admin Portal</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <button key={item.id} onClick={() => { setAdminPage(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition ${adminPage === item.id ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
              <Icon className="w-4 h-4" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">{item.badge}</span>}
            </button>
          );
        })}
      </nav>
      <div className="p-3 border-t border-white/10">
        <button onClick={() => { logoutAdmin(); setPage('home'); }} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition">
          <LogOut className="w-4 h-4" /><span>Secure Logout</span>
        </button>
      </div>
    </aside>
  );

  const TopHeader = ({ title }: { title: string }) => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-3">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-white"><Menu className="w-5 h-5" /></button>
        <h2 className="text-lg font-black text-white font-industrial">{title}</h2>
      </div>
      <div className="flex items-center space-x-3">
        <button className="hidden sm:flex items-center space-x-2 bg-white/5 border border-white/10 text-slate-300 px-3 py-2 rounded-xl text-xs font-bold hover:bg-white/10 transition">
          <Globe className="w-3.5 h-3.5" /><span>Sync Database</span>
        </button>
        <div className="flex items-center space-x-2 bg-white/5 border border-white/10 px-3 py-2 rounded-xl">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs font-bold text-slate-300">Admin Online</span>
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
          { label: 'Total Revenue', value: `Rs.${totalRevenue.toLocaleString('en-IN')}`, sub: 'Live Tracking', icon: TrendingUp, color: 'from-emerald-500 to-teal-600', trend: true },
          { label: 'Total Orders', value: orders.length, sub: `${orders.filter(o => new Date(o.date).toDateString() === new Date().toDateString()).length} Orders Today`, icon: ShoppingCart, color: 'from-blue-500 to-indigo-600' },
          { label: 'Pending Dispatch', value: pendingOrders.length, sub: 'Requires Action', icon: Clock, color: 'from-amber-500 to-orange-600' },
          { label: 'Delivered', value: deliveredOrders.length, sub: `${orders.filter(o => o.status === 'cancelled').length} Cancelled`, icon: CheckCircle, color: 'from-purple-500 to-pink-600' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-blue-500/30 transition">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}><Icon className="w-5 h-5 text-white" /></div>
                {stat.trend && <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full">↗ Live</span>}
              </div>
              <div className="text-2xl font-black text-white">{stat.value}</div>
              <div className="text-[10px] text-slate-400 mt-1">{stat.sub}</div>
            </div>
          );
        })}
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white mb-4">Recent Orders</h3>
        {orders.length === 0 ? <p className="text-xs text-slate-500 text-center py-8">No orders yet</p> : (
          <div className="space-y-3">
            {orders.slice(0, 5).map(o => (
              <div key={o.id} className="flex items-center justify-between bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                <div>
                  <div className="text-xs font-bold text-slate-200">{o.orderId} - {o.customer.name}</div>
                  <div className="text-[10px] text-slate-400">{o.customer.mobile} | {new Date(o.date).toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-white">Rs.{o.total.toLocaleString('en-IN')}</div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ORDER_STATUSES.find(s => s.key === o.status)?.color || ''}`}>{o.status}</span>
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
    const bestSelling = [...products].sort((a, b) => b.stock - a.stock).slice(0, 5);
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
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="text-xs font-bold text-slate-400 mb-2">{period.label}</div>
              <div className="text-xl font-black text-white">Rs.{period.revenue.toLocaleString('en-IN')}</div>
              <div className="text-[10px] text-slate-400 mt-1">{period.orders} orders</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4">Order Status Breakdown</h3>
            {ORDER_STATUSES.map(s => {
              const count = orders.filter(o => o.status === s.key).length;
              const pct = orders.length > 0 ? (count / orders.length * 100) : 0;
              return (
                <div key={s.key} className="flex items-center justify-between py-2">
                  <span className="text-xs text-slate-300">{s.label}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} /></div>
                    <span className="text-xs font-bold text-white w-6 text-right">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4">Low Stock Alert</h3>
            {lowStock.length === 0 ? <p className="text-xs text-slate-500 text-center py-8">All products well stocked</p> : (
              <div className="space-y-3">
                {lowStock.map(p => (
                  <div key={p.id} className="flex items-center justify-between bg-amber-500/5 border border-amber-500/20 p-3 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <img src={p.image} alt="" className="w-8 h-8 rounded-lg object-cover" />
                      <div>
                        <div className="text-xs font-bold text-slate-200 line-clamp-1">{p.name}</div>
                        <div className="text-[10px] text-slate-400">{p.brand}</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-amber-400">{p.stock} left</span>
                  </div>
                ))}
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
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
              className="w-full bg-slate-900/50 border border-slate-700/50 text-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-blue-500" />
          </div>
          <button onClick={() => { setShowAdd(!showAdd); setEditingId(null); }} className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold">
            <Plus className="w-3.5 h-3.5" /><span>Add Product</span>
          </button>
        </div>

        {showAdd && (
          <div className="bg-white/5 border border-blue-500/30 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Add New Product</h3>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Product Name" value={newProd.name} onChange={e => setNewProd({ ...newProd, name: e.target.value })} className="bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-blue-500" />
              <select value={newProd.category} onChange={e => setNewProd({ ...newProd, category: e.target.value })} className="bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-blue-500">
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
              <input type="text" placeholder="Brand" value={newProd.brand} onChange={e => setNewProd({ ...newProd, brand: e.target.value })} className="bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-blue-500" />
              <input type="number" placeholder="Price" value={newProd.price || ''} onChange={e => setNewProd({ ...newProd, price: Number(e.target.value) })} className="bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-blue-500" />
              <input type="number" placeholder="Stock" value={newProd.stock || ''} onChange={e => setNewProd({ ...newProd, stock: Number(e.target.value) })} className="bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-blue-500" />
              <input type="text" placeholder="Grade" value={newProd.grade} onChange={e => setNewProd({ ...newProd, grade: e.target.value })} className="bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-blue-500" />
            </div>
            <textarea placeholder="Description" value={newProd.description} onChange={e => setNewProd({ ...newProd, description: e.target.value })} rows={2} className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-blue-500 resize-none" />
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-400 mb-1">Product Image</label>
                <label className="block cursor-pointer bg-slate-900 hover:bg-slate-800 border border-dashed border-slate-600 hover:border-blue-500 rounded-xl px-4 py-3 text-center transition">
                  <span className="text-xs font-bold text-slate-300 flex items-center justify-center space-x-2"><ImageIcon className="w-4 h-4" /><span>{newProd.image ? 'Change Image' : 'Upload Image'}</span></span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => { setNewProd({ ...newProd, image: ev.target?.result as string }); };
                    reader.readAsDataURL(file);
                  }} />
                </label>
                {newProd.image && <img src={newProd.image} alt="Preview" className="w-16 h-16 object-cover rounded-lg mt-2 border border-slate-700" />}
              </div>
            </div>
            <div className="flex space-x-3">
              <button onClick={handleAdd} className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold">Save Product</button>
              <button onClick={() => setShowAdd(false)} className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold">Cancel</button>
            </div>
          </div>
        )}

        {editingId && (
          <div className="bg-white/5 border border-amber-500/30 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Edit Product</h3>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Product Name" value={editProd.name} onChange={e => setEditProd({ ...editProd, name: e.target.value })} className="bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-amber-500" />
              <select value={editProd.category} onChange={e => setEditProd({ ...editProd, category: e.target.value })} className="bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-amber-500">
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
              <input type="text" placeholder="Brand" value={editProd.brand} onChange={e => setEditProd({ ...editProd, brand: e.target.value })} className="bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-amber-500" />
              <input type="text" placeholder="Unit" value={editProd.unit} onChange={e => setEditProd({ ...editProd, unit: e.target.value })} className="bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-amber-500" />
              <input type="number" placeholder="Price (Rs.)" value={editProd.price || ''} onChange={e => setEditProd({ ...editProd, price: Number(e.target.value) })} className="bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-amber-500" />
              <input type="number" placeholder="Stock" value={editProd.stock || ''} onChange={e => setEditProd({ ...editProd, stock: Number(e.target.value) })} className="bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-amber-500" />
              <input type="text" placeholder="Grade" value={editProd.grade} onChange={e => setEditProd({ ...editProd, grade: e.target.value })} className="bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-amber-500" />
            </div>
            <textarea placeholder="Description" value={editProd.description} onChange={e => setEditProd({ ...editProd, description: e.target.value })} rows={3} className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-amber-500 resize-none" />
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-400 mb-1">Product Image</label>
                <label className="block cursor-pointer bg-slate-900 hover:bg-slate-800 border border-dashed border-slate-600 hover:border-amber-500 rounded-xl px-4 py-3 text-center transition">
                  <span className="text-xs font-bold text-slate-300 flex items-center justify-center space-x-2"><ImageIcon className="w-4 h-4" /><span>{editProd.image ? 'Change Image' : 'Upload Image'}</span></span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => { setEditProd({ ...editProd, image: ev.target?.result as string }); };
                    reader.readAsDataURL(file);
                  }} />
                </label>
                {editProd.image && <img src={editProd.image} alt="Preview" className="w-16 h-16 object-cover rounded-lg mt-2 border border-slate-700" />}
              </div>
            </div>
            <div className="flex space-x-3">
              <button onClick={saveEdit} className="bg-amber-500 text-white px-4 py-2 rounded-xl text-xs font-bold">Save Changes</button>
              <button onClick={() => setEditingId(null)} className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold">Cancel</button>
            </div>
          </div>
        )}

        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-slate-800">
                <th className="text-left px-4 py-3 text-slate-400 font-bold">Product</th>
                <th className="text-left px-4 py-3 text-slate-400 font-bold hidden sm:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-slate-400 font-bold">Price</th>
                <th className="text-left px-4 py-3 text-slate-400 font-bold">Stock</th>
                <th className="text-left px-4 py-3 text-slate-400 font-bold">Status</th>
                <th className="text-left px-4 py-3 text-slate-400 font-bold">Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-b border-slate-800/50 hover:bg-white/5">
                    <td className="px-4 py-3"><div className="flex items-center space-x-3"><img src={p.image} alt="" className="w-9 h-9 rounded-lg object-cover" /><div><div className="font-bold text-slate-200 line-clamp-1 max-w-[200px]">{p.name}</div><div className="text-[10px] text-slate-500">{p.brand}</div></div></div></td>
                    <td className="px-4 py-3 text-slate-300 hidden sm:table-cell">{p.category}</td>
                    <td className="px-4 py-3 font-bold text-white">Rs.{p.price}</td>
                    <td className="px-4 py-3"><span className={`font-bold ${p.stock < 50 ? 'text-amber-400' : 'text-slate-300'}`}>{p.stock}</span></td>
                    <td className="px-4 py-3"><button onClick={() => toggleProduct(p.id)} className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition ${p.enabled ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'}`}>{p.enabled ? 'Active' : 'Off'}</button></td>
                    <td className="px-4 py-3"><div className="flex items-center space-x-2"><button onClick={() => startEdit(p)} className="text-slate-400 hover:text-amber-400 transition"><Edit className="w-3.5 h-3.5" /></button><button onClick={() => { if (window.confirm(`Delete "${p.name}"?`)) deleteProduct(p.id); }} className="text-slate-400 hover:text-rose-400 transition"><Trash2 className="w-3.5 h-3.5" /></button></div></td>
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
    const [newCat, setNewCat] = useState('');
    const handleAdd = () => {
      if (!newCat) return;
      ctx.addCategory({ id: `cat-${Date.now()}`, name: newCat, image: '/cement_banner_new.png', description: '', enabled: true });
      setNewCat('');
    };
    return (
      <div className="space-y-6">
        <TopHeader title="Categories" />
        <div className="flex items-center space-x-3">
          <input type="text" value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="New category name" className="flex-1 bg-slate-900/50 border border-slate-700/50 text-slate-200 px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-blue-500" />
          <button onClick={handleAdd} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2"><Plus className="w-3.5 h-3.5" /><span>Add</span></button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(c => (
            <div key={c.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:border-blue-500/30 transition">
              <div className="flex items-center space-x-3">
                <img src={c.image} alt="" className="w-10 h-10 rounded-xl object-cover" />
                <div>
                  <div className="text-xs font-bold text-white">{c.name}</div>
                  <div className="text-[10px] text-slate-400">{products.filter(p => p.category === c.name).length} products</div>
                </div>
              </div>
              <button onClick={() => deleteCategory(c.id)} className="text-slate-400 hover:text-rose-400"><Trash2 className="w-3.5 h-3.5" /></button>
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
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition ${filter === 'all' ? 'bg-blue-500/20 text-white border border-blue-500/30' : 'text-slate-400 border border-white/10'}`}>All ({orders.length})</button>
          {ORDER_STATUSES.slice(0, 6).map(s => (
            <button key={s.key} onClick={() => setFilter(s.key)} className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition ${filter === s.key ? 'bg-blue-500/20 text-white border border-blue-500/30' : 'text-slate-400 border border-white/10'}`}>{s.label} ({orders.filter(o => o.status === s.key).length})</button>
          ))}
        </div>
        {filtered.length === 0 ? <p className="text-xs text-slate-500 text-center py-12">No orders found</p> : (
          <div className="space-y-4">
            {filtered.map(o => (
              <div key={o.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">{o.orderId}</div>
                    <div className="text-xs text-slate-400">{o.customer.name} | {o.customer.mobile} | {new Date(o.date).toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-white">Rs.{o.total.toLocaleString('en-IN')}</div>
                  </div>
                </div>
                <div className="text-xs text-slate-400">
                  <div>Items: {o.items.map(i => `${i.product.name} x${i.quantity}`).join(', ')}</div>
                  <div>Delivery: {o.deliveryLocation} | Payment: {o.paymentMode}</div>
                  <div>Address: {o.customer.address}, {o.customer.landmark}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-slate-400">Update Status:</span>
                    <select value={o.status} onChange={e => updateOrderStatus(o.orderId, e.target.value as OrderStatus)} className="bg-slate-900 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-[10px] font-bold focus:outline-none focus:border-blue-500">
                      {ORDER_STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                    </select>
                  </div>
                  <button onClick={() => { if (window.confirm(`Delete order ${o.orderId}? This cannot be undone.`)) deleteOrder(o.orderId); }} className="flex items-center space-x-1 text-[10px] font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg transition">
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
      {customers.length === 0 ? <p className="text-xs text-slate-500 text-center py-12">No customers yet. They will appear after first orders.</p> : (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-slate-800">
                <th className="text-left px-4 py-3 text-slate-400 font-bold">Customer</th>
                <th className="text-left px-4 py-3 text-slate-400 font-bold hidden sm:table-cell">Mobile</th>
                <th className="text-left px-4 py-3 text-slate-400 font-bold">Orders</th>
                <th className="text-left px-4 py-3 text-slate-400 font-bold">Spending</th>
                <th className="text-left px-4 py-3 text-slate-400 font-bold hidden sm:table-cell">Last Order</th>
                <th className="text-right px-4 py-3 text-slate-400 font-bold">Action</th>
              </tr></thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id} className="border-b border-slate-800/50 hover:bg-white/5">
                    <td className="px-4 py-3"><div className="font-bold text-slate-200">{c.name}</div></td>
                    <td className="px-4 py-3 text-slate-300 hidden sm:table-cell">{c.mobile}</td>
                    <td className="px-4 py-3 font-bold text-white">{c.totalOrders}</td>
                    <td className="px-4 py-3 font-bold text-white">Rs.{c.totalSpending.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-slate-400 hidden sm:table-cell">{new Date(c.lastOrder).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => { if (window.confirm(`Delete customer ${c.name}?`)) deleteCustomer(c.id); }} className="text-slate-400 hover:text-rose-400 transition p-1.5 rounded-lg hover:bg-rose-500/10">
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
    const handleAdd = () => {
      if (!newBlock.title) return;
      ctx.addContentBlock({ id: `cb-${Date.now()}`, ...newBlock, active: true, order: contentBlocks.length + 1 });
      setNewBlock({ title: '', subtitle: '', type: 'banner' }); setShowAdd(false);
    };
    return (
      <div className="space-y-6">
        <TopHeader title="Content & Ads" />
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white">Front Page Photos (Splash / Landing)</h3>
          <p className="text-[10px] text-slate-400">Upload photos that appear on the landing page. The first image is the default. If multiple images are added, they rotate automatically every 5 seconds.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {(siteContent.frontPageImages || []).map((img, i) => (
              <div key={i} className="relative group rounded-xl overflow-hidden border border-white/10">
                <img src={img} alt={`Front page ${i + 1}`} className="w-full aspect-video object-cover" />
                <div className="absolute top-1 left-1 bg-black/60 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">#{i + 1}</div>
                <button onClick={() => {
                  const imgs = (siteContent.frontPageImages || []).filter((_: string, j: number) => j !== i);
                  updateSiteContent({ frontPageImages: imgs });
                }} className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-500 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition"><Trash2 className="w-3 h-3" /></button>
              </div>
            ))}
          </div>
          <label className="block cursor-pointer bg-slate-900 hover:bg-slate-800 border border-dashed border-slate-600 hover:border-blue-500 rounded-xl px-4 py-3 text-center transition">
            <span className="text-xs font-bold text-slate-300 flex items-center justify-center space-x-2"><ImageIcon className="w-4 h-4" /><span>Add Front Page Photo</span></span>
            <input type="file" accept="image/*" className="hidden" onChange={e => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = ev => {
                if (ev.target?.result) {
                  const imgs = [...(siteContent.frontPageImages || []), ev.target.result as string];
                  updateSiteContent({ frontPageImages: imgs });
                }
              };
              reader.readAsDataURL(file);
            }} />
          </label>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white">Homepage Hero</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-[10px] font-bold text-slate-400 block mb-1">Business Name</label><input type="text" value={siteContent.businessName} onChange={e => updateSiteContent({ businessName: e.target.value })} className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-blue-500" /></div>
            <div><label className="text-[10px] font-bold text-slate-400 block mb-1">Phone</label><input type="text" value={siteContent.phone} onChange={e => updateSiteContent({ phone: e.target.value })} className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-blue-500" /></div>
            <div><label className="text-[10px] font-bold text-slate-400 block mb-1">WhatsApp</label><input type="text" value={siteContent.whatsapp} onChange={e => updateSiteContent({ whatsapp: e.target.value })} className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-blue-500" /></div>
            <div><label className="text-[10px] font-bold text-slate-400 block mb-1">Address</label><input type="text" value={siteContent.address} onChange={e => updateSiteContent({ address: e.target.value })} className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-blue-500" /></div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Banners & Promotions</h3>
          <button onClick={() => setShowAdd(!showAdd)} className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold"><Plus className="w-3.5 h-3.5" /><span>Add Banner</span></button>
        </div>
        {showAdd && (
          <div className="bg-white/5 border border-blue-500/30 rounded-2xl p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Title" value={newBlock.title} onChange={e => setNewBlock({ ...newBlock, title: e.target.value })} className="bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-blue-500" />
              <input type="text" placeholder="Subtitle" value={newBlock.subtitle || ''} onChange={e => setNewBlock({ ...newBlock, subtitle: e.target.value })} className="bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-blue-500" />
            </div>
            <div className="flex space-x-3">
              <button onClick={handleAdd} className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold">Save</button>
              <button onClick={() => setShowAdd(false)} className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold">Cancel</button>
            </div>
          </div>
        )}
        <div className="space-y-3">
          {contentBlocks.length === 0 ? <p className="text-xs text-slate-500 text-center py-8">No banners yet</p> : contentBlocks.map(b => (
            <div key={b.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
              <div><div className="text-xs font-bold text-white">{b.title}</div><div className="text-[10px] text-slate-400">{b.subtitle} | {b.type}</div></div>
              <div className="flex items-center space-x-2">
                <button onClick={() => ctx.toggleContentBlock(b.id)} className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${b.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>{b.active ? 'Active' : 'Off'}</button>
                <button onClick={() => deleteContentBlock(b.id)} className="text-slate-400 hover:text-rose-400"><Trash2 className="w-3.5 h-3.5" /></button>
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
          <p className="text-xs text-slate-400">Manage delivery zones and charges</p>
          <button onClick={() => setShowAdd(!showAdd)} className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold"><Plus className="w-3.5 h-3.5" /><span>Add Zone</span></button>
        </div>
        {showAdd && (
          <div className="bg-white/5 border border-blue-500/30 rounded-2xl p-4 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <input type="text" placeholder="Zone Name" value={newZone.name} onChange={e => setNewZone({ ...newZone, name: e.target.value })} className="bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-blue-500" />
              <input type="text" placeholder="Mandal" value={newZone.mandal} onChange={e => setNewZone({ ...newZone, mandal: e.target.value })} className="bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-blue-500" />
              <input type="number" placeholder="Charge (Rs.)" value={newZone.charge || ''} onChange={e => setNewZone({ ...newZone, charge: Number(e.target.value) })} className="bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-blue-500" />
              <input type="text" placeholder="Est. Time" value={newZone.estimatedTime} onChange={e => setNewZone({ ...newZone, estimatedTime: e.target.value })} className="bg-slate-900 border border-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-blue-500" />
            </div>
            <div className="flex space-x-3">
              <button onClick={handleAdd} className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold">Save</button>
              <button onClick={() => setShowAdd(false)} className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold">Cancel</button>
            </div>
          </div>
        )}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-slate-800">
              <th className="text-left px-4 py-3 text-slate-400 font-bold">Zone</th>
              <th className="text-left px-4 py-3 text-slate-400 font-bold">Mandal</th>
              <th className="text-left px-4 py-3 text-slate-400 font-bold">Charge</th>
              <th className="text-left px-4 py-3 text-slate-400 font-bold hidden sm:table-cell">Est. Time</th>
              <th className="text-left px-4 py-3 text-slate-400 font-bold">Actions</th>
            </tr></thead>
            <tbody>
              {transportZones.map(z => (
                <tr key={z.id} className="border-b border-slate-800/50 hover:bg-white/5">
                  <td className="px-4 py-3 font-bold text-slate-200">{z.name}</td>
                  <td className="px-4 py-3 text-slate-300">{z.mandal}</td>
                  <td className="px-4 py-3 font-bold text-white">{z.charge === 0 ? 'FREE' : `Rs.${z.charge}`}</td>
                  <td className="px-4 py-3 text-slate-400 hidden sm:table-cell">{z.estimatedTime}</td>
                  <td className="px-4 py-3"><button onClick={() => deleteTransportZone(z.id)} className="text-slate-400 hover:text-rose-400"><Trash2 className="w-3.5 h-3.5" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
            <p className="text-xs text-slate-400">{unreadNotifs} unread</p>
            <span className="text-xs text-slate-600">|</span>
            <p className="text-xs text-slate-400">{notifications.filter(n => n.active).length} active</p>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => ctx.clearNotifications()} className="text-xs font-bold text-slate-400 hover:text-white border border-white/10 px-3 py-1.5 rounded-lg transition">Mark All Read</button>
            <button onClick={() => { setShowAdd(!showAdd); setEditingId(null); setNewTitle(''); setNewContent(''); }} className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-xl text-xs font-bold">
              <Plus className="w-3.5 h-3.5" /><span>New Alert</span>
            </button>
          </div>
        </div>

        {showAdd && (
          <div className="bg-white/5 border border-purple-500/30 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Create Notification Alert</h3>
            <input type="text" placeholder="Title (e.g. Flash Sale, Price Drop, Holiday Notice)" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-purple-500" />
            <textarea placeholder="Message content for customers..." value={newContent} onChange={e => setNewContent(e.target.value)} rows={3} className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-purple-500 resize-none" />
            <select value={newType} onChange={e => setNewType(e.target.value)} className="bg-slate-900 border border-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-purple-500">
              <option value="announcement">📢 Announcement</option>
              <option value="offer">🏷️ Offer / Sale</option>
              <option value="update">🔄 Price Update</option>
              <option value="alert">⚠️ Alert</option>
            </select>
            <div className="flex space-x-3">
              <button onClick={handleAdd} className="bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-bold">Publish Alert</button>
              <button onClick={() => setShowAdd(false)} className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold">Cancel</button>
            </div>
          </div>
        )}

        {editingId && (
          <div className="bg-white/5 border border-amber-500/30 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Edit Notification</h3>
            <input type="text" placeholder="Title" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-amber-500" />
            <textarea placeholder="Message" value={newContent} onChange={e => setNewContent(e.target.value)} rows={3} className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-amber-500 resize-none" />
            <div className="flex space-x-3">
              <button onClick={handleSaveEdit} className="bg-amber-500 text-white px-4 py-2 rounded-xl text-xs font-bold">Save Changes</button>
              <button onClick={() => { setEditingId(null); setNewTitle(''); setNewContent(''); }} className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold">Cancel</button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {notifications.length === 0 ? <p className="text-xs text-slate-500 text-center py-12">No notifications yet. Create your first alert above!</p> : notifications.map(n => (
            <div key={n.id} className={`bg-white/5 border rounded-2xl p-4 transition hover:border-purple-500/30 ${n.read ? 'border-white/5' : 'border-blue-500/30'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 cursor-pointer" onClick={() => ctx.markNotificationRead(n.id)}>
                  <div className="flex items-center space-x-2 mb-1">
                    {!n.read && <div className="w-2 h-2 bg-blue-400 rounded-full shrink-0" />}
                    <div className="text-xs font-bold text-white">{n.title}</div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 font-bold border border-purple-500/20">{n.type}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${n.active !== false ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-slate-500/20 text-slate-400 border border-slate-500/20'}`}>{n.active !== false ? 'Active' : 'Hidden'}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 pl-4">{n.content}</div>
                  {n.createdAt && <div className="text-[10px] text-slate-500 mt-1 pl-4">{new Date(n.createdAt).toLocaleString()}</div>}
                </div>
                <div className="flex items-center space-x-1 shrink-0">
                  <button onClick={() => ctx.updateNotification(n.id, { active: n.active === false ? true : false })} className={`text-[10px] px-2 py-1 rounded-lg font-bold transition ${n.active !== false ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-slate-500/20 text-slate-400 hover:bg-slate-500/30'}`}>{n.active !== false ? 'Hide' : 'Show'}</button>
                  <button onClick={() => handleEdit(n.id, n.title, n.content)} className="text-slate-400 hover:text-amber-400 transition p-1"><Edit className="w-3.5 h-3.5" /></button>
                  <button onClick={() => { if (window.confirm(`Delete notification "${n.title}"?`)) ctx.deleteNotification(n.id); }} className="text-slate-400 hover:text-rose-400 transition p-1"><Trash2 className="w-3.5 h-3.5" /></button>
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
            <div key={t.id} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white">{t.title}</h3>
                <button onClick={() => { setEditing(editing === t.id ? null : t.id); setEditContent(t.content); }} className="text-xs font-bold text-blue-400 hover:text-blue-300">{editing === t.id ? 'Cancel' : 'Edit'}</button>
              </div>
              {editing === t.id ? (
                <div className="space-y-3">
                  <textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={6} className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-4 py-3 rounded-xl text-xs focus:outline-none focus:border-blue-500 resize-none" />
                  <button onClick={() => { updateTermsContent(t.id, editContent); setEditing(null); }} className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold">Save Changes</button>
                </div>
              ) : (
                <p className="text-xs text-slate-400 leading-relaxed">{t.content}</p>
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
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
        <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">Business Information</h3>
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
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">{f.label}</label>
              <input type="text" value={f.val} onChange={e => updateSiteSettings({ [f.key]: e.target.value })} className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition" />
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">Admin Account</h3>
        <div className="space-y-3">
          <div><label className="text-xs font-bold text-slate-300 block mb-1.5">Email</label><div className="bg-slate-900/50 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200">habeebc84@gmail.com</div></div>
          <div><label className="text-xs font-bold text-slate-300 block mb-1.5">Password</label>
            <div className="flex space-x-2">
              <input type="password" defaultValue="admin123" readOnly className="flex-1 bg-slate-900/50 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200" />
              <button onClick={() => { const np = prompt('Enter new password:'); if (np) { localStorage.setItem('hsn_admin_password', np); alert('Password updated'); } }} className="bg-white/10 border border-white/10 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-white/20 transition">Change</button>
            </div>
          </div>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-xs text-amber-300">
          <p className="font-bold mb-1"><Lock className="w-3.5 h-3.5 inline mr-1" />Security Note</p>
          <p>Keep your credentials secure. Admin access controls the entire store management system.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative z-10">
      <Sidebar />
      {sidebarOpen && <div className="fixed inset-0 bg-slate-950/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className="lg:ml-64 p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </div>
    </div>
  );
}
