'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Logowanie nie powiodło się');
      }

      // Wait a bit for cookie to be set before redirect
      await new Promise(resolve => setTimeout(resolve, 100));
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd logowania');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-slate-950 via-blue-950/40 to-slate-950 relative overflow-hidden">
      {/* Decorative Stickers */}
      <div className="absolute inset-0 overflow-visible pointer-events-none">
        <div className="absolute top-20 right-10 w-32 h-32 sticker sticker-blue opacity-50" />
        <div className="absolute bottom-40 left-5 w-24 h-24 sticker sticker-cyan opacity-40 md:flex hidden" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md rounded-3xl border border-slate-700/50 p-10 relative z-10"
        style={{
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <span className="speech-bubble inline-block">
              Powrót! 👋
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white">
              Zaloguj się
            </h1>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              role="alert"
              aria-live="polite"
              className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg focus:outline-none"
              tabIndex={0}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate={false}>
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 transition-all"
                placeholder="twój@email.com"
                aria-required="true"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">
                Hasło
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 transition-all"
                placeholder="••••••••"
                aria-required="true"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-950 outline-none"
              aria-busy={isLoading}
            >
              {isLoading ? 'Logowanie...' : 'Zaloguj się'}
            </button>
          </form>

          <p className="text-center text-gray-400">
            Nie masz konta?{' '}
            <Link href="/register" className="text-blue-400 hover:text-blue-300 font-bold transition-colors focus:underline outline-none">
              Zarejestruj się
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
