'use client';

import { motion } from 'framer-motion';
import { useState, FormEvent, useEffect } from 'react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function MentoringPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setIsAuthenticated(true);
          setUserRole(data.user.role);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!isAuthenticated || userRole !== 'mentor') {
      alert('Tylko mentorzy mogą wysyłać wnioski o mentora.');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const response = await fetch('/api/mentor/application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          specialization: 'General', // Default value since field removed
          experience: 0, // Default value since field removed
          aboutYou: formData.get('aboutYou'),
          aboutCourse: formData.get('aboutCourse'),
        }),
      });

      if (response.ok) {
        alert('Dziękujemy! Twoja aplikacja została wysłana. Wkrótce się z Tobą skontaktujemy!');
      } else {
        const error = await response.json();
        alert(error.error || 'Wystąpił błąd podczas wysyłania aplikacji.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Wystąpił błąd podczas wysyłania aplikacji.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen py-32 px-4 bg-gradient-to-br from-slate-950/50 via-blue-950/25 to-slate-950/50 relative overflow-hidden">
      {/* Decorative Stickers */}
      <div className="absolute inset-0 overflow-visible pointer-events-none">
        <div className="absolute top-32 right-5 w-28 h-28 sticker sticker-pink opacity-35 md:flex hidden" />
        <div className="absolute bottom-32 left-10 w-24 h-24 sticker sticker-blue opacity-40 md:flex hidden" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto max-w-3xl relative z-10"
      >
        <motion.div variants={itemVariants} className="text-center mb-16 space-y-4">
          <span className="speech-bubble inline-block">
            Zostań Mentorem 🎓
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white">
            Dziel się <span className="text-gradient-warm">Wiedzą</span>
          </h1>
        </motion.div>

        {/* Benefits */}
        <motion.div variants={containerVariants} className="grid md:grid-cols-2 gap-6 mb-16">
          {[
            {
              title: 'Buduj Reputację',
              description: 'Bądź ekspertem w swojej dziedzinie',
              icon: '⭐',
            },
            {
              title: 'Zarabiaj pasywnie i na uczciwej stawce',
              description: 'Twoje kursy mogą zarabiać dla Ciebie 24/7. Dostajesz między 70% a 85% od sprzedaży!',
              icon: '💰',
            },
            {
              title: 'Wypłacaj kiedy chcesz',
              description: 'Wysyłamy pieniądze do 48h roboczych.',
              icon: '⏰',
            },
            {
              title: 'Dedykowane Wsparcie',
              description: 'Pomoc naszego zespołu na każdym kroku',
              icon: '🤝',
            },
          ].map((benefit) => (
            <motion.div
              key={benefit.title}
              variants={itemVariants}
              whileHover={{ translateY: -4 }}
              className="rounded-2xl border border-slate-700/50 p-6 interactive-card"
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div className="text-5xl mb-4">{benefit.icon}</div>
              <h3 className="text-xl font-black text-white mb-2">{benefit.title}</h3>
              <p className="text-gray-400">{benefit.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Application Form */}
        <motion.div
          variants={itemVariants}
          className="rounded-3xl border border-slate-700/50 p-10"
          style={{
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <h2 className="text-3xl font-black text-white mb-8">Aplikuj Teraz</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">
                O Tobie
              </label>
              <textarea
                name="aboutYou"
                placeholder="Opowiedz nam o sobie i dlaczego chcesz być mentorem"
                rows={4}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 transition-all resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">
                O Twoim Kursie
              </label>
              <textarea
                name="aboutCourse"
                placeholder="Plan na twój kurs"
                rows={4}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 transition-all resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Wysyłanie...' : 'Wyślij Aplikację'}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
