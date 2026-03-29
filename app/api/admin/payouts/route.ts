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
          select: { mentorId: true }
        }
      }
    });

    if (pendingEnrollments.length === 0) {
      return apiResponse({ message: 'Brak nowych zapisów do rozliczenia' });
    }

    // Group by mentor (10% platform fee, 90% mentor share)
    const mentorPayouts = pendingEnrollments.reduce((acc: any, curr) => {
      const mentorId = curr.course.mentorId;
      const amount = curr.paidAmount * 0.90; // 10% for us, 90% for them
      if (!acc[mentorId]) acc[mentorId] = 0;
      acc[mentorId] += amount;
      return acc;
    }, {});

    // Create payout records
    const payoutPromises = Object.entries(mentorPayouts).map(([mentorId, amount]) => {
      if (amount as number <= 0) return null;
      return prisma.payout.create({
        data: {
          mentorId,
          amount: amount as number,
          status: 'pending'
        }
      });
    }).filter(Boolean);

    await Promise.all(payoutPromises);

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
