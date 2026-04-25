import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth/jwt';
import { apiError, apiResponse, ApiError } from '@/lib/api-utils';
import { promises as fs } from 'fs';
import path from 'path';

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

    // Handle maintenance mode file toggle
    const maintenanceFile = path.join(process.cwd(), '.maintenance');
    if (body.maintenanceMode === true) {
      // Create maintenance file
      await fs.writeFile(maintenanceFile, 'Maintenance mode enabled');
    } else if (body.maintenanceMode === false) {
      // Delete maintenance file if it exists
      try {
        await fs.unlink(maintenanceFile);
      } catch {
        // File doesn't exist, that's fine
      }
    }

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
