/**
 * Template Exporter
 *
 * Epic 5 - Story 5.2: JSON Export
 * Utilities for exporting templates to JSON format
 */

import type {
  Template,
  TemplateExport,
  TemplateExportData,
  TemplateExportMetadata,
  TemplateExportUsage,
  ExportOptions,
  ExportResult,
  ContentSafetyCheckResult,
} from '../types';

/**
 * Generate export filename with timestamp
 *
 * Format: template-{YYYY-MM-DD}-{HHMMSS}.json
 * Example: template-2026-02-20-164512.json
 *
 * Uses ISO format for reliable cross-browser timestamp generation
 */
export function generateExportFilename(): string {
  const now = new Date();
  const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const time = now.toTimeString().split(' ')[0].replace(/:/g, ''); // HHMMSS
  return `template-${date}-${time}.json`;
}

/**
 * Create export metadata from template
 */
export function createExportMetadata(template: Template): TemplateExportMetadata {
  const now = new Date().toISOString();
  return {
    version: '1.0.0',
    templateId: template.id,
    analysisResultId: template.analysisResultId,
    createdAt: template.createdAt.toISOString(),
    exportedAt: now,
    platform: 'image_analyzer',
  };
}

/**
 * Create export data from template
 */
export function createExportData(template: Template): TemplateExportData {
  return {
    variableFormat: template.variableFormat,
    jsonFormat: template.jsonFormat,
  };
}

/**
 * Create export usage information
 */
export function createExportUsage(): TemplateExportUsage {
  return {
    description: 'AI 图像生成提示词模版，可用于 Stable Diffusion、Midjourney、DALL-E 等工具',
    examples: [
      'Stable Diffusion: 直接复制 variableFormat 到提示词框',
      'ComfyUI: 使用 jsonFormat 字段构建工作流',
      'API 调用: POST /generate with jsonFormat body',
    ],
    notes: [
      '替换 [变量名] 为你想要的描述',
      '保留原有的风格关键词',
      '可以根据需要调整 additional 字段',
    ],
  };
}

/**
 * Create complete export object
 */
export function createExportObject(template: Template, options: ExportOptions = {}): TemplateExport {
  const metadata = createExportMetadata(template);
  const data = createExportData(template);
  const usage = options.includeUsage !== false ? createExportUsage() : undefined;

  return {
    metadata,
    template: data,
    ...(usage && { usage }),
  } as TemplateExport;
}

/**
 * Validate template for export
 * Checks for required fields and data integrity
 */
