import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiResponse } from '@/lib/api-utils';

export async function GET(_request: NextRequest) {
  try {
    const courses = await prisma.course.findMany({
      where: {
        isVerified: true
      },
      include: {
        mentor: {
          select: {
            name: true,
            avatar: true,
          }
        },
        _count: {
          select: { enrollments: true }
        }
      },
      orderBy: {
        createdAt: 'desc',
      }
    });

    return apiResponse({ courses });
  } catch (error) {
    return apiError(error);
  }
}

// Support legacy POST if needed
export async function POST(request: NextRequest) {
  return GET(request);
}
