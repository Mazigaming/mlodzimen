import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth/jwt';
import { apiError, apiResponse } from '@/lib/api-utils';
import { stripe } from '@/lib/stripe';

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

    // 1. Check if user is already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.userId,
          courseId: courseId,
        }
      }
    });

    if (existingEnrollment && existingEnrollment.status === 'active') {
      return apiResponse({ message: 'Już jesteś zapisany na ten kurs' });
    }

    // 2. Check Stripe for successful sessions for this user/course
    // This is a more secure fallback than just creating an enrollment
    const sessions = await stripe.checkout.sessions.list({
      limit: 10,
    });

    const successfulSession = sessions.data.find(s => 
      s.status === 'complete' && 
      s.payment_status === 'paid' &&
      s.metadata?.userId === session.userId &&
      s.metadata?.courseId === courseId
    );

    if (successfulSession) {
      const { userId, courseId, paidAmount, couponCode, couponCreatorId } = successfulSession.metadata!;

      const enrollment = await prisma.$transaction(async (tx) => {
        const enrollmentData = {
          userId,
          courseId,
          status: 'active',
          paidAmount: parseFloat(paidAmount || '0'),
          couponCode: couponCode || null,
          couponCreatorId: couponCreatorId || null,
        };

        const result = await tx.enrollment.upsert({
          where: {
            userId_courseId: {
              userId,
              courseId,
            },
          },
          update: enrollmentData,
          create: enrollmentData,
        });

        if (couponCode) {
          await tx.coupon.update({
            where: { code: couponCode },
            data: { usedCount: { increment: 1 } }
          });
        }
        
        return result;
      });

      return apiResponse({ 
        message: 'Płatność zweryfikowana pomyślnie',
        enrollment
      });
    }

    // 3. Last check: maybe the webhook already processed it
    const confirmedEnrollment = await prisma.enrollment.findFirst({
      where: {
        userId: session.userId,
        courseId: courseId,
        status: 'active'
      }
    });

    if (confirmedEnrollment) {
      return apiResponse({ message: 'Płatność zweryfikowana pomyślnie' });
    }

    throw new Error('Nie znaleziono potwierdzonej płatności. Jeśli zapłaciłeś, odczekaj chwilę lub skontaktuj się z nami.');

  } catch (error) {
    return apiError(error);
  }
}