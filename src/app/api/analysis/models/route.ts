import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { modelRegistry, getUserAvailableModels } from '@/lib/analysis/models';

/**
 * GET /api/analysis/models
 * 获取用户可用的视觉模型列表
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     models: VisionModel[],
 *     userTier: string,
 *     availableModels: string[]
 *   }
 * }
 */
export async function GET() {
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

    // 2. 获取用户可用模型
    const { models, tier } = await getUserAvailableModels(userId);

    // 3. 过滤用户可用的模型
    const availableModelIds = models.map(m => m.id);

    // 4. 返回所有模型（包含锁定信息）
    const allModels = modelRegistry.getAllModels();
    const modelsWithAccess = allModels.map(model => ({
      id: model.id,
      name: model.name,
      description: model.description,
      features: model.features,
      isDefault: model.isDefault,
      enabled: model.enabled,
      requiresTier: model.requiresTier,
      isLocked: !availableModelIds.includes(model.id),
    }));

    return NextResponse.json({
      success: true,
      data: {
        models: modelsWithAccess,
        userTier: tier,
        availableModels: availableModelIds,
      },
    });
  } catch (error) {
    console.error('Analysis models GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } },
      { status: 500 }
    );
  }
}
