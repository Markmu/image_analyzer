/**
 * R2 批量删除功能
 *
 * Story 4-1: 内容审核功能
 * Epic 4: 内容安全与合规
 */

import { DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { r2, getBucketName } from './index';

/**
 * 批量删除 R2 对象
 *
 * @param keys - 要删除的对象键列表
 * @returns 删除结果
 */
export async function batchDeleteFromR2(keys: string[]): Promise<{
  deleted: number;
  errors: string[];
}> {
  if (keys.length === 0) {
    return { deleted: 0, errors: [] };
  }

  console.log('[BatchDelete] Deleting objects:', keys.length);

  const result = {
    deleted: 0,
    errors: [] as string[],
  };

  try {
    const bucketName = getBucketName();
    // R2 批量删除（一次最多 1000 个）
    const batchSize = 1000;

    for (let i = 0; i < keys.length; i += batchSize) {
      const batch = keys.slice(i, i + batchSize);

      try {
        const command = new DeleteObjectsCommand({
          Bucket: bucketName,
          Delete: {
            Objects: batch.map((key) => ({ Key: key })),
            Quiet: false,
          },
        });

        const response = await r2.send(command);

        if (response.Deleted) {
          result.deleted += response.Deleted.length;
          console.log(`[BatchDelete] Deleted batch: ${response.Deleted.length}`);
        }

        if (response.Errors && response.Errors.length > 0) {
          response.Errors.forEach((error) => {
            console.error(`[BatchDelete] Error deleting ${error.Key}: ${error.Message}`);
            result.errors.push(`Failed to delete ${error.Key}: ${error.Message}`);
          });
        }
      } catch (error) {
        console.error(`[BatchDelete] Error deleting batch:`, error);
        result.errors.push(`Batch delete error: ${error}`);

        // 尝试单独删除
        for (const key of batch) {
          try {
            const singleCommand = new DeleteObjectsCommand({
              Bucket: bucketName,
              Delete: {
                Objects: [{ Key: key }],
              },
            });
            await r2.send(singleCommand);
            result.deleted++;
          } catch (singleError) {
            console.error(`[BatchDelete] Error deleting ${key}:`, singleError);
            result.errors.push(`Failed to delete ${key}: ${singleError}`);
          }
        }
      }
    }

    console.log('[BatchDelete] Completed:', result);
    return result;
  } catch (error) {
    console.error('[BatchDelete] Fatal error:', error);
    result.errors.push(`Fatal error: ${error}`);
    return result;
  }
}
