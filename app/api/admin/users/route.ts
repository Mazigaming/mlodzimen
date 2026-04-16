import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth/jwt';
import { apiError, apiResponse, ApiError } from '@/lib/api-utils';
import { z } from 'zod';

const UpdateUserSchema = z.object({
  userId: z.string(),
  isVerified: z.boolean().optional(),
  isActive: z.boolean().optional(),
  role: z.enum(['student', 'mentor', 'admin']).optional(),
});

async function isAdmin(session: any) {
  if (!session) return false;
  return session.email === 'admin@admin.com' || session.role === 'admin';
}

export async function GET(_request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!await isAdmin(session)) throw new ApiError('Brak uprawnień administratora', 403);

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        nickname: true,
        avatar: true,
        role: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return apiResponse({ users });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session.email !== 'admin@admin.com' && session.role !== 'admin')) {
      throw new ApiError('Brak uprawnień', 403);
    }

    const body = await request.json();
    const { userId, isVerified, isActive, role } = UpdateUserSchema.parse(body);

    const data: any = {};
    if (isVerified !== undefined) data.isVerified = isVerified;
    if (isActive !== undefined) data.isActive = isActive;
    if (role !== undefined) {
      if (session.email !== 'admin@admin.com' && role === 'admin') {
        throw new ApiError('Tylko główny administrator może nadawać uprawnienia admina', 403);
      }
      data.role = role;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data
    });

    return apiResponse({
      user: { id: user.id, isVerified: user.isVerified, isActive: user.isActive, role: user.role },
      message: 'Użytkownik zaktualizowany'
    });
  } catch (error) {
    return apiError(error);
  }
}

// Support for legacy POST with action
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    if (body.action === 'list') return GET(request);
    if (body.action === 'verify') {
      const session = await getAuthSession();
      if (!session || session.email !== 'admin@admin.com') {
        throw new ApiError('Brak uprawnień', 403);
      }
      return PATCH(new NextRequest(request.url, {
        method: 'PATCH',
        body: JSON.stringify({ userId: body.userId, status: body.status }),
        headers: request.headers
      }));
    }
    throw new ApiError('Nieprawidłowa akcja', 400);
  } catch (error) {
    return apiError(error);
  }
}
