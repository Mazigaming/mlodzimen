import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiResponse } from '@/lib/api-utils';

export async function GET(_request: NextRequest) {
  try {
    const articles = await prisma.article.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        author: true,
        excerpt: true,
        image: true,
        slug: true,
        createdAt: true,
      }
    });

    return apiResponse({ articles });
  } catch (error) {
    return apiError(error);
  }
}
