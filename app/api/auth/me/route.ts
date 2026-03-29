import { NextRequest } from 'next/server';
import { getAuthSession } from '@/lib/auth/jwt';
import { apiError, apiResponse } from '@/lib/api-utils';

export async function GET(_request: NextRequest) {
  try {
    const session = await getAuthSession();
    return apiResponse({ user: session });
  } catch (error) {
    return apiError(error);
  }
}
