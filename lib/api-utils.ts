import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export class ApiError extends Error {
  constructor(public message: string, public status: number = 400) {
    super(message);
  }
}

export function apiResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}

export function apiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof ZodError) {
    const fieldErrors = error.flatten().fieldErrors;
    const firstError = Object.values(fieldErrors).flat()[0];
    return NextResponse.json({ 
      error: firstError || 'Błąd walidacji danych', 
      details: fieldErrors 
    }, { status: 400 });
  }

  console.error('[API ERROR]', error);
  return NextResponse.json({ error: 'Wystąpił nieoczekiwany błąd serwera' }, { status: 500 });
}

export const AUTH_COOKIE_NAME = 'auth_token';
