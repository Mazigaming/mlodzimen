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

async function isAdmin(session: any) {
  return session?.role === 'admin' || session?.email === 'admin@admin.com';
}

export async function GET(_request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!await isAdmin(session)) throw new ApiError('Brak uprawnień', 403);

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return apiResponse({ coupons });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) throw new ApiError('Brak autoryzacji', 401);

    const body = await request.json();
    
    // Legacy action support
    if (body.action === 'list') {
      // Only admins can list all coupons
      if (session.role === 'admin' || session.email === 'admin@admin.com') {
        const coupons = await prisma.coupon.findMany({
          orderBy: { createdAt: 'desc' }
        });
        return apiResponse({ coupons });
      }
      // Non-admins can only see their own coupons
      const coupons = await prisma.coupon.findMany({
        where: { creatorId: session.userId },
        orderBy: { createdAt: 'desc' }
      });
      return apiResponse({ coupons });
    }
    
    const data = CouponSchema.parse(body);

    const coupon = await prisma.coupon.create({
      data: {
        ...data,
        code: data.code.toUpperCase(),
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        creatorId: session.userId, // Track who created the coupon
      }
    });

    return apiResponse({ coupon, message: 'Kupon utworzony' }, 201);
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!await isAdmin(session)) throw new ApiError('Brak uprawnień', 403);

    const body = await request.json();
    const { id, ...data } = body;

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        ...data,
        code: data.code?.toUpperCase(),
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : data.expiresAt === null ? null : undefined,
      }
    });

    return apiResponse({ coupon, message: 'Kupon zaktualizowany' });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!await isAdmin(session)) throw new ApiError('Brak uprawnień', 403);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) throw new ApiError('Brak ID kuponu', 400);

    await prisma.coupon.delete({ where: { id } });

    return apiResponse({ message: 'Kupon usunięty' });
  } catch (error) {
    return apiError(error);
  }
}
