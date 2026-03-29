import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth/jwt';

async function isAdmin(session: any) {
  if (!session) return false;
  return session.email === 'admin@admin.com' || session.role === 'admin';
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || !(await isAdmin(session))) {
      return NextResponse.json({ error: 'Brak uprawnień administratora' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));

    // LIST ALL COURSES
    if (body.action === 'list') {
      const courses = await prisma.course.findMany({
        include: {
          mentor: {
            select: { name: true, email: true, avatar: true }
          },
          _count: {
            select: { enrollments: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ courses });
    }

    // VERIFY COURSE
    if (body.action === 'verify') {
      const { courseId, status } = body;
      const course = await prisma.course.update({
        where: { id: courseId },
        data: { isVerified: status }
      });
      return NextResponse.json({ course, message: status ? 'Kurs zweryfikowany' : 'Weryfikacja kursu cofnięta' });
    }

    // DELETE COURSE
    if (body.action === 'delete') {
      const { id } = body;
      await prisma.course.delete({ where: { id } });
      return NextResponse.json({ message: 'Kurs usunięty' });
    }

    return NextResponse.json({ error: 'Nieprawidłowa akcja' }, { status: 400 });
  } catch (error) {
    console.error('Admin Courses API error:', error);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}
