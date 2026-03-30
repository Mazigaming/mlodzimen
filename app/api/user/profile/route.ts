import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth/jwt';
import { apiError, apiResponse, ApiError } from '@/lib/api-utils';
import { z } from 'zod';

const ProfileUpdateSchema = z.object({
  name: z.string().min(2, 'Imię musi mieć co najmniej 2 znaki').optional(),
  nickname: z.string().max(30, 'Nickname może mieć max 30 znaków').optional().nullable(),
  avatar: z.string().max(255).optional().nullable(),
});

export async function GET(_request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) throw new ApiError('Brak autoryzacji', 401);

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        nickname: true,
        avatar: true,
        role: true,
        isVerified: true,
        enrollments: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                description: true,
                category: true,
                level: true,
                mentor: {
                  select: { name: true }
                }
              }
            }
          }
        }
      }
    });

    if (!user) throw new ApiError('Nie znaleziono użytkownika', 404);

    return apiResponse({ user });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) throw new ApiError('Brak autoryzacji', 401);

    const body = await request.json();
    
    if (body.action === 'get') {
       return GET(request);
    }

    const data = ProfileUpdateSchema.parse(body);

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        name: data.name,
        nickname: data.nickname,
        avatar: data.avatar,
      },
      select: {
        id: true,
        name: true,
        nickname: true,
        avatar: true,
      }
    });

    return apiResponse({ user: updatedUser, message: 'Profil zaktualizowany' });
  } catch (error) {
    return apiError(error);
  }
}
