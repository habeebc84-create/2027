# HSN production color palette

The storefront is a dark, premium canvas with one warm light reading surface
(the wholesale pricing panel). Brand, commerce, and status colors are kept
separate so orange means “purchase,” champagne means “HSN,” and green means
“success.”

## Canonical tokens

| Token | Name | Hex | Role |
| --- | --- | --- | --- |
| `--color-obsidian` | Obsidian | `#0B0C0E` | Primary background |
| `--color-charcoal` | Charcoal Steel | `#1A1D21` | Elevated surfaces |
| `--color-gunmetal` | Gunmetal | `#34373B` | Borders and panels |
| `--color-champagne` | Burnished Champagne | `#C6A875` | Brand accent |
| `--color-porcelain` | Warm Porcelain | `#F7F5F0` | Main light background |
| `--color-ivory` | Soft Ivory | `#F7F5F0` | Primary light text |
| `--color-silver` | Silver Mist | `#C2C1BD` | Secondary text on dark |
| `--color-graphite` | Deep Graphite | `#17191C` | Body text on light |
| `--color-purchase` | Construction Orange | `#F97316` | Primary purchase action |
| `--color-success` | Deep Green | `#166534` | Success status |

Porcelain and Ivory intentionally share the same value: one is a surface role,
the other a text role.

## Semantic aliases

Prefer these in new UI:

- `bg-background`, `bg-surface`, `bg-surface-light`
- `border-line`
- `text-foreground`, `text-muted`, `text-foreground-light`
- `bg-brand` / `text-brand`
- `.btn-purchase`, `.btn-brand`, `.btn-secondary`
- `.status-success`, `.status-success-light`, `.surface-light`

## Derived interaction tones

These are computed from the canonical tokens with `color-mix()` so the ten
production colors remain the source of truth:

- `--color-brand-ink`: champagne + graphite, for brand text on porcelain.
- `--color-muted-light`: graphite + porcelain, for secondary text on light.
- `--color-success-foreground`: success + ivory, for success text on dark.
- `--color-purchase-hover`: purchase + porcelain, for purchase hover.
- Brand/slate ramps are compatibility aliases for existing utilities.

## Usage rules

1. **Purchase orange is reserved for commerce intent**: enter-and-shop,
   explore catalog, add to cart, proceed to checkout, and place order.
   Use `.btn-purchase` (or `bg-purchase text-obsidian`) rather than a generic
   orange utility.
2. **Champagne is the brand accent**: active navigation, featured badges,
   section accents, WhatsApp/contact actions, admin primary actions, and
   invoice brand rules. Solid champagne surfaces use Obsidian ink.
3. **Deep Green is success only**: order placed, delivered, in stock, free
   delivery, inquiry received, and success toasts. On dark surfaces use
   `text-success-foreground` or `.status-success`; on porcelain use
   `text-success` or `.status-success-light`.
4. **Neutral hierarchy**: Obsidian page → Charcoal Steel cards → Gunmetal
   borders. Ivory is primary text on dark; Silver Mist is secondary text.
   Porcelain panels use Graphite body text.
5. **Legacy `orange-*` utilities alias champagne**, not purchase orange.
   This keeps older/admin-entered class strings on-brand while new commerce
   CTAs opt into purchase orange explicitly.

## Print / PDF

`src/lib/pdfColors.ts` mirrors the CSS tokens as numeric RGB tuples for jsPDF.
Invoices use porcelain paper, graphite ink, champagne brand rules, obsidian
header/footer bands, and deep green only for delivered status.

## Accessibility spot checks

WCAG contrast ratios for the main pairings:

- Ivory on Obsidian: **17.96:1**
- Silver Mist on Charcoal Steel: **9.39:1**
- Champagne on Obsidian: **8.63:1**
- Obsidian on Construction Orange: **6.98:1**
- Ivory on Deep Green: **6.54:1**
- Graphite on Porcelain: **16.17:1**
- Brand ink on Porcelain: **4.98:1**
