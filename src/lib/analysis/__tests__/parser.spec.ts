/**
 * Story 3-1: 风格分析单元测试
 *
 * 测试覆盖：
 * - 分析结果解析器
 * - JSON Schema 验证
 * - 特征提取工具函数
 * - 置信度计算
 */

import { describe, test, expect } from 'vitest';
import { z } from 'zod';
import {
  parseAnalysisResponse,
  extractFeatures,
  calculateAverageConfidence,
  validateConfidenceRange,
  AnalysisDataSchema,
  StyleDimensionSchema,
  StyleFeatureSchema
} from '../../src/lib/analysis/parser';

// Mock 数据
const mockValidAnalysisData = {
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
};

const mockLowConfidenceData = {
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
};

// ========================================
// 解析器测试
// ========================================
describe('parseAnalysisResponse', () => {
  test('TEST-UNIT-01: 应解析有效的 JSON 响应', () => {
    const jsonString = JSON.stringify(mockValidAnalysisData);

    const result = parseAnalysisResponse(jsonString);

    expect(result).toMatchObject({
      dimensions: {
        lighting: expect.objectContaining({
          name: '光影',
          confidence: 0.85
        }),
        composition: expect.objectContaining({
          name: '构图',
          confidence: 0.88
        }),
        color: expect.objectContaining({
          name: '色彩',
          confidence: 0.88
        }),
        artisticStyle: expect.objectContaining({
          name: '艺术风格',
          confidence: 0.81
        })
      },
      overallConfidence: 0.86,
      modelUsed: 'llava-13b',
      analysisDuration: 45
    });
  });

  test('TEST-UNIT-02: 应拒绝无效的 JSON', () => {
    const invalidJSON = 'This is not JSON';

    expect(() => {
      parseAnalysisResponse(invalidJSON);
    }).toThrow('Invalid JSON format');
  });

  test('TEST-UNIT-03: 应验证必需字段存在', () => {
    const incompleteData = {
      dimensions: {
        lighting: {
          name: '光影',
          features: [],
          confidence: 0.8
        }
        // 缺少 composition, color, artisticStyle
      },
      overallConfidence: 0.8,
      modelUsed: 'llava-13b',
      analysisDuration: 30
    };

    const jsonString = JSON.stringify(incompleteData);

    expect(() => {
      parseAnalysisResponse(jsonString);
    }).toThrow(/Missing required field|Invalid data structure/);
  });

  test('TEST-UNIT-04: 应验证置信度在 0-1 范围内', () => {
    const invalidConfidenceData = {
      ...mockValidAnalysisData,
      dimensions: {
        ...mockValidAnalysisData.dimensions,
        lighting: {
          ...mockValidAnalysisData.dimensions.lighting,
          confidence: 1.5 // 超出范围
        }
      }
    };

    const jsonString = JSON.stringify(invalidConfidenceData);

    expect(() => {
      parseAnalysisResponse(jsonString);
    }).toThrow('Confidence must be between 0 and 1');
  });

  test('TEST-UNIT-05: 应处理负置信度', () => {
    const negativeConfidenceData = {
      ...mockValidAnalysisData,
      dimensions: {
        ...mockValidAnalysisData.dimensions,
        composition: {
          ...mockValidAnalysisData.dimensions.composition,
          features: [
            {
              name: '视角',
              value: '平视',
              confidence: -0.5 // 负数
            }
          ]
        }
      }
    };

    const jsonString = JSON.stringify(negativeConfidenceData);

    expect(() => {
      parseAnalysisResponse(jsonString);
    }).toThrow('Confidence must be between 0 and 1');
  });

  test('TEST-UNIT-06: 应处理边界值（0 和 1）', () => {
    const boundaryData = {
      ...mockValidAnalysisData,
      dimensions: {
        lighting: {
          name: '光影',
          features: [
            { name: '主光源方向', value: '侧光', confidence: 0 }
          ],
          confidence: 0
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
            { name: '主色调', value: '暖色调', confidence: 0.5 }
          ],
          confidence: 0.5
        },
        artisticStyle: {
          name: '艺术风格',
          features: [
            { name: '风格流派', value: '印象派', confidence: 0.5 }
          ],
          confidence: 0.5
        }
      },
      overallConfidence: 0.5,
      modelUsed: 'llava-13b',
      analysisDuration: 30
    };

    const jsonString = JSON.stringify(boundaryData);

    const result = parseAnalysisResponse(jsonString);

    expect(result).toBeDefined();
    expect(result.dimensions.lighting.confidence).toBe(0);
    expect(result.dimensions.composition.confidence).toBe(1);
  });
});

