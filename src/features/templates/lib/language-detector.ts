/**
 * Language Detection
 *
 * Epic 5 - Story 5.4: Prompt Optimization
 * Detect language from template content (Chinese or English)
 */

import type { TemplateJSONFormat } from '../types/template';

/**
 * Detect language from template content
 *
 * @param template - Template to detect language from
 * @returns 'zh' for Chinese, 'en' for English
 */
export function detectLanguage(template: TemplateJSONFormat): 'zh' | 'en' {
  // Combine all field values
  const text = Object.values(template).join(' ');

  // Count Chinese and English characters
  const chineseChars = text.match(/[\u4e00-\u9fa5]/g);
  const englishChars = text.match(/[a-zA-Z]/g);

  const chineseCount = chineseChars?.length || 0;
  const englishCount = englishChars?.length || 0;

  // If Chinese characters are more prevalent, return 'zh'
  if (chineseCount > englishCount) {
    return 'zh';
  }

  // Default to English
  return 'en';
}

/**
 * Detect language from text string
 *
 * @param text - Text to detect language from
 * @returns 'zh' for Chinese, 'en' for English
 */
export function detectLanguageFromText(text: string): 'zh' | 'en' {
  // Count Chinese and English characters
  const chineseChars = text.match(/[\u4e00-\u9fa5]/g);
  const englishChars = text.match(/[a-zA-Z]/g);

  const chineseCount = chineseChars?.length || 0;
  const englishCount = englishChars?.length || 0;

  // If Chinese characters are more prevalent, return 'zh'
  if (chineseCount > englishCount) {
    return 'zh';
  }

  // Default to English
  return 'en';
}
