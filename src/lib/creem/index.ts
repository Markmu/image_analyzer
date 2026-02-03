/**
 * Creem Payment Integration
 *
 * This module provides integration with Creem for payment processing.
 * Documentation: https://docs.creem.io
 */

export const CREEM_API_URL = 'https://api.creem.io/v1';

// Validate required environment variables
if (!process.env.CREEM_API_KEY) {
  throw new Error('CREEM_API_KEY environment variable is required');
}

// Export validated API key
export const CREEM_API_KEY = process.env.CREEM_API_KEY;

// Webhook secret is optional (may be undefined)
export const CREEM_WEBHOOK_SECRET = process.env.CREEM_WEBHOOK_SECRET;

/**
 * Base response from Creem API
 */
export interface CreemResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Product information from Creem
 */
export interface CreemProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval?: 'month' | 'year' | 'one-time';
  features?: string[];
}

/**
 * Checkout session for payment
 */
export interface CreemCheckoutSession {
  id: string;
  url: string;
  productId: string;
  userId: string;
  status: 'pending' | 'completed' | 'expired';
  createdAt: string;
  expiresAt: string;
}

/**
 * Make a request to the Creem API
 * @param endpoint - API endpoint (without base URL)
 * @param options - Fetch options
 * @returns Parsed response
 */
async function creemRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<CreemResponse<T>> {
  const url = `${CREEM_API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${CREEM_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      success: false,
      error: {
        code: data.code || 'UNKNOWN_ERROR',
        message: data.message || 'An error occurred',
      },
    };
  }

  return {
    success: true,
    data,
  };
}

export { creemRequest };

/**
 * Webhook payload from Creem
 */
export interface CreemWebhookPayload {
  event: 'checkout.completed' | 'checkout.refunded' | 'subscription.created' | 'subscription.updated' | 'subscription.cancelled';
  data: {
    checkoutSessionId?: string;
    subscriptionId?: string;
    userId?: string;
    status?: string;
    [key: string]: unknown;
  };
  createdAt: string;
}
