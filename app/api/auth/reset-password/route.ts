import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth/password';
import { apiError, apiResponse } from '@/lib/api-utils';
import { z } from 'zod';

const ResetPasswordSchema = z.object({
  email: z.string().email('Nieprawidłowy format email'),
  code: z.string().min(6, 'Kod musi mieć 6 znaków'),
  password: z.string().min(6, 'Hasło musi mieć co najmniej 6 znaków'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code, password } = ResetPasswordSchema.parse(body);

    // Find user by email, reset code and check if code is still valid
    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        passwordResetToken: code,
        passwordResetExpires: {
          gt: new Date(), // Code must not be expired
        },
      },
    });

    if (!user) {
      throw new Error('Nieprawidłowy kod resetowania lub email');
    }

    // Hash the new password
    const hashedPassword = await hashPassword(password);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return apiResponse({
      message: 'Hasło zostało pomyślnie zresetowane. Możesz się teraz zalogować.'
    });
  } catch (error) {
    return apiError(error);
  }
}