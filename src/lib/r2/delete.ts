import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { r2, getBucketName } from './index';

/**
 * Delete a file from R2 storage
 * @param key - The key (path) of the file to delete
 * @returns Promise that resolves when the file is deleted
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
 * Delete multiple files from R2 storage
 * @param keys - Array of keys (paths) to delete
 * @returns Promise that resolves when all files are deleted
 */
export async function deleteMultipleFromR2(keys: string[]): Promise<void> {
  await Promise.all(keys.map((key) => deleteFromR2(key)));
}
