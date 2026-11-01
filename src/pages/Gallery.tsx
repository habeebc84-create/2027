import { useState } from 'react';
import { X, ZoomIn, Trophy, FileText, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Gallery() {
  const { siteContent, achievements } = useApp();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedAch, setSelectedAch] = useState<string | null>(null);

  const selected = achievements.find(a => a.id === selectedAch) || null;

  return (
    <div className="py-10 bg-transparent min-h-screen relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-5xl font-black text-ivory font-industrial">
            Our <span className="bg-gradient-to-r from-brand-400 to-brand-500 bg-clip-text text-transparent">Gallery</span>
          </h1>
          <p className="text-silver text-sm mt-2">Warehouse stock, delivery fleet, and product displays</p>
        </div>

        {achievements.length > 0 && (
          <>
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-ivory font-industrial flex items-center justify-center space-x-2">
                <Trophy className="w-5 h-5 text-brand-400" />
                <span>Achievements <span className="text-silver">&</span> Contracts</span>
              </h2>
              <p className="text-silver text-xs mt-1">Milestones, completed contracts, and certifications from 15+ years of service</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-14">
              {achievements.map(a => (
                <div
                  key={a.id}
                  className="group relative bg-charcoal rounded-2xl border border-brand-500/20 overflow-hidden hover:border-brand-500/50 transition cursor-pointer"
                  onClick={() => setSelectedAch(a.id)}
                >
                  <img src={a.imageUrl} alt={a.title} className="w-full h-52 object-cover group-hover:scale-105 transition duration-500" />
                  <div className="absolute top-3 left-3 bg-obsidian/80 backdrop-blur-sm border border-brand-500/30 px-2.5 py-1 rounded-full text-[10px] font-black text-brand-300 flex items-center space-x-1.5">
                    {a.kind === 'contract' ? <FileText className="w-3 h-3" /> : a.kind === 'certificate' ? <Award className="w-3 h-3" /> : <Trophy className="w-3 h-3" />}
                    <span>{a.kind === 'contract' ? 'CONTRACT' : a.kind === 'certificate' ? 'CERTIFICATE' : 'ACHIEVEMENT'}</span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-bold text-ivory line-clamp-1">{a.title}</h3>
                    {a.date && <p className="text-[10px] text-brand-400 font-bold mt-0.5">{a.date}</p>}
                    {a.description && <p className="text-xs text-silver mt-1.5 line-clamp-2">{a.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {siteContent.galleryImages.map(img => (
            <div
              key={img.id}
              className="group relative bg-charcoal rounded-2xl border border-gunmetal overflow-hidden hover:border-brand-500/40 transition cursor-pointer"
              onClick={() => setSelectedImage(img.url)}
            >
              <img src={img.url} alt={img.title} className="w-full h-64 object-cover group-hover:scale-105 transition duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
              <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition">
                <span className="text-xs font-bold text-ivory">{img.title}</span>
                <span className="block text-[10px] text-silver">{img.category}</span>
              </div>
              <div className="absolute top-3 right-3 bg-charcoal/60 backdrop-blur-sm p-2 rounded-xl opacity-0 group-hover:opacity-100 transition">
                <ZoomIn className="w-4 h-4 text-ivory" />
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox */}
        {selectedImage && (
          <div className="fixed inset-0 z-50 bg-obsidian/90 backdrop-blur-xl flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
            <button className="absolute top-6 right-6 text-ivory p-2 hover:bg-white/10 rounded-xl transition">
              <X className="w-6 h-6" />
            </button>
            <img src={selectedImage} alt="" className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()} />
          </div>
        )}

        {/* Achievement detail modal */}
        {selected && (
          <div className="fixed inset-0 z-50 bg-obsidian/90 backdrop-blur-xl flex items-center justify-center p-4" onClick={() => setSelectedAch(null)}>
            <div className="bg-charcoal border border-brand-500/30 rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
              <img src={selected.imageUrl} alt={selected.title} className="w-full h-64 object-cover" />
              <div className="p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-brand-300 bg-brand-500/10 border border-brand-500/25 px-2 py-1 rounded-full">
                    {selected.kind === 'contract' ? 'CONTRACT' : selected.kind === 'certificate' ? 'CERTIFICATE' : 'ACHIEVEMENT'}
                  </span>
                  <button onClick={() => setSelectedAch(null)} className="text-silver hover:text-ivory p-1.5 hover:bg-white/10 rounded-lg transition"><X className="w-4 h-4" /></button>
                </div>
                <h3 className="text-lg font-black text-ivory">{selected.title}</h3>
                {selected.date && <p className="text-xs text-brand-400 font-bold">{selected.date}</p>}
                {selected.description && <p className="text-sm text-silver leading-relaxed">{selected.description}</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
