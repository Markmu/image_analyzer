import { NextRequest, NextResponse } from 'next/server';
import { createTemplate, listTemplates } from '@/lib/mock/store';

const validVisibility = new Set(['private', 'public', 'shared']);

function validationError(message: string) {
  return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message } }, { status: 422 });
}

export async function GET() {
  return NextResponse.json({ data: listTemplates() });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: { code: 'INVALID_JSON', message: 'Malformed JSON body' } }, { status: 400 });
  }

  if (typeof body.name !== 'string' || body.name.trim().length === 0) {
    return validationError('Template name is required');
  }

  if (!validVisibility.has(body.visibility)) {
    return validationError('Invalid visibility value');
  }

  const template = createTemplate({
    id: body.id,
    userId: body.userId,
    name: body.name.trim(),
    visibility: body.visibility,
    styles: Array.isArray(body.styles) ? body.styles : [],
  });

  return NextResponse.json(template, { status: 201 });
}
