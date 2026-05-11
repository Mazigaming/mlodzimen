import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiResponse, ApiError } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      throw new ApiError('Brak tokena weryfikacyjnego', 400);
    }

    // Find user with this verification token
    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
      select: { id: true, email: true, isVerified: true }
    });

    if (!user) {
      throw new ApiError('Nieprawidłowy lub wygasły token weryfikacyjny', 400);
    }

    if (user.isVerified) {
      // User already verified, redirect to login
      return NextResponse.redirect(new URL('/login?message=already-verified', request.url));
    }

    // Update user as verified and clear token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null
      }
    });

    // Redirect to login with success message
    return NextResponse.redirect(new URL('/login?message=email-verified', request.url));
  } catch (error) {
    return apiError(error);
  }
}

// Allow POST for API calls as well
export async function POST(request: NextRequest) {
  try {
    const { code, email } = await request.json();

    if (!code || !email) {
      throw new ApiError('Brak kodu weryfikacyjnego lub emaila', 400);
    }

    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        verificationToken: code
      },
      select: { id: true, email: true, isVerified: true }
    });

    if (!user) {
      throw new ApiError('Nieprawidłowy kod weryfikacyjny', 400);
    }

    if (user.isVerified) {
      return apiResponse({ message: 'Email został już zweryfikowany' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null
      }
    });

    return apiResponse({ message: 'Email został pomyślnie zweryfikowany' });
  } catch (error) {
    return apiError(error);
  }
}