import { NextRequest, NextResponse } from 'next/server';
import { validateImageComplexity } from '@/lib/replicate/vision';
import type { ValidationResult, ValidationError, ValidationWarning } from '@/lib/utils/image-validation';

/**
 * POST /api/validate
 *
 * Validates an uploaded image using both local and API-based checks
 * Performs deep analysis to determine image complexity and suitability for style analysis
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_JSON',
            message: '请求格式错误',
          },
        },
        { status: 400 }
      );
    }

    const { imageUrl } = body;

    // Validate imageUrl parameter
    if (typeof imageUrl !== 'string' || !imageUrl.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'imageUrl 参数无效',
          },
        },
        { status: 422 }
      );
    }

    // Validate URL format
    try {
      new URL(imageUrl);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_URL',
            message: '图片 URL 格式无效',
          },
        },
        { status: 422 }
      );
    }

    // Perform API-based complexity validation
    const analysis = await validateImageComplexity(imageUrl);

    // Determine if image is suitable based on analysis
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check subject count (AC-1: more than 5 subjects is complex)
    if (analysis.subjectCount > 5) {
      warnings.push({
        code: 'COMPLEX_SCENE',
        message: '这张图片包含多个主体',
        suggestion: '建议使用单主体图片以获得更好的分析效果',
        confidence: analysis.confidence,
      });
    }

    // Check complexity level
    if (analysis.complexity === 'high') {
      warnings.push({
        code: 'COMPLEX_SCENE',
        message: '这张图片场景较为复杂',
        suggestion: '复杂场景可能影响分析准确性，建议使用构图简洁的图片',
        confidence: analysis.confidence,
      });
    }

    // Check confidence level (AC-3: confidence < 60% should warn)
    if (analysis.confidence < 0.6) {
      warnings.push({
        code: 'LOW_CONFIDENCE',
        message: '这张图片可能不适合分析',
        suggestion: '您可以继续尝试，或更换一张更清晰的图片',
        confidence: analysis.confidence,
      });
    }

    // Build response
    const isValid = errors.length === 0;
    const hasWarnings = warnings.length > 0;

    return NextResponse.json(
      {
        success: true,
        data: {
          valid: isValid,
          errors,
          warnings,
          analysis: {
            subjectCount: analysis.subjectCount,
            complexity: analysis.complexity,
            confidence: analysis.confidence,
            reason: analysis.reason,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Validation API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '图片验证失败，请稍后重试',
          details: error instanceof Error ? error.message : '未知错误',
        },
      },
      { status: 500 }
    );
  }
}

// Configure route
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
