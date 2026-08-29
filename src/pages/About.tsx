import { Shield, Truck, Heart, Phone } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function About() {
  const { siteContent } = useApp();

  return (
    <div className="py-12 bg-transparent min-h-screen space-y-16 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6 text-center">
            <div className="inline-flex items-center space-x-1.5 bg-blue-500/10 text-white text-xs font-bold px-3 py-1 rounded-full border border-blue-500/30">
              <Shield className="w-3.5 h-3.5" />
              <span>About Our Company</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-100 leading-tight font-industrial">
              Kalikiri's Most Trusted Name in{' '}
              <span className="bg-gradient-to-r from-blue-400 to-pink-500 bg-clip-text text-transparent">Cement & Steel</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">{siteContent.aboutStory}</p>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-white/5 p-4 rounded-2xl border border-slate-800">
                <div className="text-2xl font-black bg-gradient-to-r from-blue-400 to-pink-500 bg-clip-text text-transparent">15+ Years</div>
                <div className="text-xs text-slate-400 mt-1">Trusted Industry Experience</div>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-slate-800">
                <div className="text-2xl font-black bg-gradient-to-r from-blue-400 to-pink-500 bg-clip-text text-transparent">5000+</div>
                <div className="text-xs text-slate-400 mt-1">Projects Delivered</div>
              </div>
            </div>
            <div className="pt-2">
              <a href={`tel:${siteContent.phone}`} className="bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold px-6 py-3 rounded-xl text-sm inline-flex items-center space-x-2 transition">
                <Phone className="w-4 h-4" />
                <span>Contact Store Manager</span>
              </a>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mt-16 pt-12 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 p-6 rounded-2xl border border-slate-800">
            <Shield className="w-8 h-8 text-white mb-3" />
            <h3 className="text-base font-bold text-slate-100 mb-1">100% Genuine Materials</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We source directly from JSW, ACC, Dalmia, Bharathi Cement plants and Tata Tiscon / Vizag Steel rebar mills with full batch verification.
            </p>
          </div>
          <div className="bg-white/5 p-6 rounded-2xl border border-slate-800">
            <Truck className="w-8 h-8 text-white mb-3" />
            <h3 className="text-base font-bold text-slate-100 mb-1">Direct Fleet Dispatch</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Equipped with dedicated transport vehicles to make sure cement bags and rebar bundles reach your site on schedule without delay.
            </p>
          </div>
          <div className="bg-white/5 p-6 rounded-2xl border border-slate-800">
            <Heart className="w-8 h-8 text-white mb-3" />
            <h3 className="text-base font-bold text-slate-100 mb-1">Community & Builder Loyalty</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Serving contractors, structural engineers, and home owners across Kalikiri mandal with fair pricing and transparent weighing scales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
