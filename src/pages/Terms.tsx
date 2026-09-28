import { useApp } from '../context/AppContext';
import { nationalDigits } from '../lib/phone';

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
            <h2 className="text-lg font-bold text-white mb-3">1. General Terms & Regulatory Compliance</h2>
            <p className="leading-relaxed">
              Welcome to HSN CEMENT AND STEEL. By accessing or using our portal, you agree to be bound by these terms and conditions, complying with the Consumer Protection (Direct Selling &amp; E-Commerce) Rules 2020 and applicable Indian laws.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-3">2. Statutory GST &amp; Invoicing</h2>
            <p className="leading-relaxed">
              HSN CEMENT AND STEEL is a registered dealer operating under GSTIN guidelines. Tax Invoices with proper HSN/SAC code classifications (e.g., HSN 2523 for Cement, HSN 7214 for TMT Steel Rebar) are issued for all orders.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-3">3. BIS Quality Standards &amp; Mill Test Certificates</h2>
            <p className="leading-relaxed">
              All steel rebar and cement supplies strictly comply with Bureau of Indian Standards (BIS) specifications (IS 1786 for High Strength Deformed Steel Bars and IS 1489/IS 269 for OPC/PPC Cement). Original manufacturer Mill Test Certificates (MTC) are provided on request for all structural building supplies.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-3">4. Legal Metrology &amp; Weights Measures</h2>
            <p className="leading-relaxed">
              In full compliance with the Legal Metrology Act 2009, all packaged products (Cement, Binding Wires, Cutting Blades) bear standard declared net weights and MRP tags. Steel rebars are weighed using calibrated electronic weighbridges certified by the Department of Legal Metrology, Andhra Pradesh.
            </p>

          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-3">5. Pricing & Payment</h2>
            <p className="leading-relaxed">
              All prices displayed reflect live daily wholesale rates subject to steel/cement market fluctuations. Final billing prices are locked at order confirmation. Accepted payment options include Cash on Delivery (COD) and direct UPI/QR transfers.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-3">6. Delivery & Dispatch Policy</h2>
            <p className="leading-relaxed">
              Express site transportation is available in Kalikiri and adjacent mandals. Same-day dispatch applies for verified orders placed before 2:00 PM. On-site unloading assistance is provided as agreed per transport zone tariffs.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-3">7. Returns & Grievance Redressal</h2>
            <p className="leading-relaxed">
              Damaged, defective, or incorrect deliveries must be notified within 24 hours of site arrival. Approved returns or refunds are processed within 3-5 business days. Consumer grievances can be directed to our nodal officer at {nationalDigits(siteContent.phone)} or visited in person at {siteContent.address}.
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
