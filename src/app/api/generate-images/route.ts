/**
 * 图片生成 API (Story 6.1)
 *
 * 支持从模版生成图片,提供实时进度反馈
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { replicate } from '@/lib/replicate';
import { moderatePrompt, moderateGeneratedImage } from '@/lib/moderation/generation-moderation';
import { buildGenerationPrompt } from '@/features/generation/lib/prompt-builder';
import type { Template } from '@/features/templates/types/template';

/**
 * POST /api/generate-images
 *
 * Request body:
 * - template: Template - 模版对象
 * - provider: string - 模型提供商 (如 "stability-ai")
 * - model: string - 模型版本 (如 "stable-diffusion-xl")
 * - resolution: { width, height } - 分辨率
 * - quantity: number - 生成数量 (1-4)
 *
 * Response:
 * - success: boolean
 * - data: { predictionId: string, status: string } - 异步模式返回 predictionId
 * - data: { images: GeneratedImage[] } - 同步模式返回图片 (如果支持)
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 验证用户身份
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '请先登录' } },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json().catch(() => null);

    // 2. 验证请求参数
    if (!body || !body.template) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_REQUEST', message: '缺少模版参数' } },
        { status: 400 }
      );
    }

    const template = body.template as Template;
    const provider = body.provider || 'stability-ai';
    const model = body.model || 'stability-ai/stable-diffusion-xl';
    const resolution = body.resolution || { width: 1024, height: 1024 };
    const quantity = Math.min(body.quantity || 1, 4);

    // 3. 构建提示词
    const prompt = buildGenerationPrompt(template);

    // 4. 内容安全检查
    const safetyCheck = await moderatePrompt(prompt, userId);
    if (!safetyCheck.isApproved) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CONTENT_POLICY_VIOLATION',
            message: safetyCheck.reason || '内容不符合安全规范'
          }
        },
        { status: 403 }
      );
    }

    // 5. 调用 Replicate API
    try {
      const modelString = model as `${string}/${string}`;

      const replicateInput = {
        prompt,
        width: resolution.width,
        height: resolution.height,
        num_outputs: quantity,
        enhance_prompt: true,
        scheduler: 'DPMSolverMultistep',
        num_inference_steps: 30,
      };

      // 使用 replicate.run 进行同步调用
      // 注意: 这会阻塞直到生成完成,对于长时间任务应该使用 webhook
      const output = await replicate.run(modelString, { input: replicateInput });

      // 处理输出
      const outputs = Array.isArray(output) ? output : [output];
      const images = [];

      for (let i = 0; i < outputs.length; i++) {
        const url = typeof outputs[i] === 'string' ? outputs[i] : String(outputs[i]);

        // 生成后内容安全检查
        const imageSafetyCheck = await moderateGeneratedImage(url, Date.now(), userId);

        images.push({
          id: `${Date.now()}-${i}`,
          url,
          thumbnailUrl: url,
          metadata: {
            width: resolution.width,
            height: resolution.height,
            format: 'png',
            size: 0,
          },
          safetyCheck: {
            passed: imageSafetyCheck.isApproved,
            score: imageSafetyCheck.confidence,
            reason: imageSafetyCheck.reason,
          },
        });
      }

      // 过滤掉不安全的图片
      const safeImages = images.filter(img => img.safetyCheck.passed);

      if (safeImages.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'CONTENT_POLICY_VIOLATION',
              message: '生成图片未通过安全检查,已为您退款',
            },
          },
          { status: 403 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          images: safeImages,
          provider,
          model,
          resolution,
          templateId: template.id,
          creditsConsumed: safeImages.length * 4, // 简单计算:每张4个积分
        },
      });

    } catch (replicateError) {
      console.error('Replicate API error:', replicateError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'GENERATION_FAILED',
            message: replicateError instanceof Error ? replicateError.message : '图片生成失败',
          },
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Generate images API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '服务器内部错误',
        },
      },
      { status: 500 }
    );
  }
}
