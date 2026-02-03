import {
  GetObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2, getBucketName, getPublicUrl } from './index';

/**
 * Download options
 */
export interface DownloadOptions {
  /** Key of the file to download */
  key: string;
  /** If true, returns the file as a Buffer instead of a stream */
  asBuffer?: boolean;
}

/**
 * Download result
 */
export interface DownloadResult {
  /** The file content */
  body: Buffer | NodeJS.ReadableStream;
  /** Metadata about the downloaded file */
  metadata: {
    contentType: string;
    contentLength: number;
    lastModified: Date;
    etag?: string;
  };
}

/**
 * Download a file from R2
 * @param options - Download options
 * @returns Download result with body and metadata
 */
export async function downloadFromR2(
  options: DownloadOptions
): Promise<DownloadResult> {
  const bucketName = getBucketName();

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: options.key,
  });

  const response = await r2.send(command);

  let body: Buffer | NodeJS.ReadableStream;
  if (options.asBuffer && response.Body) {
    body = await streamToBuffer(response.Body as NodeJS.ReadableStream | ReadableStream);
  } else {
    body = response.Body as NodeJS.ReadableStream;
  }

  return {
    body,
    metadata: {
      contentType: response.ContentType || 'application/octet-stream',
      contentLength: Number(response.ContentLength) || 0,
      lastModified: response.LastModified || new Date(),
      etag: response.ETag?.replace(/"/g, ''),
    },
  };
}

/**
 * Get a signed URL for temporary access to a private file
 * @param key - Key of the file
 * @param expiresIn - Time in seconds until the URL expires (default: 3600)
 * @returns Signed URL for the file
 */
export async function getSignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const bucketName = getBucketName();

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  return getSignedUrl(r2, command, { expiresIn });
}

/**
 * Get a signed URL for uploading a file
 * @param key - Key of the file to upload
 * @param contentType - Expected content type
 * @param expiresIn - Time in seconds until the URL expires
 * @returns Signed URL for upload
 */
export async function getSignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<string> {
  const bucketName = getBucketName();

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(r2, command, { expiresIn });
}

/**
 * Delete a file from R2
 * @param key - Key of the file to delete
 */
export async function deleteFromR2(key: string): Promise<void> {
  const bucketName = getBucketName();

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  await r2.send(command);
}

/**
 * Copy a file within R2
 * @param sourceKey - Source key
 * @param destinationKey - Destination key
 */
export async function copyWithinR2(
  sourceKey: string,
  destinationKey: string
): Promise<void> {
  const bucketName = getBucketName();

  const command = new CopyObjectCommand({
    Bucket: bucketName,
    CopySource: `${bucketName}/${sourceKey}`,
    Key: destinationKey,
  });

  await r2.send(command);
}

/**
 * Get the public (unauthenticated) URL for a file
 * @param key - Key of the file
 * @returns Public URL
 */
export function getPublicDownloadUrl(key: string): string {
  return getPublicUrl(key);
}

/**
 * Convert a stream to a buffer
 * @param stream - NodeJS Readable stream or Web ReadableStream
 * @returns Promise resolving to Buffer
 */
async function streamToBuffer(
  stream: NodeJS.ReadableStream | ReadableStream
): Promise<Buffer> {
  // Handle both NodeJS.ReadableStream and Web ReadableStream
  const chunks: Uint8Array[] = [];

  if (stream instanceof ReadableStream) {
    // Web ReadableStream
    const reader = stream.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
  } else {
    // NodeJS.ReadableStream
    for await (const chunk of stream) {
      chunks.push(chunk as Uint8Array);
    }
  }

  return Buffer.concat(chunks);
}

/**
 * Download a file and return as Buffer
 * @param key - Key of the file to download
 * @returns Buffer containing the file content
 */
export async function downloadAsBuffer(key: string): Promise<Buffer> {
  const result = await downloadFromR2({ key, asBuffer: true });
  if (result.body instanceof Buffer) {
    return result.body;
  }
  throw new Error('Expected buffer but got stream');
}

/**
 * Download a file and return as text
 * @param key - Key of the file to download
 * @param encoding - Text encoding (default: utf-8)
 * @returns String content of the file
 */
export async function downloadAsText(
  key: string,
  encoding: BufferEncoding = 'utf-8'
): Promise<string> {
  const buffer = await downloadAsBuffer(key);
  return buffer.toString(encoding);
}

/**
 * Download a file and parse as JSON
 * @param key - Key of the JSON file
 * @returns Parsed JSON object
 */
export async function downloadAsJson<T>(key: string): Promise<T> {
  const text = await downloadAsText(key);
  return JSON.parse(text) as T;
}

/**
 * Get metadata for an object without downloading it
 * @param key - The key (path) of the object
 * @returns Object metadata
 */
export async function getObjectMetadata(
  key: string
): Promise<{
  contentLength: number;
  contentType: string;
  lastModified?: Date;
  etag?: string;
  metadata?: Record<string, string>;
}> {
  const bucketName = getBucketName();

  const command = new HeadObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  const response = await r2.send(command);

  return {
    contentLength: response.ContentLength || 0,
    contentType: response.ContentType || 'application/octet-stream',
    lastModified: response.LastModified,
    etag: response.ETag,
    metadata: response.Metadata,
  };
}

/**
 * Check if an object exists in R2
 * @param key - The key (path) to check
 * @returns True if the object exists
 */
export async function objectExists(key: string): Promise<boolean> {
  try {
    await getObjectMetadata(key);
    return true;
  } catch {
    return false;
  }
}
