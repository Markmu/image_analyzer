import { NextRequest, NextResponse } from 'next/server';
import { deleteTemplate, isValidUuid, updateTemplate } from '@/lib/mock/store';

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!isValidUuid(id)) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid template id format' } }, { status: 422 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: { code: 'INVALID_JSON', message: 'Malformed JSON body' } }, { status: 400 });
  }

  const updated = updateTemplate(id, {
    name: typeof body.name === 'string' ? body.name.trim() : undefined,
    visibility: body.visibility,
    styles: Array.isArray(body.styles) ? body.styles : undefined,
  });

  if (!updated) {
    return NextResponse.json({ error: { code: 'TEMPLATE_NOT_FOUND', message: 'Template not found' } }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!isValidUuid(id)) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid template id format' } }, { status: 422 });
  }

  const ok = deleteTemplate(id);
  if (!ok) {
    return NextResponse.json({ error: { code: 'TEMPLATE_NOT_FOUND', message: 'Template not found' } }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