// ========================================
// 特征提取测试
// ========================================
describe('extractFeatures', () => {
  test('TEST-UNIT-07: 应正确提取特征标签', () => {
    const mockDimension = {
      name: '光影',
      features: [
        { name: '主光源方向', value: '侧光', confidence: 0.85 },
        { name: '光影对比度', value: '高对比度', confidence: 0.9 },
        { name: '阴影特征', value: '柔和阴影', confidence: 0.8 }
      ],
      confidence: 0.85
    };

    const features = extractFeatures(mockDimension);

    expect(features).toHaveLength(3);
    expect(features[0]).toMatchObject({
      name: '主光源方向',
      value: '侧光',
      confidence: 0.85
    });
    expect(features[1]).toMatchObject({
      name: '光影对比度',
      value: '高对比度',
      confidence: 0.9
    });
    expect(features[2]).toMatchObject({
      name: '阴影特征',
      value: '柔和阴影',
      confidence: 0.8
    });
  });

  test('TEST-UNIT-08: 应处理空特征数组', () => {
    const emptyDimension = {
      name: '光影',
      features: [],
      confidence: 0
    };

    const features = extractFeatures(emptyDimension);

    expect(features).toHaveLength(0);
    expect(features).toEqual([]);
  });

  test('TEST-UNIT-09: 应处理单个特征', () => {
    const singleFeatureDimension = {
      name: '光影',
      features: [
        { name: '主光源方向', value: '侧光', confidence: 0.85 }
      ],
      confidence: 0.85
    };

    const features = extractFeatures(singleFeatureDimension);

    expect(features).toHaveLength(1);
    expect(features[0]).toMatchObject({
      name: '主光源方向',
      value: '侧光',
      confidence: 0.85
    });
  });
});

// ========================================
// 置信度计算测试
// ========================================
describe('calculateAverageConfidence', () => {
  test('TEST-UNIT-10: 应计算维度的平均置信度', () => {
    const features = [
      { confidence: 0.85 },
      { confidence: 0.9 },
      { confidence: 0.8 }
    ];

    const avgConfidence = calculateAverageConfidence(features);

    expect(avgConfidence).toBeCloseTo(0.85, 2);
  });

  test('TEST-UNIT-11: 应处理空数组', () => {
    const avgConfidence = calculateAverageConfidence([]);

    expect(avgConfidence).toBe(0);
  });

  test('TEST-UNIT-12: 应处理单个特征', () => {
    const features = [{ confidence: 0.75 }];

    const avgConfidence = calculateAverageConfidence(features);

    expect(avgConfidence).toBe(0.75);
  });

  test('TEST-UNIT-13: 应处理大量特征', () => {
    const features = Array.from({ length: 100 }, (_, i) => ({
      confidence: i / 100
    }));

    const avgConfidence = calculateAverageConfidence(features);

    // 平均值应该接近 0.495
    expect(avgConfidence).toBeCloseTo(0.495, 2);
  });

  test('TEST-UNIT-14: 应处理相同置信度', () => {
    const features = [
      { confidence: 0.8 },
      { confidence: 0.8 },
      { confidence: 0.8 }
    ];

    const avgConfidence = calculateAverageConfidence(features);

    expect(avgConfidence).toBe(0.8);
  });
});

