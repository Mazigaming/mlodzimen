import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth/jwt';
import { ApiError, apiError } from '@/lib/api-utils';

async function isAdmin(session: any) {
  return session?.role === 'admin' || session?.email === 'admin@admin.com';
}

export async function GET(_request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!await isAdmin(session)) throw new ApiError('Brak uprawnień', 403);

    const enrollments = await prisma.enrollment.findMany({
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true, price: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // CSV Header
    let csvContent = 'ID,Uzytkownik,Email,Kurs,Cena,Status,Data\n';

    // CSV Rows
    enrollments.forEach(e => {
      const row = [
        e.id,
        `"${e.user.name}"`,
        e.user.email,
        `"${e.course.title}"`,
        e.course.price,
        e.status,
        new Date(e.createdAt).toISOString()
      ].join(',');
      csvContent += row + '\n';
    });

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=raport-sprzedazy.csv'
      }
    });

  } catch (error) {
    return apiError(error);
  }
}
