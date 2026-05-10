'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [mentorStats, setMentorStats] = useState<any>(null);
  const [mentorPayouts, setMentorPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    fetchSession();
    // Check for payment success
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      const courseId = urlParams.get('courseId');
      handlePaymentSuccess(courseId);
    }
  }, [router]);

  async function handlePaymentSuccess(courseId: string | null) {
    if (!courseId) return;

    try {
      // Try to create enrollment as fallback if webhook didn't work
      const response = await fetch('/api/checkout/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ courseId })
      });

      if (response.ok) {
        setPaymentSuccess(true);
      }
    } catch (error) {
      console.error('Payment verification failed:', error);
      // Still show success message even if verification fails
      setPaymentSuccess(true);
    }

    // Clear URL parameters after showing success message
    setTimeout(() => {
      router.replace('/dashboard');
    }, 5000);
  }

  async function fetchSession() {
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          fetchUserData();
        } else {
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }

  async function fetchUserData() {
    try {
      const response = await fetch('/api/courses/mentor', {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
        setMentorStats(data.stats);
        setMentorPayouts(data.payouts || []);
      }
    } catch (err) {
      console.error('Error fetching mentor data:', err);
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    router.push('/');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-white text-xl animate-pulse">Wczytywanie...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen py-24 px-4 bg-gradient-to-br from-slate-950/50 via-blue-950/25 to-slate-950/50 relative overflow-hidden">
      {/* Decorative Stickers */}
      <div className="absolute inset-0 overflow-visible pointer-events-none">
        <div className="absolute top-32 right-5 w-28 h-28 sticker sticker-pink opacity-35 md:flex hidden" />
        <div className="absolute bottom-32 left-10 w-24 h-24 sticker sticker-blue opacity-40 md:flex hidden" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto max-w-6xl relative z-10"
      >
        {/* Payment Success Message */}
        {paymentSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            role="alert"
            aria-live="polite"
            className="mb-8 p-6 bg-green-500/20 border border-green-500/50 text-green-200 rounded-2xl flex items-center gap-4"
          >
            <div className="text-3xl">✅</div>
            <div>
              <h3 className="font-black text-lg text-green-200 mb-1">Płatność zakończona pomyślnie!</h3>
              <p className="text-green-300/80">Zostałeś zapisany na kurs. Możesz teraz rozpocząć naukę.</p>
            </div>
          </motion.div>
        )}

        {/* Header */}
        <motion.div variants={itemVariants} className="flex justify-between items-start mb-16">
          <div>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-2">
              Dashboard
            </h1>
            <p className="text-xl text-gray-400">
              Witaj, {user.email} ({user.role === 'mentor' ? 'Mentor' : user.role === 'admin' ? 'Administrator' : 'Uczeń'})
            </p>
            <div className="flex gap-4 mt-4">
              <Link href="/dashboard/profile" className="text-cyan-400 hover:text-cyan-300 font-bold text-sm flex items-center gap-1 transition-all">
                ⚙️ Ustawienia Profilu
              </Link>
              {(user.email === 'admin@admin.com' || user.role === 'admin') && (
                <Link href="/dashboard/admin" className="text-purple-400 hover:text-purple-300 font-bold text-sm flex items-center gap-1 transition-all">
                  🛡️ Panel Administratora
                </Link>
              )}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-outline focus:ring-2 focus:ring-red-500 outline-none"
            aria-label="Wyloguj się z systemu"
          >
            Wyloguj się
          </button>
        </motion.div>

        {/* Dashboard Content */}
        {user.role === 'mentor' || user.role === 'admin' ? (
          <motion.div variants={containerVariants} className="space-y-12">
            {/* Mentor Actions */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-4 mb-8">
              <Link href="/dashboard/create-course" className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all flex items-center gap-2">
                <span>➕</span> Stwórz Nowy Kurs
              </Link>
              <Link href="/dashboard/admin/articles" className="px-8 py-4 bg-slate-800 text-white rounded-2xl font-black border border-slate-700 hover:bg-slate-700 transition-all flex items-center gap-2">
                <span>📝</span> Moje Artykuły
              </Link>
            </motion.div>

            {/* Earnings Stats */}
            {mentorStats && mentorStats.netRevenue > 0 && (
              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  ...(mentorStats.grossRevenue > 0 ? [
                    { label: 'Przychód Brutto', value: `${(mentorStats.grossRevenue || 0).toFixed(2)} PLN`, icon: '💰', color: 'from-blue-600/20 to-indigo-600/20' },
                    { label: 'Opłata (25%)', value: `${((mentorStats.grossRevenue || 0) * 0.25).toFixed(2)} PLN`, icon: '🏢', color: 'from-slate-600/20 to-slate-700/20' },
                    { label: 'Aktywni Uczniowie', value: mentorStats.totalEnrollments, icon: '👥', color: 'from-purple-600/20 to-pink-600/20' }
                  ] : []),
                  { label: 'Twoje Zarobki', value: `${(mentorStats.netRevenue || 0).toFixed(2)} PLN`, icon: '💎', color: 'from-green-600/20 to-emerald-600/20' },
                ].map((stat, i) => (
                  <div key={i} className={`p-8 rounded-3xl border border-slate-700/50 bg-gradient-to-br ${stat.color} backdrop-blur-xl group hover:scale-[1.02] transition-all`}>
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{stat.icon}</div>
                    <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                    <div className="text-xs font-black text-gray-500 uppercase tracking-widest">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-3">
                <span>🎓</span> Moje Kursy ({courses.length})
              </h2>
              {courses.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      className="group rounded-3xl border border-slate-700/50 p-8 glass-dark hover:border-blue-500/50 transition-all"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="text-5xl group-hover:scale-110 transition-transform">📚</div>
                        <div className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-wider">
                          {course.category}
                        </div>
                      </div>
                      <h3 className="text-xl font-black text-white mb-3 line-clamp-1">{course.title}</h3>
                      <p className="text-gray-500 mb-6 text-sm line-clamp-2">{course.description}</p>
                      
                       <div className="flex items-center justify-between pt-6 border-t border-slate-800">
                         <div className="text-xs font-bold text-gray-400">
                           <span className="text-white">{course._count.enrollments}</span> kursantów
                         </div>
                         <div className="flex gap-3">
                           <Link
                             href={`/kursy/${course.id}`}
                             className="text-sm font-black text-blue-400 hover:text-white transition-colors"
                           >
                             ZARZĄDZAJ →
                           </Link>
                           <Link
                             href={`/dashboard/edit-course/${course.id}`}
                             className="text-sm font-black text-cyan-400 hover:text-white transition-colors"
                           >
                             ✏️ EDYTUJ
                           </Link>
                         </div>
                       </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-800 p-12 text-center bg-slate-900/20">
                  <p className="text-gray-500 mb-8">Nie opublikowałeś jeszcze żadnego kursu.</p>
                  <Link href="/dashboard/create-course" className="btn btn-primary">
                    Stwórz swój pierwszy kurs 🚀
                  </Link>
                </div>
              )}
            </motion.div>

            {mentorPayouts.length > 0 && (
              <motion.div variants={itemVariants} className="space-y-6">
                <h2 className="text-3xl font-black text-white flex items-center gap-3">
                  <span>💸</span> Historia Wypłat
                </h2>
                <div className="glass-dark rounded-3xl border border-slate-700/50 overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-900/80 text-gray-500 text-[10px] uppercase tracking-widest font-black">
                        <th className="p-6">Kwota</th>
                        <th className="p-6">Status</th>
                        <th className="p-6">Data</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-300">
                      {mentorPayouts.map((p: any) => (
                        <tr key={p.id} className="border-b border-slate-800/50">
                          <td className="p-6 font-black text-white text-lg">{p.amount.toFixed(2)} PLN</td>
                          <td className="p-6">
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                              p.status === 'paid' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                              p.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                              'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                              {p.status === 'paid' ? 'Wypłacono' : p.status === 'pending' ? 'Oczekuje' : 'Odrzucono'}
                            </span>
                          </td>
                          <td className="p-6 text-sm text-gray-500">{new Date(p.createdAt).toLocaleDateString('pl-PL')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div variants={containerVariants} className="space-y-12">
            {/* User Stats */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Zapisane Kursy', value: user.enrollments?.length || 0, icon: '📚', color: 'from-blue-600/20 to-indigo-600/20' },
                { label: 'Łączny Postęp', value: '0%', icon: '📈', color: 'from-green-600/20 to-emerald-600/20' },
                { label: 'Ukończone Lekcje', value: 0, icon: '✅', color: 'from-purple-600/20 to-pink-600/20' },
                { label: 'Certyfikaty', value: 0, icon: '🏆', color: 'from-orange-600/20 to-red-600/20' },
              ].map((stat, i) => (
                <div key={i} className={`p-8 rounded-3xl border border-slate-700/50 bg-gradient-to-br ${stat.color} backdrop-blur-xl group hover:scale-[1.02] transition-all`}>
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{stat.icon}</div>
                  <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                  <div className="text-xs font-black text-gray-500 uppercase tracking-widest">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            {/* Earnings Stats for coupon creators */}
            {mentorStats && mentorStats.netRevenue > 0 && (
              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <div className={`p-8 rounded-3xl border border-slate-700/50 bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-xl group hover:scale-[1.02] transition-all`}>
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">💎</div>
                  <div className="text-3xl font-black text-white mb-1">{mentorStats.netRevenue.toFixed(2)} PLN</div>
                  <div className="text-xs font-black text-gray-500 uppercase tracking-widest">Twoje Zarobki</div>
                </div>
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-3">
                <span>📚</span> Moje Kursy
              </h2>
              {user.enrollments && user.enrollments.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {user.enrollments.map((enrollment: any) => (
                    <div
                      key={enrollment.id}
                      className="group rounded-3xl border border-slate-700/50 p-8 glass-dark hover:border-cyan-500/50 transition-all"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="text-5xl group-hover:scale-110 transition-transform">📘</div>
                        <div className="px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 text-[10px] font-black uppercase tracking-wider">
                          {enrollment.course.level}
                        </div>
                      </div>
                      <h3 className="text-xl font-black text-white mb-2 line-clamp-1">{enrollment.course.title}</h3>
                      <p className="text-gray-500 mb-6 text-xs italic">Mentor: {enrollment.course.mentor.name}</p>
                      
                      <div className="space-y-4">
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-cyan-500 h-full rounded-full w-0" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">0% ukończono</span>
                         <div className="flex gap-2">
                           <Link
                             href={`/kursy/${enrollment.course.id}`}
                             className="text-sm font-black text-blue-400 hover:text-white transition-colors"
                           >
                             KONTYNUUJ →
                           </Link>
                           {user.role === 'mentor' && user.id === enrollment.course.mentorId && (
                             <Link
                               href={`/dashboard/edit-course/${enrollment.course.id}`}
                               className="text-sm font-black text-cyan-400 hover:text-white transition-colors"
                             >
                               ✏️ EDYTUJ
                             </Link>
                           )}
                         </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-800 p-16 text-center bg-slate-900/20">
                  <div className="text-6xl mb-6">🚀</div>
                  <h3 className="text-2xl font-black text-white mb-2">Czas zacząć naukę!</h3>
                  <p className="text-gray-500 mb-8 max-w-sm mx-auto">Przeglądaj naszą ofertę i wybierz kurs, który pomoże Ci rozwinąć skrzydła.</p>
                  <Link href="/kursy" className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all inline-block">
                    Przeglądaj Kursy
                  </Link>
                </div>
              )}
            </motion.div>

            {/* CTA */}            
            <motion.div variants={itemVariants}>
              <div
                className="rounded-2xl border border-slate-700/50 p-12 text-center"
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <h3 className="text-2xl font-black text-white mb-3">Zainteresowany Nauczaniem?</h3>
                <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                  Zostań mentorem i zarabiaj dzieląc się swoją wiedzą
                </p>
                <Link href="/mentoring" className="btn btn-secondary">
                  Dowiedz Się Więcej
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