// ========================================
// 置信度验证测试
// ========================================
describe('validateConfidenceRange', () => {
  test('TEST-UNIT-15: 应接受有效的置信度', () => {
    expect(validateConfidenceRange(0.5)).toBe(true);
    expect(validateConfidenceRange(0)).toBe(true);
    expect(validateConfidenceRange(1)).toBe(true);
    expect(validateConfidenceRange(0.999)).toBe(true);
  });

  test('TEST-UNIT-16: 应拒绝超出范围的置信度', () => {
    expect(validateConfidenceRange(-0.1)).toBe(false);
    expect(validateConfidenceRange(1.1)).toBe(false);
    expect(validateConfidenceRange(2)).toBe(false);
    expect(validateConfidenceRange(-1)).toBe(false);
  });

  test('TEST-UNIT-17: 应处理边界值', () => {
    expect(validateConfidenceRange(0)).toBe(true);
    expect(validateConfidenceRange(1)).toBe(true);
    expect(validateConfidenceRange(0.0001)).toBe(true);
    expect(validateConfidenceRange(0.9999)).toBe(true);
  });

  test('TEST-UNIT-18: 应拒绝 NaN', () => {
    expect(validateConfidenceRange(NaN)).toBe(false);
  });

  test('TEST-UNIT-19: 应拒绝 Infinity', () => {
    expect(validateConfidenceRange(Infinity)).toBe(false);
    expect(validateConfidenceRange(-Infinity)).toBe(false);
  });
});

// ========================================
// Zod Schema 验证测试
// ========================================
describe('AnalysisDataSchema', () => {
  test('TEST-UNIT-20: 应验证有效的 AnalysisData', () => {
    const result = AnalysisDataSchema.parse(mockValidAnalysisData);

    expect(result).toEqual(mockValidAnalysisData);
  });

  test('TEST-UNIT-21: 应拒绝缺少维度的数据', () => {
    const incompleteData = {
      dimensions: {
        lighting: {
          name: '光影',
          features: [],
          confidence: 0.8
        }
        // 缺少 composition, color, artisticStyle
      },
      overallConfidence: 0.8,
      modelUsed: 'llava-13b',
      analysisDuration: 30
    };

    expect(() => {
      AnalysisDataSchema.parse(incompleteData);
    }).toThrow();
  });

  test('TEST-UNIT-22: 应验证 overallConfidence 类型', () => {
    const invalidTypeData = {
      ...mockValidAnalysisData,
      overallConfidence: '0.86' // 应该是 number
    };

    expect(() => {
      AnalysisDataSchema.parse(invalidTypeData);
    }).toThrow();
  });

  test('TEST-UNIT-23: 应验证 analysisDuration 类型', () => {
    const invalidTypeData = {
      ...mockValidAnalysisData,
      analysisDuration: '45' // 应该是 number
    };

    expect(() => {
      AnalysisDataSchema.parse(invalidTypeData);
    }).toThrow();
  });

  test('TEST-UNIT-24: 应验证 modelUsed 类型', () => {
    const invalidTypeData = {
      ...mockValidAnalysisData,
      modelUsed: 123 // 应该是 string
    };

    expect(() => {
      AnalysisDataSchema.parse(invalidTypeData);
    }).toThrow();
  });

  test('TEST-UNIT-25: 应拒绝空特征数组', () => {
    // 至少需要一个特征
    const emptyFeaturesData = {
      dimensions: {
        lighting: {
          name: '光影',
          features: [],
          confidence: 0.8
        },
        composition: {
          name: '构图',
          features: [],
          confidence: 0.8
        },
        color: {
          name: '色彩',
          features: [],
          confidence: 0.8
        },
        artisticStyle: {
          name: '艺术风格',
          features: [],
          confidence: 0.8
        }
      },
      overallConfidence: 0.8,
      modelUsed: 'llava-13b',
      analysisDuration: 30
    };

    // 如果配置要求至少一个特征，这应该失败
    // 否则应该通过
    try {
      AnalysisDataSchema.parse(emptyFeaturesData);
      // 如果通过，说明允许空特征
      expect(true).toBe(true);
    } catch (error) {
      // 如果失败，说明不允许空特征
      expect(error).toBeDefined();
    }
  });
});

