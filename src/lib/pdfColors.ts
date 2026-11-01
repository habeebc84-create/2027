/**
 * RGB counterparts of the production palette in src/index.css.
 * jsPDF needs numeric tuples; keep these values aligned with the CSS tokens.
 * The invoice is a light reading surface: porcelain paper, graphite ink,
 * champagne brand rules, and deep green only for delivered status.
 */
export type PdfRgb = readonly [number, number, number];

export const PDF_COLORS = {
  obsidian: [11, 12, 14],
  charcoal: [26, 29, 33],
  gunmetal: [52, 55, 59],
  champagne: [198, 168, 117],
  porcelain: [247, 245, 240],
  ivory: [247, 245, 240],
  silver: [194, 193, 189],
  graphite: [23, 25, 28],
  purchase: [249, 115, 22],
  success: [22, 101, 52],
  // Derived print tones, matching the CSS color-mix() interaction tones.
  champagneInk: [119, 104, 77],
  muted: [77, 78, 79],
  rule: [211, 210, 207],
  white: [255, 255, 255],
} as const satisfies Record<string, PdfRgb>;
