import { describe, expect, it } from 'vitest';
import {
  buildTemplateSnapshotFromAnalysis,
  normalizeTemplateSnapshot,
} from '@/lib/analysis/template-snapshot';

describe('template-snapshot', () => {
  it('buildTemplateSnapshotFromAnalysis should generate non-empty template from dimensions', () => {
    const snapshot = buildTemplateSnapshotFromAnalysis({
      dimensions: {
        lighting: { features: [{ value: '逆光' }] },
        composition: { features: [{ value: '中心构图' }] },
        color: { features: [{ value: '暖色调' }] },
        artisticStyle: { features: [{ value: '电影感' }] },
      },
    });

    expect(snapshot.variableFormat).toContain('风格方向：电影感。');
    expect(snapshot.variableFormat).toContain('光影表现：逆光。');
    expect(snapshot.variableFormat).toContain('构图建议：中心构图。');
    expect(snapshot.variableFormat).toContain('色彩策略：暖色调。');
    expect(snapshot.jsonFormat.style).toBe('电影感');
  });

  it('normalizeTemplateSnapshot should backfill variableFormat from jsonFormat when missing', () => {
    const snapshot = normalizeTemplateSnapshot({
      variableFormat: '',
      jsonFormat: {
        subject: '[人物]',
        style: '极简',
        composition: '留白构图',
        colors: '低饱和',
        lighting: '柔光',
        additional: '[无文字]',
      },
    });

    expect(snapshot.variableFormat).toContain('请创作一张[人物]图片。');
    expect(snapshot.variableFormat).toContain('风格方向：极简。');
    expect(snapshot.variableFormat).toContain('附加要求：[无文字]。');
  });
});
