'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

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

export default function PartnersPage() {
  const partners = [
    { name: 'Future Code', description: 'Wsparcie technologiczne i staże dla najlepszych kursantów.', icon: '💻' },
    { name: 'Creative Minds', description: 'Partner w obszarze designu i kreatywności.', icon: '🎨' },
    { name: 'EduVentures', description: 'Fundusz wspierający innowacje w edukacji.', icon: '🚀' },
    { name: 'TechHub PL', description: 'Inkubator dla młodych talentów IT.', icon: '🏢' },
  ];

  return (
    <div className="min-h-screen py-32 px-4 bg-slate-950 relative">
      {/* Decorative Stickers */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-5 w-32 h-32 sticker sticker-blue opacity-20 rotate-12 md:flex hidden" aria-hidden="true" />
        <div className="absolute bottom-40 right-10 w-28 h-28 sticker sticker-cyan opacity-25 -rotate-6 md:flex hidden" aria-hidden="true" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto max-w-6xl relative z-10"
      >
        <motion.div variants={itemVariants} className="text-center mb-32 space-y-6">
          <span className="speech-bubble inline-block" role="status">
            Partnerzy 🤝
          </span>
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter">
            Budujemy <span className="text-gradient-warm">Przyszłość</span> Razem
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto font-medium">
            Współpracujemy z liderami branży, aby dostarczać najlepsze możliwości rozwoju dla naszych uczniów.
          </p>
        </motion.div>

        <motion.div 
            variants={containerVariants} 
            className="grid md:grid-cols-2 gap-12 mb-32" 
            role="list"
            aria-label="Lista naszych partnerów"
        >
          {partners.map((partner) => (
            <motion.div
              key={partner.name}
              variants={itemVariants}
              whileHover={{ translateY: -8, scale: 1.02 }}
              className="rounded-3xl border border-slate-800 p-10 flex items-center gap-8 interactive-card group"
              style={{
                background: 'rgba(15, 23, 42, 0.4)',
                backdropFilter: 'blur(10px)',
              }}
              role="listitem"
            >
              <div className="text-6xl group-hover:scale-125 transition-transform duration-500" aria-hidden="true">
                {partner.icon}
              </div>
              <div>
                <h3 className="text-2xl font-black text-white mb-2 group-hover:text-blue-400 transition-colors">{partner.name}</h3>
                <p className="text-gray-400 leading-relaxed font-medium">{partner.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
            variants={itemVariants} 
            className="mt-32 text-center space-y-8 rounded-[3rem] border border-blue-500/30 p-12 md:p-16 shadow-2xl shadow-blue-500/5 relative overflow-hidden" 
            style={{ background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(20px)' }}
        >
          <div className="absolute top-0 right-0 p-8 text-6xl opacity-20" aria-hidden="true">🤝</div>
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">Chcesz Być Częścią <br/> Tej Misji?</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Dołącz do grona partnerów Młodych Mentorów i pomóż nam rewolucjonizować polski system edukacji.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/kontakt" className="btn btn-primary px-10 py-4 text-lg focus:ring-4 focus:ring-blue-500/20">
              Skontaktuj Się Z Nami
            </Link>
            <Link href="/o-nas" className="px-10 py-4 rounded-2xl border border-slate-700 text-white font-black hover:bg-slate-800 transition-all text-lg focus:ring-4 focus:ring-slate-500/20">
              Poznaj Naszą Wizję
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
