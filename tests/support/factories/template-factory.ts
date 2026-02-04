/**
 * Template Factory for Test Data Generation
 *
 * Creates realistic template test data for the image analyzer app.
 * Templates represent saved image analysis configurations.
 */

import { faker } from '@faker-js/faker';

// ============================================
// TYPE DEFINITIONS
// ============================================

export type TemplateVisibility = 'private' | 'public' | 'shared';

export type TemplateStatus = 'draft' | 'active' | 'archived';

export interface TemplateStyle {
  name: string;
  prompt: string;
  negativePrompt?: string;
  parameters?: Record<string, unknown>;
}

export interface Template {
  id: string;
  userId: string;
  name: string;
  description?: string;
  visibility: TemplateVisibility;
  status: TemplateStatus;
  styles: TemplateStyle[];
  thumbnailUrl?: string;
  usageCount: number;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTemplateInput extends Partial<Omit<Template, 'id' | 'createdAt' | 'updatedAt'>> {
  // Override any field except id, createdAt, updatedAt
}

// ============================================
// STYLE PRESETS (Realistic AI image styles)
// ============================================

const AI_STYLES: TemplateStyle[] = [
  {
    name: 'Photorealistic',
    prompt: 'photorealistic, highly detailed, 8k resolution, professional photography',
    negativePrompt: 'cartoon, anime, illustration, drawing, painting',
  },
  {
    name: 'Oil Painting',
    prompt: 'oil painting style, brushstrokes visible, artistic, classic masterpiece',
    negativePrompt: 'digital, photo, 3d render',
  },
  {
    name: 'Cyberpunk',
    prompt: 'cyberpunk city, neon lights, futuristic, sci-fi, dystopian',
    negativePrompt: 'natural, countryside, peaceful',
  },
  {
    name: 'Watercolor',
    prompt: 'watercolor painting, soft colors, delicate brushwork, artistic',
    negativePrompt: 'digital art, sharp edges, photo',
  },
  {
    name: 'Anime',
    prompt: 'anime style, manga illustration, vibrant colors, Japanese animation',
    negativePrompt: 'photorealistic, realistic, western cartoon',
  },
];

// ============================================
// FACTORY FUNCTION
// ============================================

/**
 * Create a test template with realistic data
 *
 * @param overrides - Partial template data to override defaults
 * @returns Complete Template object with unique, collision-free data
 *
 * @example
 * // Default template
 * const template = createTemplate();
 *
 * // Public template
 * const template = createTemplate({ visibility: 'public' });
 *
 * // Template with custom styles
 * const template = createTemplate({ styles: [customStyle] });
 */
export function createTemplate(overrides: CreateTemplateInput = {}): Template {
  const now = new Date();
  const randomStyle = faker.helpers.arrayElement(AI_STYLES);

  const template: Template = {
    id: faker.string.uuid(),
    userId: 'test-user-id', // Will be set by fixture
    name: faker.commerce.productName() + ' Style',
    description: faker.lorem.sentence(),
    visibility: 'private',
    status: 'active',
    styles: [randomStyle],
    thumbnailUrl: faker.image.urlPicsumPhotos({ width: 400, height: 300 }),
    usageCount: faker.number.int({ min: 0, max: 1000 }),
    isFavorite: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };

  return template;
}

// ============================================
// SPECIALIZED FACTORIES
// ============================================

/**
 * Create a public template (discoverable by other users)
 */
export function createPublicTemplate(overrides: CreateTemplateInput = {}): Template {
  return createTemplate({
    visibility: 'public',
    status: 'active',
    isFavorite: faker.datatype.boolean(),
    ...overrides,
  });
}

/**
 * Create a shared template (shared with specific users)
 */
export function createSharedTemplate(overrides: CreateTemplateInput = {}): Template {
  return createTemplate({
    visibility: 'shared',
    status: 'active',
    ...overrides,
  });
}

/**
 * Create a draft template (not yet active)
 */
export function createDraftTemplate(overrides: CreateTemplateInput = {}): Template {
  return createTemplate({
    status: 'draft',
    visibility: 'private',
    ...overrides,
  });
}

/**
 * Create an archived template
 */
export function createArchivedTemplate(overrides: CreateTemplateInput = {}): Template {
  return createTemplate({
    status: 'archived',
    ...overrides,
  });
}

/**
 * Create a template with multiple styles
 */
export function createMultiStyleTemplate(styleCount: number = 3, overrides: CreateTemplateInput = {}): Template {
  const styles = faker.helpers.arrayElements(AI_STYLES, { min: 2, max: styleCount });

  return createTemplate({
    styles,
    ...overrides,
  });
}

/**
 * Create a popular template (high usage count)
 */
export function createPopularTemplate(overrides: CreateTemplateInput = {}): Template {
  return createTemplate({
    usageCount: faker.number.int({ min: 1000, max: 10000 }),
    isFavorite: true,
    visibility: 'public',
    status: 'active',
    ...overrides,
  });
}

// ============================================
// BATCH CREATION
// ============================================

/**
 * Create multiple templates for bulk testing
 */
export function createTemplates(count: number, baseOverrides: CreateTemplateInput = {}): Template[] {
  return Array.from({ length: count }, () => createTemplate(baseOverrides));
}

/**
 * Create templates with mixed visibility
 */
export function createTemplatesWithVisibility(
  visibilityCount: Record<TemplateVisibility, number>,
): Template[] {
  const templates: Template[] = [];

  Object.entries(visibilityCount).forEach(([visibility, count]) => {
    const visibilityTemplates = createTemplates(count, { visibility: visibility as TemplateVisibility });
    templates.push(...visibilityTemplates);
  });

  return templates;
}

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate template object matches expected structure
 */
export function validateTemplate(template: unknown): template is Template {
  if (!template || typeof template !== 'object') {
    return false;
  }

  const t = template as Record<string, unknown>;

  return (
    typeof t.id === 'string' &&
    typeof t.userId === 'string' &&
    typeof t.name === 'string' &&
    ['private', 'public', 'shared'].includes(t.visibility as string) &&
    ['draft', 'active', 'archived'].includes(t.status as string) &&
    Array.isArray(t.styles) &&
    typeof t.usageCount === 'number'
  );
}

// ============================================
// MOCK DATA SETS
// ============================================

/**
 * Predefined templates for common test scenarios
 */
export const MockTemplates = {
  default: createTemplate(),
  public: createPublicTemplate(),
  shared: createSharedTemplate(),
  draft: createDraftTemplate(),
  archived: createArchivedTemplate(),
  popular: createPopularTemplate(),
};

/**
 * Generate a mock template database response
 */
export function createTemplateDatabaseResponse(templates: Template[]) {
  return {
    success: true,
    data: templates,
  };
}

/**
 * Generate a mock single template response
 */
export function createTemplateResponse(template: Template) {
  return {
    success: true,
    data: template,
  };
}

/**
 * Generate a template error response
 */
export function createTemplateErrorResponse(code: string, message: string) {
  return {
    success: false,
    error: {
      code,
      message,
    },
  };
}
