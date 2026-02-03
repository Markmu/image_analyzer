import { S3Client } from '@aws-sdk/client-s3';

/**
 * R2 Storage Client Configuration
 *
 * Cloudflare R2 is S3-compatible storage that offers zero egress fees.
 * This client is configured to work with R2's S3-compatible API.
 */

if (!process.env.R2_ACCOUNT_ID) {
  throw new Error('R2_ACCOUNT_ID environment variable is required');
}

if (!process.env.R2_ACCESS_KEY_ID) {
  throw new Error('R2_ACCESS_KEY_ID environment variable is required');
}

if (!process.env.R2_SECRET_ACCESS_KEY) {
  throw new Error('R2_SECRET_ACCESS_KEY environment variable is required');
}

if (!process.env.R2_BUCKET_NAME) {
  throw new Error('R2_BUCKET_NAME environment variable is required');
}

/**
 * R2 S3 Client instance
 * Configured with 'auto' region for Cloudflare R2
 */
export const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Get the R2 bucket name
 * @throws Error if R2_BUCKET_NAME is not set (should be validated at module load)
 */
export function getBucketName(): string {
  const bucketName = process.env.R2_BUCKET_NAME;
  if (!bucketName) {
    throw new Error('R2_BUCKET_NAME environment variable is required');
  }
  return bucketName;
}

/**
 * Get the R2 public URL base
 * Useful for constructing public URLs for uploaded files
 */
export function getPublicUrl(key: string): string {
  const domain = process.env.R2_PUBLIC_DOMAIN;
  const accountId = process.env.R2_ACCOUNT_ID;
  const bucketName = process.env.R2_BUCKET_NAME;

  if (domain) {
    return `https://${domain}/${key}`;
  }
  // Default to R2.dev URL for preview access
  return `https://${accountId}.r2.dev/${bucketName}/${key}`;
}
