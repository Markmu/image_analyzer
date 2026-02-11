import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { images } from '@/lib/db/schema';
import { uploadToR2 } from '@/lib/r2/upload';
import { deleteFromR2 } from '@/lib/r2/download';
import pLimit from 'p-limit';
import { randomUUID } from 'crypto';
import {
  MAX_FILE_SIZE,
  ALLOWED_FORMATS,
  MAX_FILES,
  CONCURRENCY_LIMIT,
  validateFileForUpload,
  generateFilename,
} from '@/lib/upload/validation';

/**
 * POST /api/upload/batch
 *
 * Batch upload multiple images (up to 5) with concurrency control
 *
 * Features:
 * - Concurrent upload limit (max 3 concurrent uploads)
 * - Individual file validation
 * - Batch ID generation for grouping uploaded images
 * - Progress tracking
 * - Cleanup on failure
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verify user authentication
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to upload images',
          },
        },
        { status: 401 }
      );
    }

    // 2. Parse form data
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NO_FILES',
            message: 'No files provided',
          },
        },
        { status: 400 }
      );
    }

    // 3. Check file count limit
    const warning = files.length > MAX_FILES ? {
      code: 'TOO_MANY_FILES',
      message: `最多只能上传 ${MAX_FILES} 张图片，已自动处理前 ${MAX_FILES} 张`,
      details: {
        totalFiles: files.length,
        processedFiles: MAX_FILES,
        skippedFiles: files.length - MAX_FILES,
      },
    } : null;

    // Limit files to MAX_FILES
    const processedFiles = files.slice(0, MAX_FILES);

    // 4. Generate batch ID for this upload
    const batchId = randomUUID();

    // 5. Set up concurrency control
    const limit = pLimit(CONCURRENCY_LIMIT);

    // 6. Validate and upload each file
    const results: Array<{
      success: boolean;
      imageId?: string;
      filePath?: string;
      url?: string;
      fileSize?: number;
      fileFormat?: string;
      width?: number;
      height?: number;
      error?: {
        code: string;
        message: string;
      };
    }> = [];

    const uploadedImages: Array<{
      imageId: string;
      filePath: string;
      url: string;
      fileSize: number;
      fileFormat: string;
      width: number;
      height: number;
    }> = [];

    const uploadedFiles: string[] = [];

    // Process each file with concurrency control
    const uploadPromises = processedFiles.map((file, index) =>
      limit(async () => {
        const result = await processSingleFile(file, session.user.id, index);
        results[index] = result;

        if (result.success && result.imageId) {
          uploadedImages.push({
            imageId: result.imageId,
            filePath: result.filePath!,
            url: result.url!,
            fileSize: result.fileSize!,
            fileFormat: result.fileFormat!,
            width: result.width!,
            height: result.height!,
          });
          uploadedFiles.push(result.filePath!);
        }

        return result;
      })
    );

    await Promise.all(uploadPromises);

    // 7. Batch insert to database
    if (uploadedImages.length > 0) {
      try {
        await db.insert(images).values(
          uploadedImages.map((img, index) => ({
            id: img.imageId,
            userId: session.user.id,
            filePath: img.filePath,
            fileSize: img.fileSize,
            fileFormat: img.fileFormat,
            width: img.width,
            height: img.height,
            uploadStatus: 'completed',
            batchId: batchId as any,
            uploadOrder: index,
          }))
        );
      } catch (error) {
        // Cleanup uploaded files on database error
        for (const filePath of uploadedFiles) {
          try {
            await deleteFromR2(filePath);
          } catch (cleanupError) {
            console.error('Failed to cleanup file:', filePath, cleanupError);
          }
        }

        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'DATABASE_ERROR',
              message: 'Failed to save image metadata. All uploaded files have been cleaned up.',
            },
          },
          { status: 500 }
        );
      }
    }

    // 8. Return success response
    return NextResponse.json(
      {
        success: true,
        data: {
          batchId,
          images: uploadedImages,
          totalCount: processedFiles.length,
          completedCount: uploadedImages.length,
        },
        results: results.map((r) => ({
          success: r.success,
          imageId: r.imageId,
          error: r.error,
        })),
        ...(warning && { warning }),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Batch upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred during batch upload',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Process a single file: validate and upload to R2
 */
async function processSingleFile(
  file: File,
  userId: string,
  order: number
): Promise<{
  success: boolean;
  imageId?: string;
  filePath?: string;
  url?: string;
  fileSize?: number;
  fileFormat?: string;
  width?: number;
  height?: number;
  error?: {
    code: string;
    message: string;
  };
}> {
  // Validate file using shared validation
  const validationResult = await validateFileForUpload(file);

  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error,
    };
  }

  // Generate filename and file path
  const { filePath, imageId } = generateFilename(userId, file.type);
  const buffer = Buffer.from(await file.arrayBuffer());

  // Upload to R2
  try {
    const uploadResult = await uploadToR2(filePath, buffer, {
      contentType: file.type,
    });

    const fileExtension = file.type.split('/')[1].toUpperCase();

    return {
      success: true,
      imageId,
      filePath: uploadResult.key,
      url: uploadResult.url,
      fileSize: file.size,
      fileFormat: fileExtension,
      width: validationResult.width,
      height: validationResult.height,
    };
  } catch {
    return {
      success: false,
      error: {
        code: 'UPLOAD_FAILED',
        message: 'Failed to upload file to storage.',
      },
    };
  }
}
