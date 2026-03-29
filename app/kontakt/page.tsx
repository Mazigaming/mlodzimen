'use client';

import { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';

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

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  }

  return (
    <div className="min-h-screen py-32 px-4 bg-gradient-to-b from-slate-950/30 via-blue-950/30 to-slate-950/30 relative overflow-hidden">
      {/* Decorative Stickers */}
      <div className="absolute inset-0 overflow-visible pointer-events-none">
        <div className="absolute top-20 left-10 w-24 h-24 sticker sticker-pink opacity-30 md:flex hidden" />
        <div className="absolute bottom-40 right-5 w-28 h-28 sticker sticker-cyan opacity-40 md:flex hidden" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto max-w-5xl relative z-10"
      >
        <motion.div variants={itemVariants} className="text-center mb-16 space-y-4">
          <span className="speech-bubble inline-block">
            Skontaktuj się 💬
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white">
            <span className="text-gradient-warm">Pytania?</span> Jesteśmy tu!
          </h1>
        </motion.div>

        <motion.div variants={containerVariants} className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-black text-white mb-8">Informacje Kontaktowe</h2>

            <div className="space-y-6">
              {[
                {
                  icon: '📧',
                  title: 'Email',
                  content: 'contact@mlodzimentorzy.pl',
                },
                {
                  icon: '📞',
                  title: 'Telefon',
                  content: '+48 XXX XXX XXX',
                },
                {
                  icon: '📍',
                  title: 'Adres',
                  content: 'ul. Przykładowa 1, 00-001 Warszawa',
                },
                {
                  icon: '⏰',
                  title: 'Godziny',
                  content: 'Pn-Pt: 9:00-17:00',
                },
              ].map((item) => (
                <motion.div
                  key={item.title}
                  whileHover={{ x: 4 }}
                  className="flex gap-4 p-4 rounded-xl border border-slate-700/30 hover:border-slate-600/50 transition-all"
                >
                  <div className="text-4xl">{item.icon}</div>
                  <div>
                    <h3 className="font-bold text-white mb-1">{item.title}</h3>
                    <p className="text-gray-400">{item.content}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            variants={itemVariants}
            className="rounded-2xl border border-slate-700/50 p-8"
            style={{
              background: 'rgba(15, 23, 42, 0.8)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {isSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg mb-4"
              >
                Dziękujemy za wiadomość! Wkrótce się z Tobą skontaktujemy.
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">
                  Imię
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 transition-all"
                  placeholder="Jan Kowalski"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 transition-all"
                  placeholder="jan@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">
                  Temat
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 transition-all"
                  placeholder="Temat wiadomości"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wide">
                  Wiadomość
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 transition-all resize-none"
                  placeholder="Twoja wiadomość..."
                />
              </div>

              <button type="submit" className="w-full btn btn-primary py-3">
                Wyślij Wiadomość
              </button>
            </form>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
