import { NextRequest, NextResponse } from 'next/server';
import { createAnalysis } from '@/lib/mock/store';

const validTypes = new Set(['style_analysis', 'color_analysis', 'composition_analysis', 'full_analysis']);

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: { code: 'INVALID_JSON', message: 'Malformed JSON body' } }, { status: 400 });
  }

  if (typeof body.inputImageUrl !== 'string' || !isValidUrl(body.inputImageUrl)) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'inputImageUrl must be a valid URL' } },
      { status: 422 },
    );
  }

  if (!validTypes.has(body.type)) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Invalid analysis type' } },
      { status: 422 },
    );
  }

  const analysis = createAnalysis({
    id: body.id,
    userId: body.userId,
    inputImageUrl: body.inputImageUrl,
    type: body.type,
    status: 'pending',
  });

  return NextResponse.json(analysis, { status: 201 });
}
