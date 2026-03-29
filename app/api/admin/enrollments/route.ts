import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth/jwt';
import { apiError, apiResponse, ApiError } from '@/lib/api-utils';

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session || (session.role !== 'admin' && session.email !== 'admin@admin.com')) {
      throw new ApiError('Brak uprawnień administratora', 403);
    }

    const enrollments = await prisma.enrollment.findMany({
      include: {
        user: {
          select: { name: true, email: true }
        },
        course: {
          select: { title: true, price: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return apiResponse({ enrollments });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session.role !== 'admin' && session.email !== 'admin@admin.com')) {
      throw new ApiError('Brak uprawnień administratora', 403);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) throw new ApiError('Brak ID zapisu', 400);

    await prisma.enrollment.delete({ where: { id } });

    return apiResponse({ message: 'Zapis usunięty' });
  } catch (error) {
    return apiError(error);
  }
}
