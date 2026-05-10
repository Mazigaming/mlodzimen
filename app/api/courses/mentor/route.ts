import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth/jwt';

export async function POST(_request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 });
    }

    const [courses, payouts] = await Promise.all([
      prisma.course.findMany({
        where: { mentorId: session.userId },
        include: {
          _count: { select: { enrollments: true } },
          enrollments: { select: { paidAmount: true } }
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.payout.findMany({
        where: { mentorId: session.userId },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    // Calculate stats
    const totalEnrollments = courses.reduce((acc, curr) => acc + curr._count.enrollments, 0);
    const grossRevenue = courses.reduce((acc, curr) => {
      return acc + curr.enrollments.reduce((sum, e) => sum + e.paidAmount, 0);
    }, 0);

    // Sum up all processed payouts for the mentor
    const totalPayouts = payouts.reduce((sum, p) => sum + p.amount, 0);

    // Net revenue includes both direct course sales (90%) and coupon earnings
    const netRevenue = totalPayouts;

    return NextResponse.json({ 
      courses, 
      payouts,
      stats: {
        totalEnrollments,
        grossRevenue,
        netRevenue
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching mentor data:', error);
    return NextResponse.json({ error: 'Błąd pobierania danych' }, { status: 500 });
  }
}
