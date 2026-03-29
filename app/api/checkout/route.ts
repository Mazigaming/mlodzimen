import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth/jwt';
import { stripe } from '@/lib/stripe';
import { apiError, ApiError } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      throw new ApiError('Brak autoryzacji', 401);
    }

    const { courseId, couponCode } = await request.json();

    if (!courseId) {
      throw new ApiError('Nie podano ID kursu', 400);
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new ApiError('Kurs nie istnieje', 404);
    }

    // Check if user is already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.userId,
          courseId: courseId,
        },
      },
    });

    if (existingEnrollment) {
      throw new ApiError('Jesteś już zapisany na ten kurs', 400);
    }

    let finalPrice = course.price;

    // Optional coupon validation
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode },
      });

      if (coupon && coupon.isActive && (coupon.expiresAt === null || coupon.expiresAt > new Date())) {
        if (coupon.discountType === 'percent') {
          finalPrice = Math.max(0, course.price * (1 - coupon.discountValue / 100));
        } else if (coupon.discountType === 'fixed') {
          finalPrice = Math.max(0, course.price - coupon.discountValue);
        }
      }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'blik', 'p24'],
      locale: 'pl',
      line_items: [
        {
          price_data: {
            currency: 'pln',
            product_data: {
              name: course.title,
              description: course.description,
            },
            unit_amount: Math.round(finalPrice * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${appUrl}/dashboard?success=true&courseId=${courseId}`,
      cancel_url: `${appUrl}/kursy/${courseId}?canceled=true`,
      metadata: {
        userId: session.userId,
        courseId: courseId,
        couponCode: couponCode || '',
        paidAmount: finalPrice.toString(),
      },
      customer_email: session.email,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    return apiError(error);
  }
}
