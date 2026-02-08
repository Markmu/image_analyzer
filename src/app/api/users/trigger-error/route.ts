import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Simulated server error' } },
    { status: 500 },
  );
}
