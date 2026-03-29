import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ error: 'Brak autoryzacji' }, { status: 401 });

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    
    // Only main admin or mentors can manage articles (for now let's keep it strict to admin for management)
    if (!decoded || decoded.email !== 'admin@admin.com') {
      return NextResponse.json({ error: 'Brak uprawnień administratora' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));

    // LIST ARTICLES
    if (body.action === 'list') {
      const articles = await prisma.article.findMany({
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ articles });
    }

    // CREATE ARTICLE
    if (body.action === 'create') {
      const { title, content, excerpt, author, image, slug } = body;
      
      if (!title || !content || !slug) {
        return NextResponse.json({ error: 'Brak wymaganych pól' }, { status: 400 });
      }

      const article = await prisma.article.create({
        data: {
          title,
          content,
          excerpt: excerpt || title.substring(0, 100),
          author: author || 'Młodzi Mentorzy',
          image: image || '📖',
          slug: slug.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
        }
      });
      return NextResponse.json({ article, message: 'Artykuł dodany' });
    }

    // DELETE ARTICLE
    if (body.action === 'delete') {
      const { id } = body;
      await prisma.article.delete({ where: { id } });
      return NextResponse.json({ message: 'Artykuł usunięty' });
    }

    // UPDATE ARTICLE
    if (body.action === 'update') {
      const { id, title, content, excerpt, author, image, slug } = body;
      const article = await prisma.article.update({
        where: { id },
        data: {
          title,
          content,
          excerpt,
          author,
          image,
          slug: slug?.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
        }
      });
      return NextResponse.json({ article, message: 'Artykuł zaktualizowany' });
    }

    return NextResponse.json({ error: 'Nieprawidłowa akcja' }, { status: 400 });
  } catch (error) {
    console.error('Admin Articles API error:', error);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}
