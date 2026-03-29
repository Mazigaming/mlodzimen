import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const article = await prisma.article.findUnique({
      where: { slug }
    });

    if (!article || !article.isPublished) {
      return NextResponse.json({ error: 'Nie znaleziono artykułu' }, { status: 404 });
    }

    return NextResponse.json({ article });
  } catch (error) {
    console.error('Fetch article by slug error:', error);
    return NextResponse.json({ error: 'Błąd pobierania artykułu' }, { status: 500 });
  }
}
