import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { replicate } from '@/lib/replicate';
import { detectLanguage } from '@/features/templates/lib/language-detector';
import { buildOptimizationSystemPrompt, getCreditCost } from '@/features/templates/lib/optimization-presets';
import { generateDiff } from '@/features/templates/lib/diff-generator';
import type { TemplateJSONFormat } from '@/features/templates/types/template';
import type { PromptOptimizationOptions } from '@/features/templates/types/optimization';

interface OptimizeRequestBody {
  template?: TemplateJSONFormat;
  options?: PromptOptimizationOptions;
}

interface ContentSafetyResult {
  isSafe: boolean;
  reason?: string;
}

function buildFullPrompt(template: TemplateJSONFormat): string {
  const parts: string[] = [];

  if (template.subject) parts.push(`主体: ${template.subject}`);
  if (template.style) parts.push(`风格: ${template.style}`);
  if (template.composition) parts.push(`构图: ${template.composition}`);
  if (template.colors) parts.push(`色彩: ${template.colors}`);
  if (template.lighting) parts.push(`光线: ${template.lighting}`);
  if (template.additional) parts.push(`其他: ${template.additional}`);

  return parts.join('\n');
}

function parseOptimizationResult(response: unknown): string {
  if (typeof response === 'string') {
    return response.trim();
  }

  if (typeof response === 'object' && response !== null) {
    if ('output' in response) {
      return String((response as { output: unknown }).output).trim();
    }
    if ('text' in response) {
      return String((response as { text: unknown }).text).trim();
    }
    if ('result' in response) {
      return String((response as { result: unknown }).result).trim();
    }
    return JSON.stringify(response).trim();
  }

  return String(response).trim();
}

async function checkContentSafetyPlaceholder(content: string): Promise<ContentSafetyResult> {
  const lowerContent = content.toLowerCase();

  const explicitUnsafePatterns = [
    'violence', 'gore', 'blood', 'torture', 'murder', 'kill', 'assault',
    '暴力', '血腥', '酷刑', '谋杀', '杀害', '袭击',
    'pornography', 'explicit', 'nude', 'sexual',
    '色情', '露骨', '裸体', '性',
    'illegal', 'drug', 'terrorism', 'extremism',
    '非法', '毒品', '恐怖主义', '极端主义',
    'hate speech', 'discrimination', 'racist',
    '仇恨言论', '歧视', '种族主义',
  ];

  if (explicitUnsafePatterns.some((pattern) => lowerContent.includes(pattern.toLowerCase()))) {
    return {
      isSafe: false,
      reason: '检测到明显的不安全内容,包含暴力、色情或非法相关词汇',
    };
  }

  const suspiciousPatterns = [
    /\b(weapon|gun|knife|bomb)\b/i,
    /\b(武器|枪|刀|炸弹)\b/i,
    /\b(adult|18\+|mature)\b/i,
    /\b(成人|18\+|成熟)\b/i,
  ];

  if (suspiciousPatterns.some((pattern) => pattern.test(content))) {
    return {
      isSafe: false,
      reason: '检测到潜在的不安全内容,可能包含不当元素',
    };
  }

  const words = content.split(/\s+/);
  const uniqueWords = new Set(words);
  const repetitionRatio = uniqueWords.size / Math.max(words.length, 1);

  if (repetitionRatio < 0.3 && words.length > 20) {
    return {
      isSafe: false,
      reason: '提示词质量可能较低,包含过多重复内容',
    };
  }

  if (content.length > 5000) {
    return {
      isSafe: false,
      reason: '提示词过长,可能包含不必要的内容',
    };
  }

  return { isSafe: true };
}

function isValidOptions(options: unknown): options is PromptOptimizationOptions {
  if (!options || typeof options !== 'object') return false;

  const value = options as Record<string, unknown>;
  return (
    (value.mode === 'quick' || value.mode === 'deep') &&
    (value.target === 'detailed' || value.target === 'concise' || value.target === 'professional' || value.target === 'creative') &&
    (value.intensity === 'light' || value.intensity === 'medium' || value.intensity === 'heavy') &&
    (value.language === 'zh' || value.language === 'en' || value.language === 'auto')
  );
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '请先登录' } },
        { status: 401 }
      );
    }

    const body = (await request.json().catch(() => null)) as OptimizeRequestBody | null;
    if (!body?.template || !isValidOptions(body.options)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_REQUEST', message: '请求参数无效' } },
        { status: 400 }
      );
    }

    const template = body.template;
    const options = body.options;
    const language: 'zh' | 'en' = options.language === 'auto' ? detectLanguage(template) : options.language;

    const fullPrompt = buildFullPrompt(template);
    const systemPrompt = buildOptimizationSystemPrompt(options, language);
    const creditsConsumed = getCreditCost(options.mode);

    const model = process.env.REPLICATE_TEXT_MODEL_ID || 'meta/meta-llama-3.1-8b-instruct';
    const response = await replicate.run(model as `${string}/${string}`, {
      input: {
        prompt: `${systemPrompt}\n\n请优化以下提示词:\n\n${fullPrompt}`,
        max_tokens: 1000,
        temperature: 0.7,
      },
    });

    const optimized = parseOptimizationResult(response);
    const safetyCheck = await checkContentSafetyPlaceholder(optimized);
    if (!safetyCheck.isSafe) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CONTENT_POLICY_VIOLATION',
            message: `优化结果未通过内容安全检查: ${safetyCheck.reason || '未知原因'}`,
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        original: fullPrompt,
        optimized,
        diff: generateDiff(fullPrompt, optimized),
        language,
        mode: options.mode,
        creditsConsumed,
      },
    });
  } catch (error) {
    console.error('[POST /api/templates/optimize] failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'OPTIMIZATION_FAILED',
          message: `提示词优化失败: ${error instanceof Error ? error.message : '未知错误'}`,
        },
      },
      { status: 500 }
    );
  }
}
