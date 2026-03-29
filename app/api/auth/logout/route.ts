import { NextRequest } from 'next/server';
import { removeAuthCookie } from '@/lib/auth/jwt';
import { apiResponse, apiError } from '@/lib/api-utils';

export async function POST(_request: NextRequest) {
  try {
    await removeAuthCookie();
    return apiResponse({ message: 'Wylogowano pomyślnie' });
  } catch (error) {
    return apiError(error);
  }
}
