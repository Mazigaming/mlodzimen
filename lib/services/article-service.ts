import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const ArticleSchema = z.object({
  title: z.string().min(3, 'Tytuł musi mieć co najmniej 3 znaki'),
  content: z.string().min(10, 'Treść musi mieć co najmniej 10 znaków'),
  excerpt: z.string().min(5, 'Opis musi mieć co najmniej 5 znaków'),
  author: z.string().min(2, 'Autor jest wymagany'),
  image: z.string().default('📖'),
  isPublished: z.boolean().optional().default(false),
});

export type ArticleInput = z.infer<typeof ArticleSchema>;

export const ArticleService = {
  async getAll(includeUnpublished: boolean = false) {
    return prisma.article.findMany({
      where: includeUnpublished ? {} : { isPublished: true },
      orderBy: { createdAt: 'desc' }
    });
  },

  async getBySlug(slug: string) {
    return prisma.article.findUnique({
      where: { slug }
    });
  },

  async create(data: ArticleInput, _userId: string, isAdmin: boolean) {
    const slugBase = data.title.toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/-+/g, '-');

    return prisma.article.create({
      data: {
        ...data,
        slug: `${slugBase}-${Date.now()}`,
        isPublished: isAdmin ? (data.isPublished ?? false) : false
      }
    });
  },

  async update(id: string, data: Partial<ArticleInput>) {
    return prisma.article.update({
      where: { id },
      data
    });
  },

  async delete(id: string) {
    return prisma.article.delete({
      where: { id }
    });
  }
};
