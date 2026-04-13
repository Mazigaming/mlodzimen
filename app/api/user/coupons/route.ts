import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth/jwt';
import { apiError, apiResponse, ApiError } from '@/lib/api-utils';
import { z } from 'zod';

const CouponSchema = z.object({
  code: z.string().min(3, 'Kod musi mieć co najmniej 3 znaki'),
  discountType: z.enum(['fixed', 'percent']),
  discountValue: z.number().positive('Wartość musi być większa od 0'),
  maxUses: z.number().optional().default(0),
  expiresAt: z.string().optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

// GET - List user's own coupons
export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) {
      throw new ApiError('Brak autoryzacji', 401);
    }

    const coupons = await prisma.coupon.findMany({
      where: { creatorId: session.userId },
      orderBy: { createdAt: 'desc' }
    });

    return apiResponse({ coupons });
  } catch (error) {
    return apiError(error);
  }
}

// POST - Create a new coupon
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      throw new ApiError('Brak autoryzacji', 401);
    }

    // Every user can create 1 coupon
    if (!session.role) {
      throw new ApiError('Tylko zalogowani użytkownicy mogą tworzyć kupony', 403);
    }

    // Check if user already has a coupon
    const existingCoupon = await prisma.coupon.findFirst({
      where: { creatorId: session.userId }
    });

    if (existingCoupon) {
      throw new ApiError('Możesz mieć tylko jeden kupon', 400);
    }

    const body = await request.json();
    const data = CouponSchema.parse(body);

    // Force discount type to percent and value to 10 for now
    const coupon = await prisma.coupon.create({
      data: {
        ...data,
        code: data.code.toUpperCase(),
        discountType: 'percent',
        discountValue: 10, // Fixed 10% discount
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        creatorId: session.userId,
      }
    });

    return apiResponse({ coupon, message: 'Kupon utworzony' }, 201);
  } catch (error) {
    return apiError(error);
  }
}

// DELETE - Delete a coupon (only if user owns it)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      throw new ApiError('Brak autoryzacji', 401);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) throw new ApiError('Brak ID kuponu', 400);

    // Verify ownership
    const coupon = await prisma.coupon.findFirst({
      where: { id, creatorId: session.userId }
    });

    if (!coupon) {
      throw new ApiError('Nie możesz usunąć tego kuponu', 403);
    }

    await prisma.coupon.delete({ where: { id } });

    return apiResponse({ message: 'Kupon usunięty' });
  } catch (error) {
    return apiError(error);
  }
}