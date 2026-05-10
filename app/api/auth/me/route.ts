import { NextRequest } from 'next/server';
import { getAuthSession } from '@/lib/auth/jwt';
import { apiError, apiResponse } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';

export async function GET(_request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return apiResponse({ user: null });

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        nickname: true,
        role: true,
        avatar: true,
        isVerified: true,
        isActive: true,
      },
    });

    return apiResponse({ user });
  } catch (error) {
    return apiError(error);
  }
}
