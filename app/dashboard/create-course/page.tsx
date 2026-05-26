'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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

export default function CreateCoursePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.user && (data.user.role === 'mentor' || data.user.role === 'admin')) {
          setUser(data.user);
          if (data.user.role === 'mentor' && !data.user.isVerified) {
             setError('Twoje konto mentora wymaga weryfikacji przed tworzeniem kursów.');
          }
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

  const [modules, setModules] = useState([
    {
      title: 'Wstęp',
      lessons: [{ title: 'Wprowadzenie', videoUrl: '', description: 'O czym będzie ten kurs.', content: '' }]
    }
  ]);

  const addModule = () => {
    setModules([...modules, { title: 'Nowy Moduł', lessons: [{ title: 'Nowa Lekcja', videoUrl: '', description: '', content: '' }] }]);
  };

  const removeModule = (mIndex: number) => {
    setModules(modules.filter((_, i) => i !== mIndex));
  };

  const updateModuleTitle = (mIndex: number, title: string) => {
    const newModules = [...modules];
    newModules[mIndex].title = title;
    setModules(newModules);
  };

  const addLesson = (mIndex: number) => {
    const newModules = [...modules];
    newModules[mIndex].lessons.push({ title: '', videoUrl: '', description: '', content: '' });
    setModules(newModules);
  };

  const removeLesson = (mIndex: number, lIndex: number) => {
    const newModules = [...modules];
    newModules[mIndex].lessons = newModules[mIndex].lessons.filter((_, i) => i !== lIndex);
    setModules(newModules);
  };

  const updateLesson = (mIndex: number, lIndex: number, field: string, value: string) => {
    const newModules = [...modules];
    (newModules[mIndex].lessons[lIndex] as any)[field] = value;
    setModules(newModules);
  };

  const generateStructure = () => {
    const categorySelect = document.getElementsByName('category')[0] as HTMLSelectElement;
    const category = categorySelect.value;
    
    if (!category) {
      setError('Wybierz kategorię, aby wygenerować strukturę');
      return;
    }

    const structures: Record<string, {title: string, lessons: {title: string, desc: string}[]}[]> = {
      'web-development': [
        { title: 'Fundamenty', lessons: [
          { title: 'Czym jest Web Development?', desc: 'Wprowadzenie do świata technologii webowych.' },
          { title: 'Instalacja środowiska', desc: 'Konfiguracja VS Code, Node.js i terminala.' }
        ]},
        { title: 'HTML & CSS', lessons: [
          { title: 'Struktura dokumentu HTML', desc: 'Semantyka i podstawowe tagi.' },
          { title: 'Selektory CSS', desc: 'Kaskadowość i dziedziczenie.' },
          { title: 'Flexbox i Grid', desc: 'Nowoczesne układy stron.' }
        ]},
        { title: 'JavaScript', lessons: [
          { title: 'Zmienne i typy danych', desc: 'Fundamenty logiki programowania.' },
          { title: 'Funkcje i zdarzenia', desc: 'Interaktywność na stronie.' }
        ]}
      ],
      'python': [
        { title: 'Podstawy', lessons: [
          { title: 'Instalacja Pythona', desc: 'Pierwsze kroki w Pythonie.' },
          { title: 'Hello World', desc: 'Twój pierwszy skrypt.' }
        ]},
        { title: 'Logika', lessons: [
          { title: 'Instrukcje warunkowe', desc: 'If, else, elif.' },
          { title: 'Pętle for i while', desc: 'Automatyzacja powtarzalnych zadań.' }
        ]}
      ],
      'design': [
        { title: 'Teoria', lessons: [
          { title: 'Psychologia koloru', desc: 'Jak kolory wpływają na emocje.' },
          { title: 'Zasady typografii', desc: 'Dobieranie fontów i hierarchia.' }
        ]},
        { title: 'Narzędzia', lessons: [
          { title: 'Podstawy Figmy', desc: 'Interfejs i podstawowe kształty.' },
          { title: 'Auto Layout', desc: 'Responsywne komponenty.' }
        ]}
      ],
      'mobile': [
        { title: 'Wstęp do Mobile', lessons: [
          { title: 'React Native vs Flutter', desc: 'Przegląd technologii.' },
          { title: 'Instalacja emulatorów', desc: 'Konfiguracja Android Studio / Xcode.' }
        ]}
      ],
      'business': [
        { title: 'Startup 101', lessons: [
          { title: 'Walidacja pomysłu', desc: 'Lean Canvas i badania rynku.' },
          { title: 'Budowanie MVP', desc: 'Skupienie na core-features.' }
        ]}
      ]
    };

    const genModules = structures[category] || [
      { title: 'Moduł 1', lessons: [{ title: 'Wprowadzenie', desc: 'O czym będzie ten kurs.' }] }
    ];

    setModules(genModules.map(m => ({
      title: m.title,
      lessons: m.lessons.map(l => ({
        title: l.title,
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Placeholder
        description: l.desc,
        content: ''
      }))
    })));
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    /* 
    if (user?.role === 'mentor' && !user?.isVerified) {
      setError('Twoje konto mentora musi zostać zweryfikowane przez admina.');
      return;
    }
    */

    setIsLoading(true);
    setError('');
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title')?.toString().trim() || '';
    const description = formData.get('description')?.toString().trim() || '';
    const price = parseFloat(formData.get('price')?.toString() || '0');
    const category = formData.get('category')?.toString() || '';
    const level = formData.get('level')?.toString() || '';

    // Basic frontend validation
    if (title.length < 3) {
      setError('Tytuł kursu musi mieć co najmniej 3 znaki');
      return;
    }

    if (description.length < 10) {
      setError('Opis kursu musi mieć co najmniej 10 znaków');
      return;
    }

    if (price < 0) {
      setError('Cena nie może być ujemna');
      return;
    }

    if (!category) {
      setError('Wybierz kategorię kursu');
      return;
    }

    if (!level) {
      setError('Wybierz poziom trudności');
      return;
    }

    const payload = {
      title,
      description,
      price,
      category,
      level,
      modules: modules.filter(m => m.title.trim() !== '').map(m => ({
        title: m.title.trim(),
        lessons: m.lessons.filter(l => l.title.trim() !== '').map(l => ({
          title: l.title.trim(),
          description: (l.description?.toString().trim() || ''),
          videoUrl: (l.videoUrl?.toString().trim() || ''),
          content: (l.content?.toString().trim() || ''),
        }))
      })),
    };

    try {
      const response = await fetch('/api/courses/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.details && Array.isArray(data.details)) {
          throw new Error(data.details.join('\n'));
        }
        throw new Error(data.message || 'Błąd tworzenia kursu');
      }

      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd tworzenia kursu');
    } finally {
      setIsLoading(false);
    }
  }

  if (!user) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Weryfikacja uprawnień...</div>;

  return (
    <div className="min-h-screen py-32 px-4 bg-gradient-to-br from-slate-950/50 via-blue-950/25 to-slate-950/50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-visible pointer-events-none">
        <div className="absolute top-32 right-5 w-28 h-28 sticker sticker-pink opacity-20" />
        <div className="absolute bottom-32 left-10 w-24 h-24 sticker sticker-blue opacity-25" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto max-w-4xl relative z-10"
      >
        <motion.div variants={itemVariants} className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-4">Stwórz <span className="text-gradient-warm">Kurs</span></h1>
            <p className="text-xl text-gray-400 font-medium">Zaprojektuj profesjonalną ścieżkę edukacyjną</p>
          </div>
          <Link href="/dashboard" className="px-6 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-gray-400 hover:text-white transition-all font-bold">Anuluj</Link>
        </motion.div>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-5 gap-8">
          {/* Main Info */}
          <motion.div variants={itemVariants} className="lg:col-span-3 space-y-6">
            <div className="glass-dark rounded-3xl border border-slate-700/50 p-8 shadow-2xl">
              <div aria-live="polite">
                {success && (
                  <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-6 py-4 rounded-2xl mb-6 font-bold flex items-center gap-3">
                    <span>🚀</span> Kurs stworzony pomyślnie!
                  </div>
                )}
                {error && (
                  <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-6 py-4 rounded-2xl mb-6 font-bold flex items-center gap-3">
                    <span>⚠️</span> {error}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-xs font-black text-gray-500 mb-2 uppercase tracking-widest">Tytuł Kursu</label>
                  <input
                    id="title"
                    type="text"
                    name="title"
                    required
                    placeholder="np. Masterclass Nowoczesnego Designu"
                    className="w-full px-6 py-4 bg-slate-950/50 border border-slate-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white font-black text-xl placeholder-slate-700 transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-xs font-black text-gray-500 mb-2 uppercase tracking-widest">Opis Kursu</label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    rows={6}
                    placeholder="Opisz czego nauczą się Twoi uczniowie. Jakie projekty stworzycie?"
                    className="w-full px-6 py-4 bg-slate-950/50 border border-slate-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-700 transition-all resize-none leading-relaxed"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase">Kategoria</label>
                    <select name="category" required className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-blue-500 transition-all">
                      <option value="">Wybierz...</option>
                      <option value="web-development">Code</option>
                      <option value="design">Design</option>
                      <option value="business">Biznes</option>
                      <option value="mobile">Mobile</option>
                      <option value="python">Python</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase">Poziom</label>
                    <select name="level" className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-blue-500 transition-all">
                      <option value="beginner">Junior</option>
                      <option value="intermediate">Mid</option>
                      <option value="advanced">Senior</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase">Cena (PLN)</label>
                    <input type="number" name="price" step="0.01" min="0" placeholder="0.00" className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm font-black focus:ring-2 focus:ring-blue-500 transition-all" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Curriculum / Generator */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            <div className="glass-dark rounded-3xl border border-slate-700/50 p-8 shadow-2xl sticky top-24">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-white flex items-center gap-2">
                  <span>📂</span> Program
                </h3>
                <button type="button" onClick={generateStructure} className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-blue-600/10 text-blue-400 rounded-lg border border-blue-500/20 hover:bg-blue-600 hover:text-white transition-all">
                  Auto-Gen ✨
                </button>
              </div>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence>
                  {modules.map((m, mIdx) => (
                    <motion.div 
                      key={mIdx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center gap-2 group">
                        <span className="text-slate-700 font-mono text-xs">{String(mIdx + 1).padStart(2, '0')}</span>
                        <input
                          value={m.title}
                          onChange={(e) => updateModuleTitle(mIdx, e.target.value)}
                          className="flex-1 bg-transparent border-b border-slate-800 focus:border-blue-500 text-white font-black text-sm py-1 focus:outline-none"
                          placeholder="Tytuł modułu..."
                        />
                        <button type="button" onClick={() => removeModule(mIdx)} className="opacity-0 group-hover:opacity-100 text-red-500 text-xs transition-all hover:scale-125">✕</button>
                      </div>

                      <div className="pl-6 space-y-2 border-l border-slate-800 ml-2">
                        {m.lessons.map((l, lIdx) => (
                          <div key={lIdx} className="flex flex-col gap-1 p-3 rounded-xl bg-slate-900/40 border border-slate-800/50 hover:border-slate-700 transition-all">
                            <div className="flex items-center gap-2">
                              <span className="text-blue-500 text-[10px] font-black">VIDEO</span>
                              <input
                                value={l.title}
                                onChange={(e) => updateLesson(mIdx, lIdx, 'title', e.target.value)}
                                className="flex-1 bg-transparent text-xs text-gray-300 focus:text-white focus:outline-none font-medium"
                                placeholder="Tytuł lekcji..."
                              />
                              <button type="button" onClick={() => removeLesson(mIdx, lIdx)} className="text-slate-600 hover:text-red-400 transition-colors">✕</button>
                            </div>
                            <div className="flex flex-col gap-2">
                              <input
                                value={l.videoUrl || ''}
                                onChange={(e) => updateLesson(mIdx, lIdx, 'videoUrl', e.target.value)}
                                className="text-[9px] bg-slate-950/50 rounded px-2 py-1 text-gray-500 focus:text-blue-400 focus:outline-none border border-transparent focus:border-blue-900/50 transition-all"
                                placeholder="Link do wideo (np. YouTube)"
                              />
                               <textarea
                                 value={l.description || ''}
                                 onChange={(e) => updateLesson(mIdx, lIdx, 'description', e.target.value)}
                                 className="text-[9px] bg-slate-950/50 rounded px-2 py-1 text-gray-500 focus:text-blue-400 focus:outline-none border border-transparent focus:border-blue-900/50 transition-all resize-none h-12"
                                 placeholder="Opis lekcji..."
                               />
                            </div>
                          </div>
                        ))}
                        <button type="button" onClick={() => addLesson(mIdx)} className="text-[10px] font-black text-slate-500 hover:text-cyan-400 transition-all uppercase tracking-widest pl-2">+ Dodaj Lekcję</button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="pt-8 space-y-4">
                <button type="button" onClick={addModule} className="w-full py-4 border-2 border-dashed border-slate-800 rounded-2xl text-gray-500 hover:text-white hover:border-slate-600 transition-all font-black text-xs uppercase tracking-widest">
                  + Nowy Folder Modułu
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-600/20 hover:bg-blue-500 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? 'TRWA TWORZENIE...' : 'OPUBLIKUJ KURS 🚀'}
                </button>
              </div>
            </div>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
