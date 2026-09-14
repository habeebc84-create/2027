import type { Product, Category, Brand, Notification, Banner, SiteContent, TransportZone, Customer, TermsContent } from './types';

export const categories: Category[] = [
  { id: 'cat-cement', name: 'Cement', image: '/cement_banner_new.png', description: 'Premium Portland & Composite Cements', enabled: true, order: 1 },
  { id: 'cat-steel', name: 'TMT Steel Bars', image: '/tmt_steel_rebar_new.png', description: 'High-yield TMT rebar for structural reinforcement', enabled: true, order: 2 },
  { id: 'cat-blades', name: 'Cutting Blades & Discs', image: '/img-blades.png', description: 'Diamond, Marble, TMT Steel & Concrete Cutting Blades', enabled: true, order: 3 },
  { id: 'cat-wire', name: 'Binding Wire', image: '/binding_wire_category_hd.png', description: 'High ductility wire for rebar tying', enabled: true, order: 4 },
  { id: 'cat-nails', name: 'Nails & Fasteners', image: '/img-nails.png', description: 'Concrete, GI, and MS wire construction nails', enabled: true, order: 5 },
  { id: 'cat-pipes', name: 'Pipes & Fittings', image: '/pvc_pipes_hd.svg', description: 'PVC, CPVC pipes & water storage tanks', enabled: true, order: 6 },
  { id: 'cat-chemicals', name: 'Chemicals & Adhesives', image: '/cement_banner_new.png', description: 'Waterproofing, Tile Adhesives, Putty & Primers', enabled: true, order: 7 },
  { id: 'cat-tools', name: 'Hardware & Tools', image: '/img-blades.png', description: 'Shovels, Wheelbarrows, Measuring Tapes & Safety Gear', enabled: true, order: 8 },
  { id: 'cat-roofing', name: 'Roofing Sheets', image: '/roofing-category.png', description: 'Galvalume, Color Coated & GI Corrugated Roofing Sheets', enabled: true, order: 9 },
];

export const brands: Brand[] = [
  { id: 'brand-jsw', name: 'JSW Cement', logo: '/jsw_cement.png', categories: ['cat-cement'] },
  { id: 'brand-acc', name: 'ACC Cement', logo: '/acc_cement.png', categories: ['cat-cement'] },
  { id: 'brand-dalmia', name: 'Dalmia Cement', logo: '/dalmia_cement.png', categories: ['cat-cement'] },
  { id: 'brand-bharathi', name: 'Bharathi Cement', logo: '/cement_banner_new.png', categories: ['cat-cement'] },
  { id: 'brand-rajaram', name: 'Rajaram Steel', logo: '/img-steel.png', categories: ['cat-steel'] },
  { id: 'brand-tata', name: 'Tata Tiscon', logo: '/img-steel.png', categories: ['cat-steel'] },
  { id: 'brand-vizag', name: 'Vizag Steel', logo: '/img-steel.png', categories: ['cat-steel'] },
  { id: 'brand-bosch', name: 'Bosch Professional', logo: '/img-blades.png', categories: ['cat-blades'] },
  { id: 'brand-dongcheng', name: 'Dongcheng Tools', logo: '/img-blades.png', categories: ['cat-blades'] },
  { id: 'brand-drfixit', name: 'Dr. Fixit', logo: '/cement_banner_new.png', categories: ['cat-chemicals'] },
  { id: 'brand-supreme', name: 'Supreme Pipes', logo: '/img-steel.png', categories: ['cat-pipes'] },
  { id: 'brand-jsw-roofing', name: 'JSW Everglow', logo: '/roofing-jsw.png', categories: ['cat-roofing'] },
  { id: 'brand-tata-roofing', name: 'Tata BlueScope', logo: '/roofing-tata.png', categories: ['cat-roofing'] },
];

