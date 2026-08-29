import { useState } from 'react';
import { X, ZoomIn } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Gallery() {
  const { siteContent } = useApp();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div className="py-10 bg-transparent min-h-screen relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-5xl font-black text-slate-100 font-industrial">
            Our <span className="bg-gradient-to-r from-blue-400 to-pink-500 bg-clip-text text-transparent">Gallery</span>
          </h1>
          <p className="text-slate-400 text-sm mt-2">Warehouse stock, delivery fleet, and product displays</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {siteContent.galleryImages.map(img => (
            <div
              key={img.id}
              className="group relative bg-white/5 rounded-2xl border border-white/10 overflow-hidden hover:border-blue-500/40 transition cursor-pointer"
              onClick={() => setSelectedImage(img.url)}
            >
              <img src={img.url} alt={img.title} className="w-full h-64 object-cover group-hover:scale-105 transition duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
              <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition">
                <span className="text-xs font-bold text-white">{img.title}</span>
                <span className="block text-[10px] text-slate-300">{img.category}</span>
              </div>
              <div className="absolute top-3 right-3 bg-slate-900/60 backdrop-blur-sm p-2 rounded-xl opacity-0 group-hover:opacity-100 transition">
                <ZoomIn className="w-4 h-4 text-white" />
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox */}
        {selectedImage && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
            <button className="absolute top-6 right-6 text-white p-2 hover:bg-white/10 rounded-xl transition">
              <X className="w-6 h-6" />
            </button>
            <img src={selectedImage} alt="" className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()} />
          </div>
        )}
      </div>
    </div>
  );
}
