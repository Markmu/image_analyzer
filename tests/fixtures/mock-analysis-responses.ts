/**
 * Mock 分析响应数据
 * 用于测试 Story 3-1 风格分析功能
 */

export const mockAnalysisResponses = {
  // 高置信度完整响应
  highConfidence: {
    dimensions: {
      lighting: {
        name: '光影',
        features: [
          { name: '主光源方向', value: '侧光', confidence: 0.85 },
          { name: '光影对比度', value: '高对比度', confidence: 0.9 },
          { name: '阴影特征', value: '柔和阴影', confidence: 0.8 }
        ],
        confidence: 0.85
      },
      composition: {
        name: '构图',
        features: [
          { name: '视角', value: '平视', confidence: 0.92 },
          { name: '画面平衡', value: '黄金分割构图', confidence: 0.88 },
          { name: '景深', value: '浅景深', confidence: 0.85 }
        ],
        confidence: 0.88
      },
      color: {
        name: '色彩',
        features: [
          { name: '主色调', value: '暖色调', confidence: 0.95 },
          { name: '色彩对比度', value: '中等对比', confidence: 0.82 },
          { name: '色温', value: '暖色', confidence: 0.88 }
        ],
        confidence: 0.88
      },
      artisticStyle: {
        name: '艺术风格',
        features: [
          { name: '风格流派', value: '印象派', confidence: 0.78 },
          { name: '艺术时期', value: '现代', confidence: 0.85 },
          { name: '情感基调', value: '愉悦', confidence: 0.8 }
        ],
        confidence: 0.81
      }
    },
    overallConfidence: 0.86,
    modelUsed: 'llava-13b',
    analysisDuration: 45
  },

  // 低置信度响应（整体 < 0.6）
  lowConfidence: {
    dimensions: {
      lighting: {
        name: '光影',
        features: [
          { name: '主光源方向', value: '不确定', confidence: 0.5 }
        ],
        confidence: 0.5
      },
      composition: {
        name: '构图',
        features: [
          { name: '视角', value: '不确定', confidence: 0.55 }
        ],
        confidence: 0.55
      },
      color: {
        name: '色彩',
        features: [
          { name: '主色调', value: '混合色调', confidence: 0.58 }
        ],
        confidence: 0.58
      },
      artisticStyle: {
        name: '艺术风格',
        features: [
          { name: '风格流派', value: '不确定', confidence: 0.45 }
        ],
        confidence: 0.45
      }
    },
    overallConfidence: 0.52,
    modelUsed: 'llava-13b',
    analysisDuration: 42
  },

  // 单个低置信度维度
  lowConfidenceDimension: {
    dimensions: {
      lighting: {
        name: '光影',
        features: [
          { name: '主光源方向', value: '侧光', confidence: 0.85 }
        ],
        confidence: 0.85
      },
      composition: {
        name: '构图',
        features: [
          { name: '视角', value: '不确定', confidence: 0.4 }
        ],
        confidence: 0.4 // 低置信度维度
      },
      color: {
        name: '色彩',
        features: [
          { name: '主色调', value: '暖色调', confidence: 0.9 }
        ],
        confidence: 0.9
      },
      artisticStyle: {
        name: '艺术风格',
        features: [
          { name: '风格流派', value: '印象派', confidence: 0.88 }
        ],
        confidence: 0.88
      }
    },
    overallConfidence: 0.76,
    modelUsed: 'llava-13b',
    analysisDuration: 44
  },

  // 中等置信度（0.6-0.8）
  mediumConfidence: {
    dimensions: {
      lighting: {
        name: '光影',
        features: [
          { name: '主光源方向', value: '侧光', confidence: 0.7 }
        ],
        confidence: 0.7
      },
      composition: {
        name: '构图',
        features: [
          { name: '视角', value: '平视', confidence: 0.72 }
        ],
        confidence: 0.72
      },
      color: {
        name: '色彩',
        features: [
          { name: '主色调', value: '暖色调', confidence: 0.68 }
        ],
        confidence: 0.68
      },
      artisticStyle: {
        name: '艺术风格',
        features: [
          { name: '风格流派', value: '印象派', confidence: 0.65 }
        ],
        confidence: 0.65
      }
    },
    overallConfidence: 0.69,
    modelUsed: 'llava-13b',
    analysisDuration: 43
  },

  // 最小边界值（置信度 = 0）
  minConfidence: {
    dimensions: {
      lighting: {
        name: '光影',
        features: [
          { name: '主光源方向', value: '不确定', confidence: 0 }
        ],
        confidence: 0
      },
      composition: {
        name: '构图',
        features: [
          { name: '视角', value: '不确定', confidence: 0 }
        ],
        confidence: 0
      },
      color: {
        name: '色彩',
        features: [
          { name: '主色调', value: '不确定', confidence: 0 }
        ],
        confidence: 0
      },
      artisticStyle: {
        name: '艺术风格',
        features: [
          { name: '风格流派', value: '不确定', confidence: 0 }
        ],
        confidence: 0
      }
    },
    overallConfidence: 0,
    modelUsed: 'llava-13b',
    analysisDuration: 30
  },

  // 最大边界值（置信度 = 1）
  maxConfidence: {
    dimensions: {
      lighting: {
        name: '光影',
        features: [
          { name: '主光源方向', value: '侧光', confidence: 1 }
        ],
        confidence: 1
      },
      composition: {
        name: '构图',
        features: [
          { name: '视角', value: '平视', confidence: 1 }
        ],
        confidence: 1
      },
      color: {
        name: '色彩',
        features: [
          { name: '主色调', value: '暖色调', confidence: 1 }
        ],
        confidence: 1
      },
      artisticStyle: {
        name: '艺术风格',
        features: [
          { name: '风格流派', value: '印象派', confidence: 1 }
        ],
        confidence: 1
      }
    },
    overallConfidence: 1,
    modelUsed: 'llava-13b',
    analysisDuration: 30
  }
};

