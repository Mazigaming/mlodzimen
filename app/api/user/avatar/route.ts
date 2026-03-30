import { NextRequest } from 'next/server';
import { getAuthSession } from '@/lib/auth/jwt';
import { apiError, apiResponse, ApiError } from '@/lib/api-utils';
import { uploadImage } from '@/lib/cloudinary';

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

    // Upload to Cloudinary
    const avatarUrl = await uploadImage(buffer, 'mlodzi-mentorzy/avatars');

    return apiResponse({ avatar: avatarUrl });
  } catch (error) {
    return apiError(error);
  }
}
