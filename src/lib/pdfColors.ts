/**
 * RGB counterparts of the production palette in src/index.css.
 * jsPDF needs numeric tuples; keep these values aligned with the CSS tokens.
 * The invoice is a light reading surface: porcelain paper, graphite ink,
 * lime brand rules, and deep green only for delivered status.
 * Lime on paper uses the dark limeInk for text/rules — bright lime
 * #C6FF00 alone is too light for print contrast.
 */
export type PdfRgb = readonly [number, number, number];

export const PDF_COLORS = {
  obsidian: [6, 10, 8],
  ink: [6, 10, 8],
  charcoal: [14, 20, 17],
  gunmetal: [51, 61, 56],
  champagne: [198, 168, 117],
  lime: [198, 255, 0],
  limeBright: [217, 255, 77],
  limeDeep: [143, 191, 0],
  silverGlass: [221, 227, 232],
  porcelain: [247, 245, 240],
  ivory: [247, 245, 240],
  silver: [221, 227, 232],
  graphite: [23, 25, 28],
  purchase: [198, 255, 0],
  success: [22, 101, 52],
  // Derived print tones, matching the CSS color-mix() interaction tones.
  champagneInk: [119, 104, 77],
  limeInk: [74, 107, 0],
  muted: [77, 78, 79],
  rule: [211, 210, 207],
  white: [255, 255, 255],
} as const satisfies Record<string, PdfRgb>;
