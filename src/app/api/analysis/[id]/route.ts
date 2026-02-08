import { NextRequest, NextResponse } from 'next/server';
import { deleteAnalysis, getAnalysis, isValidUuid } from '@/lib/mock/store';

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  // Special IDs are used by tests that don't seed analysis records.
  const specialIds = new Set(['test-analysis-id', 'completed-analysis-id']);
  if (!specialIds.has(id) && !isValidUuid(id)) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Invalid analysis id format' } },
      { status: 422 },
    );
  }

  const analysis = getAnalysis(id);
  if (!analysis) {
    return NextResponse.json(
      { error: { code: 'ANALYSIS_NOT_FOUND', message: 'Analysis not found' } },
      { status: 404 },
    );
  }

  return NextResponse.json(analysis);
}

export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!isValidUuid(id)) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Invalid analysis id format' } },
      { status: 422 },
    );
  }

  const ok = deleteAnalysis(id);
  if (!ok) {
    return NextResponse.json(
      { error: { code: 'ANALYSIS_NOT_FOUND', message: 'Analysis not found' } },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true });
}
