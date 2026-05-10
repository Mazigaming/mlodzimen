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
  level: string;
  mentor: {
    name: string;
    avatar: string | null;
  };
  _count: {
    enrollments: number;
  };
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

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

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.mentor.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === '' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === '' || course.level === selectedLevel;

    return matchesSearch && matchesCategory && matchesLevel;
  });

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
            Cały czas dodajemy nowe treści 📚
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white">
            Nasze <span className="text-gradient-warm">Kursy</span>
          </h1>
        </motion.div>

        {/* Search and Filter */}
        <motion.div variants={itemVariants} className="mb-12 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <label htmlFor="search-courses" className="sr-only">Szukaj kursu</label>
            <input
              id="search-courses"
              type="text"
              placeholder="Szukaj kursu po tytule, kategorii lub mentorze..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder-gray-500 transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="category-filter" className="text-sm font-medium text-gray-300">Kategoria:</label>
              <select
                id="category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white text-sm"
              >
                <option value="">Wszystkie</option>
                <option value="web-development">Web Development</option>
                <option value="design">Design</option>
                <option value="business">Biznes</option>
                <option value="mobile">Mobile</option>
                <option value="python">Python</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="level-filter" className="text-sm font-medium text-gray-300">Poziom:</label>
              <select
                id="level-filter"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white text-sm"
              >
                <option value="">Wszystkie</option>
                <option value="beginner">Junior</option>
                <option value="intermediate">Mid</option>
                <option value="advanced">Senior</option>
              </select>
            </div>

            {(searchTerm || selectedCategory || selectedLevel) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setSelectedLevel('');
                }}
                className="px-4 py-2 bg-red-600/20 border border-red-500/30 rounded-lg hover:bg-red-600/30 text-red-400 hover:text-red-300 transition-all text-sm font-medium"
              >
                Wyczyść filtry
              </button>
            )}
          </div>
        </motion.div>

        {/* Results Counter */}
        {!loading && (
          <motion.div variants={itemVariants} className="mb-8">
            <p className="text-gray-400 text-sm">
              Znaleziono <span className="text-white font-bold">{filteredCourses.length}</span> z <span className="text-white font-bold">{courses.length}</span> dostępnych kursów
            </p>
          </motion.div>
        )}

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
                  {course.category === 'python' ? '🐍' :
                   course.category === 'web-development' ? '💻' :
                   course.category === 'design' ? '🎨' :
                   course.category === 'business' ? '📈' :
                   course.category === 'mobile' ? '📱' : '📚'}
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
                     <div className="flex flex-col">
                       <span className="font-bold text-lg text-blue-400">
                         {course.price} zł
                       </span>
                       <span className="text-xs text-gray-500">
                         👥 {course._count.enrollments} uczniów
                       </span>
                     </div>
                     <div className="flex flex-col items-end gap-1">
                       <span className={`text-xs uppercase font-bold tracking-wider px-2 py-1 rounded ${
                         course.level === 'beginner' ? 'bg-green-500/20 text-green-400' :
                         course.level === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                         'bg-red-500/20 text-red-400'
                       }`}>
                         {course.level === 'beginner' ? 'Junior' :
                          course.level === 'intermediate' ? 'Mid' : 'Senior'}
                       </span>
                       <span className="text-cyan-400 text-xs uppercase font-bold tracking-wider">{course.category}</span>
                     </div>
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
