/**
 * Prompt Builder
 *
 * Epic 6 - Story 6.1: Image Generation
 * Build generation prompts from template data
 */

import type { Template } from '@/features/templates/types/template';

/**
 * Build image generation prompt from template
 * Combines all template fields into a single prompt
 */
export function buildGenerationPrompt(template: Template): string {
  const parts = [
    template.jsonFormat.subject,
    template.jsonFormat.style,
    template.jsonFormat.composition,
    template.jsonFormat.colors,
    template.jsonFormat.lighting,
    template.jsonFormat.additional,
  ].filter(Boolean); // Remove empty strings

  return parts.join(', ');
}

/**
 * Build enhanced prompt with style emphasis
 * Adds emphasis to style and artistic elements
 */
export function buildEnhancedPrompt(template: Template, options?: {
  emphasizeStyle?: boolean;
  emphasizeLighting?: boolean;
}): string {
  const prompt = buildGenerationPrompt(template);
  const { emphasizeStyle = true, emphasizeLighting = true } = options || {};

  let enhanced = prompt;

  if (emphasizeStyle && template.jsonFormat.style) {
    enhanced = `${template.jsonFormat.style}, ${enhanced}`;
  }

  if (emphasizeLighting && template.jsonFormat.lighting) {
    enhanced = `${enhanced}, with ${template.jsonFormat.lighting}`;
  }

  return enhanced;
}

/**
 * Validate prompt length
 * Ensures prompt doesn't exceed model token limits
 */
export function validatePromptLength(prompt: string, maxTokens: number = 1000): boolean {
  // Rough estimation: 1 token ≈ 4 characters
  const estimatedTokens = prompt.length / 4;
  return estimatedTokens <= maxTokens;
}

/**
 * Truncate prompt if too long
 * Preserves important keywords at the beginning
 */
export function truncatePrompt(prompt: string, maxTokens: number = 1000): string {
  const maxChars = maxTokens * 4;

  if (prompt.length <= maxChars) {
    return prompt;
  }

  // Truncate and add ellipsis
  return prompt.slice(0, maxChars - 3).trim() + '...';
}