export const products: Product[] = [
  {
    id: 'prod-bosch-4inch-blade', name: 'Bosch Professional 4-Inch Diamond Saw Blade', category: 'Cutting Blades & Discs', brand: 'Bosch Professional',
    description: 'High performance continuous rim diamond cutting wheel for smooth cutting of marble, granite, ceramic tiles, and reinforced concrete.',
    image: '/img-blades.png', price: 320, stock: 150, type: 'general', grade: '4 Inch (110 mm) Diamond Rim',
    sizes: [{ size: '4 inch (110mm)', price: 320, stock: 80 }, { size: '5 inch (125mm)', price: 420, stock: 45 }, { size: '7 inch (180mm)', price: 680, stock: 25 }],
    featured: true, enabled: true, specifications: { Material: 'Diamond', Application: 'Marble, Concrete', 'Max RPM': '15000' },
  },
  {
    id: 'prod-dongcheng-14inch-blade', name: 'Dongcheng 14-Inch Heavy Duty Chop Saw Blade', category: 'Cutting Blades & Discs', brand: 'Dongcheng Tools',
    description: '355mm reinforced abrasive chop saw wheel for heavy TMT rebar cutting, iron pipes, angle channels.',
    image: '/img-blades.png', price: 240, stock: 90, type: 'general', grade: '14 Inch (355 mm)', featured: true, enabled: true,
  },
  {
    id: 'prod-hsn-tmt-blade-pack', name: 'HSN Ultra-Thin TMT Cutting Discs (Pack of 10)', category: 'Cutting Blades & Discs', brand: 'Bosch Professional',
    description: '100mm x 1mm super-thin double mesh reinforced cutting wheels for TMT bars.',
    image: '/img-blades.png', price: 280, stock: 200, type: 'general', grade: 'Pack of 10 (4 Inch)', featured: true, enabled: true,
  },
  {
    id: 'prod-jsw-opc', name: 'JSW Cement (OPC 53 Grade)', category: 'Cement', brand: 'JSW Cement',
    description: 'High performance Ordinary Portland Cement for columns, beams, slabs and structural foundation work.',
    image: '/jsw_cement.png', price: 375, stock: 500, type: 'cement', grade: 'OPC 53 Grade (50 KG Bag)', featured: true, enabled: true,
  },
  {
    id: 'prod-jsw-ppc', name: 'JSW Concreel HD Cement (PPC)', category: 'Cement', brand: 'JSW Cement',
    description: 'Portland Pozzolana Cement with micro-particles for chemical resistance and anti-crack properties.',
    image: '/jsw_cement.png', price: 360, stock: 350, type: 'cement', grade: 'PPC (50 KG Bag)', featured: true, enabled: true,
  },
  {
    id: 'prod-acc-gold', name: 'ACC Gold Water Shield Cement', category: 'Cement', brand: 'ACC Cement',
    description: 'Water-repellent cement for roofs, exterior walls, and basements.',
    image: '/acc_cement.png', price: 390, stock: 400, type: 'cement', grade: 'PPC Water Shield (50 KG)', featured: true, enabled: true,
  },
  {
    id: 'prod-dalmia-dsp', name: 'Dalmia DSP Cement', category: 'Cement', brand: 'Dalmia Cement',
    description: 'Premium heavy construction cement with high early strength.',
    image: '/dalmia_cement.png', price: 385, stock: 300, type: 'cement', grade: 'OPC / PPC Premium (50 KG)', featured: true, enabled: true,
  },
  {
    id: 'prod-rajaram-tmt', name: 'Rajaram 550D TMT Steel Rebar', category: 'TMT Steel Bars', brand: 'Rajaram Steel',
    description: 'High tensile strength TMT steel rebar for heavy load RCC slabs, columns, beams.',
    image: '/tmt_steel_rebar_new.png', price: 60, stock: 1100, type: 'steel', grade: 'Fe 550D Grade',
    sizes: [{ size: '6 mm', price: 63, stock: 250 }, { size: '8 mm', price: 61, stock: 350 }, { size: '10 mm', price: 60, stock: 400 }, { size: '12 mm', price: 59, stock: 300 }, { size: '16 mm', price: 60, stock: 200 }],
    featured: true, enabled: true,
  },
  {
    id: 'prod-tata-tiscon', name: 'Tata Tiscon 550SD TMT Steel Bars', category: 'TMT Steel Bars', brand: 'Tata Tiscon',
    description: 'Super-ductile primary TMT steel bars with advanced Rib Pattern for superior concrete bonding.',
    image: '/tmt_steel_rebar_new.png', price: 64, stock: 1200, type: 'steel', grade: 'Fe 550SD Grade',
    sizes: [{ size: '6 mm', price: 68, stock: 200 }, { size: '8 mm', price: 65, stock: 350 }, { size: '10 mm', price: 64, stock: 400 }, { size: '12 mm', price: 63, stock: 500 }, { size: '16 mm', price: 63, stock: 300 }, { size: '20 mm', price: 64, stock: 250 }, { size: '25 mm', price: 65, stock: 150 }, { size: '32 mm', price: 66, stock: 100 }],
    featured: true, enabled: true,
  },
  {
    id: 'prod-vizag-steel', name: 'Vizag Steel (RINL) TMT Rebar', category: 'TMT Steel Bars', brand: 'Vizag Steel',
    description: 'Government plant steel bars with Thermex quenching process. High tensile strength.',
    image: '/tmt_steel_rebar_new.png', price: 61, stock: 1500, type: 'steel', grade: 'Fe 500D Grade',
    sizes: [{ size: '6 mm', price: 64, stock: 300 }, { size: '8 mm', price: 62, stock: 400 }, { size: '10 mm', price: 61, stock: 500 }, { size: '12 mm', price: 61, stock: 300 }],
    featured: true, enabled: true,
  },
  {
    id: 'prod-binding-wire', name: '18G Soft Annealed GI Rebar Binding Wire (25 KG)', category: 'Binding Wire', brand: 'Tata Tiscon',
    description: 'High ductility soft annealed steel binding wire for tying TMT rebar stirrups.',
    image: '/binding_wire_hd.png', price: 85, stock: 250, type: 'wire', grade: '18 Gauge Annealed',
    sizes: [{ size: '18 Gauge (Soft)', price: 85, stock: 150 }, { size: '20 Gauge (Fine)', price: 90, stock: 100 }],
    featured: true, enabled: true,
  },
  {
    id: 'prod-concrete-nails', name: 'Hardened Carbon Steel Concrete Nails (1 KG)', category: 'Nails & Fasteners', brand: 'Bosch Professional',
    description: 'High tensile galvanized carbon steel fluted concrete nails.',
    image: '/img-nails.png', price: 135, stock: 300, type: 'general', grade: '2-4 Inch Fluted Steel',
    sizes: [{ size: '2 Inch', price: 135, stock: 100 }, { size: '3 Inch', price: 140, stock: 100 }, { size: '4 Inch', price: 145, stock: 100 }],
    featured: true, enabled: true,
  },
  {
    id: 'prod-supreme-cpvc', name: 'Supreme CPVC Hot & Cold Water Pipe', category: 'Pipes & Fittings', brand: 'Supreme Pipes',
    description: 'SDR 11 CPVC lead-free hot and cold water pressure pipes.',
    image: '/img-steel.png', price: 240, stock: 200, type: 'general', grade: 'Class SDR 11 (10 Feet)',
    sizes: [{ size: '3/4 inch (10ft)', price: 240, stock: 80 }, { size: '1 inch (10ft)', price: 340, stock: 70 }, { size: '1.25 inch (10ft)', price: 480, stock: 50 }],
    featured: true, enabled: true,
  },
  {
    id: 'prod-drfixit', name: 'Dr. Fixit 501 LW+ Waterproofing Additive', category: 'Chemicals & Adhesives', brand: 'Dr. Fixit',
    description: 'Integral liquid waterproofing compound for RCC slabs, columns, plastering.',
    image: '/cement_banner_new.png', price: 680, stock: 120, type: 'general', grade: '5 Litre Pack',
    sizes: [{ size: '1 Litre', price: 155, stock: 50 }, { size: '5 Litres', price: 680, stock: 45 }, { size: '20 Litres', price: 2450, stock: 25 }],
    featured: true, enabled: true,
  },
  {
    id: 'prod-shovel', name: 'Heavy Duty Forged Steel Construction Shovel', category: 'Hardware & Tools', brand: 'Bosch Professional',
    description: 'Heavy gauge hardened steel spade for mixing concrete, sand, gravel.',
    image: '/img-blades.png', price: 340, stock: 90, type: 'general', grade: 'Heavy Duty Forged Steel', featured: true, enabled: true,
  },
  {
    id: 'prod-jsw-roofing', name: 'JSW Everglow Color Coated Roofing Sheet', category: 'Roofing Sheets', brand: 'JSW Everglow',
    description: 'Pre-painted color coated PPGI steel roofing sheets.',
    image: '/roofing-jsw.png', price: 480, stock: 150, type: 'general', grade: 'PPGI Color Coated (Per Ft)',
    sizes: [{ size: '8 ft', price: 480, stock: 40 }, { size: '10 ft', price: 600, stock: 35 }, { size: '12 ft', price: 720, stock: 30 }, { size: '14 ft', price: 840, stock: 25 }, { size: '16 ft', price: 960, stock: 20 }],
    featured: true, enabled: true,
  },
  {
    id: 'prod-tata-roofing', name: 'Tata BlueScope Durashine Roofing Sheet', category: 'Roofing Sheets', brand: 'Tata BlueScope',
    description: 'Premium anti-corrosion steel roofing with patented Activate technology.',
    image: '/roofing-tata.png', price: 550, stock: 120, type: 'general', grade: 'Durashine Plus (Per Ft)',
    sizes: [{ size: '8 ft', price: 550, stock: 30 }, { size: '10 ft', price: 690, stock: 25 }, { size: '12 ft', price: 825, stock: 25 }, { size: '14 ft', price: 965, stock: 20 }, { size: '16 ft', price: 1100, stock: 20 }],
    featured: true, enabled: true,
  },
];

