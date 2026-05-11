import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiResponse } from '@/lib/api-utils';
import { sendPasswordResetEmail } from '@/lib/email';
import { z } from 'zod';

const ForgotPasswordSchema = z.object({
  email: z.string().email('Nieprawidłowy adres email'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = ForgotPasswordSchema.parse(body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success for security reasons (don't reveal if email exists)
    if (!user) {
      return apiResponse({
        message: 'Jeśli podany adres email istnieje w naszym systemie, otrzymasz wiadomość z linkiem do resetowania hasła.'
      });
    }

    // Generate 6-digit reset code and expiry (1 hour)
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Update user with reset code
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetCode,
        passwordResetExpires: resetExpires,
      },
    });

    // Send reset email with code
    const emailSent = await sendPasswordResetEmail(user.email, resetCode);

    if (!emailSent) {
      console.error('Failed to send password reset email');
      // Still return success for security
    }

    return apiResponse({
      message: 'Jeśli podany adres email istnieje w naszym systemie, otrzymasz wiadomość z linkiem do resetowania hasła.'
    });
  } catch (error) {
    return apiError(error);
  }
}