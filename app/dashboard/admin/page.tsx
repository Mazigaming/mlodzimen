'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [recentEnrollments, setRecentEnrollments] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'summary' | 'users' | 'articles' | 'courses' | 'coupons' | 'enrollments' | 'payouts' | 'settings'>('summary');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Settings state
  const [config, setConfig] = useState({
    siteName: 'Młodzi Mentorzy',
    contactEmail: 'kontakt@mlodzimentorzy.pl',
    maintenanceMode: false,
    bannerMessage: '',
    platformFee: 10,
    facebookUrl: '',
    instagramUrl: '',
    youtubeUrl: '',
    twitterUrl: ''
  });
  
  // Coupon form state
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'fixed' as 'fixed' | 'percent',
    discountValue: 0,
    maxUses: 0,
    expiresAt: '',
    isActive: true
  });
  
  // Article form state
  const [showArticleForm, setShowArticleForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [articleForm, setArticleForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    author: 'Administrator',
    image: '📖',
    slug: '',
    isPublished: true
  });

  useEffect(() => {
    checkAuth();
    // Open sidebar by default on desktop
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setSidebarOpen(true);
    }
    
    // Handle window resize to auto-open/close sidebar
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [activeTab, user]);

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.user && (data.user.role === 'admin' || data.user.email === 'admin@admin.com')) {
          setUser(data.user);
        } else {
          router.push('/dashboard');
        }
      } else {
        router.push('/login');
      }
    } catch {
      router.push('/login');
    }
  }

  async function fetchData() {
    setLoading(true);
    if (activeTab === 'summary') await fetchStats();
    else if (activeTab === 'users') await fetchUsers();
    else if (activeTab === 'articles') await fetchArticles();
    else if (activeTab === 'courses') await fetchCourses();
    else if (activeTab === 'coupons') await fetchCoupons();
    else if (activeTab === 'enrollments') await fetchEnrollments();
    else if (activeTab === 'payouts') await fetchPayouts();
    else if (activeTab === 'settings') await fetchConfig();
    setLoading(false);
  }

  async function fetchConfig() {
    try {
      const res = await fetch('/api/admin/config');
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setConfig({
            siteName: data.config.siteName,
            contactEmail: data.config.contactEmail,
            maintenanceMode: data.config.maintenanceMode,
            bannerMessage: data.config.bannerMessage || '',
            platformFee: data.config.platformFee || 10,
            facebookUrl: data.config.facebookUrl || '',
            instagramUrl: data.config.instagramUrl || '',
            youtubeUrl: data.config.youtubeUrl || '',
            twitterUrl: data.config.twitterUrl || ''
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchPayouts() {
    try {
      const res = await fetch('/api/admin/payouts');
      if (res.ok) {
        const data = await res.json();
        setPayouts(data.payouts);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchEnrollments() {
    try {
      const res = await fetch('/api/admin/enrollments');
      if (res.ok) {
        const data = await res.json();
        setEnrollments(data.enrollments);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function saveConfig(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        alert('Ustawienia zapisane pomyślnie!');
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function clearCache() {
    if (!confirm('Czy na pewnu chcesz wyczyścić cache? To może wymagać przeładowania strony.')) return;
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clearCache' })
      });
      if (res.ok) {
        alert('Cache wyczyszczony!');
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function exportData() {
    try {
      const res = await fetch('/api/admin/reports/csv');
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteEnrollment(id: string) {
    if (!confirm('Czy na pewno chcesz usunąć ten zapis? Użytkownik straci dostęp do kursu.')) return;
    try {
      const res = await fetch(`/api/admin/enrollments?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) fetchEnrollments();
    } catch (err) {
      console.error(err);
    }
  }

  async function generatePayouts() {
    if (!confirm('Czy chcesz przeliczyć i wygenerować nowe wypłaty dla mentorów?')) return;
    try {
      const res = await fetch('/api/admin/payouts', { method: 'POST' });
      if (res.ok) fetchPayouts();
    } catch (err) {
      console.error(err);
    }
  }

  async function updatePayoutStatus(id: string, status: string) {
    try {
      const res = await fetch('/api/admin/payouts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) fetchPayouts();
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchStats() {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setRecentEnrollments(data.recentEnrollments);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchCoupons() {
    try {
      const res = await fetch('/api/admin/coupons');
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCouponSubmit(e: React.FormEvent) {
    e.preventDefault();
    const method = editingCoupon ? 'PATCH' : 'POST';
    const payload = editingCoupon ? { ...couponForm, id: editingCoupon.id } : couponForm;

    try {
      const res = await fetch('/api/admin/coupons', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowCouponForm(false);
        setEditingCoupon(null);
        setCouponForm({
          code: '',
          discountType: 'fixed',
          discountValue: 0,
          maxUses: 0,
          expiresAt: '',
          isActive: true
        });
        fetchCoupons();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteCoupon(id: string) {
    if (!confirm('Czy na pewno chcesz usunąć ten kupon?')) return;
    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) fetchCoupons();
    } catch (err) {
      console.error(err);
    }
  }

  async function toggleCouponStatus(id: string, currentStatus: boolean) {
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentStatus })
      });
      if (res.ok) fetchCoupons();
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchUsers() {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchArticles() {
    try {
      const res = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list' })
      });
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchCourses() {
    try {
      const res = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list' })
      });
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function toggleVerification(userId: string, currentStatus: boolean) {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: !currentStatus })
      });
      if (res.ok) fetchUsers();
    } catch (err) {
      console.error(err);
    }
  }

  async function changeUserRole(userId: string, newRole: string) {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole })
      });
      if (res.ok) fetchUsers();
    } catch (err) {
      console.error(err);
    }
  }

  async function toggleCourseVerification(courseId: string, currentStatus: boolean) {
    try {
      const res = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', courseId, status: !currentStatus })
      });
      if (res.ok) fetchCourses();
    } catch (err) {
      console.error(err);
    }
  }

  // Strip style and script tags to prevent site breakage
  function sanitizeHtml(html: string) {
    return html
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<link[^>]*rel="stylesheet"[^>]*>/gi, '');
  }

  async function handleArticleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const action = editingArticle ? 'update' : 'create';
    const payload = editingArticle 
      ? { ...articleForm, id: editingArticle.id, action }
      : { ...articleForm, action };

    try {
      const res = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowArticleForm(false);
        setEditingArticle(null);
        setArticleForm({
          title: '',
          content: '',
          excerpt: '',
          author: user?.name || 'Administrator',
          image: '📖',
          slug: '',
          isPublished: true
        });
        fetchArticles();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteArticle(id: string) {
    if (!confirm('Czy na pewno chcesz usunąć ten artykuł?')) return;
    try {
      const res = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id })
      });
      if (res.ok) fetchArticles();
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteCourse(id: string) {
    if (!confirm('Czy na pewno chcesz usunąć ten kurs? Wszystkie dane i zapisy zostaną usunięte.')) return;
    try {
      const res = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id })
      });
      if (res.ok) fetchCourses();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
      {/* Desktop Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-all hidden lg:block"
        aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
        </svg>
      </button>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen w-72 bg-slate-900 border-r border-slate-800 z-40 flex flex-col p-6 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl`}>
        <div className="mb-12">
          <Link href="/" className="text-2xl font-black gradient-text tracking-tighter flex items-center gap-3">
            <span>🚀</span> MM Admin
          </Link>
        </div>

        <nav className="flex-grow space-y-1" aria-label="Główna nawigacja admina">
          {[
            { id: 'summary', label: 'Statystyki', icon: '📈' },
            { id: 'users', label: 'Użytkownicy', icon: '👥' },
            { id: 'courses', label: 'Kursy', icon: '📚' },
            { id: 'enrollments', label: 'Zapisy', icon: '🛒' },
            { id: 'payouts', label: 'Wypłaty', icon: '💸' },
            { id: 'articles', label: 'Artykuły', icon: '📝' },
            { id: 'coupons', label: 'Kupony', icon: '🎟️' },
            { id: 'settings', label: 'Ustawienia', icon: '⚙️' },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setSidebarOpen(false); }}
              aria-pressed={activeTab === tab.id}
              className={`w-full px-5 py-4 rounded-2xl text-sm font-black transition-all flex items-center gap-4 group ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' 
                  : 'text-gray-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="text-xl group-hover:scale-110 transition-transform" aria-hidden="true">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800">
          <Link href="/dashboard" className="flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-black text-gray-400 hover:text-white hover:bg-slate-800 transition-all">
            <span>←</span> Panel Użytkownika
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`min-h-screen relative transition-all duration-300 ${sidebarOpen ? 'lg:ml-72 lg:w-[calc(100%-18rem)]' : 'lg:ml-0 lg:w-full'}`}>
        {/* Mobile Header/Nav */}
        <header className="lg:hidden sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 p-4">
          <div className="flex justify-between items-center mb-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg bg-slate-800 text-white"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
            <Link href="/" className="text-xl font-black gradient-text">🚀 MM Admin</Link>
            <Link href="/dashboard" className="text-xs font-bold text-gray-400">Panel 👤</Link>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar" aria-label="Nawigacja mobilna">
            {[
              { id: 'summary', label: 'Stats', icon: '📈' },
              { id: 'users', label: 'Users', icon: '👥' },
              { id: 'courses', label: 'Courses', icon: '📚' },
              { id: 'payouts', label: 'Payouts', icon: '💸' },
              { id: 'settings', label: 'Config', icon: '⚙️' },
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap flex items-center gap-2 ${
                  activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-slate-800 text-gray-400'
                }`}
              >
                <span aria-hidden="true">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="p-4 md:p-8 lg:p-12 max-w-[1600px] mx-auto overflow-x-hidden">
          <div className="mb-12 hidden lg:block">
            <h1 className="text-5xl font-black text-white mb-2 tracking-tight">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
            <p className="text-lg text-gray-400 font-medium">Zarządzaj swoją platformą edukacyjną</p>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-32 flex flex-col items-center justify-center gap-4"
              >
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 font-black uppercase tracking-widest text-xs animate-pulse">Syncing Data...</p>
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'summary' && stats && (
                  <div className="space-y-12">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                      {[
                        { label: 'Przychód Brutto', value: `${(stats?.totalRevenue || 0).toFixed(2)} PLN`, icon: '💰', color: 'bg-green-600/10 text-green-400 border-green-500/20' },
                        { label: 'Zysk Platformy (10%)', value: `${(stats?.platformRevenue || 0).toFixed(2)} PLN`, icon: '🏢', color: 'bg-blue-600/10 text-blue-400 border-blue-500/20' },
                        { label: 'Dla Mentorów (90%)', value: `${(stats?.mentorsRevenue || 0).toFixed(2)} PLN`, icon: '👨‍🏫', color: 'bg-orange-600/10 text-orange-400 border-orange-500/20' },
                        { label: 'Użytkownicy', value: stats?.userCount || 0, icon: '🎓', color: 'bg-purple-600/10 text-purple-400 border-purple-500/20' },
                      ].map((stat, i) => (
                        <div key={i} className={`p-4 md:p-6 rounded-xl border ${stat.color} backdrop-blur-xl relative group hover:scale-[1.02] transition-all duration-300 shadow-xl shadow-black/20`}>
                          <div className="relative z-10">
                            <div className="text-[10px] md:text-xs font-black uppercase tracking-widest opacity-60 mb-1">{stat.label}</div>
                            <div className="text-xl md:text-2xl font-black tracking-tight">{stat.value}</div>
                          </div>
                          <div className="absolute right-4 bottom-4 text-7xl opacity-10 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500" aria-hidden="true">{stat.icon}</div>
                        </div>
                      ))}
                    </div>

                    {/* Secondary Stats */}
                    <div className="grid lg:grid-cols-3 gap-8">
                      <section className="lg:col-span-2 glass-dark rounded-[2.5rem] border border-slate-800 p-8 shadow-2xl" aria-labelledby="recent-enrollments-title">
                        <div className="flex justify-between items-center mb-8">
                          <h2 id="recent-enrollments-title" className="text-2xl font-black text-white flex items-center gap-3">
                            <span aria-hidden="true">⚡</span> Ostatnie Zapisy
                          </h2>
                          <a 
                            href="/api/admin/reports/csv" 
                            download 
                            className="text-[10px] font-black uppercase tracking-widest bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl hover:bg-slate-700 transition-colors"
                          >
                            Export CSV
                          </a>
                        </div>
                        <div className="overflow-x-auto -mx-8 px-8">
                          <table className="w-full text-left min-w-[600px]">
                            <thead>
                              <tr className="text-gray-500 text-[10px] uppercase tracking-widest font-black border-b border-slate-800">
                                <th className="pb-6">Użytkownik</th>
                                <th className="pb-6">Kurs</th>
                                <th className="pb-6 text-right">Kwota</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                              {recentEnrollments.map((e: any) => (
                                <tr key={e.id} className="hover:bg-blue-500/5 transition-colors group">
                                  <td className="py-6 pr-4">
                                    <div className="font-bold text-white group-hover:text-blue-400 transition-colors">{e.user.name}</div>
                                    <div className="text-xs text-gray-500">{e.user.email}</div>
                                  </td>
                                  <td className="py-6 pr-4">
                                    <div className="text-sm font-medium text-gray-300">{e.course.title}</div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest">{new Date(e.createdAt).toLocaleDateString()}</div>
                                  </td>
                                  <td className="py-6 text-right font-black text-white">
                                    {e.paidAmount?.toFixed(2) || e.course.price.toFixed(2)} PLN
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </section>

                      <section className="glass-dark rounded-[2.5rem] border border-slate-800 p-8 shadow-2xl" aria-labelledby="revenue-cats-title">
                        <h2 id="revenue-cats-title" className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                          <span aria-hidden="true">📊</span> Kategorie
                        </h2>
                        <div className="space-y-6">
                          {Object.entries(stats.revenueByCategory || {}).map(([cat, rev]: [string, any]) => (
                            <div key={cat} className="space-y-3">
                              <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                                <span className="text-gray-500">{cat}</span>
                                <span className="text-white">{rev.toFixed(2)} PLN</span>
                              </div>
                              <div className="h-2.5 bg-slate-800 rounded-full p-0.5">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  whileInView={{ width: `${Math.min(100, (rev / (stats.totalRevenue || 1)) * 100)}%` }}
                                  className="h-full bg-blue-500 rounded-full"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>

                      <section className="glass-dark rounded-[2.5rem] border border-slate-800 p-8 shadow-2xl">
                        <h3 className="text-2xl font-black text-white flex items-center gap-3 mb-8">
                          <span>🎯</span> Szybkie Akcje
                        </h3>
                        <div className="grid gap-4">
                          <button onClick={() => setActiveTab('coupons')} className="p-6 rounded-3xl bg-blue-600/10 border border-blue-500/30 hover:bg-blue-600/20 transition-all text-left group">
                            <div className="text-2xl mb-2">🎟️</div>
                            <div className="font-black text-white group-hover:text-blue-400 transition-colors">Utwórz Promocję</div>
                            <div className="text-xs text-gray-500 mt-1">Zwiększ sprzedaż nowym kuponem</div>
                          </button>
                          <button onClick={() => setActiveTab('articles')} className="p-6 rounded-3xl bg-purple-600/10 border border-purple-500/30 hover:bg-purple-600/20 transition-all text-left group">
                            <div className="text-2xl mb-2">📝</div>
                            <div className="font-black text-white group-hover:text-purple-400 transition-colors">Napisz Artykuł</div>
                            <div className="text-xs text-gray-500 mt-1">Zbuduj społeczność nową treścią</div>
                          </button>
                          <button onClick={() => setActiveTab('users')} className="p-6 rounded-3xl bg-orange-600/10 border border-orange-500/30 hover:bg-orange-600/20 transition-all text-left group">
                            <div className="text-2xl mb-2">🛡️</div>
                            <div className="font-black text-white group-hover:text-orange-400 transition-colors">Weryfikuj Mentorów</div>
                            <div className="text-xs text-gray-500 mt-1">Zatwierdź nowe wnioski mentorów</div>
                          </button>
                          <button onClick={() => setActiveTab('payouts')} className="p-6 rounded-3xl bg-green-600/10 border border-green-500/30 hover:bg-green-600/20 transition-all text-left group">
                            <div className="text-2xl mb-2">💸</div>
                            <div className="font-black text-white group-hover:text-green-400 transition-colors">Rozlicz Mentorów</div>
                            <div className="text-xs text-gray-500 mt-1">Przetwórz oczekujące wypłaty</div>
                          </button>
                        </div>
                      </section>
                    </div>
                  </div>
                )}

              {activeTab === 'users' && (
                <div className="glass-dark rounded-3xl border border-slate-700/50 shadow-2xl">
                  <div className="p-8 border-b border-slate-700/50 bg-gradient-to-r from-blue-600/10 to-transparent">
                    <h2 className="text-2xl font-black text-white">Wszyscy Użytkownicy</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-900/80 text-gray-500 text-[10px] uppercase tracking-[0.2em] font-black">
                          <th className="p-6">Użytkownik</th>
                          <th className="p-6">Rola</th>
                          <th className="p-6">Weryfikacja</th>
                          <th className="p-6 text-right">Akcje</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-300">
                        {users.map(u => (
                          <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-all group">
                            <td className="p-6">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-inner">
                                  {u.avatar ? (
                                    typeof u.avatar === 'string' && (u.avatar.startsWith('http') || u.avatar.startsWith('/')) ? (
                                      <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                                    ) : (
                                      u.avatar
                                    )
                                  ) : '👤'}
                                </div>
                                <div>
                                  <div className="font-black text-white text-lg">{u.name}</div>
                                  <div className="text-sm text-gray-500">{u.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-6">
                              <select 
                                value={u.role}
                                onChange={(e) => changeUserRole(u.id, e.target.value)}
                                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-transparent border cursor-pointer outline-none transition-all ${
                                  u.role === 'admin' ? 'text-red-400 border-red-500/30' :
                                  u.role === 'mentor' ? 'text-purple-400 border-purple-500/30' :
                                  'text-blue-400 border-blue-500/30'
                                }`}
                              >
                                <option value="student" className="bg-slate-900">Student</option>
                                <option value="mentor" className="bg-slate-900">Mentor</option>
                                <option value="admin" className="bg-slate-900">Admin</option>
                              </select>
                            </td>
                            <td className="p-6">
                              {u.role === 'mentor' ? (
                                <div className={`flex items-center gap-2 font-bold ${u.isVerified ? 'text-green-400' : 'text-yellow-400'}`}>
                                  <span className="text-xl">{u.isVerified ? '✅' : '⏳'}</span>
                                  <span>{u.isVerified ? 'Zweryfikowany' : 'Oczekuje'}</span>
                                </div>
                              ) : <span className="text-gray-600">—</span>}
                            </td>
                            <td className="p-6 text-right">
                              {u.role === 'mentor' && (
                                <button 
                                  onClick={() => toggleVerification(u.id, u.isVerified)}
                                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                                    u.isVerified ? 'text-red-400 hover:bg-red-500/10' : 'bg-green-600 text-white hover:bg-green-500 shadow-lg shadow-green-600/20'
                                  }`}
                                >
                                  {u.isVerified ? 'Cofnij weryfikację' : 'Zweryfikuj Mentorzy'}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'courses' && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map(c => (
                    <div key={c.id} className="glass-dark rounded-3xl border border-slate-700/50 p-8 interactive-card group">
                      <div className="flex justify-between items-start mb-6">
                        <div className="text-5xl group-hover:scale-125 transition-transform duration-500">🎓</div>
                        <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${c.isVerified ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {c.isVerified ? 'Widoczny' : 'Oczekuje'}
                        </div>
                      </div>
                      <h3 className="text-xl font-black text-white mb-2 line-clamp-1">{c.title}</h3>
                      <p className="text-gray-500 text-sm mb-6 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs">
                          {c.mentor.avatar ? (
                            typeof c.mentor.avatar === 'string' && (c.mentor.avatar.startsWith('http') || c.mentor.avatar.startsWith('/')) ? (
                              <img src={c.mentor.avatar} alt={c.mentor.name} className="w-full h-full object-cover" />
                            ) : (
                              c.mentor.avatar
                            )
                          ) : '👤'}
                        </span>
                        <span>{c.mentor.name}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                        <span>👥 {c._count.enrollments}</span>
                      </p>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => toggleCourseVerification(c.id, c.isVerified)}
                          className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${
                            c.isVerified ? 'text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/10' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20'
                          }`}
                        >
                          {c.isVerified ? 'Ukryj' : 'Zatwierdź'}
                        </button>
                        <button 
                          onClick={() => deleteCourse(c.id)}
                          className="px-4 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'articles' && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-black text-white">Zarządzaj Artykułami</h2>
                    <button 
                      onClick={() => {
                        setEditingArticle(null);
                        setArticleForm({
                          title: '',
                          content: '',
                          excerpt: '',
                          author: user.name,
                          image: '📖',
                          slug: '',
                          isPublished: true
                        });
                        setShowArticleForm(true);
                      }}
                      className="btn btn-primary"
                    >
                      + Nowy Artykuł
                    </button>
                  </div>

                  {showArticleForm && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="glass-dark rounded-3xl border border-blue-500/30 p-10 shadow-2xl shadow-blue-500/10 relative"
                    >
                      <div className="absolute top-0 right-0 p-4">
                        <button onClick={() => setShowArticleForm(false)} className="text-gray-500 hover:text-white text-2xl">✕</button>
                      </div>
                      
                      <div className="grid lg:grid-cols-2 gap-12">
                        {/* Editor Side */}
                        <div className="space-y-6">
                          <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                            <span>✍️</span> {editingArticle ? 'Edytuj Artykuł' : 'Kreator Artykułu'}
                          </h3>
                          
                          <div className="space-y-4">
                            <input 
                              type="text" 
                              placeholder="Tytuł artykułu"
                              value={articleForm.title}
                              onChange={(e) => setArticleForm({...articleForm, title: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')})}
                              className="w-full px-6 py-4 bg-slate-900/80 border border-slate-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white font-black text-xl"
                            />
                            
                            <div className="grid grid-cols-2 gap-4">
                              <input 
                                type="text" 
                                placeholder="Slug (URL)"
                                value={articleForm.slug}
                                onChange={(e) => setArticleForm({...articleForm, slug: e.target.value})}
                                className="px-4 py-2 bg-slate-900/50 border border-slate-700/50 rounded-xl text-xs text-gray-400"
                              />
                              <input 
                                type="text" 
                                placeholder="Ikona/Emoji"
                                value={articleForm.image}
                                onChange={(e) => setArticleForm({...articleForm, image: e.target.value})}
                                className="px-4 py-2 bg-slate-900/50 border border-slate-700/50 rounded-xl text-xs text-white text-center"
                              />
                            </div>

                            <textarea 
                              placeholder="Krótki wstęp (excerpt)..."
                              value={articleForm.excerpt}
                              onChange={(e) => setArticleForm({...articleForm, excerpt: e.target.value})}
                              rows={2}
                              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-sm text-gray-300 resize-none"
                            />

                            <div className="relative">
                              <div className="absolute top-3 right-3 flex gap-2">
                                <button 
                                  type="button"
                                  onClick={() => setPreviewMode(!previewMode)}
                                  className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-slate-800 rounded border border-slate-700 text-blue-400 hover:text-white transition-colors"
                                >
                                  {previewMode ? 'Edytuj Kod' : 'Podgląd HTML'}
                                </button>
                              </div>
                              <textarea 
                                placeholder="Treść (HTML/CSS support)..."
                                value={articleForm.content}
                                onChange={(e) => setArticleForm({...articleForm, content: e.target.value})}
                                rows={15}
                                className={`w-full px-6 py-8 bg-slate-950/80 border border-slate-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white font-mono text-sm leading-relaxed transition-all ${previewMode ? 'hidden' : 'block'}`}
                              />
                              <div 
                                className={`w-full h-[375px] px-6 py-8 bg-white border border-slate-700/50 rounded-2xl overflow-y-auto prose prose-blue max-w-none transition-all ${previewMode ? 'block' : 'hidden'}`}
                                dangerouslySetInnerHTML={{ __html: sanitizeHtml(articleForm.content) }}
                              />
                            </div>
                          </div>

                          <div className="flex gap-4 pt-4">
                            <button onClick={handleArticleSubmit} className="flex-1 btn btn-primary py-4 text-lg">
                              {editingArticle ? 'Zaktualizuj Artykuł' : 'Opublikuj Teraz'}
                            </button>
                          </div>
                        </div>

                        {/* Tips Side */}
                        <div className="hidden lg:block space-y-6">
                          <div className="p-8 rounded-3xl bg-blue-600/5 border border-blue-500/20">
                            <h4 className="font-black text-white mb-4 flex items-center gap-2">
                              <span>💡</span> Wskazówki CMS
                            </h4>
                            <ul className="space-y-4 text-sm text-gray-400">
                              <li className="flex gap-3">
                                <span className="text-blue-400">01</span>
                                <span>Możesz używać tagów <b>HTML</b> i <b>style</b> inline, aby stworzyć unikalny design artykułu.</span>
                              </li>
                              <li className="flex gap-3">
                                <span className="text-blue-400">02</span>
                                <span>Slug jest generowany automatycznie, ale możesz go dostosować dla lepszego SEO.</span>
                              </li>
                              <li className="flex gap-3">
                                <span className="text-blue-400">03</span>
                                <span>Ikona artykułu (Emoji) pojawi się na kartach w sekcji Artykuły.</span>
                              </li>
                            </ul>
                          </div>
                          
                          <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800">
                            <h4 className="font-black text-white mb-4">Przykład HTML</h4>
                            <pre className="text-[10px] font-mono text-cyan-400 bg-slate-950 p-4 rounded-xl overflow-x-auto">
{`<style>
  .hero { color: #22d3ee; }
</style>
<h1 class="hero">Moja Historia</h1>
<p>To jest epicki artykuł...</p>`}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    {articles.map(a => (
                      <div key={a.id} className="glass-dark rounded-3xl border border-slate-700/50 p-8 flex gap-6 group">
                        <div className="text-4xl w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center shrink-0 border border-slate-800 shadow-inner">
                          {a.image || '📖'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-black text-white truncate group-hover:text-blue-400 transition-colors">{a.title}</h3>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded ${a.isPublished ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                              {a.isPublished ? 'PUBLISHED' : 'DRAFT'}
                            </span>
                          </div>
                          <p className="text-gray-500 text-sm line-clamp-2 mb-6">{a.excerpt}</p>
                          <div className="flex gap-4">
                            <button 
                              onClick={() => {
                                setEditingArticle(a);
                                setArticleForm({
                                  title: a.title,
                                  content: a.content,
                                  excerpt: a.excerpt,
                                  author: a.author,
                                  image: a.image,
                                  slug: a.slug,
                                  isPublished: a.isPublished
                                });
                                setShowArticleForm(true);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="text-xs font-black text-blue-400 hover:text-white transition-colors"
                            >
                              EDYCJA →
                            </button>
                            <button 
                              onClick={() => deleteArticle(a.id)}
                              className="text-xs font-black text-red-400 hover:text-red-300 transition-colors"
                            >
                              USUŃ
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'coupons' && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-black text-white">Zarządzaj Kuponami</h2>
                    <button 
                      onClick={() => {
                        setEditingCoupon(null);
                        setCouponForm({
                          code: '',
                          discountType: 'fixed',
                          discountValue: 0,
                          maxUses: 0,
                          expiresAt: '',
                          isActive: true
                        });
                        setShowCouponForm(true);
                      }}
                      className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all flex items-center gap-2"
                    >
                      <span>+</span> Nowy Kupon
                    </button>
                  </div>

                  {showCouponForm && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="glass-dark rounded-3xl border border-blue-500/30 p-10 shadow-2xl shadow-blue-500/10 relative"
                    >
                      <button onClick={() => setShowCouponForm(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white text-2xl">✕</button>
                      
                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Kod Kuponu</label>
                            <input 
                              type="text" 
                              placeholder="E.G. PROMO2025"
                              value={couponForm.code}
                              onChange={(e) => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})}
                              className="w-full px-5 py-4 bg-slate-900/80 border border-slate-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white font-black"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Typ Zniżki</label>
                              <select 
                                value={couponForm.discountType}
                                onChange={(e) => setCouponForm({...couponForm, discountType: e.target.value as any})}
                                className="w-full px-5 py-4 bg-slate-900/80 border border-slate-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white font-bold"
                              >
                                <option value="fixed">Stała kwota (PLN)</option>
                                <option value="percent">Procentowa (%)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Wartość</label>
                              <input 
                                type="number" 
                                value={couponForm.discountValue}
                                onChange={(e) => setCouponForm({...couponForm, discountValue: parseFloat(e.target.value)})}
                                className="w-full px-5 py-4 bg-slate-900/80 border border-slate-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white font-black"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Limit Użyć (0 = ∞)</label>
                              <input 
                                type="number" 
                                value={couponForm.maxUses}
                                onChange={(e) => setCouponForm({...couponForm, maxUses: parseInt(e.target.value)})}
                                className="w-full px-5 py-4 bg-slate-900/80 border border-slate-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white font-black"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Data Ważności (Opcjonalnie)</label>
                              <input 
                                type="date" 
                                value={couponForm.expiresAt}
                                onChange={(e) => setCouponForm({...couponForm, expiresAt: e.target.value})}
                                className="w-full px-5 py-4 bg-slate-900/80 border border-slate-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white font-bold"
                              />
                            </div>
                          </div>
                          <div className="flex items-end gap-4">
                            <button 
                              onClick={handleCouponSubmit}
                              className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all"
                            >
                              {editingCoupon ? 'Zaktualizuj Kupon' : 'Utwórz Kupon 🎟️'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="glass-dark rounded-3xl border border-slate-700/50">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-900/80 text-gray-500 text-[10px] uppercase tracking-[0.2em] font-black">
                          <th className="p-6">Kod</th>
                          <th className="p-6">Zniżka</th>
                          <th className="p-6">Użycia</th>
                          <th className="p-6">Ważność</th>
                          <th className="p-6">Status</th>
                          <th className="p-6 text-right">Akcje</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-300">
                        {coupons.map(c => (
                          <tr key={c.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-all group">
                            <td className="p-6">
                              <span className="font-black text-white text-lg tracking-widest bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                                {c.code}
                              </span>
                            </td>
                            <td className="p-6">
                              <span className="font-black text-blue-400">
                                {c.discountValue}{c.discountType === 'percent' ? '%' : ' PLN'}
                              </span>
                            </td>
                            <td className="p-6">
                              <div className="text-sm">
                                <span className="font-black text-white">{c.usedCount}</span>
                                <span className="text-gray-600"> / {c.maxUses === 0 ? '∞' : c.maxUses}</span>
                              </div>
                            </td>
                            <td className="p-6">
                              <span className="text-xs text-gray-500 font-bold uppercase">
                                {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('pl-PL') : 'Bezterminowo'}
                              </span>
                            </td>
                            <td className="p-6">
                              <button 
                                onClick={() => toggleCouponStatus(c.id, c.isActive)}
                                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                                  c.isActive ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                }`}
                              >
                                {c.isActive ? 'Aktywny' : 'Wyłączony'}
                              </button>
                            </td>
                            <td className="p-6 text-right space-x-4">
                              <button 
                                onClick={() => {
                                  setEditingCoupon(c);
                                  setCouponForm({
                                    code: c.code,
                                    discountType: c.discountType,
                                    discountValue: c.discountValue,
                                    maxUses: c.maxUses,
                                    expiresAt: c.expiresAt ? new Date(c.expiresAt).toISOString().split('T')[0] : '',
                                    isActive: c.isActive
                                  });
                                  setShowCouponForm(true);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="text-xs font-black text-blue-400 hover:text-white"
                              >
                                EDYCJA
                              </button>
                              <button 
                                onClick={() => deleteCoupon(c.id)}
                                className="text-xs font-black text-red-400 hover:text-red-300"
                              >
                                USUŃ
                              </button>
                            </td>
                          </tr>
                        ))}
                        {coupons.length === 0 && (
                          <tr>
                            <td colSpan={6} className="p-12 text-center text-gray-500 italic">Brak aktywnych kuponów. Kliknij "+ Nowy Kupon", aby zacząć zarabiać więcej! 🚀</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'enrollments' && (
                <div className="glass-dark rounded-3xl border border-slate-700/50 shadow-2xl">
                  <div className="p-8 border-b border-slate-700/50 bg-gradient-to-r from-blue-600/10 to-transparent flex justify-between items-center">
                    <h2 className="text-2xl font-black text-white">Wszystkie Zapisy na Kursy</h2>
                    <div className="text-sm text-gray-500 font-bold uppercase tracking-widest">
                      Suma: {enrollments.length}
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-900/80 text-gray-500 text-[10px] uppercase tracking-[0.2em] font-black">
                          <th className="p-6">Kursant</th>
                          <th className="p-6">Kurs</th>
                          <th className="p-6">Data Zapisu</th>
                          <th className="p-6 text-right">Akcje</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-300">
                        {enrollments.map(e => (
                          <tr key={e.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-all group">
                            <td className="p-6">
                              <div>
                                <div className="font-black text-white">{e.user.name}</div>
                                <div className="text-xs text-gray-500">{e.user.email}</div>
                              </div>
                            </td>
                            <td className="p-6">
                              <div className="font-bold text-gray-300">{e.course.title}</div>
                              <div className="text-[10px] text-blue-400 font-black">{e.course.price} PLN</div>
                            </td>
                            <td className="p-6 text-sm text-gray-500">
                              {new Date(e.createdAt).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </td>
                            <td className="p-6 text-right">
                              <button 
                                onClick={() => deleteEnrollment(e.id)}
                                className="text-xs font-black text-red-400 hover:text-red-300 transition-colors"
                              >
                                USUŃ ZAPIS
                              </button>
                            </td>
                          </tr>
                        ))}
                        {enrollments.length === 0 && (
                          <tr>
                            <td colSpan={4} className="p-12 text-center text-gray-500 italic">Brak zapisów w systemie.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'payouts' && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-black text-white">Rozliczenia z Mentorami</h2>
                    <button 
                      onClick={generatePayouts}
                      className="px-6 py-3 bg-green-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-green-600/20 hover:bg-green-500 transition-all"
                    >
                      🔄 Generuj Nowe Wypłaty
                    </button>
                  </div>

                  <div className="glass-dark rounded-3xl border border-slate-700/50">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-900/80 text-gray-500 text-[10px] uppercase tracking-[0.2em] font-black">
                          <th className="p-6">Mentor</th>
                          <th className="p-6">Kwota</th>
                          <th className="p-6">Status</th>
                          <th className="p-6">Data</th>
                          <th className="p-6 text-right">Akcje</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-300">
                        {payouts.map(p => (
                          <tr key={p.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-all group">
                            <td className="p-6">
                              <div className="font-black text-white">{p.mentor.name}</div>
                              <div className="text-xs text-gray-500">{p.mentor.email}</div>
                            </td>
                            <td className="p-6">
                              <span className="font-black text-green-400 text-lg">{p.amount.toFixed(2)} PLN</span>
                            </td>
                            <td className="p-6">
                              <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                                p.status === 'paid' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                p.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                'bg-red-500/20 text-red-400 border border-red-500/30'
                              }`}>
                                {p.status === 'paid' ? 'Wypłacono' : p.status === 'pending' ? 'Oczekuje' : 'Odrzucono'}
                              </span>
                            </td>
                            <td className="p-6 text-sm text-gray-500">
                              {new Date(p.createdAt).toLocaleDateString('pl-PL')}
                            </td>
                            <td className="p-6 text-right space-x-2">
                              {p.status === 'pending' && (
                                <>
                                  <button 
                                    onClick={() => updatePayoutStatus(p.id, 'paid')}
                                    className="px-4 py-2 rounded-xl bg-green-600 text-white text-[10px] font-black hover:bg-green-500 transition-all"
                                  >
                                    OPŁAĆ
                                  </button>
                                  <button 
                                    onClick={() => updatePayoutStatus(p.id, 'rejected')}
                                    className="px-4 py-2 rounded-xl border border-red-500/30 text-red-400 text-[10px] font-black hover:bg-red-500/10 transition-all"
                                  >
                                    ODRZUĆ
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                        {payouts.length === 0 && (
                          <tr>
                            <td colSpan={5} className="p-12 text-center text-gray-500 italic">Brak rozliczeń do wyświetlenia.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {activeTab === 'settings' && (
                <div className="max-w-2xl mx-auto">
                  <form onSubmit={saveConfig} className="glass-dark rounded-3xl border border-slate-700/50 p-10 space-y-8">
                    <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                      <span>⚙️</span> Konfiguracja Platformy
                    </h2>
                    
                    <div className="space-y-6">
                      {/* Podstawowe ustawienia */}
                      <div className="p-6 bg-blue-600/10 border border-blue-500/20 rounded-2xl">
                        <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                          <span>🏠</span> Podstawowe Ustawienia
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Nazwa Strony</label>
                            <input 
                              type="text" 
                              value={config.siteName}
                              onChange={(e) => setConfig({...config, siteName: e.target.value})}
                              className="w-full px-5 py-4 bg-slate-900/80 border border-slate-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white font-black"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Email Kontaktowy</label>
                            <input 
                              type="email" 
                              value={config.contactEmail}
                              onChange={(e) => setConfig({...config, contactEmail: e.target.value})}
                              className="w-full px-5 py-4 bg-slate-900/80 border border-slate-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white font-bold"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Prowizja */}
                      <div className="p-6 bg-green-600/10 border border-green-500/20 rounded-2xl">
                        <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                          <span>💰</span> Prowizja Platformy
                        </h3>
                        <div>
                          <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Prowizja (%) od sprzedaży</label>
                          <div className="flex items-center gap-3">
                            <input 
                              type="number" 
                              min="0"
                              max="100"
                              value={config.platformFee}
                              onChange={(e) => setConfig({...config, platformFee: parseFloat(e.target.value)})}
                              className="w-24 px-5 py-4 bg-slate-900/80 border border-slate-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 text-white font-black text-center"
                            />
                            <span className="text-white font-black text-xl">%</span>
                            <span className="text-gray-500 text-sm">(Mentor otrzymuje {100 - config.platformFee}%)</span>
                          </div>
                        </div>
                      </div>

                      {/* Social Media */}
                      <div className="p-6 bg-purple-600/10 border border-purple-500/20 rounded-2xl">
                        <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                          <span>📱</span> Linki Społecznościowe
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Facebook</label>
                            <input 
                              type="url" 
                              placeholder="https://facebook.com/..."
                              value={config.facebookUrl || ''}
                              onChange={(e) => setConfig({...config, facebookUrl: e.target.value})}
                              className="w-full px-5 py-4 bg-slate-900/80 border border-slate-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Instagram</label>
                            <input 
                              type="url" 
                              placeholder="https://instagram.com/..."
                              value={config.instagramUrl || ''}
                              onChange={(e) => setConfig({...config, instagramUrl: e.target.value})}
                              className="w-full px-5 py-4 bg-slate-900/80 border border-slate-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3">YouTube</label>
                            <input 
                              type="url" 
                              placeholder="https://youtube.com/..."
                              value={config.youtubeUrl || ''}
                              onChange={(e) => setConfig({...config, youtubeUrl: e.target.value})}
                              className="w-full px-5 py-4 bg-slate-900/80 border border-slate-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Twitter/X</label>
                            <input 
                              type="url" 
                              placeholder="https://x.com/..."
                              value={config.twitterUrl || ''}
                              onChange={(e) => setConfig({...config, twitterUrl: e.target.value})}
                              className="w-full px-5 py-4 bg-slate-900/80 border border-slate-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white font-bold"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Banner i tryb */}
                      <div className="p-6 bg-orange-600/10 border border-orange-500/20 rounded-2xl">
                        <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                          <span>📢</span> Komunikacja
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Wiadomość na Bannerze (Opcjonalnie)</label>
                            <textarea 
                              value={config.bannerMessage}
                              onChange={(e) => setConfig({...config, bannerMessage: e.target.value})}
                              placeholder="Np. 'Zniżka -20% na wszystkie kursy z kodem START!'"
                              rows={3}
                              className="w-full px-5 py-4 bg-slate-900/80 border border-slate-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-white text-sm"
                            />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                            <div>
                              <div className="font-black text-white">Tryb Konserwacji</div>
                              <div className="text-xs text-gray-500">Wyłącza dostęp do platformy dla wszystkich poza adminami</div>
                            </div>
                            <button 
                              type="button"
                              onClick={() => setConfig({...config, maintenanceMode: !config.maintenanceMode})}
                              className={`w-14 h-8 rounded-full relative transition-all ${config.maintenanceMode ? 'bg-red-600' : 'bg-slate-700'}`}
                            >
                              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${config.maintenanceMode ? 'right-1' : 'left-1'}`} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Narzędzia */}
                      <div className="p-6 bg-slate-800/50 border border-slate-700/50 rounded-2xl">
                        <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                          <span>🔧</span> Narzędzia
                        </h3>
                        <div className="grid md:grid-cols-3 gap-4">
                          <button 
                            onClick={exportData}
                            className="p-4 bg-blue-600/20 border border-blue-500/30 rounded-xl hover:bg-blue-600/30 transition-all text-left"
                          >
                            <div className="text-2xl mb-2">📊</div>
                            <div className="font-black text-white">Eksport Danych</div>
                            <div className="text-xs text-gray-500 mt-1">Pobierz CSV</div>
                          </button>
                          <button 
                            onClick={clearCache}
                            className="p-4 bg-purple-600/20 border border-purple-500/30 rounded-xl hover:bg-purple-600/30 transition-all text-left"
                          >
                            <div className="text-2xl mb-2">🗑️</div>
                            <div className="font-black text-white">Wyczyść Cache</div>
                            <div className="text-xs text-gray-500 mt-1">Odśwież dane</div>
                          </button>
                          <button 
                            onClick={() => router.refresh()}
                            className="p-4 bg-green-600/20 border border-green-500/30 rounded-xl hover:bg-green-600/30 transition-all text-left"
                          >
                            <div className="text-2xl mb-2">🔄</div>
                            <div className="font-black text-white">Odśwież Stronę</div>
                            <div className="text-xs text-gray-500 mt-1">Przeładuj UI</div>
                          </button>
                        </div>
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all"
                    >
                      Zapisz Ustawienia 💾
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
    </div>
  );
}
