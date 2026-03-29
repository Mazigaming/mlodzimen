import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth/password';
import { generateToken, setAuthCookie } from '@/lib/auth/jwt';
import { isRateLimited } from '@/lib/security/shield';
import { z } from 'zod';
import { apiError, apiResponse, ApiError } from '@/lib/api-utils';

const RegisterSchema = z.object({
  email: z.string().email('Nieprawidłowy format email'),
  name: z.string().min(2, 'Imię musi mieć co najmniej 2 znaki'),
  password: z.string().min(6, 'Hasło musi mieć co najmniej 6 znaków'),
  role: z.enum(['student', 'mentor']),
});

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'anon';
    if (isRateLimited(`register-${ip}`, 3, 3600000)) {
      throw new ApiError('Zbyt wiele prób rejestracji. Spróbuj ponownie za godzinę.', 429);
    }

    const body = await request.json();
    const { email, name, password, role } = RegisterSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ApiError('Użytkownik z tym emailem już istnieje', 409);
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        email: true,
        role: true,
      }
    });

    const token = generateToken(user.id, user.email, user.role);
    await setAuthCookie(token);

    return apiResponse({ 
      userId: user.id, 
      role: user.role, 
      message: 'Zarejestrowano pomyślnie' 
    }, 201);
  } catch (error) {
    return apiError(error);
  }
}
