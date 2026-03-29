import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth/jwt';
import { apiError, apiResponse, ApiError } from '@/lib/api-utils';

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

// Support legacy POST if needed
export async function POST(request: NextRequest, context: any) {
  return GET(request, context);
}
