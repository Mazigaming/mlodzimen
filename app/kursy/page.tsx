'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
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

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  mentor: {
    name: string;
    avatar: string | null;
  };
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await fetch('/api/courses', {
          method: 'POST',
        });
        if (response.ok) {
          const data = await response.json();
          setCourses(data.courses || []);
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen py-32 px-4 bg-gradient-to-b from-slate-950/30 via-blue-950/30 to-slate-950/30 relative overflow-hidden">
      {/* Decorative Stickers */}
      <div className="absolute inset-0 overflow-visible pointer-events-none">
        <div className="absolute top-20 left-5 w-24 h-24 sticker sticker-blue opacity-40 md:flex hidden" aria-hidden="true" />
        <div className="absolute bottom-40 right-10 w-20 h-20 sticker sticker-cyan opacity-50 md:flex hidden" aria-hidden="true" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto max-w-7xl relative z-10"
      >
        <motion.div variants={itemVariants} className="text-center mb-16 space-y-4">
          <span className="speech-bubble inline-block" role="status">
            Nasze Kursy 📚
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white">
            Odkryj <span className="text-gradient-warm">Wiedzę</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Bogatą kolekcję kursów od doświadczonych mentorów czeka na Ciebie
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div variants={itemVariants} className="mb-12 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <label htmlFor="search-courses" className="sr-only">Szukaj kursu</label>
            <input
              id="search-courses"
              type="text"
              placeholder="Szukaj kursu po tytule lub kategorii..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder-gray-500 transition-all"
            />
          </div>
        </motion.div>

        {/* Courses Grid */}
        {loading ? (
          <div className="text-center text-white py-20 text-xl" aria-live="polite">Ładowanie dostępnych kursów...</div>
        ) : (
          <motion.div variants={containerVariants} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4" role="list">
            {filteredCourses.map((course) => (
              <motion.article
                key={course.id}
                variants={itemVariants}
                whileHover={{ translateY: -8 }}
                className="rounded-2xl border border-slate-700/50 overflow-hidden interactive-card flex flex-col h-full w-full"
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  backdropFilter: 'blur(10px)',
                }}
                role="listitem"
              >
                <div className="bg-gradient-to-br from-blue-600/30 to-cyan-600/30 p-8 text-center text-6xl border-b border-slate-700/50" aria-hidden="true">
                  {course.category === 'python' ? '🐍' : '📚'}
                </div>
                <div className="p-6 space-y-4 flex flex-col flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-lg overflow-hidden shrink-0">
                      {course.mentor.avatar && (typeof course.mentor.avatar === 'string' && (course.mentor.avatar.startsWith('http') || course.mentor.avatar.startsWith('/'))) ? (
                        <img src={course.mentor.avatar} alt={course.mentor.name} className="w-full h-full object-cover" />
                      ) : (
                        course.mentor.avatar || '👤'
                      )}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base md:text-lg font-bold text-white mb-1 break-words w-full">{course.title}</h2>
                      <p className="text-gray-500 text-xs md:text-sm break-words">od {course.mentor.name}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-4 border-y border-slate-700/50 mt-auto">
                    <span className="font-bold text-lg text-blue-400">
                      {course.price} zł
                    </span>
                    <span className="text-cyan-400 text-xs uppercase font-bold tracking-wider">{course.category}</span>
                  </div>
                  <Link 
                    href={`/kursy/${course.id}`} 
                    className="w-full btn btn-primary text-center block focus:ring-2 focus:ring-cyan-400 outline-none"
                    aria-label={`Wyświetl kurs: ${course.title}`}
                  >
                    Wyświetl Kurs
                  </Link>
                </div>
              </motion.article>
            ))}
            {!loading && filteredCourses.length === 0 && (
              <div className="col-span-full text-center py-20 text-gray-500 bg-slate-900/20 rounded-2xl border border-dashed border-slate-800">
                Nie znaleziono kursów spełniających kryteria.
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
