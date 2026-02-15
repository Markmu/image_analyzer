import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { modelConfig, modelUsageStats } from '@/lib/db/schema';
import { eq, sql, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { modelRegistry, type VisionModel } from '@/lib/analysis/models';

/**
 * GET /api/admin/models
 * 获取所有模型配置列表
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     models: VisionModel[]
 *   }
 * }
 */
export async function GET() {
  try {
    // 1. 验证管理员身份
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '请先登录' } },
        { status: 401 }
      );
    }

    // TODO: 检查管理员权限（Epic 8 完成后实现）

    const db = getDb();

    // 从数据库获取模型配置
    const dbConfigs = await db.select().from(modelConfig);

    // 合并注册表中的模型和数据库配置
    const registryModels = modelRegistry.getAllModels();

    // 创建配置映射
    const configMap = new Map(dbConfigs.map((c) => [c.id, c]));

    // 合并配置
    const mergedModels: VisionModel[] = registryModels.map((model) => {
      const dbConfig = configMap.get(model.id);
      if (dbConfig) {
        return {
          ...model,
          enabled: dbConfig.enabled,
          isDefault: dbConfig.isDefault,
          requiresTier: (dbConfig.requiresTier as 'free' | 'lite' | 'standard') || model.requiresTier,
          costPerCall: dbConfig.costPerCall || model.costPerCall,
          avgDuration: dbConfig.avgDuration || model.avgDuration,
        };
      }
      return model;
    });

    return NextResponse.json({
      success: true,
      data: {
        models: mergedModels,
      },
    });
  } catch (error) {
    console.error('Admin models GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/models
 * 配置模型启用状态
 *
 * Request body:
 * {
 *   modelId: string,
 *   enabled: boolean
 * }
 *
 * Response:
 * {
 *   success: true,
 *   data: { message: string }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 验证管理员身份
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '请先登录' } },
        { status: 401 }
      );
    }

    // TODO: 检查管理员权限

    const body = await request.json().catch(() => null);

    if (!body || typeof body.modelId !== 'string' || typeof body.enabled !== 'boolean') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_REQUEST', message: '请求参数无效' } },
        { status: 400 }
      );
    }

    const { modelId, enabled } = body;

    // 验证模型存在
    const model = modelRegistry.getModelById(modelId);
    if (!model) {
      return NextResponse.json(
        { success: false, error: { code: 'MODEL_NOT_FOUND', message: '模型不存在' } },
        { status: 404 }
      );
    }

    const db = getDb();

    // 更新或插入模型配置
    const existingConfig = await db
      .select()
      .from(modelConfig)
      .where(eq(modelConfig.id, modelId))
      .limit(1);

    if (existingConfig.length > 0) {
      await db
        .update(modelConfig)
        .set({ enabled, updatedAt: new Date() })
        .where(eq(modelConfig.id, modelId));
    } else {
      await db.insert(modelConfig).values({
        id: modelId,
        name: model.name,
        description: model.description,
        enabled,
        isDefault: model.isDefault,
        requiresTier: model.requiresTier,
        costPerCall: model.costPerCall,
        avgDuration: model.avgDuration,
      });
    }

    // 更新内存注册表
    modelRegistry.setModelEnabled(modelId, enabled);

    return NextResponse.json({
      success: true,
      data: {
        message: enabled ? '模型已启用' : '模型已禁用',
      },
    });
  } catch (error) {
    console.error('Admin models POST error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } },
      { status: 500 }
    );
  }
}
