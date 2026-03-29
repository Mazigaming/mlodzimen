import { NextRequest } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { getAuthSession } from '@/lib/auth/jwt';
import { apiError, apiResponse, ApiError } from '@/lib/api-utils';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      throw new ApiError('Brak autoryzacji', 401);
    }

    const formData = await request.formData();
    const file = formData.get('avatar') as File | null;

    if (!file || !file.type.startsWith('image/')) {
      throw new ApiError('Plik musi być obrazkiem', 400);
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      throw new ApiError('Plik jest za duży. Maksymalny rozmiar to 2MB', 400);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const filename = `${session.userId}-${Date.now()}.jpg`;
    const filepath = join(uploadDir, filename);

    // Save file
    await writeFile(filepath, buffer);

    // Return the URL
    const avatarUrl = `/uploads/avatars/${filename}`;

    return apiResponse({ avatar: avatarUrl });
  } catch (error) {
    return apiError(error);
  }
}
