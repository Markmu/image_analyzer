import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { images, user } from '@/lib/db/schema';
import { uploadToR2 } from '@/lib/r2/upload';
import { deleteFromR2 } from '@/lib/r2/download';
import { getModerationFunction } from '@/lib/moderation/image-moderation';
import { logModeration } from '@/lib/moderation/log-moderation';
import { getModerationMessage } from '@/lib/moderation/messages';
import { getExpirationDate } from '@/lib/config/retention';
import { eq } from 'drizzle-orm';
import sharp from 'sharp';

// Constants for validation
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MIN_DIMENSION = 200;
const MAX_DIMENSION = 8192;
const ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * POST /api/upload
 *
 * Upload an image to R2 and save metadata to database
 *
 * Story 4-1: 集成内容审核
 * - AC-1: 版权确认（前端实现，后端验证）
 * - AC-3: 图片内容审核
 * - AC-6: 数据保留策略
 *
 * TODO: Future Enhancements (Story 2-1):
 * - AC-5: Image complexity detection (identify complex scenes, warn if confidence < 50%)
 *         This feature is planned for a future iteration. Currently using simple heuristics.
 * - AC-7: Mobile optimization features
 *         Mobile-specific enhancements will be added in a future update.
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

    // 2. 检查用户是否已同意服务条款（Story 4-1 AC-2）
    const userInfo = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
      columns: {
        agreedToTermsAt: true,
        subscriptionTier: true,
      },
    });

    if (!userInfo?.agreedToTermsAt) {
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
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const copyrightConfirmed = formData.get('copyrightConfirmed') === 'true'; // Story 4-1 AC-1

    // 验证版权确认（Story 4-1 AC-1）
    if (!copyrightConfirmed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'COPYRIGHT_NOT_CONFIRMED',
            message: '请确认您拥有此图片的使用权利',
          },
        },
        { status: 400 }
      );
    }

    if (!file) {
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
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let metadata: sharp.Metadata;
    let width: number;
    let height: number;

    try {
      metadata = await sharp(buffer).metadata();
      width = metadata.width || 0;
      height = metadata.height || 0;

      // Validate dimensions
      if (
        width < MIN_DIMENSION ||
        height < MIN_DIMENSION ||
        width > MAX_DIMENSION ||
        height > MAX_DIMENSION
      ) {
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
      uploadResult = await uploadToR2(filePath, buffer, {
        contentType: file.type,
      });
    } catch (error) {
      // If R2 upload fails, don't save to database
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

    // 9. 内容审核（Story 4-1 AC-3）
    const moderateFn = getModerationFunction();
    const moderationResult = await moderateFn(uploadResult.url);

    console.log('[Upload] Moderation result:', moderationResult);

    // 记录审核日志
    await logModeration({
      userId: session.user.id,
      contentType: 'image',
      result: moderationResult,
    });

    // 如果审核不通过，删除已上传的图片
    if (!moderationResult.isApproved) {
      await deleteFromR2(uploadResult.key);

      const message = getModerationMessage(
        moderationResult.categories,
        { violence: 0.7, sexual: 0.7, hate: 0.7, harassment: 0.7, selfHarm: 0.7 }
      );

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CONTENT_REJECTED',
            message: message.title,
            details: {
              reason: moderationResult.reason,
              suggestion: message.suggestion,
              policyLink: '/content-policy',
            },
          },
        },
        { status: 400 }
      );
    }

    // 10. 计算数据过期时间（Story 4-1 AC-6）
    const expiresAt = getExpirationDate(userInfo.subscriptionTier as any);

    // 11. Save metadata to database
    const imageId = `${timestamp}-${random}`;
    try {
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
    } catch (error) {
      // If database insert fails, delete from R2 to avoid orphaned files
      await deleteFromR2(uploadResult.key);
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

    // 12. Return success response
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
          moderation: {
            // Story 4-1: 审核结果
            status: moderationResult.action,
            confidence: moderationResult.confidence,
          },
          expiresAt, // Story 4-1: 过期时间
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Upload error:', error);
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