export const defaultTransportZones: TransportZone[] = [
  { id: 'tz-1', name: 'Kalikiri Yard (Self Pick-up)', mandal: 'Kalikiri', charge: 0, estimatedTime: 'Immediate', enabled: true },
  { id: 'tz-2', name: 'Kalikiri (Within Town)', mandal: 'Kalikiri', charge: 500, estimatedTime: '2-4 hours', enabled: true },
  { id: 'tz-3', name: 'Pileru', mandal: 'Pileru', charge: 1000, estimatedTime: 'Same day', enabled: true },
  { id: 'tz-4', name: 'Vayalpadu', mandal: 'Vayalpadu', charge: 1200, estimatedTime: 'Same day', enabled: true },
  { id: 'tz-5', name: 'Valmikipuram', mandal: 'Valmikipuram', charge: 1500, estimatedTime: 'Same day', enabled: true },
  { id: 'tz-6', name: 'Gurramkonda', mandal: 'Gurramkonda', charge: 1800, estimatedTime: '1-2 days', enabled: true },
  { id: 'tz-7', name: 'Madanapalle', mandal: 'Madanapalle', charge: 2000, estimatedTime: '1-2 days', enabled: true },
];

export const defaultNotifications: Notification[] = [
  { id: 'notif-1', title: "Today's Cement & Steel Prices Updated!", content: 'JSW, ACC & Dalmia Cement @ ₹355-390/bag. Tata Tiscon @ ₹64/kg.', type: 'scrolling', active: true, dateBadge: 'Daily Update', read: false },
  { id: 'notif-2', title: 'Same Day Express Site Delivery', content: 'Orders before 2:00 PM dispatched same day.', type: 'banner', active: true, read: false },
];

