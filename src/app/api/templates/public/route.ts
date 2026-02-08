import { NextResponse } from 'next/server';
import { listPublicTemplates } from '@/lib/mock/store';

export async function GET() {
  return NextResponse.json({ data: listPublicTemplates() });
}
