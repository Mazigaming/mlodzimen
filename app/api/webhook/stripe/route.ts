import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = (await headers()).get('stripe-signature') as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle successful checkout
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const { userId, courseId, paidAmount, couponCode, couponCreatorId } = session.metadata;

    if (userId && courseId) {
      try {
        // Get course info for payout calculation
        const course = await prisma.course.findUnique({
          where: { id: courseId },
          select: { price: true, mentorId: true }
        });

        if (!course) {
          console.error(`Course ${courseId} not found`);
          return new NextResponse('Course not found', { status: 400 });
        }

        await prisma.$transaction(async (tx) => {
          // 1. Create enrollment
          const enrollmentData: any = {
            userId,
            courseId,
            status: 'active',
            paidAmount: parseFloat(paidAmount),
            couponCode: couponCode || null,
            couponCreatorId: couponCreatorId || null,
          };

          await tx.enrollment.upsert({
            where: {
              userId_courseId: {
                userId,
                courseId,
              },
            },
            update: enrollmentData,
            create: enrollmentData,
          });

          // 2. Create payouts based on payment structure
          if (couponCode) {
            // Coupon used: mentor 75%, platform 5%, creator 10% (all of original price)
            await tx.payout.create({
              data: {
                mentorId: course.mentorId,
                amount: course.price * 0.75,
                status: 'pending',
                notes: `Sprzedaż kursu z kuponem: ${couponCode}`
              }
            });

            // Platform fee payout (though platform keeps it, for tracking)
            await tx.payout.create({
              data: {
                mentorId: 'platform', // Special ID for platform
                amount: course.price * 0.05,
                status: 'completed', // Auto-complete for platform
                notes: `Opłata platformy za kupon: ${couponCode}`
              }
            });

            // Coupon creator payout
            const coupon = await tx.coupon.findUnique({
              where: { code: couponCode },
              select: { creatorId: true }
            });

            if (coupon?.creatorId) {
              await tx.payout.create({
                data: {
                  mentorId: coupon.creatorId,
                  amount: course.price * 0.10,
                  status: 'pending',
                  notes: `Prowizja za kod kuponu: ${couponCode}`
                }
              });
            }
          } else {
            // No coupon: mentor 85%, platform 15%
            await tx.payout.create({
              data: {
                mentorId: course.mentorId,
                amount: course.price * 0.85,
                status: 'pending',
                notes: 'Sprzedaż kursu'
              }
            });

            await tx.payout.create({
              data: {
                mentorId: 'platform',
                amount: course.price * 0.15,
                status: 'completed',
                notes: 'Opłata platformy'
              }
            });
          }

          // 3. Update coupon usage
          if (couponCode) {
            await tx.coupon.update({
              where: { code: couponCode },
              data: { usedCount: { increment: 1 } }
            });
          }
        });

        console.log(`User ${userId} successfully enrolled in course ${courseId}`);
      } catch (err) {
        console.error('Error during webhook enrollment processing:', err);
        return new NextResponse('Internal Server Error', { status: 500 });
      }
    }
  }

  return new NextResponse('Success', { status: 200 });
}
