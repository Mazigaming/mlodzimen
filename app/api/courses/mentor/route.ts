import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth/jwt';

export async function POST(_request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 });
    }

    let courses: any[] = [];
    let courseEnrollments = 0;
    let courseRevenue = 0;

    // If user is mentor/admin, get course data
    if (session.role === 'mentor' || session.role === 'admin' || session.email === 'admin@admin.com') {
      const courseData = await prisma.course.findMany({
        where: { mentorId: session.userId },
        include: {
          _count: { select: { enrollments: true } },
          enrollments: { select: { paidAmount: true } }
        },
        orderBy: { createdAt: 'desc' },
      });

      courses = courseData;
      courseEnrollments = courseData.reduce((acc, curr) => acc + curr._count.enrollments, 0);
      courseRevenue = courseData.reduce((acc, curr) => {
        return acc + curr.enrollments.reduce((sum, e) => sum + e.paidAmount, 0);
      }, 0);
    }

    // Get all payouts for the user (course sales and coupon earnings)
    const payouts = await prisma.payout.findMany({
      where: { mentorId: session.userId },
      orderBy: { createdAt: 'desc' }
    });

    const totalEarnings = payouts.reduce((sum, p) => sum + p.amount, 0);

    return NextResponse.json({
      courses,
      payouts,
      stats: {
        totalEnrollments: courseEnrollments,
        grossRevenue: courseRevenue,
        netRevenue: totalEarnings
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ error: 'Błąd pobierania danych' }, { status: 500 });
  }
}
