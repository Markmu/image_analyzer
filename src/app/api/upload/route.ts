import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { images } from '@/lib/db/schema';
import { uploadToR2 } from '@/lib/r2/upload';
import { deleteFromR2 } from '@/lib/r2/download';
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
    const file = formData.get('file') as File | null;

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

    // 3. Validate file type
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

    // 4. Validate file size
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

    // 5. Convert file to buffer and validate dimensions
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

    // 6. Generate unique filename
    const fileExtension = file.type.split('/')[1];
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const filename = `${timestamp}-${random}.${fileExtension}`;
    const filePath = `images/${session.user.id}/${filename}`;

    // 7. Upload to R2
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

    // 8. Save metadata to database
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

    // 9. Return success response
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
