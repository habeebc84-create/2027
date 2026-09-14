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
          <h1 className="text-3xl sm:text-5xl font-black text-slate-100 font-industrial">
            Our <span className="bg-gradient-to-r from-blue-400 to-pink-500 bg-clip-text text-transparent">Gallery</span>
          </h1>
          <p className="text-slate-400 text-sm mt-2">Warehouse stock, delivery fleet, and product displays</p>
        </div>

        {achievements.length > 0 && (
          <>
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-slate-100 font-industrial flex items-center justify-center space-x-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>Achievements <span className="text-slate-500">&</span> Contracts</span>
              </h2>
              <p className="text-slate-400 text-xs mt-1">Milestones, completed contracts, and certifications from 15+ years of service</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
              {achievements.map(a => (
                <div
                  key={a.id}
                  className="group relative bg-white/5 rounded-2xl border border-amber-500/20 overflow-hidden hover:border-amber-500/50 transition cursor-pointer"
                  onClick={() => setSelectedAch(a.id)}
                >
                  <img src={a.imageUrl} alt={a.title} className="w-full h-52 object-cover group-hover:scale-105 transition duration-500" />
                  <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-sm border border-amber-500/30 px-2.5 py-1 rounded-full text-[10px] font-black text-amber-300 flex items-center space-x-1.5">
                    {a.kind === 'contract' ? <FileText className="w-3 h-3" /> : a.kind === 'certificate' ? <Award className="w-3 h-3" /> : <Trophy className="w-3 h-3" />}
                    <span>{a.kind === 'contract' ? 'CONTRACT' : a.kind === 'certificate' ? 'CERTIFICATE' : 'ACHIEVEMENT'}</span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-bold text-white line-clamp-1">{a.title}</h3>
                    {a.date && <p className="text-[10px] text-amber-400 font-bold mt-0.5">{a.date}</p>}
                    {a.description && <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">{a.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

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

        {/* Achievement detail modal */}
        {selected && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4" onClick={() => setSelectedAch(null)}>
            <div className="bg-slate-900 border border-amber-500/30 rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
              <img src={selected.imageUrl} alt={selected.title} className="w-full h-64 object-cover" />
              <div className="p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-amber-300 bg-amber-500/10 border border-amber-500/25 px-2 py-1 rounded-full">
                    {selected.kind === 'contract' ? 'CONTRACT' : selected.kind === 'certificate' ? 'CERTIFICATE' : 'ACHIEVEMENT'}
                  </span>
                  <button onClick={() => setSelectedAch(null)} className="text-slate-400 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition"><X className="w-4 h-4" /></button>
                </div>
                <h3 className="text-lg font-black text-white">{selected.title}</h3>
                {selected.date && <p className="text-xs text-amber-400 font-bold">{selected.date}</p>}
                {selected.description && <p className="text-sm text-slate-300 leading-relaxed">{selected.description}</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
