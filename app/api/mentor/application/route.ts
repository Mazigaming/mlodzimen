import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth/jwt';
import { apiError, apiResponse, ApiError } from '@/lib/api-utils';
import { z } from 'zod';

const MentorApplicationSchema = z.object({
  specialization: z.string().optional().default('General'),
  experience: z.number().optional().default(0),
  aboutYou: z.string().min(10, 'Opis o sobie musi mieć co najmniej 10 znaków'),
  aboutCourse: z.string().min(10, 'Plan kursu musi mieć co najmniej 10 znaków'),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      throw new ApiError('Brak autoryzacji', 401);
    }

    // Only verified mentors can submit applications
    if (session.role !== 'mentor') {
      throw new ApiError('Tylko mentorzy mogą wysyłać wnioski o mentora', 403);
    }

    // Check if user is verified
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isVerified: true }
    });

    if (!user || !user.isVerified) {
      throw new ApiError('Musisz zweryfikować swój email przed wysłaniem aplikacji', 403);
    }

    const body = await request.json();
    const data = MentorApplicationSchema.parse(body);

    // For now, we'll just log the application
    // In a real implementation, you might want to store this in a database table
    console.log('Mentor application received:', {
      userId: session.userId,
      email: session.email,
      ...data,
    });

    // TODO: Send email notification to admins or store in database

    return apiResponse({
      message: 'Aplikacja została wysłana pomyślnie'
    }, 200);
  } catch (error) {
    return apiError(error);
  }
}