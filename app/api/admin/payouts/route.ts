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

    const payouts = await prisma.payout.findMany({
      include: {
        mentor: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return apiResponse({ payouts });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST() {
  try {
    const session = await getAuthSession();
    if (!session || (session.role !== 'admin' && session.email !== 'admin@admin.com')) {
      throw new ApiError('Brak uprawnień administratora', 403);
    }

    // Get all enrollments that haven't been processed for payout
    const pendingEnrollments = await prisma.enrollment.findMany({
      where: {
        payoutProcessed: false,
        status: 'active'
      },
      include: {
        course: {
          select: { mentorId: true, price: true }
        }
      }
    });

    if (pendingEnrollments.length === 0) {
      return apiResponse({ message: 'Brak nowych zapisów do rozliczenia' });
    }

    // Group by mentor and coupon creator - payout logic aligned with webhook:
    // - Normal sale: 25% platform, 75% mentor
    // - Coupon sale with creator: 5% platform, 75% mentor, 10% creator (all % of original price)
    // - Coupon sale without creator: 5% platform, 85% mentor
    const mentorPayouts: any = {};
    const creatorPayouts: any = {};
    let platformTotal = 0;

    pendingEnrollments.forEach((curr) => {
      const mentorId = curr.course.mentorId;
      const courseOriginalPrice = curr.course.price;
      const amount = curr.paidAmount;
      const couponCreatorId = (curr as any).couponCreatorId;

      const isCouponUsed = !!(curr.couponCode);

      let platformFee = 0;
      let mentorShare = 0;
      let creatorShare = 0;

      if (isCouponUsed && couponCreatorId) {
        platformFee = courseOriginalPrice * 0.05;
        mentorShare = courseOriginalPrice * 0.75;
        creatorShare = courseOriginalPrice * 0.10;
      } else if (isCouponUsed) {
        platformFee = courseOriginalPrice * 0.05;
        mentorShare = courseOriginalPrice * 0.85;
      } else {
        platformFee = courseOriginalPrice * 0.25;
        mentorShare = courseOriginalPrice * 0.75;
      }

      if (!mentorPayouts[mentorId]) mentorPayouts[mentorId] = 0;
      mentorPayouts[mentorId] += mentorShare;

      platformTotal += platformFee;

      if (creatorShare > 0 && couponCreatorId) {
        if (!creatorPayouts[couponCreatorId]) creatorPayouts[couponCreatorId] = 0;
        creatorPayouts[couponCreatorId] += creatorShare;
      }
    });

    // Ensure platform user exists
    const platformEmail = process.env.PLATFORM_PAYOUT_EMAIL || 'platform@mlodzimentorzy.local';
    let platformUser = await prisma.user.findUnique({ where: { email: platformEmail } });
    if (!platformUser) {
      platformUser = await prisma.user.create({
        data: {
          email: platformEmail,
          name: 'Platform',
          password: Math.random().toString(36),
          role: 'admin',
          isVerified: true
        }
      });
    }

    // Create mentor payout records
    const payoutPromises = Object.entries(mentorPayouts).map(([mentorId, amount]: [string, any]) => {
      if (amount <= 0) return null;
      return prisma.payout.create({ data: { mentorId, amount, status: 'pending' } });
    }).filter(Boolean);

    // Create coupon creator payout records
    const creatorPayoutPromises = Object.entries(creatorPayouts).map(([creatorId, amount]: [string, any]) => {
      if (amount <= 0) return null;
      return prisma.payout.create({ data: { mentorId: creatorId, amount, status: 'pending', notes: 'Prowizja od kuponu' } });
    }).filter(Boolean);

    // Create platform payout record (tracked under platform user)
    const platformPayoutPromise = platformTotal > 0 ? prisma.payout.create({ data: { mentorId: platformUser.id, amount: platformTotal, status: 'completed', notes: 'Opłaty platformy' } }) : null;

    await Promise.all([...payoutPromises, ...creatorPayoutPromises, platformPayoutPromise].filter(Boolean));

    // Mark enrollments as processed
    await prisma.enrollment.updateMany({
      where: { id: { in: pendingEnrollments.map(e => e.id) } },
      data: { payoutProcessed: true }
    });

    return apiResponse({ message: 'Wygenerowano wypłaty dla mentorów' });
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

    const body = await request.json();
    const { id, status } = body;

    const payout = await prisma.payout.update({
      where: { id },
      data: { status }
    });

    return apiResponse({ payout });
  } catch (error) {
    return apiError(error);
  }
}
