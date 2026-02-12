/**
 * 分析专业术语常量
 * 用于在分析过程中显示专业术语，增强用户信任感
 */

import type { AnalysisStage } from '@/lib/utils/time-estimation';

export interface AnalysisTerm {
  text: string;
  stage: AnalysisStage;
  category?: 'light' | 'composition' | 'color' | 'style' | 'general';
}

/**
 * 分析阶段的专业术语列表
 */
export const ANALYSIS_TERMS: AnalysisTerm[] = [
  // 光影术语
  {
    text: '正在识别光影技巧...',
    stage: 'analyzing',
    category: 'light',
  },
  {
    text: '检测主光源方向...',
    stage: 'analyzing',
    category: 'light',
  },
  {
    text: '分析阴影细节...',
    stage: 'analyzing',
    category: 'light',
  },
  {
    text: '识别高光与暗部对比...',
    stage: 'analyzing',
    category: 'light',
  },

  // 构图术语
  {
    text: '正在检测构图方法...',
    stage: 'analyzing',
    category: 'composition',
  },
  {
    text: '识别视觉平衡点...',
    stage: 'analyzing',
    category: 'composition',
  },
  {
    text: '分析画面视角...',
    stage: 'analyzing',
    category: 'composition',
  },
  {
    text: '检测三分法构图...',
    stage: 'analyzing',
    category: 'composition',
  },
  {
    text: '识别黄金分割点...',
    stage: 'analyzing',
    category: 'composition',
  },

  // 色彩术语
  {
    text: '正在分析色彩搭配...',
    stage: 'analyzing',
    category: 'color',
  },
  {
    text: '提取主色调...',
    stage: 'analyzing',
    category: 'color',
  },
  {
    text: '识别色彩对比度...',
    stage: 'analyzing',
    category: 'color',
  },
  {
    text: '分析色温与氛围...',
    stage: 'analyzing',
    category: 'color',
  },

  // 艺术风格术语
  {
    text: '正在识别艺术风格...',
    stage: 'analyzing',
    category: 'style',
  },
  {
    text: '分析风格流派...',
    stage: 'analyzing',
    category: 'style',
  },
  {
    text: '匹配艺术时期...',
    stage: 'analyzing',
    category: 'style',
  },
  {
    text: '识别绘画技法...',
    stage: 'analyzing',
    category: 'style',
  },

  // 通用阶段
  {
    text: '正在上传图片...',
    stage: 'uploading',
    category: 'general',
  },

  // 生成模版
  {
    text: '正在生成提示词模版...',
    stage: 'generating',
    category: 'general',
  },
  {
    text: '优化模版结构...',
    stage: 'generating',
    category: 'general',
  },
  {
    text: '整理分析结果...',
    stage: 'generating',
    category: 'general',
  },
];

/**
 * 根据当前阶段获取可用的术语列表
 */
export const getTermsByStage = (stage: AnalysisStage): AnalysisTerm[] => {
  return ANALYSIS_TERMS.filter((term) => term.stage === stage);
};

/**
 * 随机获取一个术语
 */
export const getRandomTerm = (stage: AnalysisStage): string => {
  const terms = getTermsByStage(stage);
  if (terms.length === 0) {
    return '正在分析...';
  }
  const randomIndex = Math.floor(Math.random() * terms.length);
  return terms[randomIndex].text;
};

/**
 * 按顺序获取术语（用于循环显示）
 */
export const getTermSequence = (stage: AnalysisStage): string[] => {
  return getTermsByStage(stage).map((term) => term.text);
};
