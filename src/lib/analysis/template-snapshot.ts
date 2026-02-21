import type { TemplateSnapshot } from '@/features/history/types';

export const EMPTY_TEMPLATE_SNAPSHOT: TemplateSnapshot = {
  variableFormat: '',
  jsonFormat: {
    subject: '',
    style: '',
    composition: '',
    colors: '',
    lighting: '',
    additional: '',
  },
};

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function collectFeatureValues(value: unknown): string {
  if (!value || typeof value !== 'object') return '';

  const maybeDimension = value as { features?: Array<{ value?: unknown }> };
  if (!Array.isArray(maybeDimension.features)) return '';

  return maybeDimension.features
    .map((feature) => (typeof feature?.value === 'string' ? feature.value : ''))
    .filter(Boolean)
    .join('、');
}

function buildVariableFormatFromJson(jsonFormat: TemplateSnapshot['jsonFormat']): string {
  const style = jsonFormat.style || '写实';
  const lighting = jsonFormat.lighting || '自然光';
  const composition = jsonFormat.composition || '平衡构图';
  const colors = jsonFormat.colors || '中性色彩';
  const subject = jsonFormat.subject || '[主题]';
  const additional = jsonFormat.additional || '[附加要求]';

  return [
    `请创作一张${subject}图片。`,
    `风格方向：${style}。`,
    `光影表现：${lighting}。`,
    `构图建议：${composition}。`,
    `色彩策略：${colors}。`,
    `附加要求：${additional}。`,
  ].join('\n');
}

export function normalizeTemplateSnapshot(value: unknown): TemplateSnapshot {
  if (!value || typeof value !== 'object') {
    return EMPTY_TEMPLATE_SNAPSHOT;
  }

  const snapshot = value as {
    variableFormat?: unknown;
    jsonFormat?: Record<string, unknown>;
  };
  const jsonFormat = snapshot.jsonFormat ?? {};

  const normalizedJson = {
    subject: asString(jsonFormat.subject),
    style: asString(jsonFormat.style),
    composition: asString(jsonFormat.composition),
    colors: asString(jsonFormat.colors),
    lighting: asString(jsonFormat.lighting),
    additional: asString(jsonFormat.additional),
  };

  const variableFormat = asString(snapshot.variableFormat).trim();
  return {
    variableFormat: variableFormat || buildVariableFormatFromJson(normalizedJson),
    jsonFormat: normalizedJson,
  };
}

export function buildTemplateSnapshotFromAnalysis(analysisData: unknown): TemplateSnapshot {
  if (!analysisData || typeof analysisData !== 'object') {
    return normalizeTemplateSnapshot(null);
  }

  const data = analysisData as {
    template?: unknown;
    dimensions?: Record<string, unknown>;
  };

  if (data.template && typeof data.template === 'object') {
    return normalizeTemplateSnapshot(data.template);
  }

  const dimensions = data.dimensions ?? {};
  const style = collectFeatureValues(dimensions.artisticStyle) || '写实';
  const lighting = collectFeatureValues(dimensions.lighting) || '自然光';
  const composition = collectFeatureValues(dimensions.composition) || '平衡构图';
  const colors = collectFeatureValues(dimensions.color) || '中性色彩';

  return normalizeTemplateSnapshot({
    variableFormat: [
      '请创作一张[主题]图片。',
      `风格方向：${style}。`,
      `光影表现：${lighting}。`,
      `构图建议：${composition}。`,
      `色彩策略：${colors}。`,
      '附加要求：[附加要求]。',
    ].join('\n'),
    jsonFormat: {
      subject: '[主题]',
      style,
      composition,
      colors,
      lighting,
      additional: '[附加要求]',
    },
  });
}
