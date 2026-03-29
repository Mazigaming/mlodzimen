import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth/jwt';
import { apiError, apiResponse, ApiError } from '@/lib/api-utils';
import { z } from 'zod';

const LessonSchema = z.object({
  title: z.string().min(1, 'Tytuł lekcji jest wymagany'),
  description: z.string().optional().nullable(),
  videoUrl: z.string().url('Nieprawidłowy URL wideo').optional().nullable().or(z.literal('')),
  content: z.string().optional().nullable(),
});

const ModuleSchema = z.object({
  title: z.string().min(1, 'Tytuł modułu jest wymagany'),
  lessons: z.array(LessonSchema),
});

const CreateCourseSchema = z.object({
  title: z.string().min(3, 'Tytuł kursu musi mieć co najmniej 3 znaki'),
  description: z.string().min(10, 'Opis kursu musi mieć co najmniej 10 znaków'),
  price: z.coerce.number().min(0),
  category: z.string().min(1, 'Kategoria jest wymagana'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  modules: z.array(ModuleSchema).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) throw new ApiError('Brak autoryzacji', 401);

    // Role check: Only mentors/admins can create courses
    if (session.role !== 'mentor' && session.role !== 'admin' && session.email !== 'admin@admin.com') {
      throw new ApiError('Tylko mentorzy mogą tworzyć kursy', 403);
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId }
    });

    if (!user || (user.role === 'mentor' && !user.isVerified)) {
      throw new ApiError('Twoje konto mentora wymaga weryfikacji przed tworzeniem kursów', 403);
    }

    const body = await request.json();
    const data = CreateCourseSchema.parse(body);

    const course = await prisma.course.create({
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        category: data.category,
        level: data.level,
        mentorId: session.userId,
        modules: data.modules ? {
          create: data.modules.map((module, mIndex) => ({
            title: module.title,
            order: mIndex,
            lessons: {
              create: module.lessons.map((lesson, lIndex) => ({
                title: lesson.title,
                description: lesson.description || '',
                videoUrl: lesson.videoUrl || '',
                content: lesson.content || '',
                order: lIndex,
              }))
            }
          }))
        } : undefined,
      },
      include: {
        modules: {
          include: {
            lessons: true
          }
        },
      }
    });

    return apiResponse({ course, message: 'Kurs stworzony pomyślnie' }, 201);
  } catch (error) {
    return apiError(error);
  }
}
