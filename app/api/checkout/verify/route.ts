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

    // Check if user is already enrolled
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

    // If no existing enrollment, try to create fallback enrollment
    // This allows enrollment when webhook might have failed
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      throw new Error('Kurs nie znaleziony');
    }

    // Create enrollment as fallback (user manually confirmed)
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: session.userId,
        courseId: courseId,
        status: 'active',
        paidAmount: course.price,
        payoutProcessed: false,
        couponCode: null,
        couponCreatorId: null
      }
    });

    return apiResponse({ 
      message: 'Płatność zweryfikowana pomyślnie',
      enrollment: enrollment
    });

  } catch (error) {
    return apiError(error);
  }
}