import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth/password';
import { apiError, apiResponse } from '@/lib/api-utils';
import { z } from 'zod';

const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Token jest wymagany'),
  password: z.string().min(6, 'Hasło musi mieć co najmniej 6 znaków'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = ResetPasswordSchema.parse(body);

    // Find user by reset token and check if token is still valid
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date(), // Token must not be expired
        },
      },
    });

    if (!user) {
      throw new Error('Nieprawidłowy lub wygasły token resetowania hasła');
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