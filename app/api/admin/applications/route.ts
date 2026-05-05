import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth/jwt';
import { apiError, apiResponse, ApiError } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session.role !== 'admin' && session.email !== 'admin@admin.com')) {
      throw new ApiError('Brak uprawnień administratora', 403);
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    const where = status ? { status } : {};

    const applications = await prisma.mentorApplication.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return apiResponse({ applications });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session.role !== 'admin' && session.email !== 'admin@admin.com')) {
      throw new ApiError('Brak uprawnień administratora', 403);
    }

    const { id, status } = await request.json();

    if (!id || !status) {
      throw new ApiError('Brak wymaganych danych', 400);
    }

    const application = await prisma.mentorApplication.update({
      where: { id },
      data: { status },
    });

    // Update user's isVerified status if approved
    if (status === 'approved' && application.userId) {
      await prisma.user.update({
        where: { id: application.userId },
        data: { isVerified: true },
      });
    }

    return apiResponse({ 
      message: `Wniosek ${status === 'approved' ? 'zatwierdzony' : 'odrzucony'} pomyślnie`,
      application
    });
  } catch (error) {
    return apiError(error);
  }
}