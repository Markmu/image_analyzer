import crypto from 'crypto';
import { CREEM_WEBHOOK_SECRET } from './index';

export type CreemWebhookEvent =
  | 'checkout.completed'
  | 'checkout.refunded'
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.cancelled';

export interface CreemWebhookPayload {
  id: string;
  event: CreemWebhookEvent;
  timestamp: string;
  data: Record<string, unknown>;
}

export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  if (!CREEM_WEBHOOK_SECRET) {
    throw new Error('CREEM_WEBHOOK_SECRET is not configured');
  }

  const expected = crypto
    .createHmac('sha256', CREEM_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

export function parseWebhookRequest(
  payload: string,
  signature: string
): CreemWebhookPayload | null {
  try {
    if (!verifyWebhookSignature(payload, signature)) {
      return null;
    }
    return JSON.parse(payload) as CreemWebhookPayload;
  } catch {
    return null;
  }
}

export async function handleWebhookEvent(
  payload: CreemWebhookPayload
): Promise<{ handled: boolean; message: string }> {
  switch (payload.event) {
    case 'checkout.completed':
      console.log('Checkout completed');
      return { handled: true, message: 'Processed' };
    case 'checkout.refunded':
      console.log('Checkout refunded');
      return { handled: true, message: 'Processed' };
    case 'subscription.created':
    case 'subscription.updated':
      console.log('Subscription updated');
      return { handled: true, message: 'Processed' };
    case 'subscription.cancelled':
      console.log('Subscription cancelled');
      return { handled: true, message: 'Processed' };
    default:
      console.log('Unknown event:', payload.event);
      return { handled: false, message: 'Unknown' };
  }
}

export function getSignatureFromHeaders(
  headers: Record<string, string | string[] | undefined>
): string | null {
  const sig = headers['x-creem-signature'];
  if (typeof sig === 'string') return sig;
  if (Array.isArray(sig) && sig[0]) return sig[0];
  return null;
}

export async function handleCreemWebhook(
  body: Record<string, unknown> | string,
  headers: Record<string, string | string[] | undefined>
): Promise<{ success: boolean; message: string }> {
  const payload = typeof body === 'string' ? body : JSON.stringify(body);
  const signature = getSignatureFromHeaders(headers);

  if (!signature) {
    return { success: false, message: 'Missing signature' };
  }

  const parsed = parseWebhookRequest(payload, signature);
  if (!parsed) {
    return { success: false, message: 'Invalid signature' };
  }

  const result = await handleWebhookEvent(parsed);
  return { success: result.handled, message: result.message };
}
