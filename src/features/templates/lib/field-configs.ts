/**
 * Field Configurations
 *
 * Epic 5 - Story 5.3: Template Editor
 * Configuration for all template fields with validation and suggestions
 */

import type { FieldConfig } from '../types/editor';

/**
 * Field configurations for all template fields
 */
export const FIELD_CONFIGS: Record<string, FieldConfig> = {
  subject: {
    key: 'subject',
    label: '主体描述',
    placeholder: '例如：一位美丽的女性',
    required: true,
    maxLength: 200,
    suggestions: [
      '一位美丽的女性',
      '一个可爱的猫咪',
      '一座雄伟的山脉',
      '一辆复古汽车',
      '一个繁忙的城市街道',
      '一片宁静的海滩',
    ],
    validation: (value: string) => {
      if (!value.trim()) return '主体描述不能为空';
      if (value.length > 200) return '主体描述不能超过 200 个字符';
      return null;
    },
  },
  style: {
    key: 'style',
    label: '风格描述',
    placeholder: '例如：肖像摄影风格',
    required: true,
    maxLength: 150,
    suggestions: [
      '肖像摄影风格',
      '印象派绘画风格',
      '赛博朋克风格',
      '极简主义风格',
      '水彩画风格',
      '超现实主义风格',
    ],
    validation: (value: string) => {
      if (!value.trim()) return '风格描述不能为空';
      if (value.length > 150) return '风格描述不能超过 150 个字符';
      return null;
    },
  },
  composition: {
    key: 'composition',
    label: '构图信息',
    placeholder: '例如：特写，居中构图',
    required: false,
    maxLength: 150,
    suggestions: [
      '特写，居中构图',
      '全景，三分法构图',
      '俯视角度',
      '对称构图',
      '黄金比例构图',
      '动态视角',
    ],
  },
  colors: {
    key: 'colors',
    label: '色彩方案',
    placeholder: '例如：暖色调，柔和的棕色和金色',
    required: false,
    maxLength: 150,
    suggestions: [
      '暖色调，柔和的棕色和金色',
      '冷色调，蓝色和灰色',
      '鲜艳的色彩，高饱和度',
      '黑白单色',
      '柔和的粉色和紫色',
      '自然的绿色和大地色调',
    ],
  },
  lighting: {
    key: 'lighting',
    label: '光线设置',
    placeholder: '例如：柔和的自然光，黄金时刻',
    required: false,
    maxLength: 150,
    suggestions: [
      '柔和的自然光，黄金时刻',
      '强烈的侧光，戏剧效果',
      '漫射光，柔光箱',
      '霓虹灯光，赛博朋克',
      '逆光，轮廓效果',
      '阴影和高光对比',
    ],
  },
  additional: {
    key: 'additional',
    label: '其他细节',
    placeholder: '例如：优雅的姿势，平静的表情',
    required: false,
    maxLength: 300,
    suggestions: [
      '优雅的姿势，平静的表情',
      '充满活力的动作，动态感',
      '梦幻的氛围，柔和的细节',
      '科技感元素，未来主义',
      '复古质感，怀旧氛围',
      '精致的纹理和细节',
    ],
  },
};

/**
 * Get field config by key
 */
export function getFieldConfig(key: string): FieldConfig | undefined {
  return FIELD_CONFIGS[key];
}

/**
 * Get all field keys in order
 */
export function getFieldKeys(): string[] {
  return Object.keys(FIELD_CONFIGS);
}
