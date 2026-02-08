import { randomUUID } from 'crypto';

export type UserRecord = {
  id: string;
  email: string;
  name: string;
  image?: string;
  creditBalance: number;
  subscriptionTier: 'free' | 'lite' | 'standard';
  createdAt: string;
  updatedAt: string;
};

export type TemplateRecord = {
  id: string;
  userId: string;
  name: string;
  visibility: 'private' | 'public' | 'shared';
  styles: Array<{ name: string; prompt: string }>;
  createdAt: string;
  updatedAt: string;
};

export type AnalysisRecord = {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  type: 'style_analysis' | 'color_analysis' | 'composition_analysis' | 'full_analysis';
  inputImageUrl: string;
  styleResults: Array<{ name: string; confidence: number }>;
  createdAt: string;
  updatedAt: string;
};

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type MockStoreState = {
  users: Map<string, UserRecord>;
  templates: Map<string, TemplateRecord>;
  analyses: Map<string, AnalysisRecord>;
  analysisHits: Map<string, number>;
};

function getState(): MockStoreState {
  const globalKey = '__image_analyzer_mock_store__';
  const globalObj = globalThis as typeof globalThis & {
    [key: string]: MockStoreState | undefined;
  };

  if (!globalObj[globalKey]) {
    globalObj[globalKey] = {
      users: new Map<string, UserRecord>(),
      templates: new Map<string, TemplateRecord>(),
      analyses: new Map<string, AnalysisRecord>(),
      analysisHits: new Map<string, number>(),
    };
  }

  return globalObj[globalKey]!;
}

const users = getState().users;
const templates = getState().templates;
const analyses = getState().analyses;
const analysisHits = getState().analysisHits;

function nowIso() {
  return new Date().toISOString();
}

export function isValidEmail(value: unknown): value is string {
  return typeof value === 'string' && emailRe.test(value);
}

export function isValidUuid(value: unknown): value is string {
  return typeof value === 'string' && uuidRe.test(value);
}

export function findUserByEmail(email: string) {
  for (const user of users.values()) {
    if (user.email.toLowerCase() === email.toLowerCase()) return user;
  }
  return null;
}

export function createUser(data: Partial<UserRecord> & { email: string; name: string }) {
  const id = data.id && isValidUuid(data.id) ? data.id : randomUUID();
  const timestamp = nowIso();
  const record: UserRecord = {
    id,
    email: data.email,
    name: data.name,
    image: data.image,
    creditBalance: typeof data.creditBalance === 'number' ? data.creditBalance : 0,
    subscriptionTier:
      data.subscriptionTier === 'lite' || data.subscriptionTier === 'standard' || data.subscriptionTier === 'free'
        ? data.subscriptionTier
        : 'free',
    createdAt: data.createdAt ?? timestamp,
    updatedAt: data.updatedAt ?? timestamp,
  };

  users.set(record.id, record);
  return record;
}

export function getUser(id: string) {
  return users.get(id) ?? null;
}

export function updateUser(id: string, patch: Partial<Pick<UserRecord, 'name' | 'email' | 'creditBalance' | 'subscriptionTier'>>) {
  const existing = users.get(id);
  if (!existing) return null;

  const updated: UserRecord = {
    ...existing,
    ...patch,
    updatedAt: nowIso(),
  };
  users.set(id, updated);
  return updated;
}

export function deleteUser(id: string) {
  const existed = users.delete(id);
  return existed;
}

export function createTemplate(data: Partial<TemplateRecord> & { name: string; visibility: 'private' | 'public' | 'shared' }) {
  const timestamp = nowIso();
  const record: TemplateRecord = {
    id: data.id && isValidUuid(data.id) ? data.id : randomUUID(),
    userId: data.userId && isValidUuid(data.userId) ? data.userId : randomUUID(),
    name: data.name,
    visibility: data.visibility,
    styles: Array.isArray(data.styles) ? data.styles : [],
    createdAt: data.createdAt ?? timestamp,
    updatedAt: data.updatedAt ?? timestamp,
  };
  templates.set(record.id, record);
  return record;
}

export function listTemplates() {
  return [...templates.values()];
}

export function listPublicTemplates() {
  return [...templates.values()].filter((item) => item.visibility === 'public');
}

export function getTemplate(id: string) {
  return templates.get(id) ?? null;
}

export function updateTemplate(id: string, patch: Partial<Pick<TemplateRecord, 'name' | 'visibility' | 'styles'>>) {
  const existing = templates.get(id);
  if (!existing) return null;
  const updated: TemplateRecord = {
    ...existing,
    ...patch,
    updatedAt: nowIso(),
  };
  templates.set(id, updated);
  return updated;
}

export function deleteTemplate(id: string) {
  return templates.delete(id);
}

export function createAnalysis(
  data: Partial<AnalysisRecord> & {
    inputImageUrl: string;
    type: 'style_analysis' | 'color_analysis' | 'composition_analysis' | 'full_analysis';
  },
) {
  const timestamp = nowIso();
  const record: AnalysisRecord = {
    id: data.id && isValidUuid(data.id) ? data.id : randomUUID(),
    userId: data.userId && isValidUuid(data.userId) ? data.userId : randomUUID(),
    status: data.status ?? 'pending',
    type: data.type,
    inputImageUrl: data.inputImageUrl,
    styleResults: data.styleResults ?? [],
    createdAt: data.createdAt ?? timestamp,
    updatedAt: data.updatedAt ?? timestamp,
  };
  analyses.set(record.id, record);
  return record;
}

export function getAnalysis(id: string) {
  const existing = analyses.get(id);
  if (existing) return existing;

  // Deterministic fixtures for tests without setup records.
  if (id === 'completed-analysis-id') {
    return {
      id,
      userId: randomUUID(),
      status: 'completed' as const,
      type: 'full_analysis' as const,
      inputImageUrl: 'https://example.com/image.jpg',
      styleResults: [{ name: 'Photorealistic', confidence: 0.91 }],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
  }

  if (id === 'test-analysis-id') {
    const hits = (analysisHits.get(id) ?? 0) + 1;
    analysisHits.set(id, hits);
    if (hits < 3) {
      return {
        id,
        userId: randomUUID(),
        status: 'processing' as const,
        type: 'full_analysis' as const,
        inputImageUrl: 'https://example.com/image.jpg',
        styleResults: [],
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
    }
    return {
      id,
      userId: randomUUID(),
      status: 'completed' as const,
      type: 'full_analysis' as const,
      inputImageUrl: 'https://example.com/image.jpg',
      styleResults: [{ name: 'Photorealistic', confidence: 0.94 }],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
  }

  return null;
}

export function deleteAnalysis(id: string) {
  return analyses.delete(id);
}