export const defaultBanners: Banner[] = [
  { id: 'banner-1', title: 'Premium Cement', subtitle: 'JSW, ACC, Dalmia', imageUrl: '/cement_banner_new.png', active: true, order: 1 },
  { id: 'banner-2', title: 'Premium TMT Steel', subtitle: 'Tata Tiscon, Vizag', imageUrl: '/steel_banner_new.png', active: true, order: 2 },
  { id: 'banner-3', title: 'Cutting Blades & Tools', subtitle: 'Bosch, Dongcheng', imageUrl: '/img-blades.png', active: true, order: 3 },
];

export const defaultSiteContent: SiteContent = {
  businessName: 'HSN CEMENT AND STEEL',
  tagline: 'Premium Cement, Steel, Cutting Blades & Construction Supplies in Kalikiri',
  heroHeading: 'Premium Cement, Steel & Cutting Blades in Kalikiri',
  heroSubheading: 'Trusted supplier of genuine construction materials for home builders & engineering contractors.',
  splashImage: '/splash_bg_clear.png',
  heroImage: '/hero_bg_ultra_8k.png',
  address: 'Kalikiri, Annamayya District, Andhra Pradesh – 517234',
  locationDetails: 'Near Main Highway, Kalikiri Landmark Hub',
  pincode: '517234',
  phone: '07989494779',
  whatsapp: '+91 9179173040',
  businessHours: 'Open 12 Hours (7:00 AM - 7:00 PM Daily)',
  googleMapsEmbed: 'https://maps.google.com/maps?q=13.68962045,78.78345215(HSN%20Cement%20and%20Steel)&z=16&output=embed',
  aboutStory: "Established as Kalikiri's premier construction materials distributor, HSN CEMENT AND STEEL has provided high-grade cement, TMT steel bars, cutting blades, binding wire, hardware tools, and chemicals to thousands of home builders, engineering contractors, and government project leads.",
  aboutExperience: 'Over 15+ years of unblemished service delivering top-tier raw materials to site locations.',
  services: [
    { id: 'serv-1', title: 'Bulk Supply for Projects', desc: 'Direct supply for residential & commercial complexes at wholesale pricing.', icon: 'Building2' },
    { id: 'serv-2', title: 'Express Site Delivery', desc: 'Own fleet ensuring on-time delivery to your construction site.', icon: 'Truck' },
    { id: 'serv-3', title: 'Steel Cutting & Bending', desc: 'Custom size cutting and bundle bundling to save time on site.', icon: 'Scissors' },
    { id: 'serv-4', title: 'Quality Assurance Testing', desc: 'Factory test certificates for all steel and cement batches.', icon: 'ShieldCheck' },
  ],
  galleryImages: [
    { id: 'g-1', url: '/cement_banner_new.png', title: 'Cement Warehouse', category: 'Cement' },
    { id: 'g-2', url: '/steel_banner_new.png', title: 'Steel Bundles', category: 'Steel' },
    { id: 'g-3', url: '/img-blades.png', title: 'Cutting Blades', category: 'Blades' },
    { id: 'g-4', url: '/hsn_hero_new.png', title: 'Delivery Fleet', category: 'Logistics' },
  ],
  frontPageImages: [],
  maintenanceMode: false,
};

