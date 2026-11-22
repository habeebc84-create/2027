# HSN production color palette — Ink + Silver Glass + Lime

The storefront is a dark, vibrant canvas: Ink base, Silver Glass surfaces,
and electric Lime as the single accent. One warm light reading surface
(the wholesale pricing panel) remains porcelain.

## Vibrant trio

| Token | Name | Hex | Role |
| --- | --- | --- | --- |
| `--color-ink` | Ink | `#060A08` | Primary background |
| `--color-ink-soft` | Ink Soft | `#0C1210` | Elevated surfaces |
| `--color-silver-glass` | Silver Glass | `#DDE3E8` | Glass surfaces, secondary text |
| `--color-lime` | Electric Lime | `#C6FF00` | Brand + purchase accent |
| `--color-lime-bright` | Lime Bright | `#D9FF4D` | Purchase / brand hover |
| `--color-lime-deep` | Lime Deep | `#8FBF00` | Lime on light, darker tone |

## Canonical tokens

| Token | Name | Hex | Role |
| --- | --- | --- | --- |
| `--color-obsidian` | Obsidian (= Ink) | `#060A08` | Primary background (legacy alias) |
| `--color-charcoal` | Charcoal Steel | `#0E1411` | Elevated surfaces |
| `--color-gunmetal` | Gunmetal | `#333D38` | Borders and panels |
| `--color-champagne` | Burnished Champagne | `#C6A875` | Legacy only — no longer on-screen brand |
| `--color-porcelain` | Warm Porcelain | `#F7F5F0` | Main light background |
| `--color-ivory` | Soft Ivory | `#F7F5F0` | Primary light text |
| `--color-silver` | Silver Mist | `#DDE3E8` | Secondary text on dark |
| `--color-graphite` | Deep Graphite | `#17191C` | Body text on light |
| `--color-purchase` | Lime (was Construction Orange) | `#C6FF00` | Primary purchase action |
| `--color-success` | Deep Green | `#166534` | Success status |

Porcelain and Ivory intentionally share the same value: one is a surface role,
the other a text role.

## Semantic aliases

Prefer these in new UI:

- `bg-background`, `bg-surface`, `bg-surface-light`
- `border-line`
- `text-foreground`, `text-muted`, `text-foreground-light`
- `bg-brand` / `text-brand` (= Lime), `bg-lime` / `text-lime`
- `.glass-silver` — silver-tinted translucent glass over Ink
- `.btn-purchase`, `.btn-brand`, `.btn-secondary`
- `.status-success`, `.status-success-light`, `.surface-light`

## Derived interaction tones

These are computed from the canonical tokens with `color-mix()` so the
production colors remain the source of truth:

- `--color-brand-ink`: `#4A6B00`, dark lime for brand text on porcelain.
- `--color-muted-light`: graphite + porcelain, for secondary text on light.
- `--color-success-foreground`: success + ivory, for success text on dark.
- `--color-purchase-hover`: Lime Bright, for purchase hover.
- Brand/lime ramps are compatibility aliases for existing utilities.

## Usage rules

1. **Lime is the one vibrant accent**: brand, active navigation, featured
   badges, section accents, WhatsApp/contact actions, admin primary actions,
   invoice brand rules, and all purchase CTAs (enter-and-shop, explore
   catalog, add to cart, proceed to checkout, place order). Use
   `.btn-purchase` / `.btn-brand` (or `bg-lime text-ink`) — never a generic
   orange utility. Ink text on Lime.
2. **Silver Glass is the surface**: navbar pill, bottom dock, feature cards,
   badges and pills use translucent silver glass (`rgba(221,227,232,0.08–0.16)`,
   silver border, blur 20px+) over Ink, so the background shows through.
   Use `.glass-silver` for new glass surfaces.
3. **Ink is the base**: Ink page → Ink Soft cards → Gunmetal borders.
   Ivory is primary text on dark; Silver Glass is secondary text.
   Porcelain panels use Graphite body text.
4. **Deep Green is success only**: order placed, delivered, in stock, free
   delivery, inquiry received, and success toasts. On dark surfaces use
   `text-success-foreground` or `.status-success`; on porcelain use
   `text-success` or `.status-success-light`.
5. **Legacy `orange-*` utilities alias Lime** (via the brand ramp), not
   purchase orange. Champagne (`#C6A875`) is retained only as a legacy
   token / PDF fallback — do not use it for new on-screen UI.

## Print / PDF

`src/lib/pdfColors.ts` mirrors the CSS tokens as numeric RGB tuples for jsPDF.
Invoices use porcelain paper, graphite ink, lime brand rules (dark `limeInk`
`#4A6B00` for text/rules, bright lime only as a fill), ink header/footer
bands, and deep green only for delivered status.

## Accessibility spot checks

WCAG contrast ratios for the main pairings:

- Ivory on Ink: **18.28:1**
- Silver Glass on Ink Soft: **~13.9:1**
- Lime on Ink: **16.79:1**
- Ink on Lime: **16.79:1**
- Ivory on Deep Green: **6.54:1**
- Graphite on Porcelain: **16.17:1**
- Brand ink (#4A6B00) on Porcelain: **5.68:1**
