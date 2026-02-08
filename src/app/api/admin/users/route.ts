import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { error: { code: 'FORBIDDEN', message: 'Forbidden' } },
    { status: 403 },
  );
}
