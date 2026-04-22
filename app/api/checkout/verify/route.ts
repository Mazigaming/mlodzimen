import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth/jwt';
import { apiError, apiResponse } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      throw new Error('Brak autoryzacji');
    }

    const { courseId } = await request.json();

    if (!courseId) {
      throw new Error('Brak ID kursu');
    }

    // Check if enrollment already exists
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        userId: session.userId,
        courseId: courseId,
        status: 'active'
      }
    });

    if (existingEnrollment) {
      return apiResponse({ message: 'Już jesteś zapisany na ten kurs' });
    }

    // Find the most recent pending enrollment for this user/course
    // This handles cases where webhook didn't process but payment succeeded
    const pendingEnrollment = await prisma.enrollment.findFirst({
      where: {
        userId: session.userId,
        courseId: courseId,
        status: 'active',
        payoutProcessed: false
      },
      orderBy: { createdAt: 'desc' }
    });

    if (pendingEnrollment) {
      // Enrollment exists but wasn't processed - mark it as processed now
      await prisma.enrollment.update({
        where: { id: pendingEnrollment.id },
        data: { payoutProcessed: true }
      });

      return apiResponse({ message: 'Płatność zweryfikowana pomyślnie' });
    }

    // If no enrollment exists at all, something went wrong
    // This shouldn't happen if the checkout flow worked correctly
    throw new Error('Nie znaleziono potwierdzonej płatności');

  } catch (error) {
    return apiError(error);
  }
}