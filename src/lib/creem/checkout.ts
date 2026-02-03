import { creemRequest, type CreemCheckoutSession, type CreemProduct } from './index';

/**
 * Create a checkout session for a product
 * @param productId - ID of the product to purchase
 * @param userId - ID of the user making the purchase
 * @param options - Additional checkout options
 * @returns Checkout session with payment URL
 */
export async function createCheckoutSession(
  productId: string,
  userId: string,
  options: {
    /** URL to redirect after successful payment */
    successUrl?: string;
    /** URL to redirect after cancelled payment */
    cancelUrl?: string;
    /** Custom metadata to attach to the checkout */
    metadata?: Record<string, string>;
  } = {}
): Promise<CreemCheckoutSession> {
  const response = await creemRequest<CreemCheckoutSession>('/checkout/sessions', {
    method: 'POST',
    body: JSON.stringify({
      product_id: productId,
      user_id: userId,
      success_url: options.successUrl || '/payment/success',
      cancel_url: options.cancelUrl || '/payment/cancel',
      metadata: options.metadata,
    }),
  });

  if (!response.success || !response.data) {
    throw new Error(response.error?.message || 'Failed to create checkout session');
  }

  return response.data;
}

/**
 * Get product details from Creem
 * @param productId - ID of the product
 * @returns Product details
 */
export async function getProduct(productId: string): Promise<CreemProduct> {
  const response = await creemRequest<CreemProduct>(`/products/${productId}`);

  if (!response.success || !response.data) {
    throw new Error(response.error?.message || 'Failed to get product');
  }

  return response.data;
}

/**
 * List all available products
 * @returns List of products
 */
export async function listProducts(): Promise<CreemProduct[]> {
  const response = await creemRequest<CreemProduct[]>('/products');

  if (!response.success || !response.data) {
    throw new Error(response.error?.message || 'Failed to list products');
  }

  return response.data;
}

/**
 * Verify a checkout session status
 * @param sessionId - ID of the checkout session
 * @returns Checkout session details
 */
export async function getCheckoutSession(
  sessionId: string
): Promise<CreemCheckoutSession> {
  const response = await creemRequest<CreemCheckoutSession>(`/checkout/sessions/${sessionId}`);

  if (!response.success || !response.data) {
    throw new Error(response.error?.message || 'Failed to get checkout session');
  }

  return response.data;
}

/**
 * Refund a payment
 * @param checkoutSessionId - ID of the checkout session to refund
 * @param reason - Reason for the refund
 * @returns Refund confirmation
 */
export async function refundPayment(
  checkoutSessionId: string,
  reason?: string
): Promise<{ success: boolean; refundId: string }> {
  const response = await creemRequest<{ id: string }>('/refunds', {
    method: 'POST',
    body: JSON.stringify({
      checkout_session_id: checkoutSessionId,
      reason,
    }),
  });

  if (!response.success) {
    throw new Error(response.error?.message || 'Failed to refund payment');
  }

  return {
    success: true,
    refundId: response.data?.id || '',
  };
}