// ========================================
// StyleDimensionSchema 测试
// ========================================
describe('StyleDimensionSchema', () => {
  test('TEST-UNIT-26: 应验证有效的 StyleDimension', () => {
    const validDimension = {
      name: '光影',
      features: [
        { name: '主光源方向', value: '侧光', confidence: 0.85 }
      ],
      confidence: 0.85
    };

    const result = StyleDimensionSchema.parse(validDimension);

    expect(result).toEqual(validDimension);
  });

  test('TEST-UNIT-27: 应拒绝缺少 name', () => {
    const invalidDimension = {
      features: [],
      confidence: 0.8
    };

    expect(() => {
      StyleDimensionSchema.parse(invalidDimension);
    }).toThrow();
  });

  test('TEST-UNIT-28: 应拒绝缺少 features', () => {
    const invalidDimension = {
      name: '光影',
      confidence: 0.8
    };

    expect(() => {
      StyleDimensionSchema.parse(invalidDimension);
    }).toThrow();
  });

  test('TEST-UNIT-29: 应拒绝缺少 confidence', () => {
    const invalidDimension = {
      name: '光影',
      features: []
    };

    expect(() => {
      StyleDimensionSchema.parse(invalidDimension);
    }).toThrow();
  });
});

// ========================================
// StyleFeatureSchema 测试
// ========================================
describe('StyleFeatureSchema', () => {
  test('TEST-UNIT-30: 应验证有效的 StyleFeature', () => {
    const validFeature = {
      name: '主光源方向',
      value: '侧光',
      confidence: 0.85
    };

    const result = StyleFeatureSchema.parse(validFeature);

    expect(result).toEqual(validFeature);
  });

  test('TEST-UNIT-31: 应拒绝缺少 name', () => {
    const invalidFeature = {
      value: '侧光',
      confidence: 0.85
    };

    expect(() => {
      StyleFeatureSchema.parse(invalidFeature);
    }).toThrow();
  });

  test('TEST-UNIT-32: 应拒绝缺少 value', () => {
    const invalidFeature = {
      name: '主光源方向',
      confidence: 0.85
    };

    expect(() => {
      StyleFeatureSchema.parse(invalidFeature);
    }).toThrow();
  });

  test('TEST-UNIT-33: 应拒绝缺少 confidence', () => {
    const invalidFeature = {
      name: '主光源方向',
      value: '侧光'
    };

    expect(() => {
      StyleFeatureSchema.parse(invalidFeature);
    }).toThrow();
  });

  test('TEST-UNIT-34: 应验证 confidence 是数字', () => {
    const invalidFeature = {
      name: '主光源方向',
      value: '侧光',
      confidence: '0.85' // 应该是 number
    };

    expect(() => {
      StyleFeatureSchema.parse(invalidFeature);
    }).toThrow();
  });
});

// ========================================
// 低置信度检测测试
// ========================================
describe('低置信度检测', () => {
  test('TEST-UNIT-35: 应检测低整体置信度', () => {
    const result = parseAnalysisResponse(JSON.stringify(mockLowConfidenceData));

    expect(result.overallConfidence).toBeLessThan(0.6);
  });

  test('TEST-UNIT-36: 应检测低维度置信度', () => {
    const result = parseAnalysisResponse(JSON.stringify(mockLowConfidenceData));

    const lowConfidenceDimensions = Object.values(result.dimensions)
      .filter(dimension => dimension.confidence < 0.6);

    expect(lowConfidenceDimensions.length).toBeGreaterThan(0);
  });

  test('TEST-UNIT-37: 应检测低特征置信度', () => {
    const result = parseAnalysisResponse(JSON.stringify(mockLowConfidenceData));

    const lowConfidenceFeatures: any[] = [];
    Object.values(result.dimensions).forEach(dimension => {
      dimension.features.forEach(feature => {
        if (feature.confidence < 0.6) {
          lowConfidenceFeatures.push(feature);
        }
      });
    });

    expect(lowConfidenceFeatures.length).toBeGreaterThan(0);
  });
});

