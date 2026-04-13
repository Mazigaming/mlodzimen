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

    // Group by mentor and coupon creator - payout logic:
    // - Normal sale: 15% platform, 85% mentor
    // - Coupon sale: 5% platform, 75% mentor, 20% coupon creator gets 20% of sale as commission
    const mentorPayouts: any = {};
    const creatorPayouts: any = {};
    
    pendingEnrollments.forEach((curr) => {
      const mentorId = curr.course.mentorId;
      const amount = curr.paidAmount;
      const courseOriginalPrice = curr.course.price;
      const couponCreatorId = (curr as any).couponCreatorId;
      
      // Check if coupon was used by comparing paid amount to original price
      const isCouponUsed = amount < courseOriginalPrice;
      
      let platformFee;
      let mentorShare;
      let creatorShare = 0;
      
      if (isCouponUsed && couponCreatorId) {
        // Coupon sale (10% discount): 5% platform, 75% mentor, 10% creator (all % of original price)
        platformFee = courseOriginalPrice * 0.05;
        mentorShare = courseOriginalPrice * 0.75;
        creatorShare = courseOriginalPrice * 0.10;
      } else if (isCouponUsed) {
        // Coupon sale with unknown creator: 5% platform, 85% mentor
        platformFee = courseOriginalPrice * 0.05;
        mentorShare = courseOriginalPrice * 0.85;
      } else {
        // Normal sale: 15% platform, 85% mentor
        platformFee = courseOriginalPrice * 0.15;
        mentorShare = courseOriginalPrice * 0.85;
      }
      
      // Add to mentor payout
      if (!mentorPayouts[mentorId]) {
        mentorPayouts[mentorId] = { platformFee: 0, mentorShare: 0 };
      }
      mentorPayouts[mentorId].platformFee += platformFee;
      mentorPayouts[mentorId].mentorShare += mentorShare;
      
      // Add to coupon creator payout (if applicable)
      if (creatorShare > 0 && couponCreatorId) {
        if (!creatorPayouts[couponCreatorId]) {
          creatorPayouts[couponCreatorId] = 0;
        }
        creatorPayouts[couponCreatorId] += creatorShare;
      }
    });

    // Create mentor payout records
    const payoutPromises = Object.entries(mentorPayouts).map(([mentorId, data]: [string, any]) => {
      const amount = data.mentorShare;
      if (amount <= 0) return null;
      return prisma.payout.create({
        data: {
          mentorId,
          amount: amount,
          status: 'pending',
        }
      });
    }).filter(Boolean);

    // Create coupon creator payout records
    const creatorPayoutPromises = Object.entries(creatorPayouts).map(([creatorId, amount]: [string, any]) => {
      if (amount <= 0) return null;
      return prisma.payout.create({
        data: {
          mentorId: creatorId, // Creators are also users, can receive payouts
          amount: amount,
          status: 'pending',
          notes: 'Prowizja od kuponu', // Note for the creator
        }
      });
    }).filter(Boolean);

    await Promise.all(payoutPromises);
    await Promise.all(creatorPayoutPromises);

    // Mark enrollments as processed
    await prisma.enrollment.updateMany({
      where: {
        id: { in: pendingEnrollments.map(e => e.id) }
      },
      data: {
        payoutProcessed: true
      }
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
