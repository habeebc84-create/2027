import { useApp } from '../context/AppContext';

/**
 * Terms & Conditions page (BUILD 74). The text below is the full
 * 14-section version supplied by the owner on 4 Nov 2026, replacing the
 * previous 7-section version. Wording is kept as supplied, including
 * the bracketed jurisdiction choice in section 13, which the owner
 * has not yet narrowed to a single court.
 */
export default function Terms() {
  const { setPage } = useApp();

  return (
    <div className="py-12 bg-transparent min-h-screen relative z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-black text-ivory font-industrial mb-8">
          Terms & <span className="bg-gradient-to-r from-brand-400 to-brand-500 bg-clip-text text-transparent">Conditions</span>
        </h1>

        <div className="bg-charcoal border border-gunmetal rounded-3xl p-6 sm:p-10 space-y-8 text-sm text-silver">
          <div>
            <h2 className="text-lg font-bold text-ivory mb-3">1. Service Area</h2>
            <p className="leading-relaxed">
              Our cement and steel delivery service currently operates primarily in Kalikiri Mandal and surrounding areas within Annamayya District, Andhra Pradesh.
            </p>
            <p className="leading-relaxed mt-3">
              Delivery availability is limited to the pin codes and villages we mark as serviceable inside the App (including Kalikiri town and nearby villages such as Medikurthi, Pallavolu, Marrikuntapalle, etc.).
            </p>
            <p className="leading-relaxed mt-3">
              We may expand or reduce the service area at any time. Orders outside the serviceable zone will be rejected or cancelled.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-ivory mb-3">2. Definitions</h2>
            <p className="leading-relaxed"><strong className="text-ivory">Products:</strong> Cement (OPC, PPC, etc.), TMT steel bars, rods, sheets, and related construction materials listed in the App.</p>
            <p className="leading-relaxed mt-3"><strong className="text-ivory">Fast Delivery:</strong> Same-day or quick delivery (Blinkit-style) within the serviceable area of Kalikiri and Annamayya District, subject to stock, distance, and operational conditions.</p>
            <p className="leading-relaxed mt-3"><strong className="text-ivory">Order:</strong> A confirmed purchase request placed through the App.</p>
            <p className="leading-relaxed mt-3"><strong className="text-ivory">Delivery Partner:</strong> Our staff or third-party personnel engaged for delivery.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-ivory mb-3">3. Eligibility</h2>
            <p className="leading-relaxed">
              You must be 18 years or older and legally capable of entering into a contract under Indian law.
            </p>
            <p className="leading-relaxed mt-3">
              You must provide accurate delivery address, phone number, and other details. False or incomplete information may lead to cancellation.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-ivory mb-3">4. Products, Pricing &amp; Availability</h2>
            <p className="leading-relaxed">
              All products are subject to stock availability in our local warehouses/suppliers serving Kalikiri and Annamayya District.
            </p>
            <p className="leading-relaxed mt-3">
              Prices shown in the App are final at the time of order confirmation and include applicable GST (unless stated otherwise).
            </p>
            <p className="leading-relaxed mt-3">
              Product descriptions, grades (e.g., Fe 500/550 TMT, OPC 53 grade), and weights are approximate and based on standard industry specifications. Minor variations are normal.
            </p>
            <p className="leading-relaxed mt-3">
              We do not guarantee exact brand matching unless clearly confirmed in the order.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-ivory mb-3">5. Orders &amp; Payment</h2>
            <p className="leading-relaxed">
              An order is confirmed only after successful payment or confirmed Cash on Delivery (where available) and generation of an Order ID in the App.
            </p>
            <p className="leading-relaxed mt-3">
              Accepted payment methods: UPI, cards, net banking, wallets, and Cash on Delivery (subject to limits).
            </p>
            <p className="leading-relaxed mt-3">
              For high-value or bulk orders of cement/steel, we may require advance payment or additional verification.
            </p>
            <p className="leading-relaxed mt-3">
              In case of payment failure, chargeback, or suspected fraud, the order may be cancelled.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-ivory mb-3">6. Delivery (Kalikiri &amp; Annamayya District Focus)</h2>
            <p className="leading-relaxed">
              Delivery timelines shown in the App (e.g., “within few hours”, “same day”) are estimates only. Actual time depends on:
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-1 leading-relaxed">
              <li>Distance within Kalikiri / Annamayya District</li>
              <li>Traffic, weather, road conditions</li>
              <li>Order volume and stock availability</li>
            </ul>
            <p className="leading-relaxed mt-3">
              Delivery is normally made to the ground floor or nearest accessible point.
            </p>
            <p className="leading-relaxed mt-3">
              Extra labour, trolley, or crane charges for higher floors, narrow lanes, or difficult access in villages around Kalikiri will be borne by the Customer.
            </p>
            <p className="leading-relaxed mt-3">
              Cement and steel are heavy materials. After delivery and OTP/signature confirmation, the Customer is fully responsible for unloading, storage, and safety.
            </p>
            <p className="leading-relaxed mt-3">
              Risk of loss or damage passes to the Customer once the products are handed over at the delivery location.
            </p>
            <p className="leading-relaxed mt-3">
              We are not responsible for delays caused by force majeure, heavy rain, roadblocks, strikes, or third-party logistics issues common in rural Annamayya District areas.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-ivory mb-3">7. Cancellation, Returns &amp; Refunds</h2>
            <p className="leading-relaxed">
              <strong className="text-ivory">Customer Cancellation:</strong> Allowed only before the order is dispatched from our local point. Once dispatched within Kalikiri / nearby areas, cancellation is generally not possible.
            </p>
            <p className="leading-relaxed mt-3">
              <strong className="text-ivory">Company Cancellation:</strong> We may cancel due to stock unavailability, pricing error, wrong address, or operational issues. Refund (if any) will be processed to the original payment method.
            </p>
            <p className="leading-relaxed mt-3">
              <strong className="text-ivory">Returns / Claims:</strong> Cement and steel are non-returnable once delivered, except for clear manufacturing defects, wrong grade/quantity, or damage caused during transit by us.
            </p>
            <p className="leading-relaxed mt-3">
              Claims must be raised within 24 hours of delivery through the App with clear photos/videos and Order ID.
            </p>
            <p className="leading-relaxed mt-3">
              Approved returns are subject to physical inspection. Refunds (if applicable) will be processed within 7–14 working days after verification.
            </p>
            <p className="leading-relaxed mt-3">
              Opened bags, partially used steel, or products damaged after delivery are not eligible for return or refund.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-ivory mb-3">8. Quality &amp; Customer Responsibility</h2>
            <p className="leading-relaxed">
              Products are supplied as per standard industry grades and specifications.
            </p>
            <p className="leading-relaxed mt-3">You are solely responsible for:</p>
            <ul className="list-disc pl-5 mt-3 space-y-1 leading-relaxed">
              <li>Calculating correct quantity</li>
              <li>Checking suitability for your construction work</li>
              <li>Compliance with local building rules and engineer recommendations in Annamayya District</li>
            </ul>
            <p className="leading-relaxed mt-3">
              We are not liable for any construction defects, structural issues, or consequential losses arising from the use of the products.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-ivory mb-3">9. User Obligations</h2>
            <ul className="list-disc pl-5 space-y-1 leading-relaxed">
              <li>Do not place fake, fraudulent, or bulk orders with intention to cancel.</li>
              <li>Provide correct delivery details (especially important in rural villages around Kalikiri).</li>
              <li>Ensure someone is available to receive the heavy materials.</li>
              <li>Do not misuse the App or attempt to resell products in violation of law.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-ivory mb-3">10. Limitation of Liability</h2>
            <p className="leading-relaxed">
              Our maximum liability for any order-related claim shall not exceed the value of that particular order.
            </p>
            <p className="leading-relaxed mt-3">
              We shall not be liable for indirect, incidental, or consequential damages (including construction delays, labour costs, or loss of profit).
            </p>
            <p className="leading-relaxed mt-3">
              Nothing in these Terms excludes liability for death, personal injury, or fraud where such exclusion is not allowed under Indian law.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-ivory mb-3">11. Intellectual Property</h2>
            <p className="leading-relaxed">
              All content, logos, designs, and software in the App are owned by or licensed to us. You may not copy, modify, or distribute them without our written permission.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-ivory mb-3">12. Privacy</h2>
            <p className="leading-relaxed">
              Your personal data (name, phone, address, location within Kalikiri/Annamayya District, etc.) is collected and processed as per our Privacy Policy. By using the App you consent to such processing.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-ivory mb-3">13. Governing Law &amp; Dispute Resolution</h2>
            <p className="leading-relaxed">
              These Terms are governed by the laws of India.
            </p>
            <p className="leading-relaxed mt-3">
              Subject to the exclusive jurisdiction of the courts in [Madanapalle / Tirupati / Chittoor] (whichever is nearest and convenient for Annamayya District matters).
            </p>
            <p className="leading-relaxed mt-3">
              Parties shall first attempt amicable settlement. If unresolved, disputes may be referred to arbitration under the Arbitration and Conciliation Act, 1996.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-ivory mb-3">14. Changes to Terms</h2>
            <p className="leading-relaxed">
              We may update these Terms at any time. The updated version will be available in the App. Continued use after changes means you accept the revised Terms.
            </p>
          </div>
        </div>

        <button onClick={() => setPage('home')} className="mt-8 btn-brand font-bold px-6 py-3 rounded-xl text-sm transition">
          Back to Home
        </button>
      </div>
    </div>
  );
}
