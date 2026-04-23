import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth/jwt';
import { apiError, apiResponse, ApiError } from '@/lib/api-utils';
import { z } from 'zod';

const UpdateCourseSchema = z.object({
  title: z.string().min(3, 'Tytuł kursu musi mieć co najmniej 3 znaki').optional(),
  description: z.string().min(10, 'Opis kursu musi mieć co najmniej 10 znaków').optional(),
  price: z.coerce.number().min(0).optional(),
  category: z.string().min(1, 'Kategoria jest wymagana').optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  modules: z.array(z.object({
    id: z.string().optional(),
    title: z.string().min(1, 'Tytuł modułu jest wymagany'),
    lessons: z.array(z.object({
      id: z.string().optional(),
      title: z.string().min(1, 'Tytuł lekcji jest wymagany'),
      description: z.string().optional().nullable(),
      videoUrl: z.string().url('Nieprawidłowy URL wideo').optional().nullable().or(z.literal('')),
      content: z.string().optional().nullable(),
      order: z.number().optional(),
    })).optional(),
    order: z.number().optional(),
  })).optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getAuthSession();

    // Fetch basic course info
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        mentor: {
          select: { id: true, name: true, email: true, avatar: true }
        },
        _count: { select: { enrollments: true } }
      }
    });

    if (!course) throw new ApiError('Kurs nie znaleziony', 404);

    // Check for access
    let hasAccess = false;
    if (session) {
      if (session.email === 'admin@admin.com' || session.userId === course.mentorId) {
        hasAccess = true;
      } else {
        const enrollment = await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: session.userId,
              courseId: id
            }
          }
        });
        if (enrollment) hasAccess = true;
      }
    }

    if (hasAccess) {
      // Return full course with modules and lessons
      const fullCourse = await prisma.course.findUnique({
        where: { id },
        include: {
          mentor: { select: { id: true, name: true, email: true, avatar: true } },
          modules: {
            orderBy: { order: 'asc' },
            include: {
              lessons: { orderBy: { order: 'asc' } }
            }
          }
        }
      });
      return apiResponse({ course: fullCourse, hasAccess: true });
    }

    // Return public info only
    return apiResponse({ 
      course: {
        ...course,
        modules: [] // Hide content for non-enrolled
      }, 
      hasAccess: false 
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getAuthSession();
    if (!session) throw new ApiError('Brak autoryzacji', 401);

    // Check if course exists and user owns it (or is admin)
    const course = await prisma.course.findUnique({
      where: { id },
      include: { modules: { include: { lessons: true } } }
    });

    if (!course) throw new ApiError('Kurs nie istnieje', 404);

    if (course.mentorId !== session.userId && session.role !== 'admin' && session.email !== 'admin@admin.com') {
      throw new ApiError('Nie masz uprawnień do edycji tego kursu', 403);
    }

    const body = await request.json();
    const data = UpdateCourseSchema.parse(body);

    // Update course with nested modules/lessons
    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.category && { category: data.category }),
        ...(data.level && { level: data.level }),
        ...(data.modules && {
          modules: {
            // Delete existing modules that are not in the update
            deleteMany: {
              id: {
                notIn: data.modules
                  .filter(m => m.id)
                  .map(m => m.id!)
              }
            },
            // Upsert modules
            upsert: data.modules.map((module, mIndex) => ({
              where: { id: module.id || 'new' },
              update: {
                title: module.title,
                order: module.order || mIndex,
                ...(module.lessons && {
                  lessons: {
                    deleteMany: {
                      id: {
                        notIn: module.lessons
                          .filter(l => l.id)
                          .map(l => l.id!)
                      }
                    },
                    upsert: module.lessons.map((lesson, lIndex) => ({
                      where: { id: lesson.id || 'new' },
                      update: {
                        title: lesson.title,
                        description: lesson.description || '',
                        videoUrl: lesson.videoUrl || '',
                        content: lesson.content || '',
                        order: lesson.order || lIndex,
                      },
                      create: {
                        title: lesson.title,
                        description: lesson.description || '',
                        videoUrl: lesson.videoUrl || '',
                        content: lesson.content || '',
                        order: lesson.order || lIndex,
                      }
                    }))
                  }
                })
              },
              create: {
                title: module.title,
                order: module.order || mIndex,
                lessons: {
                  create: module.lessons?.map((lesson, lIndex) => ({
                    title: lesson.title,
                    description: lesson.description || '',
                    videoUrl: lesson.videoUrl || '',
                    content: lesson.content || '',
                    order: lesson.order || lIndex,
                  })) || []
                }
              }
            }))
          }
        })
      },
      include: {
        modules: {
          include: {
            lessons: true
          },
          orderBy: { order: 'asc' }
        },
        mentor: {
          select: { name: true, email: true }
        },
        _count: {
          select: { enrollments: true }
        }
      }
    });

    return apiResponse({ course: updatedCourse, message: 'Kurs zaktualizowany pomyślnie' });
  } catch (error) {
    return apiError(error);
  }
}

// Support legacy POST if needed
export async function POST(request: NextRequest, context: any) {
  return GET(request, context);
}
