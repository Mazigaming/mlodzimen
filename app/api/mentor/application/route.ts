import { NextRequest } from 'next/server';
import { getAuthSession } from '@/lib/auth/jwt';
import { apiError, apiResponse, ApiError } from '@/lib/api-utils';
import { z } from 'zod';
import { sendMentorApplicationEmail } from '@/lib/email';

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

    // Anyone can submit mentor application, verification not required
    // Admins will review applications manually

    const body = await request.json();
    const data = MentorApplicationSchema.parse(body);

    console.log('Mentor application received:', {
      userId: session.userId,
      email: session.email,
      ...data,
    });

    // Send email notification to admins
    await sendMentorApplicationEmail(session.email || 'unknown');

    return apiResponse({
      message: 'Aplikacja została wysłana pomyślnie'
    }, 200);
  } catch (error) {
    return apiError(error);
  }
}
