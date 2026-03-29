import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth/jwt';
import { apiError, apiResponse, ApiError } from '@/lib/api-utils';

export async function GET() {
  try {
    const config = await prisma.globalConfig.upsert({
      where: { id: 'config' },
      update: {},
      create: { id: 'config' },
    });
    return apiResponse({ config });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || (session.role !== 'admin' && session.email !== 'admin@admin.com')) {
      throw new ApiError('Brak uprawnień administratora', 403);
    }

    const body = await request.json();
    const config = await prisma.globalConfig.upsert({
      where: { id: 'config' },
      update: {
        siteName: body.siteName,
        contactEmail: body.contactEmail,
        maintenanceMode: body.maintenanceMode,
        bannerMessage: body.bannerMessage,
      },
      create: {
        id: 'config',
        siteName: body.siteName,
        contactEmail: body.contactEmail,
        maintenanceMode: body.maintenanceMode,
        bannerMessage: body.bannerMessage,
      },
    });

    return apiResponse({ config, message: 'Ustawienia zapisane pomyślnie' });
  } catch (error) {
    return apiError(error);
  }
}
