import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword } from '@/lib/auth/password';
import { generateToken, setAuthCookie } from '@/lib/auth/jwt';
import { isRateLimited } from '@/lib/security/shield';
import { z } from 'zod';
import { apiError, apiResponse, ApiError } from '@/lib/api-utils';

const LoginSchema = z.object({
  email: z.string().email('Nieprawidłowy format email'),
  password: z.string().min(1, 'Hasło jest wymagane'),
});

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'anon';
    if (isRateLimited(`login-${ip}`, 5, 60000)) {
      throw new ApiError('Zbyt wiele prób logowania. Spróbuj ponownie za minutę.', 429);
    }

    const body = await request.json();
    const { email, password } = LoginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        isActive: true,
        isVerified: true,
      }
    });

    if (!user || !(await comparePassword(password, user.password))) {
      throw new ApiError('Nieprawidłowy email lub hasło', 401);
    }

    if (!user.isActive) {
      throw new ApiError('Konto zostało dezaktywowane. Skontaktuj się z administratorem.', 403);
    }

    // Email verification no longer required
    // if (!user.isVerified) {
    //   throw new ApiError('Konto nie zostało zweryfikowane. Sprawdź swoją skrzynkę email.', 403);
    // }

    const token = generateToken(user.id, user.email, user.role, user.isActive, user.isVerified);
    await setAuthCookie(token);

    return apiResponse({ 
      userId: user.id, 
      role: user.role, 
      message: 'Zalogowano pomyślnie' 
    });
  } catch (error) {
    return apiError(error);
  }
}
