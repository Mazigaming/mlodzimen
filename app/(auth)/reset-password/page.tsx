import { Suspense } from 'react';
import ResetPasswordClient from './client';

export const dynamic = 'force-dynamic';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-slate-950 via-blue-950/40 to-slate-950">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          Wczytywanie...
        </div>
      </div>
    }>
      <ResetPasswordClient />
    </Suspense>
  );
}