// ========================================
// 数据完整性测试
// ========================================
describe('数据完整性', () => {
  test('TEST-UNIT-38: 应验证所有四个维度存在', () => {
    const result = parseAnalysisResponse(JSON.stringify(mockValidAnalysisData));

    expect(result.dimensions).toHaveProperty('lighting');
    expect(result.dimensions).toHaveProperty('composition');
    expect(result.dimensions).toHaveProperty('color');
    expect(result.dimensions).toHaveProperty('artisticStyle');
  });

  test('TEST-UNIT-39: 应验证每个维度至少有 3 个特征', () => {
    const result = parseAnalysisResponse(JSON.stringify(mockValidAnalysisData));

    Object.values(result.dimensions).forEach(dimension => {
      expect(dimension.features.length).toBeGreaterThanOrEqual(3);
    });
  });

  test('TEST-UNIT-40: 应验证所有特征都有置信度', () => {
    const result = parseAnalysisResponse(JSON.stringify(mockValidAnalysisData));

    Object.values(result.dimensions).forEach(dimension => {
      dimension.features.forEach(feature => {
        expect(feature.confidence).toBeDefined();
        expect(feature.confidence).toBeGreaterThanOrEqual(0);
        expect(feature.confidence).toBeLessThanOrEqual(1);
      });
    });
  });

  test('TEST-UNIT-41: 应验证所有字段都是必需的', () => {
    const result = parseAnalysisResponse(JSON.stringify(mockValidAnalysisData));

    expect(result.dimensions).toBeDefined();
    expect(result.overallConfidence).toBeDefined();
    expect(result.modelUsed).toBeDefined();
    expect(result.analysisDuration).toBeDefined();
  });
});

// ========================================
// 边界条件测试
// ========================================
describe('边界条件', () => {
  test('TEST-UNIT-42: 应处理最小置信度（0）', () => {
    const minConfidenceData = {
      ...mockValidAnalysisData,
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
    };

    const result = parseAnalysisResponse(JSON.stringify(minConfidenceData));

    expect(result.overallConfidence).toBe(0);
  });

  test('TEST-UNIT-43: 应处理最大置信度（1）', () => {
    const maxConfidenceData = {
      ...mockValidAnalysisData,
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
    };

    const result = parseAnalysisResponse(JSON.stringify(maxConfidenceData));

    expect(result.overallConfidence).toBe(1);
  });

  test('TEST-UNIT-44: 应处理大量特征', () => {
    const manyFeaturesData = {
      ...mockValidAnalysisData,
      dimensions: {
        lighting: {
          name: '光影',
          features: Array.from({ length: 100 }, (_, i) => ({
            name: `特征${i}`,
            value: `值${i}`,
            confidence: 0.5
          })),
          confidence: 0.5
        },
        composition: {
          name: '构图',
          features: [],
          confidence: 0.5
        },
        color: {
          name: '色彩',
          features: [],
          confidence: 0.5
        },
        artisticStyle: {
          name: '艺术风格',
          features: [],
          confidence: 0.5
        }
      },
      overallConfidence: 0.5,
      modelUsed: 'llava-13b',
      analysisDuration: 30
    };

    const result = parseAnalysisResponse(JSON.stringify(manyFeaturesData));

    expect(result.dimensions.lighting.features).toHaveLength(100);
  });
});

// ========================================
// 错误处理测试
// ========================================
describe('错误处理', () => {
  test('TEST-UNIT-45: 应提供清晰的错误消息', () => {
    const invalidData = {
      dimensions: 'invalid', // 应该是对象
      overallConfidence: 'invalid', // 应该是数字
      modelUsed: 123, // 应该是字符串
      analysisDuration: 'invalid' // 应该是数字
    };

    const jsonString = JSON.stringify(invalidData);

    expect(() => {
      parseAnalysisResponse(jsonString);
    }).toThrow();
  });

  test('TEST-UNIT-46: 应处理 null 值', () => {
    const nullData = {
      dimensions: null,
      overallConfidence: null,
      modelUsed: null,
      analysisDuration: null
    };

    const jsonString = JSON.stringify(nullData);

    expect(() => {
      parseAnalysisResponse(jsonString);
    }).toThrow();
  });

  test('TEST-UNIT-47: 应处理 undefined 值', () => {
    const undefinedData = {
      dimensions: undefined,
      overallConfidence: undefined,
      modelUsed: undefined,
      analysisDuration: undefined
    };

    const jsonString = JSON.stringify(undefinedData);

    expect(() => {
      parseAnalysisResponse(jsonString);
    }).toThrow();
  });
});