export const defaultTerms: TermsContent[] = [
  { id: 'terms', title: 'Terms & Conditions', content: 'Welcome to HSN Cement & Steel. By accessing our website, you agree to these Terms. All products are subject to availability. Prices may change without notice. Orders are subject to confirmation. Delivery times are estimates. Payment must be completed before dispatch unless agreed otherwise. We reserve the right to refuse or cancel any order. Disputes are subject to courts in Andhra Pradesh, India.', lastUpdated: new Date().toISOString() },
  { id: 'privacy', title: 'Privacy Policy', content: 'We collect personal information only to process orders and improve services. Your data is stored securely and not shared with third parties except for order fulfillment. You can request data deletion at any time by contacting us.', lastUpdated: new Date().toISOString() },
  { id: 'shipping', title: 'Shipping Policy', content: 'Delivery available across Kalikiri and surrounding mandals. Same-day delivery for orders before 2:00 PM. Self-pickup available at our Kalikiri yard.', lastUpdated: new Date().toISOString() },
  { id: 'returns', title: 'Return Policy', content: 'Returns accepted only for damaged/defective products within 24 hours of delivery with photographic evidence. Opened cement and custom-cut steel are non-returnable.', lastUpdated: new Date().toISOString() },
  { id: 'cancellation', title: 'Cancellation Policy', content: 'Orders can be cancelled before dispatch. Once dispatched, cancellation is not possible. Bulk order cancellations within 24 hours may incur 5% processing fee.', lastUpdated: new Date().toISOString() },
  { id: 'payment', title: 'Payment Policy', content: 'We accept Cash on Delivery, UPI, bank transfers, and cheques for verified contractors. Prices are inclusive of GST unless stated. Credit terms available for established contractors.', lastUpdated: new Date().toISOString() },
];
