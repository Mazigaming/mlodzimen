'use client';

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

export default function AboutPage() {
  const founders = [
    {
      name: 'Dominik Popek',
      role: 'Co-founder',
      bio: 'Pasjonat edukacji z bogatym doświadczeniem w tech branży',
      icon: '👨‍💼',
    },
    {
      name: 'Kuba',
      role: 'Co-founder',
      bio: 'Wizjoner, którego celem jest zmiana edukacji w Polsce',
      icon: '👨‍💼',
    },
  ];

  return (
    <div className="min-h-screen py-32 px-4 bg-gradient-to-b from-slate-950/40 via-blue-950/20 to-slate-950/40 relative overflow-hidden">
      {/* Decorative Stickers */}
      <div className="absolute inset-0 overflow-visible pointer-events-none">
        <div className="absolute top-40 left-5 w-32 h-32 sticker sticker-cyan opacity-45 md:flex hidden" />
        <div className="absolute bottom-40 right-10 w-24 h-24 sticker sticker-blue opacity-35 md:flex hidden" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto max-w-5xl relative z-10"
      >
        <motion.div variants={itemVariants} className="text-center mb-16 space-y-4">
          <span className="speech-bubble inline-block">
            O Nas 💡
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white">
            Poznaj <span className="text-gradient-warm">Nas</span>
          </h1>
          <p className="text-xl text-gray-400">
            Ludzi, którzy tworzą Młodych Mentorów
          </p>
        </motion.div>

        {/* Mission */}
        <motion.section
          variants={itemVariants}
          aria-labelledby="mission-title"
          className="rounded-2xl border border-slate-700/50 p-10 md:p-12 mb-16"
          style={{
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <h2 id="mission-title" className="text-3xl font-black text-white mb-6">Nasza Misja</h2>
          <div className="space-y-4 text-gray-400 text-lg leading-relaxed">
            <p>
              Wierzymy, że edukacja ma moc zmieniać światy. Młodzi Mentorzy to platforma, 
              gdzie doświadczenie spotyka się z ambicją, a wiedza staje się dostępna dla wszystkich.
            </p>
            <p>
              Naszym celem jest stworzenie społeczności, w której każdy może się rozwijać, 
              uczyć i zarabiać poprzez dzielenie się swoją wiedzą.
            </p>
          </div>
        </motion.section>

        {/* Founders */}
        <section aria-labelledby="founders-title" className="mb-20">
          <motion.div variants={itemVariants} className="mb-8">
            <h2 id="founders-title" className="text-3xl font-black text-white mb-8">Założyciele</h2>
          </motion.div>
          <motion.div variants={containerVariants} className="grid md:grid-cols-2 gap-8">
            {founders.map((founder) => (
              <motion.article
                key={founder.name}
                variants={itemVariants}
                whileHover={{ translateY: -4 }}
                className="rounded-2xl border border-slate-700/50 p-8 interactive-card"
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div className="text-7xl mb-6" aria-hidden="true">{founder.icon}</div>
                <h3 className="text-2xl font-black text-white mb-2">{founder.name}</h3>
                <p className="text-blue-400 font-bold mb-4">{founder.role}</p>
                <p className="text-gray-400 text-lg">{founder.bio}</p>
              </motion.article>
            ))}
          </motion.div>
        </section>

        {/* Values */}
        <motion.section 
          variants={itemVariants} 
          aria-labelledby="values-title"
          className="mt-20"
        >
          <h2 id="values-title" className="text-3xl font-bold text-white mb-12 text-center md:text-left">Nasze Wartości</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Transparentność',
                description: 'Uczciwość i klarowność we wszystkim, co robimy',
                icon: '🔍',
              },
              {
                title: 'Innowacja',
                description: 'Ciągle szukamy nowych sposobów na poprawę edukacji',
                icon: '💡',
              },
              {
                title: 'Wspólnota',
                description: 'Budujemy silną społeczność wspierającą się nawzajem',
                icon: '🤝',
              },
            ].map((value) => (
              <article key={value.title} className="text-center rounded-2xl border border-slate-700/50 p-6" style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(10px)' }}>
                <div className="text-5xl mb-4" aria-hidden="true">{value.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{value.title}</h3>
                <p className="text-gray-400">{value.description}</p>
              </article>
            ))}
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}
