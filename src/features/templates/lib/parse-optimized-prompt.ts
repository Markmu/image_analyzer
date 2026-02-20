/**
 * Parse Optimized Prompt to Template
 *
 * Epic 5 - Story 5.4: Prompt Optimization
 * Parse optimized prompt back into TemplateJSONFormat fields
 */

import type { TemplateJSONFormat } from '../types/template';

/**
 * Field label patterns for parsing
 *
 * These patterns help identify which field a piece of text belongs to
 */
const FIELD_PATTERNS = {
  subject: {
    zh: ['主体', '对象', '人物', '内容', '画面主体'],
    en: ['subject', 'object', 'main subject', 'content', 'focus'],
  },
  style: {
    zh: ['风格', '画风', '艺术风格', '表现风格'],
    en: ['style', 'art style', 'artistic style'],
  },
  composition: {
    zh: ['构图', '布局', '画面构图'],
    en: ['composition', 'layout', 'framing'],
  },
  colors: {
    zh: ['色彩', '颜色', '色调', '配色'],
    en: ['color', 'colors', 'colour', '色调', 'palette'],
  },
  lighting: {
    zh: ['光线', '光照', '照明', '光线效果'],
    en: ['lighting', 'light', 'illumination'],
  },
  additional: {
    zh: ['其他', '额外', '补充', '备注'],
    en: ['additional', 'other', 'extra', 'notes'],
  },
} as const;

/**
 * Parse optimized prompt into template fields
 *
 * This function attempts to parse an optimized prompt back into
 * structured template fields. It handles both Chinese and English,
 * and falls back to intelligent distribution if parsing fails.
 *
 * @param optimizedPrompt - The optimized prompt string
 * @param language - The language of the prompt ('zh' or 'en')
 * @param originalTemplate - The original template for reference
 * @returns Parsed template fields
 */
export function parseOptimizedPromptToTemplate(
  optimizedPrompt: string,
  language: 'zh' | 'en',
  originalTemplate?: TemplateJSONFormat
): TemplateJSONFormat {
  // Try to parse field-by-field
  const parsed = parseFieldByField(optimizedPrompt, language);

  // If parsing succeeded, return parsed result
  if (hasContent(parsed)) {
    return parsed;
  }

  // Fallback: distribute content intelligently
  return distributeContentIntelligently(optimizedPrompt, language, originalTemplate);
}

/**
 * Parse prompt field by field using label detection
 */
function parseFieldByField(prompt: string, language: 'zh' | 'en'): TemplateJSONFormat {
  const lines = prompt.split('\n').filter((line) => line.trim());

  const result: TemplateJSONFormat = {
    subject: '',
    style: '',
    composition: '',
    colors: '',
    lighting: '',
    additional: '',
  };

  let currentField: keyof TemplateJSONFormat | null = null;
  let currentContent: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    const detectedField = detectFieldFromLine(trimmedLine, language);

    if (detectedField) {
      // Save previous field content
      if (currentField && currentContent.length > 0) {
        result[currentField] = currentContent.join(', ');
      }

      // Start new field
      currentField = detectedField;
      currentContent = [];
    } else if (currentField && trimmedLine) {
      // Add content to current field
      currentContent.push(trimmedLine);
    }
  }

  // Don't forget the last field
  if (currentField && currentContent.length > 0) {
    result[currentField] = currentContent.join(', ');
  }

  return result;
}

/**
 * Detect which field a line belongs to based on labels
 */
function detectFieldFromLine(line: string, language: 'zh' | 'en'): keyof TemplateJSONFormat | null {
  const lowerLine = line.toLowerCase();

  for (const [field, patterns] of Object.entries(FIELD_PATTERNS)) {
    const labels = patterns[language];
    for (const label of labels) {
      // Check for patterns like "主体:", "Subject:", etc.
      if (lowerLine.startsWith(label.toLowerCase()) || lowerLine.includes(`${label.toLowerCase()}:`) || lowerLine.includes(`${label.toLowerCase()}：`)) {
        return field as keyof TemplateJSONFormat;
      }
    }
  }

  return null;
}

/**
 * Check if parsed template has any content
 */
function hasContent(template: TemplateJSONFormat): boolean {
  return Object.values(template).some((value) => value && value.trim().length > 0);
}

/**
 * Distribute content intelligently when field parsing fails
 *
 * This function uses keyword heuristics to distribute content
 * across appropriate fields.
 */
function distributeContentIntelligently(
  prompt: string,
  language: 'zh' | 'en',
  originalTemplate?: TemplateJSONFormat
): TemplateJSONFormat {
  const result: TemplateJSONFormat = {
    subject: '',
    style: '',
    composition: '',
    colors: '',
    lighting: '',
    additional: '',
  };

  // If we have an original template, try to preserve structure
  if (originalTemplate) {
    return mapToOriginalStructure(prompt, originalTemplate);
  }

  // Otherwise, use keyword heuristics
  const lines = prompt.split('\n').filter((line) => line.trim());

  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    let assigned = false;

    // Check for style keywords
    if (containsStyleKeywords(lowerLine, language)) {
      result.style = result.style ? `${result.style}, ${line}` : line;
      assigned = true;
    }

    // Check for composition keywords
    if (containsCompositionKeywords(lowerLine, language)) {
      result.composition = result.composition ? `${result.composition}, ${line}` : line;
      assigned = true;
    }

    // Check for color keywords
    if (containsColorKeywords(lowerLine, language)) {
      result.colors = result.colors ? `${result.colors}, ${line}` : line;
      assigned = true;
    }

    // Check for lighting keywords
    if (containsLightingKeywords(lowerLine, language)) {
      result.lighting = result.lighting ? `${result.lighting}, ${line}` : line;
      assigned = true;
    }

    // If no specific field matched, put in subject or additional
    if (!assigned) {
      if (!result.subject) {
        result.subject = line;
      } else {
        result.additional = result.additional ? `${result.additional}, ${line}` : line;
      }
    }
  }

  return result;
}

