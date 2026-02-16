import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { images, user } from '@/lib/db/schema';
import { uploadToR2 } from '@/lib/r2/upload';
import { deleteFromR2 } from '@/lib/r2/download';
import { getExpirationDate } from '@/lib/config/retention';
import { eq } from 'drizzle-orm';
import sharp from 'sharp';

// Constants for validation
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MIN_DIMENSION = 200;
const MAX_DIMENSION = 8192;
const ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];

function elapsedMs(startAt: number): number {
  return Date.now() - startAt;
}

/**
 * POST /api/upload
 *
 * Upload an image to R2 and save metadata to database
 *
 * Story 4-1
 * - AC-6: 数据保留策略
 *
 * TODO: Future Enhancements (Story 2-1):
 * - AC-5: Image complexity detection (identify complex scenes, warn if confidence < 50%)
 *         This feature is planned for a future iteration. Currently using simple heuristics.
 * - AC-7: Mobile optimization features
 *         Mobile-specific enhancements will be added in a future update.
 */
export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID().slice(0, 8);
  const startedAt = Date.now();

  const logStage = (stage: string, stageStartedAt: number, extra?: Record<string, unknown>) => {
    console.log('[upload][timing]', {
      requestId,
      stage,
      stageMs: elapsedMs(stageStartedAt),
      totalMs: elapsedMs(startedAt),
      ...extra,
    });
  };

  try {
    // 1. Verify user authentication
    const authStartedAt = Date.now();
    const session = await auth();
    logStage('auth', authStartedAt, { hasUserId: Boolean(session?.user?.id) });

    if (!session?.user?.id) {
      logStage('response_unauthorized', Date.now(), { status: 401 });
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

    // 2. 检查用户是否已同意服务条款（Story 4-1 AC-2）
    const userInfoStartedAt = Date.now();
    const userInfo = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
      columns: {
        agreedToTermsAt: true,
        subscriptionTier: true,
      },
    });
    logStage('db_query_user_info', userInfoStartedAt, {
      agreedToTerms: Boolean(userInfo?.agreedToTermsAt),
    });

    if (!userInfo?.agreedToTermsAt) {
      logStage('response_terms_not_agreed', Date.now(), { status: 403 });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TERMS_NOT_AGREED',
            message: '请先同意服务条款',
          },
        },
        { status: 403 }
      );
    }

    // 3. Parse form data
    const formDataStartedAt = Date.now();
    const formData = await request.formData();
    logStage('parse_form_data', formDataStartedAt);

    const file = formData.get('file') as File | null;

    if (!file) {
      logStage('response_no_file', Date.now(), { status: 400 });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NO_FILE',
            message: 'No file provided',
          },
        },
        { status: 400 }
      );
    }

    // 4. Validate file type
    if (!ALLOWED_FORMATS.includes(file.type)) {
      logStage('response_invalid_file_type', Date.now(), {
        status: 400,
        fileType: file.type,
      });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_FILE_TYPE',
            message: 'Only JPEG, PNG, and WebP formats are supported',
          },
        },
        { status: 400 }
      );
    }

    // 5. Validate file size
    if (file.size > MAX_FILE_SIZE) {
      logStage('response_file_too_large', Date.now(), {
        status: 413,
        fileSize: file.size,
      });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FILE_TOO_LARGE',
            message: 'File size exceeds 10MB limit',
          },
        },
        { status: 413 }
      );
    }

    // 6. Convert file to buffer and validate dimensions
    const bufferStartedAt = Date.now();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    logStage('read_file_buffer', bufferStartedAt, { fileSize: file.size });

    let metadata: sharp.Metadata;
    let width: number;
    let height: number;

    try {
      const imageMetadataStartedAt = Date.now();
      metadata = await sharp(buffer).metadata();
      width = metadata.width || 0;
      height = metadata.height || 0;
      logStage('image_metadata', imageMetadataStartedAt, { width, height });

      // Validate dimensions
      if (
        width < MIN_DIMENSION ||
        height < MIN_DIMENSION ||
        width > MAX_DIMENSION ||
        height > MAX_DIMENSION
      ) {
        logStage('response_invalid_dimensions', Date.now(), {
          status: 400,
          width,
          height,
        });
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_DIMENSIONS',
              message: `Image dimensions must be between ${MIN_DIMENSION}x${MIN_DIMENSION} and ${MAX_DIMENSION}x${MAX_DIMENSION} pixels`,
            },
          },
          { status: 400 }
        );
      }
    } catch (error) {
      logStage('response_invalid_image', Date.now(), { status: 400 });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_IMAGE',
            message: 'Failed to process image. Please ensure it is a valid image file.',
          },
        },
        { status: 400 }
      );
    }

    // 7. Generate unique filename
    const fileExtension = file.type.split('/')[1];
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const filename = `${timestamp}-${random}.${fileExtension}`;
    const filePath = `images/${session.user.id}/${filename}`;

    // 8. Upload to R2
    let uploadResult;
    try {
      const r2UploadStartedAt = Date.now();
      uploadResult = await uploadToR2(filePath, buffer, {
        contentType: file.type,
      });
      logStage('r2_upload', r2UploadStartedAt, { key: uploadResult.key });
    } catch (error) {
      // If R2 upload fails, don't save to database
      logStage('response_upload_failed', Date.now(), { status: 500 });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UPLOAD_FAILED',
            message: 'Failed to upload file to storage. Please try again.',
          },
        },
        { status: 500 }
      );
    }

    // 9. 计算数据过期时间（Story 4-1 AC-6）
    const expiresAt = getExpirationDate(userInfo.subscriptionTier as any);

    // 10. Save metadata to database
    const imageId = `${timestamp}-${random}`;
    try {
      const dbInsertStartedAt = Date.now();
      await db.insert(images).values({
        id: imageId,
        userId: session.user.id,
        filePath: uploadResult.key,
        fileSize: file.size,
        fileFormat: fileExtension.toUpperCase(),
        width,
        height,
        uploadStatus: 'completed',
        expiresAt, // Story 4-1: 数据过期时间
      });
      logStage('db_insert_image', dbInsertStartedAt, { imageId });
    } catch (error) {
      // If database insert fails, delete from R2 to avoid orphaned files
      const r2CleanupStartedAt = Date.now();
      await deleteFromR2(uploadResult.key);
      logStage('r2_cleanup_after_db_error', r2CleanupStartedAt, { key: uploadResult.key });
      logStage('response_database_error', Date.now(), { status: 500 });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to save image metadata. Please try again.',
          },
        },
        { status: 500 }
      );
    }

    // 11. Return success response
    logStage('response_success', Date.now(), { status: 200, imageId });
    return NextResponse.json(
      {
        success: true,
        data: {
          imageId,
          filePath: uploadResult.key,
          fileSize: file.size,
          fileFormat: fileExtension.toUpperCase(),
          width,
          height,
          url: uploadResult.url,
          expiresAt, // Story 4-1: 过期时间
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    logStage('response_internal_error', Date.now(), { status: 500 });
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred. Please try again.',
        },
      },
      { status: 500 }
    );
  }
}