// 测试用户数据
export const testUsers = {
  premiumUser: {
    id: 'test-premium-user',
    email: 'premium@test.com',
    password: 'TestPassword123!',
    creditBalance: 100,
    subscriptionTier: 'premium'
  },

  freeUser: {
    id: 'test-free-user',
    email: 'free@test.com',
    password: 'TestPassword123!',
    creditBalance: 5,
    subscriptionTier: 'free'
  },

  noCreditUser: {
    id: 'test-no-credit-user',
    email: 'nocredit@test.com',
    password: 'TestPassword123!',
    creditBalance: 0,
    subscriptionTier: 'free'
  }
};

// 测试图片元数据
export const testImageMetadata = {
  portraitLighting: {
    filename: 'portrait-lighting.jpg',
    description: '清晰的光影对比，适合测试光影维度',
    expectedFeatures: {
      mainLightSource: '侧光',
      contrast: '高对比度',
      shadow: '柔和阴影'
    }
  },

  landscapeComposition: {
    filename: 'landscape-composition.jpg',
    description: '经典黄金分割构图，适合测试构图维度',
    expectedFeatures: {
      viewpoint: '平视',
      balance: '黄金分割构图',
      depth: '深景深'
    }
  },

  colorfulPalette: {
    filename: 'colorful-palette.jpg',
    description: '丰富的色彩层次，适合测试色彩维度',
    expectedFeatures: {
      mainTone: '暖色调',
      contrast: '中等对比',
      temperature: '暖色'
    }
  },

  impressionistArt: {
    filename: 'impressionist-art.jpg',
    description: '印象派风格作品，适合测试艺术风格维度',
    expectedFeatures: {
      style: '印象派',
      period: '现代',
      emotion: '愉悦'
    }
  },

  lowQuality: {
    filename: 'low-quality.jpg',
    description: '模糊、低对比度图片，适合测试低置信度',
    expectedConfidence: '< 0.6'
  },

  inappropriate: {
    filename: 'inappropriate.jpg',
    description: '不当内容图片，用于测试内容安全检查',
    expectedOutcome: '拒绝分析'
  }
};