/**
 * Map optimized prompt to original template structure
 */
function mapToOriginalStructure(prompt: string, originalTemplate: TemplateJSONFormat): TemplateJSONFormat {
  const result: TemplateJSONFormat = {
    subject: originalTemplate.subject,
    style: originalTemplate.style,
    composition: originalTemplate.composition,
    colors: originalTemplate.colors,
    lighting: originalTemplate.lighting,
    additional: originalTemplate.additional,
  };

  // For now, just replace the entire prompt in the subject field
  // A more sophisticated approach would use NLP to map content
  result.subject = prompt;

  return result;
}

/**
 * Check if text contains style keywords
 */
function containsStyleKeywords(text: string, language: 'zh' | 'en'): boolean {
  const styleKeywords = {
    zh: ['风格', '画风', '写实', '油画', '水彩', '素描', '卡通', '动漫', '插画', '肖像', '风景', '静物'],
    en: [
      'style',
      'art',
      'realistic',
      'oil painting',
      'watercolor',
      'sketch',
      'cartoon',
      'anime',
      'illustration',
      'portrait',
      'landscape',
      'still life',
    ],
  };

  const keywords = styleKeywords[language];
  return keywords.some((keyword) => text.includes(keyword));
}

/**
 * Check if text contains composition keywords
 */
function containsCompositionKeywords(text: string, language: 'zh' | 'en'): boolean {
  const compositionKeywords = {
    zh: ['构图', '居中', '三分法', '对称', '前景', '背景', '视角', '俯视', '仰视'],
    en: [
      'composition',
      'center',
      'rule of thirds',
      'symmetric',
      'foreground',
      'background',
      'angle',
      'overhead',
      'low angle',
    ],
  };

  const keywords = compositionKeywords[language];
  return keywords.some((keyword) => text.includes(keyword));
}

/**
 * Check if text contains color keywords
 */
function containsColorKeywords(text: string, language: 'zh' | 'en'): boolean {
  const colorKeywords = {
    zh: ['色彩', '颜色', '色调', '红', '蓝', '绿', '黄', '黑', '白', '暖色', '冷色', '鲜艳', '柔和'],
    en: [
      'color',
      'colou',
      'tone',
      'red',
      'blue',
      'green',
      'yellow',
      'black',
      'white',
      'warm',
      'cool',
      'vibrant',
      'muted',
    ],
  };

  const keywords = colorKeywords[language];
  return keywords.some((keyword) => text.includes(keyword));
}

/**
 * Check if text contains lighting keywords
 */
function containsLightingKeywords(text: string, language: 'zh' | 'en'): boolean {
  const lightingKeywords = {
    zh: ['光线', '光照', '照明', '自然光', '人造光', '侧光', '逆光', '柔光', '强光', '阴影'],
    en: [
      'lighting',
      'light',
      'illumination',
      'natural light',
      'artificial light',
      'side light',
      'backlight',
      'soft light',
      'harsh light',
      'shadow',
    ],
  };

  const keywords = lightingKeywords[language];
  return keywords.some((keyword) => text.includes(keyword));
}

/**
 * Merge optimized prompt with existing template
 *
 * This function provides options for how to merge the optimized prompt
 * with the original template fields.
 */
export function mergeOptimizedPrompt(
  originalTemplate: TemplateJSONFormat,
  optimizedPrompt: string,
  language: 'zh' | 'en',
  mode: 'replace' | 'merge' | 'append' = 'replace'
): TemplateJSONFormat {
  const parsed = parseOptimizedPromptToTemplate(optimizedPrompt, language, originalTemplate);

  if (mode === 'replace') {
    return parsed;
  }

  if (mode === 'merge') {
    return {
      subject: parsed.subject || originalTemplate.subject,
      style: parsed.style || originalTemplate.style,
      composition: parsed.composition || originalTemplate.composition,
      colors: parsed.colors || originalTemplate.colors,
      lighting: parsed.lighting || originalTemplate.lighting,
      additional: parsed.additional || originalTemplate.additional,
    };
  }

  if (mode === 'append') {
    return {
      subject: appendField(originalTemplate.subject, parsed.subject),
      style: appendField(originalTemplate.style, parsed.style),
      composition: appendField(originalTemplate.composition, parsed.composition),
      colors: appendField(originalTemplate.colors, parsed.colors),
      lighting: appendField(originalTemplate.lighting, parsed.lighting),
      additional: appendField(originalTemplate.additional, parsed.additional),
    };
  }

  return parsed;
}

/**
 * Append field content with proper separator
 */
function appendField(original: string, addition: string): string {
  if (!original) return addition;
  if (!addition) return original;
  return `${original}, ${addition}`;
}
