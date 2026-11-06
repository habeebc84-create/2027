/**
 * Browser client for the HSN Node backend (/api/*, BUILD 84).
 *
 * Every function is fallback-safe by design: any failure — server not
 * configured yet, table missing, network down, timeout — returns null /
 * 'unavailable' instead of throwing, and the caller keeps using the
 * current browser-direct path. Checkout never breaks because the server
 * is not live yet; it only switches over once the backend answers.
 */
import type { Order } from '../types';

export interface ApiPricedItem {
  productId: string;
  size?: string;
  quantity: number;
  unitPrice: number;
}

export interface ApiOrderResult {
  orderId: string;
  total: number;
  items: ApiPricedItem[];
}

export interface CreateOrderPayload {
  items: { productId: string; size?: string; quantity: number }[];
  customer: {
    name: string;
    mobile: string;
    email?: string;
    address: string;
    village?: string;
    mandal?: string;
    pincode?: string;
    landmark: string;
  };
  paymentMode: string;
  deliveryNote: string;
  deliveryLocation: string;
  deliveryMethod: string;
}

async function fetchJson(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<unknown | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal });
    if (!res.ok) return null;
    return (await res.json()) as unknown;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Create an order through the server. Null = backend not live; fall back. */
export async function createOrderViaApi(
  payload: CreateOrderPayload,
): Promise<ApiOrderResult | null> {
  const data = await fetchJson(
    '/api/orders',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    15000,
  );
  if (!data || typeof data !== 'object') return null;
  const d = data as Record<string, unknown>;
  if (typeof d.orderId !== 'string' || typeof d.total !== 'number') return null;
  if (!Array.isArray(d.items)) return null;
  const items: ApiPricedItem[] = [];
  for (const raw of d.items as Record<string, unknown>[]) {
    if (
      raw &&
      typeof raw.productId === 'string' &&
      typeof raw.quantity === 'number' &&
      typeof raw.unitPrice === 'number'
    ) {
      items.push({
        productId: raw.productId,
        size: typeof raw.size === 'string' ? raw.size : undefined,
        quantity: raw.quantity,
        unitPrice: raw.unitPrice,
      });
    }
  }
  return { orderId: d.orderId, total: d.total, items };
}

export type TrackResult =
  | { kind: 'ok'; order: Order }
  | { kind: 'not_found' }
  | { kind: 'mismatch' }
  | { kind: 'unavailable' };

/** Track one order through the server. 'unavailable' = backend not live. */
export async function trackOrderViaApi(
  orderId: string,
  mobile?: string,
): Promise<TrackResult> {
  const params = new URLSearchParams({ orderId });
  if (mobile) params.set('mobile', mobile);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(`/api/track?${params.toString()}`, {
      signal: ctrl.signal,
    });
    if (res.status === 404) return { kind: 'not_found' };
    if (res.status === 403) return { kind: 'mismatch' };
    if (!res.ok) return { kind: 'unavailable' };
    const data = (await res.json()) as Record<string, unknown>;
    const order = data.order as Record<string, unknown> | undefined;
    if (!order || typeof order.orderId !== 'string' || !Array.isArray(order.items)) {
      return { kind: 'unavailable' };
    }
    return { kind: 'ok', order: order as unknown as Order };
  } catch {
    return { kind: 'unavailable' };
  } finally {
    clearTimeout(timer);
  }
}
