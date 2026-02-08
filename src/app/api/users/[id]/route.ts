import { NextRequest, NextResponse } from 'next/server';
import { deleteUser, getUser, isValidEmail, isValidUuid, updateUser } from '@/lib/mock/store';

function validationError(message: string) {
  return NextResponse.json(
    { error: { code: 'VALIDATION_ERROR', message } },
    { status: 422 },
  );
}

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!isValidUuid(id)) {
    return validationError('Invalid user id format');
  }

  const user = getUser(id);
  if (!user) {
    return NextResponse.json({ error: { code: 'USER_NOT_FOUND', message: 'User not found' } }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!isValidUuid(id)) {
    return validationError('Invalid user id format');
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: { code: 'INVALID_JSON', message: 'Malformed JSON body' } }, { status: 400 });
  }

  if (body.email !== undefined && !isValidEmail(body.email)) {
    return validationError('email is invalid');
  }

  if (body.name !== undefined && (typeof body.name !== 'string' || body.name.trim().length === 0)) {
    return validationError('name is invalid');
  }

  const updated = updateUser(id, {
    name: typeof body.name === 'string' ? body.name.trim() : undefined,
    email: typeof body.email === 'string' ? body.email : undefined,
    creditBalance: typeof body.creditBalance === 'number' ? body.creditBalance : undefined,
    subscriptionTier: body.subscriptionTier,
  });

  if (!updated) {
    return NextResponse.json({ error: { code: 'USER_NOT_FOUND', message: 'User not found' } }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!isValidUuid(id)) {
    return validationError('Invalid user id format');
  }

  const ok = deleteUser(id);
  if (!ok) {
    return NextResponse.json({ error: { code: 'USER_NOT_FOUND', message: 'User not found' } }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
