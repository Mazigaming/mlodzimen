'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { marked } from 'marked';

export default function CourseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  async function fetchCourse() {
    try {
      // Fetch user session
      const userRes = await fetch('/api/auth/me', { credentials: 'include' });
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.user);
      }

      // Fetch course
      const res = await fetch(`/api/courses/${id}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setCourse(data.course);
        setHasAccess(data.hasAccess);
        if (data.hasAccess && data.course.modules?.[0]?.lessons?.[0]) {
          setActiveLesson(data.course.modules[0].lessons[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleEnroll() {
    setIsEnrolling(true);
    setCouponError('');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: id, couponCode })
      });
      
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        if (data.error) setCouponError(data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsEnrolling(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-2xl font-black">404: Kurs nie odnaleziony</div>;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-slate-950 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-blue-600/5 to-transparent pointer-events-none" />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="flex justify-between items-center mb-8">
          <Link href="/kursy" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-all font-black text-xs uppercase tracking-widest group">
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Galeria Kursów
          </Link>

          {/* Edit button for course owner or admin */}
          {user && course && (user.id === course.mentorId || user.role === 'admin' || user.email === 'admin@admin.com') && (
            <button
              onClick={() => router.push(`/dashboard/edit-course/${id}`)}
              className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
            >
              ✏️ Edytuj Kurs
            </button>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {hasAccess && activeLesson ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Video Player Placeholder */}
                <div className="aspect-video bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden relative group">
                  <iframe
                    className="w-full h-full"
                    src={activeLesson.videoUrl?.replace('watch?v=', 'embed/') || 'https://www.youtube.com/embed/dQw4w9WgXcQ'}
                    title={activeLesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div>
                  <h1 className="text-4xl font-black text-white mb-2">{activeLesson.title}</h1>
                  {activeLesson.description ? (
                    <div
                      className="text-gray-400 leading-relaxed prose prose-sm prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: marked.parse(activeLesson.description) as string }}
                    />
                  ) : (
                    <p className="text-gray-500 italic">Brak opisu dla tej lekcji.</p>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="space-y-8">
                <header className="space-y-6">
                  <div className="text-6xl mb-4">📚</div>
                  <h1 className="text-5xl md:text-7xl font-black text-white leading-tight">
                    {course.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-lg overflow-hidden">
                        {course.mentor.avatar && (typeof course.mentor.avatar === 'string' && (course.mentor.avatar.startsWith('http') || course.mentor.avatar.startsWith('/'))) ? (
                          <img src={course.mentor.avatar} alt={course.mentor.name} className="w-full h-full object-cover" />
                        ) : (
                          course.mentor.avatar || '👤'
                        )}
                      </div>
                      <div className="text-gray-400"><span className="text-xs uppercase font-black block text-gray-600">Mentor</span>{course.mentor.name}</div>
                    </div>
                    <div className="h-10 w-px bg-slate-800" />
                    <div><span className="text-xs uppercase font-black block text-gray-600">Kategoria</span><span className="text-white font-bold">{course.category}</span></div>
                    <div className="h-10 w-px bg-slate-800" />
                    <div><span className="text-xs uppercase font-black block text-gray-600">Poziom</span><span className="text-white font-bold">{course.level}</span></div>
                  </div>
                </header>

                <div className="prose prose-invert prose-blue max-w-none text-xl leading-relaxed text-gray-400">
                  {course.description}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {!hasAccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-dark rounded-3xl border border-blue-500/30 p-8 shadow-2xl shadow-blue-500/10 sticky top-24"
              >
                <div className="text-center space-y-4 mb-8">
                  <div className="text-5xl font-black text-white">{course.price} PLN</div>
                  <p className="text-gray-500 text-sm font-bold">Dożywotni dostęp do wszystkich materiałów</p>
                </div>

                <div className="mb-6 space-y-3">
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Masz kod zniżkowy?</label>
                  <input 
                    type="text" 
                    placeholder="Wpisz kod tutaj..."
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm font-bold focus:border-blue-500 focus:outline-none transition-all"
                  />
                  {couponError && <p className="text-red-500 text-[10px] font-bold px-1">{couponError}</p>}
                </div>
                
                <button 
                  onClick={handleEnroll}
                  disabled={isEnrolling}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-600/30 hover:bg-blue-500 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                  aria-busy={isEnrolling}
                >
                  {isEnrolling ? 'TRWA PRZETWARZANIE...' : 'ZAPISZ SIĘ TERAZ 🚀'}
                </button>
                
                <div className="mt-8 space-y-4 pt-6 border-t border-slate-800">
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <span className="text-blue-400">✔</span> {course.modules.length} Kompleksowych Modułów
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <span className="text-blue-400">✔</span> Dostęp na telefonie i komputerze
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <span className="text-blue-400">✔</span> Certyfikat ukończenia kursu
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="glass-dark rounded-3xl border border-slate-800 p-6 sticky top-24 space-y-6">
                <h3 className="text-xl font-black text-white flex items-center gap-2 px-2">
                  <span>📂</span> Program Kursu
                </h3>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                  {course.modules.map((m: any, mIdx: number) => (
                    <div key={m.id} className="space-y-2">
                      <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-2">{mIdx + 1}. {m.title}</div>
                      <div className="space-y-1">
                        {m.lessons.map((l: any) => (
                          <button
                            key={l.id}
                            onClick={() => setActiveLesson(l)}
                            className={`w-full text-left p-3 rounded-xl text-sm transition-all flex items-center gap-3 ${
                              activeLesson?.id === l.id 
                                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                                : 'text-gray-500 hover:bg-slate-800/50 hover:text-gray-300'
                            }`}
                          >
                            <span className="text-lg opacity-50">{activeLesson?.id === l.id ? '▶' : '○'}</span>
                            <span className="font-bold">{l.title}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
