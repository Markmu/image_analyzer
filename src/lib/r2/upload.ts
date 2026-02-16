import { Upload } from '@aws-sdk/lib-storage';
import { PutObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3';
import { r2, getBucketName, getPublicUrl } from './index';

/**
 * Upload options for R2
 */
export interface UploadOptions {
  /** Content type of the file */
  contentType?: string;
  /** Custom metadata to attach */
  metadata?: Record<string, string>;
  /** Whether to make the file publicly readable */
  publicRead?: boolean;
}

/**
 * Upload result from R2
 */
export interface UploadResult {
  /** The key (path) of the uploaded object */
  key: string;
  /** URL to access the uploaded file */
  url: string;
  /** ETag from the upload */
  etag?: string;
  /** Size of the uploaded file in bytes */
  size: number;
}

/**
 * Upload a file to R2 storage
 * @param key - The key (path) where the file will be stored
 * @param body - The file content as Buffer, ReadableStream, or Blob
 * @param options - Optional upload settings
 * @returns Upload result with key, url, and metadata
 */
export async function uploadToR2(
  key: string,
  body: Buffer | ReadableStream | Blob,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const bucketName = getBucketName();

  // Determine content type if not provided
  const contentType = options.contentType || detectContentType(key);

  // Upload using lib-storage for better streaming support
  const upload = new Upload({
    client: r2,
    params: {
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
      Metadata: options.metadata,
      ACL: options.publicRead ? 'public-read' : undefined,
    },
  });

  const result = await upload.done();

  return {
    key,
    url: getPublicUrl(key),
    etag: result.ETag,
    size: body instanceof Buffer ? body.length : 0,
  };
}

/**
 * Upload a string or text content to R2
 * @param key - The key (path) where the content will be stored
 * @param content - The text content to upload
 * @param contentType - MIME type of the content (default: text/plain)
 * @returns Upload result
 */
export async function uploadTextToR2(
  key: string,
  content: string,
  contentType = 'text/plain'
): Promise<UploadResult> {
  const bucketName = getBucketName();

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: content,
    ContentType: contentType,
  });

  await r2.send(command);

  return {
    key,
    url: getPublicUrl(key),
    size: content.length,
  };
}

/**
 * Upload a JSON object to R2
 * @param key - The key (path) where the JSON will be stored
 * @param data - The object to serialize and upload
 * @returns Upload result
 */
export async function uploadJsonToR2<T>(
  key: string,
  data: T
): Promise<UploadResult> {
  const jsonString = JSON.stringify(data, null, 2);
  return uploadTextToR2(key, jsonString, 'application/json');
}

/**
 * Copy an existing object to a new key within R2
 * @param sourceKey - The source key to copy from
 * @param destinationKey - The destination key to copy to
 * @returns Upload result for the copy
 */
export async function copyToR2(
  sourceKey: string,
  destinationKey: string
): Promise<UploadResult> {
  const bucketName = getBucketName();

  const command = new CopyObjectCommand({
    Bucket: bucketName,
    CopySource: `${bucketName}/${sourceKey}`,
    Key: destinationKey,
  });

  await r2.send(command);

  return {
    key: destinationKey,
    url: getPublicUrl(destinationKey),
    size: 0,
  };
}

/**
 * Detect content type from file extension
 * @param filename - The filename to detect type for
 * @returns MIME type string
 */
function detectContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();

  const contentTypes: Record<string, string> = {
    // Images
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    ico: 'image/x-icon',

    // Documents
    pdf: 'application/pdf',
    json: 'application/json',
    txt: 'text/plain',
    html: 'text/html',
    css: 'text/css',
    js: 'application/javascript',
    xml: 'application/xml',

    // Video/Audio
    mp4: 'video/mp4',
    webm: 'video/webm',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
  };

  return contentTypes[ext || ''] || 'application/octet-stream';
}
