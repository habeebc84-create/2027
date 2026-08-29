import { useApp } from '../context/AppContext';

export default function Terms() {
  const { setPage, siteContent } = useApp();

  return (
    <div className="py-12 bg-transparent min-h-screen relative z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-100 font-industrial mb-8">
          Terms & <span className="bg-gradient-to-r from-blue-400 to-pink-500 bg-clip-text text-transparent">Conditions</span>
        </h1>

        <div className="bg-white/5 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-8 text-sm text-slate-300">
          <div>
            <h2 className="text-lg font-bold text-white mb-3">1. General Terms</h2>
            <p className="leading-relaxed">
              Welcome to HSN CEMENT AND STEEL. By accessing or using our services, you agree to be bound by these terms and conditions. All products and services are subject to availability and pricing at the time of purchase.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-3">2. Pricing & Payment</h2>
            <p className="leading-relaxed">
              All prices displayed are daily wholesale rates and may vary based on market conditions. Final pricing is confirmed at the time of order placement. Payment modes accepted include Cash on Delivery and Online UPI/QR payment.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-3">3. Delivery Policy</h2>
            <p className="leading-relaxed">
              Delivery is available within Kalikiri mandal and nearby regions. Same-day dispatch for orders placed before 2:00 PM. Delivery charges vary by location as listed in our delivery zones section. Unloading support is provided at the site.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-3">4. Product Quality</h2>
            <p className="leading-relaxed">
              All cement and steel products are sourced directly from authorized manufacturers. Original Mill Test Certificates (MTC) are provided for all steel rebar and cement batches. 100% genuine quality guaranteed.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-3">5. Returns & Refunds</h2>
            <p className="leading-relaxed">
              Due to the nature of construction materials, returns are accepted only for damaged or incorrect products within 24 hours of delivery. Refunds will be processed within 3-5 business days after inspection.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-3">6. Contact</h2>
            <p className="leading-relaxed">
              For any queries regarding these terms, please contact us at {siteContent.phone} or visit our store at {siteContent.address}.
            </p>
          </div>
        </div>

        <button onClick={() => setPage('home')} className="mt-8 bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold px-6 py-3 rounded-xl text-sm transition">
          Back to Home
        </button>
      </div>
    </div>
  );
}
