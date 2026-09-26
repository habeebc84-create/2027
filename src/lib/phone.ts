/**
 * Phone / WhatsApp number helpers.
 *
 * Admin-entered numbers come in many shapes: '+91 9179173040', '07989494779'
 * (trunk '0' left in), with spaces or dashes. The dialer (tel:) needs a clean
 * international number (country code, no leading zero) and WhatsApp (wa.me)
 * needs bare digits WITH country code. These helpers normalize any stored
 * shape so every call/WhatsApp link in the app dials a valid number, even if
 * an older localStorage or cloud copy still holds a badly formatted value.
 */

const DEFAULT_COUNTRY = '91';

/** National 10-digit number ('7989494779'); '' when no digits found. */
export function nationalDigits(raw: string | undefined | null): string {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  if (digits.length > 10) return digits.slice(-10); // drop trunk '0' / country code
  return digits;
}

/** Full international digits ('917989494779') for tel: and wa.me links. */
export function intlDigits(raw: string | undefined | null): string {
  const national = nationalDigits(raw);
  if (!national) return '';
  if (national.length === 10) return DEFAULT_COUNTRY + national;
  return national;
}

/** tel: href — always international, e.g. tel:+917989494779 */
export function telHref(raw: string | undefined | null): string {
  const intl = intlDigits(raw);
  return intl ? `tel:+${intl}` : 'tel:';
}

/** wa.me href — WhatsApp requires country code + number with no '+' or '0'. */
export function waHref(raw: string | undefined | null, message?: string): string {
  const intl = intlDigits(raw);
  const q = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${intl}${q}`;
}
