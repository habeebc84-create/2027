import { Building2, Truck, Scissors, ShieldCheck, Phone, ExternalLink, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

const iconMap: Record<string, any> = {
  Building2,
  Truck,
  Scissors,
  ShieldCheck,
};

const detailedServices = [
  {
    title: 'Bulk Supply for Major Construction Projects',
    icon: Building2,
    description: 'We supply high volume cement bags, primary steel rebar bundles, and hardware directly to residential apartments, commercial buildings, and government civil contracts with tiered bulk discounts.',
    features: ['Direct factory dispatch', 'Customized billing schedules', 'Dedicated account coordinator'],
  },
  {
    title: 'On-Site Vehicle Express Delivery',
    icon: Truck,
    description: 'Our fleet of heavy lorries and tractors ensures prompt material delivery straight to your construction site across Kalikiri mandal and neighboring regions.',
    features: ['Same-day local dispatch', 'Safe unloading support', 'Live GPS tracking alert'],
  },
  {
    title: 'Steel Rebar Cutting & Bending Support',
    icon: Scissors,
    description: 'Custom length cutting and stirrup bending service to save on-site labor time, minimize steel scrap wastage, and speed up structural column/beam work.',
    features: ['Precision bending specs', 'Reduced site scrap', 'Organized bundled tags'],
  },
  {
    title: 'Structural Quality Testing & Certification',
    icon: ShieldCheck,
    description: 'Every cement batch and steel rebar ton comes backed with manufacturer quality test certificates (MTC), guaranteeing compliance with IS standards.',
    features: ['Original mill certificates', 'Grade 53 OPC & Fe 550D compliant', '100% genuine guarantee'],
  },
];

export default function Services() {
  const { siteContent } = useApp();

  return (
    <div className="py-12 bg-transparent min-h-screen space-y-16 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-1.5 bg-blue-500/10 text-white text-xs font-bold px-3 py-1 rounded-full border border-blue-500/30 mb-4">
            <Truck className="w-3.5 h-3.5" />
            <span>Our Premium Services</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-100 leading-tight font-industrial">
            Comprehensive <span className="bg-gradient-to-r from-blue-400 to-pink-500 bg-clip-text text-transparent">Supply & Logistics</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mt-4 leading-relaxed">
            HSN CEMENT AND STEEL offers comprehensive supply, logistics, and site support tailored for contractors, civil engineers, and individual home builders.
          </p>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {detailedServices.map((svc, i) => {
            const Icon = svc.icon;
            return (
              <div key={i} className="bg-white/5 rounded-3xl border border-slate-800 hover:border-blue-500/40 transition duration-300 flex flex-col p-6 sm:p-8">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-white border border-blue-500/30 flex items-center justify-center mb-6">
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-3">{svc.title}</h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">{svc.description}</p>
                <ul className="space-y-2 mb-6">
                  {svc.features.map((feat, j) => (
                    <li key={j} className="flex items-center space-x-2 text-xs text-slate-300 font-semibold">
                      <Check className="w-4 h-4 text-pink-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between mt-auto">
                  <a href={`tel:${siteContent.phone}`} className="text-white hover:text-amber-300 font-bold text-xs flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call for Quote</span>
                  </a>
                  <a
                    href={`https://wa.me/${siteContent.whatsapp.replace(/[^0-9]/g, '')}?text=Hi,%20I%20want%20to%20inquire%20about%20${encodeURIComponent(svc.title)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-pink-600/20 hover:bg-pink-600/30 text-fuchsia-300 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1 border border-pink-500/30"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>WhatsApp Inquiry</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Delivery Zones */}
        <div className="mt-16 pt-12 border-t border-slate-800">
          <h2 className="text-xl font-black text-white font-industrial mb-6 text-center">
            Delivery <span className="bg-gradient-to-r from-blue-400 to-pink-500 bg-clip-text text-transparent">Zones & Rates</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { zone: 'Kalikiri Yard (Self Pick-up)', charge: 'FREE' },
              { zone: 'Kalikiri (Within Town)', charge: '₹500' },
              { zone: 'Pileru', charge: '₹1,000' },
              { zone: 'Vayalpadu', charge: '₹1,200' },
              { zone: 'Valmikipuram', charge: '₹1,500' },
              { zone: 'Gurramkonda', charge: '₹1,800' },
              { zone: 'Madanapalle', charge: '₹2,000' },
            ].map((loc, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:border-blue-500/30 transition">
                <span className="text-xs font-bold text-slate-200">{loc.zone}</span>
                <span className={`text-xs font-black ${loc.charge === 'FREE' ? 'text-fuchsia-400' : 'text-white'}`}>{loc.charge}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
