'use client';

import { motion } from 'framer-motion';
import { useState, FormEvent } from 'react';

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

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      alert('Dziękujemy! Twoja aplikacja została wysłana. Wkrótce się z Tobą skontaktujemy!');
    }, 2000);
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
          <p className="text-xl text-gray-400">
            Podziel się swoją wiedzą i zarabiaj nauczając innych
          </p>
        </motion.div>

        {/* Benefits */}
        <motion.div variants={containerVariants} className="grid md:grid-cols-2 gap-6 mb-16">
          {[
            {
              title: 'Elastyczne Harmonogramy',
              description: 'Udzielaj lekcji w swoim własnym tempie',
              icon: '⏰',
            },
            {
              title: 'Zarabiaj Pasywnie',
              description: 'Twoje kursy mogą zarabiać dla Ciebie 24/7',
              icon: '💰',
            },
            {
              title: 'Buduj Reputację',
              description: 'Bądź ekspertem w swojej dziedzinie',
              icon: '⭐',
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
                Dziedzina specjalizacji
              </label>
              <input
                type="text"
                placeholder="np. Python, Web Development, itp."
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">
                Lata doświadczenia
              </label>
              <input
                type="number"
                placeholder="np. 3"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">
                O Tobie
              </label>
              <textarea
                placeholder="Opowiedz nam o sobie i dlaczego chcesz być mentorem"
                rows={4}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 transition-all resize-none"
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
