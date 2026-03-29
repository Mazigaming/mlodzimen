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
    const { userId, courseId, paidAmount } = session.metadata;

    if (userId && courseId) {
      try {
        await prisma.$transaction(async (tx) => {
          // 1. Create enrollment
          await tx.enrollment.upsert({
            where: {
              userId_courseId: {
                userId,
                courseId,
              },
            },
            update: {
              status: 'active',
              paidAmount: parseFloat(paidAmount),
            },
            create: {
              userId,
              courseId,
              status: 'active',
              paidAmount: parseFloat(paidAmount),
            },
          });

          // 2. We'll generate the payout record automatically using our Payout service logic
          // (which calculates the 10%/90% split when the admin processes it)
          // The current system uses Payout Processed flag on enrollment
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
