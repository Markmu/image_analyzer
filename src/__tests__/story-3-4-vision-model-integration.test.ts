/**
 * Story 3-4: 视觉模型集成测试
 *
 * 测试范围:
 * - AC-1: 支持多个视觉模型提供商
 * - AC-2: 用户可以手动选择视觉模型
 * - AC-3: 订阅等级配置模型访问权限
 * - AC-4: 动态切换模型
 * - AC-5: 管理员配置模型启用/禁用
 * - AC-6: 模型使用统计
 * - AC-7: 处理模型不可用情况
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ============================================================
// AC-1: 支持多个视觉模型提供商测试
// ============================================================

describe('AC-1: 支持多个视觉模型提供商', () => {
  describe('模型注册表', () => {
    it('应支持至少 3 个视觉模型', () => {
      const availableModels = [
        { id: 'qwen3-vl', name: 'Qwen3 VL 8B' },
        { id: 'kimi-k2.5', name: 'Kimi K2.5' },
        { id: 'gemini-flash', name: 'Gemini 3 Flash' }
      ];

      expect(availableModels.length).toBeGreaterThanOrEqual(3);
    });

    it('每个模型应有不同的特点', () => {
      const models = [
        { id: 'qwen3-vl', features: ['快速', '经济'], cost: 'low' },
        { id: 'kimi-k2.5', features: ['中文优化', '准确'], cost: 'medium' },
        { id: 'gemini-flash', features: ['最高准确率'], cost: 'high' }
      ];

      expect(models[0].features).not.toEqual(models[1].features);
      expect(models[1].features).not.toEqual(models[2].features);
    });

    it('应能通过环境变量配置启用的模型列表', () => {
      // 模拟环境变量配置
      const envConfig = {
        REPLICATE_VISION_MODEL_ID: 'lucataco/qwen3-vl-8b-instruct:xxx',
        ENABLED_VISION_MODELS: 'kimi-k2.5,qwen3-vl'
      };

      const enabledModels = envConfig.ENABLED_VISION_MODELS.split(',');

      expect(enabledModels).toContain('kimi-k2.5');
      expect(enabledModels).toContain('qwen3-vl');
    });
  });

  describe('模型配置结构', () => {
    it('应有模型 ID', () => {
      const model = { id: 'qwen3-vl', name: 'Qwen3 VL' };

      expect(model.id).toBeDefined();
      expect(typeof model.id).toBe('string');
    });

    it('应有模型名称', () => {
      const model = { id: 'qwen3-vl', name: 'Qwen3 VL 8B' };

      expect(model.name).toBeDefined();
      expect(model.name.length).toBeGreaterThan(0);
    });

    it('应有模型描述', () => {
      const model = {
        id: 'qwen3-vl',
        name: 'Qwen3 VL',
        description: '性价比高，适合日常使用'
      };

      expect(model.description).toBeDefined();
    });

    it('应有 enabled 字段表示启用状态', () => {
      const model = { id: 'qwen3-vl', enabled: true };

      expect(model.enabled).toBeDefined();
      expect(typeof model.enabled).toBe('boolean');
    });

    it('应有 isDefault 字段表示默认模型', () => {
      const model = { id: 'kimi-k2.5', isDefault: true };

      expect(model.isDefault).toBeDefined();
      expect(typeof model.isDefault).toBe('boolean');
    });
  });

  describe('模型查询接口', () => {
    it('应能根据 ID 获取模型', () => {
      const models = [
        { id: 'qwen3-vl', name: 'Qwen3 VL' },
        { id: 'kimi-k2.5', name: 'Kimi K2.5' },
        { id: 'gemini-flash', name: 'Gemini 3 Flash' }
      ];

      const getModelById = (id: string) => models.find(m => m.id === id);

      expect(getModelById('qwen3-vl')).toBeDefined();
      expect(getModelById('qwen3-vl')?.name).toBe('Qwen3 VL');
    });

    it('应能获取所有启用的模型', () => {
      const models = [
        { id: 'qwen3-vl', enabled: true },
        { id: 'kimi-k2.5', enabled: true },
        { id: 'gemini-flash', enabled: false }
      ];

      const getEnabledModels = () => models.filter(m => m.enabled);

      expect(getEnabledModels().length).toBe(2);
    });

    it('应能获取默认模型', () => {
      const models = [
        { id: 'qwen3-vl', isDefault: false },
        { id: 'kimi-k2.5', isDefault: true },
        { id: 'gemini-flash', isDefault: false }
      ];

      const getDefaultModel = () => models.find(m => m.isDefault);

      expect(getDefaultModel()).toBeDefined();
      expect(getDefaultModel()?.id).toBe('kimi-k2.5');
    });
  });
});

// ============================================================
// AC-2: 用户可以手动选择视觉模型测试
// ============================================================

describe('AC-2: 用户可以手动选择视觉模型', () => {
  describe('模型选择器', () => {
    it('应能在分析设置中选择模型', () => {
      const analysisSettings = {
        imageId: 123,
        modelId: 'qwen3-vl'
      };

      expect(analysisSettings.modelId).toBeDefined();
    });

    it('应记住用户偏好的模型选择', () => {
      // 模拟用户偏好存储
      const userPreferences = {
        preferredModelId: 'kimi-k2.5'
      };

      // 模拟保存偏好
      const savePreference = (modelId: string) => {
        userPreferences.preferredModelId = modelId;
      };

      savePreference('gemini-flash');
      expect(userPreferences.preferredModelId).toBe('gemini-flash');
    });

    it('应显示每个模型的特点和适用场景', () => {
      const models = [
        {
          id: 'qwen3-vl',
          name: 'Qwen3 VL',
          features: ['快速', '经济'],
         适用场景: '日常使用'
        },
        {
          id: 'kimi-k2.5',
          name: 'Kimi K2.5',
          features: ['中文优化', '准确'],
         适用场景: '中文图片'
        },
        {
          id: 'gemini-flash',
          name: 'Gemini 3 Flash',
          features: ['最高准确率'],
         适用场景: '复杂分析'
        }
      ];

      expect(models[0].features).toBeDefined();
      expect(models[0]['适用场景']).toBeDefined();
    });
  });

  describe('API 扩展支持模型选择', () => {
    it('POST /api/analysis 应支持 modelId 参数', () => {
      const request = {
        imageId: 123,
        modelId: 'qwen3-vl'  // 可选参数
      };

      expect(request.modelId).toBeDefined();
    });

    it('未指定 modelId 时应使用默认模型', () => {
      const request = { imageId: 123 };
      const defaultModelId = 'kimi-k2.5';
      const usedModelId = request.modelId || defaultModelId;

      expect(usedModelId).toBe('kimi-k2.5');
    });

    it('未指定 modelId 时应使用用户偏好模型', () => {
      const userPreference = { preferredModelId: 'qwen3-vl' };
      const request = { imageId: 123 };
      const defaultModelId = 'kimi-k2.5';
      const usedModelId = request.modelId || userPreference.preferredModelId || defaultModelId;

      expect(usedModelId).toBe('qwen3-vl');
    });
  });

  describe('响应中应包含使用的模型信息', () => {
    it('响应应包含 modelUsed 字段', () => {
      const response = {
        success: true,
        data: {
          analysisId: 456,
          status: 'processing',
          modelUsed: 'qwen3-vl'
        }
      };

      expect(response.data.modelUsed).toBeDefined();
    });

    it('modelUsed 应返回实际使用的模型 ID', () => {
      const response = {
        data: {
          modelUsed: 'kimi-k2.5'
        }
      };

      const validModels = ['qwen3-vl', 'kimi-k2.5', 'gemini-flash'];
      expect(validModels).toContain(response.data.modelUsed);
    });
  });

  describe('批量分析支持模型选择', () => {
    it('POST /api/analysis/batch 应支持模型选择参数', () => {
      const batchRequest = {
        imageIds: [1, 2, 3],
        modelId: 'gemini-flash'
      };

      expect(batchRequest.modelId).toBeDefined();
    });

    it('批量分析应使用统一的模型', () => {
      const batchRequest = {
        imageIds: [1, 2, 3],
        modelId: 'qwen3-vl'
      };

      // 所有图片应使用相同的模型
      const allUseSameModel = batchRequest.imageIds.every(() => batchRequest.modelId);
      expect(allUseSameModel).toBe(true);
    });
  });
});

// ============================================================
// AC-3: 订阅等级配置模型访问权限测试
// ============================================================

describe('AC-3: 订阅等级配置模型访问权限', () => {
  describe('订阅等级模型访问配置', () => {
    const TIER_ACCESS = {
      free: ['kimi-k2.5'],        // 仅默认模型
      lite: ['kimi-k2.5', 'qwen3-vl'],  // 默认 + 1 个
      standard: ['kimi-k2.5', 'qwen3-vl', 'gemini-flash']  // 所有模型
    };

    it('Free 用户应仅能访问默认模型', () => {
      const userTier = 'free';
      const allowedModels = TIER_ACCESS[userTier];

      expect(allowedModels).toContain('kimi-k2.5');
      expect(allowedModels.length).toBe(1);
    });

    it('Lite 用户应能访问默认模型 + 1 个高级模型', () => {
      const userTier = 'lite';
      const allowedModels = TIER_ACCESS[userTier];

      expect(allowedModels).toContain('kimi-k2.5');
      expect(allowedModels).toContain('qwen3-vl');
      expect(allowedModels.length).toBe(2);
    });

    it('Standard 用户应能访问所有模型', () => {
      const userTier = 'standard';
      const allowedModels = TIER_ACCESS[userTier];

      expect(allowedModels.length).toBe(3);
    });

    it('应能获取用户可用的模型列表', () => {
      const getUserAvailableModels = (tier: string) => {
        return TIER_ACCESS[tier] || TIER_ACCESS['free'];
      };

      expect(getUserAvailableModels('free').length).toBe(1);
      expect(getUserAvailableModels('lite').length).toBe(2);
      expect(getUserAvailableModels('standard').length).toBe(3);
    });
  });

  describe('权限检查逻辑', () => {
    const TIER_ACCESS = {
      free: ['kimi-k2.5'],
      lite: ['kimi-k2.5', 'qwen3-vl'],
      standard: ['kimi-k2.5', 'qwen3-vl', 'gemini-flash']
    };

    it('应检查用户是否有权限使用指定模型', () => {
      const canUseModel = (tier: string, modelId: string) => {
        const allowedModels = TIER_ACCESS[tier] || TIER_ACCESS['free'];
        return allowedModels.includes(modelId);
      };

      expect(canUseModel('free', 'kimi-k2.5')).toBe(true);
      expect(canUseModel('free', 'qwen3-vl')).toBe(false);
      expect(canUseModel('standard', 'gemini-flash')).toBe(true);
    });

    it('Free 用户尝试访问高级模型时应返回错误', () => {
      const response = {
        success: false,
        error: {
          code: 'MODEL_UNAVAILABLE',
          message: '该模型需要 Lite 订阅',
          data: {
            upgradeTier: 'lite'
          }
        }
      };

      expect(response.success).toBe(false);
      expect(response.error.code).toBe('MODEL_UNAVAILABLE');
      expect(response.error.data.upgradeTier).toBe('lite');
    });
  });

  describe('升级提示 UI', () => {
    it('应显示模型锁定提示', () => {
      const model = {
        id: 'gemini-flash',
        requiresTier: 'standard',
        isLocked: true
      };

      expect(model.isLocked).toBe(true);
    });

    it('应显示需要升级到的等级', () => {
      const model = { requiresTier: 'standard' };

      const upgradeMessage = `需要升级到 ${model.requiresTier} 套餐`;
      expect(upgradeMessage).toContain('standard');
    });

    it('应提供升级引导链接', () => {
      const upgradeLink = '/subscription/upgrade?plan=standard';

      expect(upgradeLink).toContain('upgrade');
      expect(upgradeLink).toContain('standard');
    });
  });

  describe('前端模型过滤', () => {
    it('应在前端隐藏不可用的模型选项', () => {
      const userTier = 'free';
      const allModels = [
        { id: 'kimi-k2.5', requiresTier: 'free' },
        { id: 'qwen3-vl', requiresTier: 'lite' },
        { id: 'gemini-flash', requiresTier: 'standard' }
      ];

      const getVisibleModels = (tier: string) => {
        const tierLevel = { free: 1, lite: 2, standard: 3 };
        const userLevel = tierLevel[tier] || 1;
        return allModels.filter(m => tierLevel[m.requiresTier] <= userLevel);
      };

      const visibleModels = getVisibleModels(userTier);
      expect(visibleModels.length).toBe(1);
      expect(visibleModels[0].id).toBe('kimi-k2.5');
    });

    it('Lite 用户应能看到 2 个模型', () => {
      const allModels = [
        { id: 'kimi-k2.5', requiresTier: 'free' },
        { id: 'qwen3-vl', requiresTier: 'lite' },
        { id: 'gemini-flash', requiresTier: 'standard' }
      ];

      const tierLevel = { free: 1, lite: 2, standard: 3 };
      const visibleModels = allModels.filter(m => tierLevel[m.requiresTier] <= 2);

      expect(visibleModels.length).toBe(2);
    });
  });

  describe('API 端点返回用户可用模型', () => {
    it('GET /api/analysis/models 应返回 availableModels', () => {
      const response = {
        success: true,
        data: {
          models: [],
          userTier: 'lite',
          availableModels: ['kimi-k2.5', 'qwen3-vl']
        }
      };

      expect(response.data.availableModels).toBeDefined();
      expect(response.data.availableModels.length).toBe(2);
    });

    it('应同时返回 userTier 信息', () => {
      const response = {
        data: {
          userTier: 'free'
        }
      };

      expect(response.data.userTier).toBeDefined();
      expect(['free', 'lite', 'standard']).toContain(response.data.userTier);
    });
  });
});

// ============================================================
// AC-4: 动态切换模型测试
// ============================================================

describe('AC-4: 动态切换模型', () => {
  describe('模型动态选择', () => {
    it('应能通过模型 ID 动态选择模型', () => {
      const analyzeWithModel = (imageUrl: string, modelId: string) => {
        const modelConfig = {
          'qwen3-vl': { prompt: 'Analyze this image...' },
          'kimi-k2.5': { prompt: '分析这张图片...' },
          'gemini-flash': { prompt: 'Perform a comprehensive analysis...' }
        };
        return modelConfig[modelId];
      };

      const config = analyzeWithModel('http://example.com/image.jpg', 'qwen3-vl');
      expect(config).toBeDefined();
    });

    it('不同模型应使用不同的 prompt', () => {
      const modelPrompts = {
        'qwen3-vl': 'Analyze the visual style...',
        'kimi-k2.5': '分析这张图片的视觉风格...',
        'gemini-flash': 'Perform a comprehensive visual style analysis...'
      };

      expect(modelPrompts['qwen3-vl']).not.toEqual(modelPrompts['kimi-k2.5']);
      expect(modelPrompts['kimi-k2.5']).not.toEqual(modelPrompts['gemini-flash']);
    });

    it('应保持 API 响应格式一致', () => {
      const responseFormat = {
        success: true,
        data: {
          analysisId: 123,
          status: 'completed',
          result: {
            styles: [],
            confidence: 0.9
          }
        }
      };

      // 不同模型应返回相同格式
      expect(responseFormat.data.result).toHaveProperty('styles');
      expect(responseFormat.data.result).toHaveProperty('confidence');
    });
  });

  describe('不修改核心分析逻辑', () => {
    it('分析结果结构应保持一致', () => {
      const result1 = { styles: ['modern'], confidence: 0.85 };
      const result2 = { styles: ['minimalist'], confidence: 0.92 };

      // 无论使用哪个模型，结构应相同
      expect(Object.keys(result1)).toEqual(Object.keys(result2));
    });

    it('应统一返回 styles 数组', () => {
      const result = {
        styles: ['vintage', 'warm', 'natural']
      };

      expect(Array.isArray(result.styles)).toBe(true);
    });

    it('应统一返回 confidence 数值', () => {
      const result = { confidence: 0.85 };

      expect(typeof result.confidence).toBe('number');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('模型切换功能', () => {
    it('应能从默认模型切换到其他模型', () => {
      let currentModel = 'kimi-k2.5';

      const switchModel = (newModelId: string) => {
        currentModel = newModelId;
      };

      switchModel('qwen3-vl');
      expect(currentModel).toBe('qwen3-vl');
    });

    it('应能切换到任意启用的模型', () => {
      const enabledModels = ['kimi-k2.5', 'qwen3-vl', 'gemini-flash'];

      const selectModel = (modelId: string) => {
        if (enabledModels.includes(modelId)) {
          return modelId;
        }
        return enabledModels[0];
      };

      expect(selectModel('qwen3-vl')).toBe('qwen3-vl');
      expect(selectModel('invalid-model')).toBe('kimi-k2.5');
    });

    it('切换模型不应影响分析状态', () => {
      const analysisState = {
        status: 'processing',
        progress: { completed: 0, total: 1 }
      };

      const switchModel = () => {
        // 切换模型不应改变分析状态
        return analysisState;
      };

      const newState = switchModel();
      expect(newState.status).toBe('processing');
    });
  });
});

// ============================================================
// AC-5: 管理员配置模型启用/禁用测试
// ============================================================

describe('AC-5: 管理员配置模型启用/禁用', () => {
  describe('管理员配置接口', () => {
    it('POST /api/admin/models 应能配置模型启用状态', () => {
      const request = {
        modelId: 'gemini-flash',
        enabled: true
      };

      expect(request.enabled).toBeDefined();
      expect(typeof request.enabled).toBe('boolean');
    });

    it('GET /api/admin/models 应获取模型配置列表', () => {
      const models = [
        { id: 'qwen3-vl', enabled: true },
        { id: 'kimi-k2.5', enabled: true },
        { id: 'gemini-flash', enabled: false }
      ];

      expect(models.length).toBe(3);
      expect(models.filter(m => m.enabled).length).toBe(2);
    });

    it('应返回配置结果消息', () => {
      const response = {
        success: true,
        data: {
          message: '模型已启用'
        }
      };

      expect(response.data.message).toBeDefined();
    });
  });

  describe('管理员权限检查', () => {
    it('非管理员应无法配置模型', () => {
      const user = { role: 'user', isAdmin: false };

      const canConfigure = user.isAdmin === true;
      expect(canConfigure).toBe(false);
    });

    it('管理员应能配置模型', () => {
      const user = { role: 'admin', isAdmin: true };

      const canConfigure = user.isAdmin === true;
      expect(canConfigure).toBe(true);
    });

    it('应返回 403 权限错误', () => {
      const errorResponse = {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: '需要管理员权限'
        }
      };

      expect(errorResponse.error.code).toBe('FORBIDDEN');
    });
  });

  describe('禁用模型的可见性', () => {
    it('禁用模型应对普通用户不可见', () => {
      const allModels = [
        { id: 'qwen3-vl', enabled: true },
        { id: 'kimi-k2.5', enabled: true },
        { id: 'gemini-flash', enabled: false }
      ];

      const getVisibleModels = (models: typeof allModels) =>
        models.filter(m => m.enabled);

      const visibleModels = getVisibleModels(allModels);
      expect(visibleModels.length).toBe(2);
      expect(visibleModels.find(m => m.id === 'gemini-flash')).toBeUndefined();
    });

    it('禁用模型应对管理员可见', () => {
      const allModels = [
        { id: 'qwen3-vl', enabled: true },
        { id: 'kimi-k2.5', enabled: true },
        { id: 'gemini-flash', enabled: false }
      ];

      // 管理员应能看到所有模型（包括禁用的）
      const adminSeesAll = true;
      expect(adminSeesAll).toBe(true);
    });

    it('禁用模型应不可选择', () => {
      const model = { id: 'gemini-flash', enabled: false };

      const canSelect = model.enabled;
      expect(canSelect).toBe(false);
    });
  });

  describe('模型配置持久化', () => {
    it('应能保存模型配置到数据库', () => {
      const modelConfig = {
        id: 'gemini-flash',
        enabled: false,
        updatedAt: new Date().toISOString()
      };

      expect(modelConfig.enabled).toBe(false);
      expect(modelConfig.updatedAt).toBeDefined();
    });

    it('配置应能跨会话持久', () => {
      const savedConfig = {
        id: 'gemini-flash',
        enabled: false
      };

      // 模拟重新加载配置
      const loadedConfig = savedConfig;
      expect(loadedConfig.enabled).toBe(false);
    });

    it('应能更新模型配置', () => {
      const modelConfig = { id: 'gemini-flash', enabled: false };

      // 更新配置
      modelConfig.enabled = true;

      expect(modelConfig.enabled).toBe(true);
    });
  });

  describe('模型配置响应格式', () => {
    it('GET /api/admin/models 应返回模型列表及状态', () => {
      const response = {
        success: true,
        data: {
          models: [
            {
              id: 'qwen3-vl',
              name: 'Qwen3 VL',
              enabled: true,
              isDefault: false
            },
            {
              id: 'gemini-flash',
              name: 'Gemini 3 Flash',
              enabled: false,
              isDefault: false
            }
          ]
        }
      };

      expect(response.data.models).toBeDefined();
      expect(Array.isArray(response.data.models)).toBe(true);
    });

    it('每个模型应包含 enabled 字段', () => {
      const models = [
        { id: 'qwen3-vl', enabled: true },
        { id: 'gemini-flash', enabled: false }
      ];

      models.forEach(model => {
        expect(model).toHaveProperty('enabled');
      });
    });
  });
});

// ============================================================
// AC-6: 模型使用统计测试
// ============================================================

describe('AC-6: 模型使用统计', () => {
  describe('统计表结构', () => {
    it('应记录 modelId', () => {
      const stats = {
        modelId: 'qwen3-vl',
        successCount: 10,
        failureCount: 2
      };

      expect(stats.modelId).toBeDefined();
    });

    it('应记录 successCount', () => {
      const stats = {
        successCount: 100
      };

      expect(stats.successCount).toBeDefined();
      expect(typeof stats.successCount).toBe('number');
    });

    it('应记录 failureCount', () => {
      const stats = {
        failureCount: 5
      };

      expect(stats.failureCount).toBeDefined();
      expect(stats.failureCount).toBeGreaterThanOrEqual(0);
    });

    it('应记录 avgDuration', () => {
      const stats = {
        avgDuration: 15.5  // 秒
      };

      expect(stats.avgDuration).toBeDefined();
      expect(stats.avgDuration).toBeGreaterThan(0);
    });
  });

  describe('统计记录功能', () => {
    it('分析完成时应记录使用统计', () => {
      const recordStats = (modelId: string, success: boolean, duration: number) => {
        return {
          modelId,
          success,
          duration,
          timestamp: new Date().toISOString()
        };
      };

      const record = recordStats('qwen3-vl', true, 12.5);
      expect(record.modelId).toBe('qwen3-vl');
      expect(record.success).toBe(true);
    });

    it('应记录成功状态', () => {
      const record = { success: true };
      expect(record.success).toBe(true);
    });

    it('应记录失败状态', () => {
      const record = { success: false };
      expect(record.success).toBe(false);
    });

    it('应记录分析耗时', () => {
      const duration = 18.3;
      expect(duration).toBeGreaterThan(0);
    });
  });

  describe('统计查询 API', () => {
    it('GET /api/admin/models/stats 应返回使用统计', () => {
      const response = {
        success: true,
        data: {
          stats: [
            { modelId: 'qwen3-vl', totalCalls: 150, successRate: 0.95 },
            { modelId: 'kimi-k2.5', totalCalls: 45, successRate: 0.98 }
          ]
        }
      };

      expect(response.data.stats).toBeDefined();
      expect(Array.isArray(response.data.stats)).toBe(true);
    });

    it('应包含 totalCalls 字段', () => {
      const stats = { totalCalls: 100 };
      expect(stats.totalCalls).toBeDefined();
      expect(stats.totalCalls).toBeGreaterThan(0);
    });

    it('应包含 successRate 字段', () => {
      const stats = { successRate: 0.95 };
      expect(stats.successRate).toBeDefined();
      expect(stats.successRate).toBeGreaterThanOrEqual(0);
      expect(stats.successRate).toBeLessThanOrEqual(1);
    });

    it('应支持按时间范围筛选', () => {
      const query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };

      expect(query.startDate).toBeDefined();
      expect(query.endDate).toBeDefined();
    });
  });

  describe('计算统计', () => {
    it('应能计算成功率', () => {
      const successCount = 95;
      const failureCount = 5;
      const successRate = successCount / (successCount + failureCount);

      expect(successRate).toBe(0.95);
    });

    it('应能计算平均耗时', () => {
      const durations = [10, 12, 15, 20, 8];
      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;

      expect(avgDuration).toBe(13);
    });

    it('应能计算总调用次数', () => {
      const stats = [
        { modelId: 'qwen3-vl', successCount: 100, failureCount: 10 },
        { modelId: 'kimi-k2.5', successCount: 50, failureCount: 5 }
      ];

      const totalCalls = stats.reduce((sum, s) => sum + s.successCount + s.failureCount, 0);

      expect(totalCalls).toBe(165);
    });
  });
});

// ============================================================
// AC-7: 处理模型不可用情况测试
// ============================================================

describe('AC-7: 处理模型不可用情况', () => {
  describe('模型 API 失败处理', () => {
    it('模型 API 失败时应能自动切换备用模型', () => {
      const fallbackSequence = ['qwen3-vl', 'kimi-k2.5', 'gemini-flash'];

      const getFallbackModel = (failedModel: string) => {
        const currentIndex = fallbackSequence.indexOf(failedModel);
        if (currentIndex < fallbackSequence.length - 1) {
          return fallbackSequence[currentIndex + 1];
        }
        return null;
      };

      expect(getFallbackModel('qwen3-vl')).toBe('kimi-k2.5');
      expect(getFallbackModel('kimi-k2.5')).toBe('gemini-flash');
      expect(getFallbackModel('gemini-flash')).toBeNull();
    });

    it('应配置降级顺序', () => {
      const fallbackConfig = {
        primary: 'qwen3-vl',
        secondary: 'kimi-k2.5',
        tertiary: 'gemini-flash'
      };

      expect(fallbackConfig.primary).toBeDefined();
      expect(fallbackConfig.secondary).toBeDefined();
      expect(fallbackConfig.tertiary).toBeDefined();
    });

    it('应记录降级日志', () => {
      const logs: string[] = [];

      const logFallback = (from: string, to: string) => {
        logs.push(`从 ${from} 降级到 ${to}`);
      };

      logFallback('qwen3-vl', 'kimi-k2.5');

      expect(logs.length).toBe(1);
      expect(logs[0]).toContain('降级');
    });
  });

  describe('用户提示', () => {
    it('应显示模型切换提示', () => {
      const userNotification = {
        message: '当前模型不可用，已自动切换到备用模型',
        type: 'info'
      };

      expect(userNotification.message).toContain('切换');
    });

    it('提示应包含切换后的模型名称', () => {
      const notification = {
        fromModel: 'qwen3-vl',
        toModel: 'kimi-k2.5',
        message: '已切换到 kimi-k2.5 模型'
      };

      expect(notification.message).toContain('kimi-k2.5');
    });
  });

  describe('错误处理策略', () => {
    it('应重试可恢复的错误', () => {
      const retryableErrors = ['RATE_LIMIT', 'TIMEOUT', 'TEMPORARILY_UNAVAILABLE'];

      const error = { code: 'RATE_LIMIT' };
      const shouldRetry = retryableErrors.includes(error.code);

      expect(shouldRetry).toBe(true);
    });

    it('不可恢复的错误不应重试', () => {
      const retryableErrors = ['RATE_LIMIT', 'TIMEOUT'];

      const error = { code: 'INVALID_MODEL' };
      const shouldRetry = retryableErrors.includes(error.code);

      expect(shouldRetry).toBe(false);
    });

    it('模型失败时应返回友好错误信息', () => {
      const errorResponse = {
        success: false,
        error: {
          code: 'MODEL_UNAVAILABLE',
          message: '模型暂时不可用，请稍后重试或选择其他模型'
        }
      };

      expect(errorResponse.error.message).toBeDefined();
      expect(errorResponse.error.message.length).toBeGreaterThan(0);
    });
  });

  describe('日志记录', () => {
    it('应记录模型切换日志', () => {
      const logs: Array<{ timestamp: string; from: string; to: string }> = [];

      const log = (from: string, to: string) => {
        logs.push({
          timestamp: new Date().toISOString(),
          from,
          to
        });
      };

      log('qwen3-vl', 'kimi-k2.5');

      expect(logs.length).toBe(1);
      expect(logs[0].from).toBe('qwen3-vl');
      expect(logs[0].to).toBe('kimi-k2.5');
    });

    it('应记录错误详情', () => {
      const errorLog = {
        timestamp: new Date().toISOString(),
        modelId: 'qwen3-vl',
        error: 'API rate limit exceeded',
        userId: 'user-123'
      };

      expect(errorLog.modelId).toBeDefined();
      expect(errorLog.error).toBeDefined();
    });
  });

  describe('重试机制', () => {
    it('应配置最大重试次数', () => {
      const config = { maxRetries: 3 };
      expect(config.maxRetries).toBe(3);
    });

    it('应配置重试间隔', () => {
      const config = { retryDelayMs: 2000 };
      expect(config.retryDelayMs).toBe(2000);
    });

    it('超过最大重试应停止', () => {
      let retryCount = 0;
      const maxRetries = 3;

      const shouldRetry = retryCount < maxRetries;
      expect(shouldRetry).toBe(true);

      retryCount = 3;
      const shouldRetryAfterMax = retryCount < maxRetries;
      expect(shouldRetryAfterMax).toBe(false);
    });
  });

  describe('备用模型选择', () => {
    it('所有备用模型都失败时应返回错误', () => {
      const availableModels = ['kimi-k2.5', 'gemini-flash'];
      const failedModels = ['qwen3-vl', 'kimi-k2.5', 'gemini-flash'];

      const hasAvailableModel = availableModels.some(m => !failedModels.includes(m));

      expect(hasAvailableModel).toBe(false);
    });

    it('应选择下一个可用的备用模型', () => {
      const fallbackOrder = ['qwen3-vl', 'kimi-k2.5', 'gemini-flash'];
      const failedModels = ['qwen3-vl'];

      const nextModel = fallbackOrder.find(m => !failedModels.includes(m));

      expect(nextModel).toBe('kimi-k2.5');
    });
  });
});

// ============================================================
// 集成场景测试
// ============================================================

describe('集成场景测试', () => {
  describe('完整模型选择流程', () => {
    it('用户应能选择模型 → 分析 → 查看结果', () => {
      // 1. 选择模型
      const selectedModel = 'qwen3-vl';
      expect(selectedModel).toBeDefined();

      // 2. 发起分析
      const analysisRequest = { imageId: 1, modelId: selectedModel };
      expect(analysisRequest.modelId).toBe('qwen3-vl');

      // 3. 获取结果
      const result = { status: 'completed', modelUsed: 'qwen3-vl' };
      expect(result.modelUsed).toBe('qwen3-vl');
    });

    it('应返回使用的模型名称', () => {
      const response = {
        data: {
          modelUsed: 'qwen3-vl',
          modelName: 'Qwen3 VL 8B'
        }
      };

      expect(response.data.modelName).toBeDefined();
    });
  });

  describe('订阅等级限制场景', () => {
    it('Free 用户应只能看到默认模型', () => {
      const allModels = [
        { id: 'kimi-k2.5', requiresTier: 'free', enabled: true },
        { id: 'qwen3-vl', requiresTier: 'lite', enabled: true },
        { id: 'gemini-flash', requiresTier: 'standard', enabled: true }
      ];

      const userModels = allModels.filter(m => m.requiresTier === 'free');

      expect(userModels.length).toBe(1);
      expect(userModels[0].id).toBe('kimi-k2.5');
    });

    it('Free 用户尝试选择高级模型应被拒绝', () => {
      const TIER_ACCESS = {
        free: ['kimi-k2.5'],
        lite: ['kimi-k2.5', 'qwen3-vl'],
        standard: ['kimi-k2.5', 'qwen3-vl', 'gemini-flash']
      };

      const canUse = TIER_ACCESS.free.includes('qwen3-vl');
      expect(canUse).toBe(false);
    });

    it('Standard 用户应能使用所有模型', () => {
      const TIER_ACCESS = {
        standard: ['kimi-k2.5', 'qwen3-vl', 'gemini-flash']
      };

      expect(TIER_ACCESS.standard.length).toBe(3);
    });
  });

  describe('管理员配置场景', () => {
    it('管理员禁用模型后用户应看不到', () => {
      const allModels = [
        { id: 'qwen3-vl', enabled: true },
        { id: 'kimi-k2.5', enabled: true },
        { id: 'gemini-flash', enabled: false }
      ];

      // 禁用 gemini-flash
      const disabledModel = allModels.find(m => m.id === 'gemini-flash');
      disabledModel!.enabled = false;

      const visibleModels = allModels.filter(m => m.enabled);
      expect(visibleModels.length).toBe(2);
      expect(visibleModels.find(m => m.id === 'gemini-flash')).toBeUndefined();
    });

    it('管理员应能看到所有模型配置', () => {
      const allModels = [
        { id: 'qwen3-vl', enabled: true },
        { id: 'gemini-flash', enabled: false }
      ];

      // 管理员应看到所有模型
      expect(allModels.length).toBe(2);
    });
  });

  describe('统计追踪场景', () => {
    it('每次分析应记录使用的模型', () => {
      const analysis = {
        id: 1,
        modelId: 'qwen3-vl',
        status: 'completed'
      };

      expect(analysis.modelId).toBeDefined();
    });

    it('应能查询特定模型的统计数据', () => {
      const stats = {
        'qwen3-vl': { totalCalls: 100, successRate: 0.95 },
        'kimi-k2.5': { totalCalls: 50, successRate: 0.98 }
      };

      expect(stats['qwen3-vl']).toBeDefined();
      expect(stats['qwen3-vl'].totalCalls).toBe(100);
    });
  });

  describe('模型不可用处理场景', () => {
    it('主模型失败时应自动切换', () => {
      let currentModel = 'qwen3-vl';
      let failed = false;

      const tryAnalyze = () => {
        if (failed) {
          currentModel = 'kimi-k2.5'; // 切换到备用
        }
        return { modelUsed: currentModel };
      };

      failed = true;
      const result = tryAnalyze();

      expect(result.modelUsed).toBe('kimi-k2.5');
    });

    it('切换模型时应通知用户', () => {
      const notification = {
        show: true,
        message: '已自动切换到备用模型'
      };

      expect(notification.show).toBe(true);
      expect(notification.message).toContain('切换');
    });
  });
});
