import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth/jwt';
import { apiError, apiResponse, ApiError } from '@/lib/api-utils';
import { z } from 'zod';

const EnrollSchema = z.object({
  courseId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) throw new ApiError('Brak autoryzacji', 401);

    const body = await request.json();
    const { courseId } = EnrollSchema.parse(body);

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) throw new ApiError('Kurs nie istnieje', 404);

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.userId,
          courseId: courseId
        }
      }
    });

    if (existingEnrollment) {
      return apiResponse({ message: 'Jesteś już zapisany na ten kurs', alreadyEnrolled: true });
    }

    // Direct enrollment (useful for free courses or demo)
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: session.userId,
        courseId: courseId,
        status: 'active'
      }
    });

    return apiResponse({ 
      enrollment, 
      message: 'Zapisano pomyślnie' 
    }, 201);

  } catch (error) {
    return apiError(error);
  }
}
