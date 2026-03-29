import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth/jwt';
import { apiError, apiResponse, ApiError } from '@/lib/api-utils';

async function isAdmin(session: any) {
  return session?.role === 'admin' || session?.email === 'admin@admin.com';
}

export async function GET(_request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!await isAdmin(session)) throw new ApiError('Brak uprawnień', 403);

    const [userCount, mentorCount, courseCount, enrollmentCount, couponCount, activeCoupons, recentEnrollments, _config] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'mentor' } }),
      prisma.course.count(),
      prisma.enrollment.count(),
      prisma.coupon.count(),
      prisma.coupon.count({ where: { isActive: true } }),
      prisma.enrollment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          course: { select: { title: true, price: true } }
        }
      }),
      prisma.globalConfig.upsert({
        where: { id: 'config' },
        update: {},
        create: { id: 'config' }
      })
    ]);

    // Calculate approximate revenue (only active enrollments)
    const activeEnrollments = await prisma.enrollment.findMany({
      where: { status: 'active' },
      include: { course: { select: { price: true, category: true } } }
    });

    const totalRevenue = activeEnrollments.reduce((acc, curr) => acc + curr.paidAmount, 0);
    const platformRevenue = totalRevenue * 0.10; // 10% platform fee
    const mentorsRevenue = totalRevenue * 0.90; // 90% mentor share
    
    const avgRevenuePerUser = userCount > 0 ? totalRevenue / userCount : 0;

    // Get revenue by category
    const revenueByCategory = activeEnrollments.reduce((acc: any, curr: any) => {
      const cat = curr.course.category || 'Inne';
      acc[cat] = (acc[cat] || 0) + curr.paidAmount;
      return acc;
    }, {});

    return apiResponse({
      stats: {
        userCount,
        mentorCount,
        courseCount,
        enrollmentCount,
        couponCount,
        activeCoupons,
        totalRevenue,
        platformRevenue,
        mentorsRevenue,
        avgRevenuePerUser,
        revenueByCategory
      },
      recentEnrollments
    });
  } catch (error) {
    return apiError(error);
  }
}
