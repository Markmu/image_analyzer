import { NextRequest, NextResponse } from 'next/server';
import { createUser, findUserByEmail, isValidEmail } from '@/lib/mock/store';

function validationError(message: string) {
  return NextResponse.json(
    { error: { code: 'VALIDATION_ERROR', message } },
    { status: 422 },
  );
}

export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: { code: 'INVALID_JSON', message: 'Malformed JSON body' } }, { status: 400 });
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: { code: 'INVALID_JSON', message: 'Malformed JSON body' } }, { status: 400 });
  }

  const email = body?.email;
  const name = body?.name;

  if (!isValidEmail(email)) {
    return validationError('email is invalid');
  }

  if (typeof name !== 'string' || name.trim().length === 0) {
    return validationError('name is required');
  }

  if (findUserByEmail(email)) {
    return NextResponse.json(
      { error: { code: 'USER_ALREADY_EXISTS', message: 'User already exists' } },
      { status: 409 },
    );
  }

  const user = createUser({
    id: body?.id,
    email,
    name: name.trim(),
    image: typeof body?.image === 'string' ? body.image : undefined,
    creditBalance: typeof body?.creditBalance === 'number' ? body.creditBalance : 0,
    subscriptionTier: body?.subscriptionTier,
    createdAt: typeof body?.createdAt === 'string' ? body.createdAt : undefined,
    updatedAt: typeof body?.updatedAt === 'string' ? body.updatedAt : undefined,
  });

  return NextResponse.json(user, { status: 201 });
}