export function validateTemplateForExport(template: Template): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required fields
  if (!template.id) {
    errors.push('Template ID is missing');
  }

  if (!template.variableFormat) {
    errors.push('Variable format is empty');
  }

  if (!template.jsonFormat) {
    errors.push('JSON format is missing');
  } else {
    // Check JSON format fields
    const requiredFields = ['subject', 'style', 'composition', 'colors', 'lighting', 'additional'];
    for (const field of requiredFields) {
      if (!template.jsonFormat[field as keyof typeof template.jsonFormat]) {
        errors.push(`JSON format field '${field}' is empty`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Serialize template to JSON string
 * Uses UTF-8 encoding with proper formatting
 */
export function serializeTemplate(exportObject: TemplateExport, format = true): string {
  if (format) {
    return JSON.stringify(exportObject, null, 2);
  }
  return JSON.stringify(exportObject);
}

/**
 * Get blob size in bytes
 */
export function getBlobSize(blob: Blob): number {
  return blob.size;
}

/**
 * Check if browser supports Blob API
 */
export function isBlobSupported(): boolean {
  return typeof Blob !== 'undefined' && typeof URL !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Get browser information for compatibility checks
 */
export function getBrowserInfo(): { name: string; isMobile: boolean; supportsBlob: boolean } {
  const userAgent = navigator.userAgent.toLowerCase();

  // Detect mobile devices
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);

  // Detect browser type
  let name = 'unknown';
  if (userAgent.includes('chrome')) {
    name = 'chrome';
  } else if (userAgent.includes('firefox')) {
    name = 'firefox';
  } else if (userAgent.includes('safari')) {
    name = 'safari';
  } else if (userAgent.includes('edge')) {
    name = 'edge';
  }

  return {
    name,
    isMobile,
    supportsBlob: isBlobSupported(),
  };
}

/**
 * Get user-friendly error message based on error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Browser-specific errors
    if (error.name === 'NetworkError') {
      return '网络错误：请检查网络连接后重试';
    }
    if (error.name === 'SecurityError') {
      return '安全错误：浏览器阻止了下载操作';
    }
    if (error.message.includes('Blob')) {
      return '浏览器不支持文件下载功能';
    }
    return error.message;
  }

  return '未知错误：导出失败，请重试';
}

/**
 * Create download link and trigger download
 *
 * Features:
 * - Checks browser compatibility before download
 * - Provides mobile-specific handling
 * - Uses increased delay (1000ms) to ensure download completes before cleanup
 * - Most browsers initiate download within 100-500ms
 * - 1000ms provides safe margin for slower connections
 */
export function triggerDownload(blob: Blob, filename: string): void {
  const browserInfo = getBrowserInfo();

  if (!browserInfo.supportsBlob) {
    throw new Error('浏览器不支持文件下载功能，请使用现代浏览器（Chrome、Firefox、Safari、Edge）');
  }

  // Mobile-specific handling
  if (browserInfo.isMobile) {
    console.warn('移动设备检测：某些移动浏览器可能不支持自动下载');
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();

  // Cleanup with increased delay for better reliability
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 1000); // Increased from 100ms to 1000ms
}

/**
 * Export template to JSON file
 *
 * @param template - Template to export
 * @param options - Export options
 * @returns Export result with success status and metadata
 */
export async function exportTemplate(
  template: Template,
  options: ExportOptions = {}
): Promise<ExportResult> {
  try {
    // Check browser compatibility
    const browserInfo = getBrowserInfo();
    if (!browserInfo.supportsBlob) {
      return {
        success: false,
        filename: '',
        size: 0,
        error: '浏览器不支持文件下载，请使用现代浏览器（Chrome、Firefox、Safari、Edge）',
      };
    }

    // Validate template
    const validation = validateTemplateForExport(template);
    if (!validation.valid) {
      return {
        success: false,
        filename: '',
        size: 0,
        error: `模板验证失败：${validation.errors.join(', ')}`,
      };
    }

    // Create export object
    const exportObject = createExportObject(template, options);

    // Serialize to JSON
    const jsonString = serializeTemplate(exportObject, options.format !== false);

    // Create blob with UTF-8 encoding
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });

    // Generate filename
    const filename = options.filename || generateExportFilename();

    // Trigger download
    triggerDownload(blob, filename);

    // Get file size
    const size = getBlobSize(blob);

    return {
      success: true,
      filename,
      size,
    };
  } catch (error) {
    return {
      success: false,
      filename: '',
      size: 0,
      error: getErrorMessage(error),
    };
  }
}

/**
 * Check content safety before export
 *
 * IMPORTANT: This is a placeholder implementation that should integrate with
 * Story 4.1 (Content Moderation) content safety logic.
 *
 * Current Implementation:
 * - Returns safe for all content (placeholder)
 * - Does not perform actual content moderation
 *
 * Future Implementation (Story 4.1 Integration):
 * - Integrate with actual content moderation service
 * - Check for inappropriate content patterns
 * - Return detailed safety reports
 * - Support configurable safety thresholds
 *
 * @param template - Template to check
 * @returns Content safety check result
 */
export async function checkContentSafety(template: Template): Promise<ContentSafetyCheckResult> {
  // TODO: Integrate with Story 4.1 content moderation logic
  //
  // Integration points:
  // 1. Import content moderation utilities from Story 4.1
  // 2. Check template.variableFormat and template.jsonFormat for unsafe content
  // 3. Return detailed safety results with specific unsafe content types
  // 4. Support configurable safety levels (strict, moderate, permissive)
  //
  // Example integration:
  // import { checkContentModeration } from '@/features/moderation';
  // const moderationResult = await checkContentModeration({
  //   text: `${template.variableFormat} ${JSON.stringify(template.jsonFormat)}`,
  //   categories: ['violence', 'adult', 'hate', 'self-harm'],
  // });
  // return {
  //   isSafe: !moderationResult.flagged,
  //   unsafeContent: moderationResult.categories,
  //   warning: moderationResult.flagged ? 'Template contains unsafe content' : undefined,
  // };

  // Placeholder: Always return safe
  // This will be replaced with actual Story 4.1 integration
  return {
    isSafe: true,
    unsafeContent: undefined,
    warning: undefined,
  };
}
