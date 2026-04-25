'use client';

import { useState, FormEvent, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = (searchParams.get('type') as 'student' | 'mentor') || 'student';

  const [role, setRole] = useState<'student' | 'mentor'>(defaultRole);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');
    const name = formData.get('name');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    if (password !== confirmPassword) {
      setError('Hasła się nie zgadzają');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, name, password, role }),
      });

      if (!response.ok) {
        let errorMessage = 'Rejestracja nie powiodła się';

        try {
          // Try to parse as JSON
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            errorMessage = data.error || data.message || errorMessage;
          } else {
            // If not JSON, get text response
            const text = await response.text();
            console.error('Non-JSON response:', text);
            errorMessage = 'Wystąpił błąd serwera. Spróbuj ponownie.';
          }
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          // If JSON parsing fails, it might be HTML error page
          errorMessage = 'Wystąpił błąd serwera. Sprawdź połączenie i spróbuj ponownie.';
        }

        throw new Error(errorMessage);
      }

      // No more localStorage - handled by HttpOnly cookie
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd rejestracji');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative z-10">
      <motion.div variants={itemVariants} className="text-center space-y-6 mb-12">
        <span className="speech-bubble inline-block">
          Witamy! 👋
        </span>
        <h1 className="text-5xl md:text-7xl font-black text-white">
          <span className="text-gradient-warm">Dołącz</span> do nas
        </h1>
        <p className="text-xl text-gray-400">
          Wybierz postać i zacznij swoją przygodę 🧙
        </p>
      </motion.div>

      {/* Role Selection */}
      <motion.div 
        variants={itemVariants} 
        className="grid md:grid-cols-2 gap-6 mb-12"
        role="radiogroup"
        aria-label="Wybierz swoją rolę"
      >
        {[
          {
            value: 'student',
            label: 'Jestem Uczniem',
            description: 'Chcę uczyć się od mentorów',
            icon: '📚',
          },
          {
            value: 'mentor',
            label: 'Jestem Mentorem',
            description: 'Chcę nauczać i zarabiać',
            icon: '🎓',
          },
        ].map((option) => (
          <motion.button
            key={option.value}
            type="button"
            onClick={() => setRole(option.value as 'student' | 'mentor')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            role="radio"
            aria-checked={role === option.value}
            className={`p-8 rounded-2xl border-2 transition-all interactive-card text-left focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              role === option.value
                ? 'border-blue-400 bg-blue-500/10'
                : 'border-slate-700/50 bg-slate-900/30 hover:border-slate-600'
            }`}
          >
            <div className="text-5xl mb-4" aria-hidden="true">{option.icon}</div>
            <h3 className="font-black text-lg text-white mb-2">{option.label}</h3>
            <p className="text-sm text-gray-400">{option.description}</p>
          </motion.button>
        ))}
      </motion.div>

      {/* Registration Form */}
      <motion.div
        variants={itemVariants}
        className="rounded-3xl border border-slate-700/50 p-10 relative"
        style={{
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            role="alert"
            aria-live="polite"
            className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6 focus:outline-none"
            tabIndex={0}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">
              Imię i nazwisko
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 transition-all"
              placeholder="Jan Kowalski"
              aria-required="true"
            />
          </div>

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
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                className="w-full px-4 py-3 pr-12 bg-slate-900/50 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 transition-all"
                placeholder="••••••••"
                aria-required="true"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 focus:outline-none focus:text-gray-300 transition-colors"
                aria-label={showPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M14.12 14.12l1.415 1.415M14.12 14.12L15.536 15.536" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">
              Potwierdź hasło
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                className="w-full px-4 py-3 pr-12 bg-slate-900/50 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 transition-all"
                placeholder="••••••••"
                aria-required="true"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 focus:outline-none focus:text-gray-300 transition-colors"
                aria-label={showConfirmPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M14.12 14.12l1.415 1.415M14.12 14.12L15.536 15.536" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-400 outline-none"
            aria-busy={isLoading}
          >
            {isLoading ? 'Rejestracja...' : 'Zarejestruj się'}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          Masz już konto?{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-bold transition-colors focus:underline outline-none">
            Zaloguj się
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-b from-slate-950/40 via-blue-950/20 to-slate-950/40 relative overflow-hidden">
      {/* Decorative Stickers */}
      <div className="absolute inset-0 overflow-visible pointer-events-none">
        <div className="absolute top-20 left-5 w-32 h-32 sticker sticker-cyan opacity-45 md:flex hidden" />
        <div className="absolute bottom-40 right-10 w-24 h-24 sticker sticker-blue opacity-35 md:flex hidden" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-2xl mx-auto relative z-10"
      >
        <Suspense fallback={<div className="text-white text-center">Wczytywanie...</div>}>
          <RegisterForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
