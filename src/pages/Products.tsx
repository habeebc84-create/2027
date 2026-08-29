import { useState } from 'react';
import { Search, Filter, Grid, List } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';

export default function Products() {
  const { products, categories, brands } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');

  const enabledProducts = products.filter(p => p.enabled);

  const filtered = enabledProducts.filter(p => {
    const matchesSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesBrand = selectedBrand === 'All' || p.brand === selectedBrand;
    return matchesSearch && matchesCategory && matchesBrand;
  });

  const allCategoryNames = ['All', ...new Set(enabledProducts.map(p => p.category))];
  const allBrandNames = ['All', ...new Set(enabledProducts.map(p => p.brand))];

  return (
    <div className="py-12 bg-transparent min-h-screen relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-5xl font-black text-slate-100 font-industrial">
            Our <span className="bg-gradient-to-r from-blue-400 to-pink-500 bg-clip-text text-transparent">Product Catalog</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mt-2">Browse genuine construction materials at wholesale direct daily rates</p>
        </div>

        {/* Filters */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 mb-8 backdrop-blur-xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products, brands..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700/50 text-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* Category filter */}
            <div className="relative">
              <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700/50 text-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-blue-500 transition appearance-none"
              >
                {allCategoryNames.map(cat => (
                  <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
                ))}
              </select>
            </div>

            {/* Brand filter */}
            <select
              value={selectedBrand}
              onChange={e => setSelectedBrand(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700/50 text-slate-200 px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-blue-500 transition appearance-none"
            >
              {allBrandNames.map(brand => (
                <option key={brand} value={brand}>{brand === 'All' ? 'All Brands' : brand}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs text-slate-400 font-semibold">
            Showing <span className="text-white">{filtered.length}</span> of {enabledProducts.length} products
          </p>
          {(selectedCategory !== 'All' || selectedBrand !== 'All' || search) && (
            <button
              onClick={() => { setSearch(''); setSelectedCategory('All'); setSelectedBrand('All'); }}
              className="text-xs font-bold text-pink-400 hover:text-pink-300 transition"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Products Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <Search className="w-12 h-12 mx-auto mb-4 text-slate-600" />
            <p className="text-lg font-bold">No products found</p>
            <p className="text-sm mt-1">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Categories quick access */}
        <div className="mt-16 pt-12 border-t border-slate-800">
          <h2 className="text-xl font-black text-white font-industrial mb-6 text-center">
            Shop by <span className="bg-gradient-to-r from-blue-400 to-pink-500 bg-clip-text text-transparent">Category</span>
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
            {categories.map(cat => {
              const count = enabledProducts.filter(p => p.category === cat.name).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`bg-white/5 border rounded-2xl p-3 flex flex-col items-center space-y-2 transition group ${
                    selectedCategory === cat.name ? 'border-blue-500/50 bg-blue-500/10' : 'border-white/10 hover:border-blue-500/30'
                  }`}
                >
                  <img src={cat.image} alt={cat.name} className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-xl group-hover:scale-110 transition" />
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-300 text-center leading-tight">{cat.name}</span>
                  <span className="text-[8px] text-slate-500">{count} items</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
