'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Application {
  id: string;
  userId: string;
  email: string;
  aboutYou: string;
  aboutCourse: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export default function MentorApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    try {
      const mockApplications: Application[] = [
        {
          id: '1',
          userId: 'cmoejg8ys0004680y713dup5c',
          email: 'fulltest@example.com',
          aboutYou: 'Jestem doświadczonym programistą z 5-letnim doświadczeniem, chcę dzielić się wiedzą z innymi.',
          aboutCourse: 'Planuję stworzyć kurs o nowoczesnym JavaScript, React i Node.js',
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
      ];
      setApplications(mockApplications);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateApplicationStatus(id: string, status: 'approved' | 'rejected') {
    try {
      setApplications(apps => 
        apps.map(app => 
          app.id === id ? { ...app, status } : app
        )
      );
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating application:', error);
    }
  }

  const filteredApplications = applications.filter(app => 
    filter === 'all' ? true : app.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border border-red-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-spin">🔄</div>
          <p className="text-xl">Ładowanie wniosków...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-32 px-4 bg-gradient-to-br from-slate-950 via-blue-950/25 to-slate-900 relative">
      <div className="absolute inset-0 overflow-visible pointer-events-none">
        <div className="absolute top-32 right-10 w-32 h-32 sticker sticker-blue opacity-20" />
        <div className="absolute bottom-32 left-10 w-24 h-24 sticker sticker-cyan opacity-25" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto max-w-6xl relative z-10"
      >
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex justify-between items-center mb-12"
        >
          <div>
            <h1 className="text-5xl font-black text-white tracking-tight">
              🎓 Wnioski o Mentora
            </h1>
            <p className="text-gray-400 mt-2 text-lg">
              Zarządzaj aplikacjami mentorów
            </p>
          </div>
          <Link href="/dashboard/admin" className="btn btn-outline px-8 py-4">
            ← Powrót
          </Link>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
        >
          <div className="glass-dark rounded-2xl border border-slate-700/50 p-6 text-center">
            <div className="text-4xl mb-2">📋</div>
            <div className="text-3xl font-black text-white">{applications.length}</div>
            <div className="text-gray-400 text-sm">Wszystkie</div>
          </div>
          <div className="glass-dark rounded-2xl border border-yellow-500/30 p-6 text-center">
            <div className="text-4xl mb-2">⏳</div>
            <div className="text-3xl font-black text-yellow-400">{applications.filter(a => a.status === 'pending').length}</div>
            <div className="text-gray-400 text-sm">Oczekujące</div>
          </div>
          <div className="glass-dark rounded-2xl border border-green-500/30 p-6 text-center">
            <div className="text-4xl mb-2">✅</div>
            <div className="text-3xl font-black text-green-400">{applications.filter(a => a.status === 'approved').length}</div>
            <div className="text-gray-400 text-sm">Zatwierdzone</div>
          </div>
          <div className="glass-dark rounded-2xl border border-red-500/30 p-6 text-center">
            <div className="text-4xl mb-2">❌</div>
            <div className="text-3xl font-black text-red-400">{applications.filter(a => a.status === 'rejected').length}</div>
            <div className="text-gray-400 text-sm">Odrzucone</div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex gap-4 mb-8 overflow-x-auto pb-4"
        >
          {['all', 'pending', 'approved', 'rejected'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-6 py-3 rounded-xl font-black text-sm transition-all whitespace-nowrap ${
                filter === f
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-slate-800/50 text-gray-400 border border-slate-700/50 hover:border-slate-600'
              }`}
            >
              {f === 'all' ? 'Wszystkie'
                : f === 'pending' ? 'Oczekujące'
                : f === 'approved' ? 'Zatwierdzone'
                : 'Odrzucone'}
            </button>
          ))}
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          {filteredApplications.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-400 text-xl">Brak wniosków</p>
            </div>
          ) : (
            filteredApplications.map((app, index) => (
              <motion.div
                key={app.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 * index }}
                className="glass-dark rounded-3xl border border-slate-700/50 p-8 hover:border-slate-600 transition-all cursor-pointer"
                onClick={() => {
                  setSelectedApp(app);
                  setIsModalOpen(true);
                }}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-2xl font-black">
                      {app.email[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white mb-2">
                        {app.email}
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        <span className="px-4 py-2 bg-slate-800/50 rounded-xl text-xs font-bold text-gray-400">
                          ID: {app.userId.substring(0, 8)}...
                        </span>
                        <span className="px-4 py-2 bg-slate-800/50 rounded-xl text-xs font-bold text-gray-400">
                          {new Date(app.createdAt).toLocaleDateString('pl-PL')}
                        </span>
                        <span className={`px-4 py-2 rounded-xl text-xs font-black ${getStatusColor(app.status)}`}>
                          {app.status === 'pending' && '⏳ Oczekujące'}
                          {app.status === 'approved' && '✅ Zatwierdzone'}
                          {app.status === 'rejected' && '❌ Odrzucone'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    {app.status === 'pending' && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateApplicationStatus(app.id, 'approved');
                          }}
                          className="px-6 py-3 bg-green-600/20 border border-green-500/30 rounded-xl font-black text-green-400 hover:bg-green-600 hover:text-white transition-all"
                        >
                          ✅ Zatwierdź
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateApplicationStatus(app.id, 'rejected');
                          }}
                          className="px-6 py-3 bg-red-600/20 border border-red-500/30 rounded-xl font-black text-red-400 hover:bg-red-600 hover:text-white transition-all"
                        >
                          ❌ Odrzuć
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>

        <AnimatePresence>
          {isModalOpen && selectedApp && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setIsModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="glass-dark rounded-3xl border border-slate-700/50 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-3xl font-black text-white mb-2">Wniosek Mentora</h2>
                    <p className="text-gray-400">{selectedApp.email}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-xl text-xs font-black ${getStatusColor(selectedApp.status)}`}>
                    {selectedApp.status === 'pending' && '⏳ Oczekujące'}
                    {selectedApp.status === 'approved' && '✅ Zatwierdzone'}
                    {selectedApp.status === 'rejected' && '❌ Odrzucone'}
                  </span>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-white mb-3">📝 O Tobie</h3>
                    <p className="text-gray-300 bg-slate-800/50 p-4 rounded-xl">
                      {selectedApp.aboutYou}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white mb-3">🎯 O Twoim Kursie</h3>
                    <p className="text-gray-300 bg-slate-800/50 p-4 rounded-xl">
                      {selectedApp.aboutCourse}
                    </p>
                  </div>
                </div>

                {selectedApp.status === 'pending' && (
                  <div className="flex gap-4 mt-8">
                    <button
                      onClick={() => updateApplicationStatus(selectedApp.id, 'approved')}
                      className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-black text-lg hover:bg-green-500 transition-all"
                    >
                      ✅ Zatwierdź Wniosek
                    </button>
                    <button
                      onClick={() => updateApplicationStatus(selectedApp.id, 'rejected')}
                      className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-lg hover:bg-red-500 transition-all"
                    >
                      ❌ Odrzuć Wniosek
                    </button>
                  </div>
                )}

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full mt-6 py-3 bg-slate-800 text-gray-400 rounded-2xl font-black hover:bg-slate-700 transition-all"
                >
                  Zamknij
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
