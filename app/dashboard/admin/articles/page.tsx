'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// Sanitize HTML to prevent style/script injection
function sanitizeHtml(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<link[^>]*rel="stylesheet"[^>]*>/gi, '');
}

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  image: string;
  slug: string;
  isPublished: boolean;
  createdAt: string;
}

export default function AdminArticlesPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    author: '',
    image: '📖',
    isPublished: false
  });

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.user && (data.user.role === 'admin' || data.user.email === 'admin@admin.com')) {
          setFormData(prev => ({ ...prev, author: data.user.name }));
          fetchArticles();
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

  async function fetchArticles() {
    try {
      const res = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list' })
      });
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const action = editingId ? 'update' : 'create';
    const payload = editingId 
      ? { ...formData, id: editingId, action }
      : { ...formData, action };

    try {
      const res = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowForm(false);
        setEditingId(null);
        setFormData({ ...formData, title: '', content: '', excerpt: '', image: '📖', isPublished: false });
        fetchArticles();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id: string) {
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

  function handleEdit(article: Article) {
    setEditingId(article.id);
    setFormData({
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      author: article.author,
      image: article.image,
      isPublished: article.isPublished
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const insertTag = (tag: string) => {
    const textarea = document.getElementById('editor-area') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.content;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const selected = text.substring(start, end);
    
    let newText = '';
    if (tag === 'b') newText = `<b>${selected}</b>`;
    else if (tag === 'i') newText = `<i>${selected}</i>`;
    else if (tag === 'h2') newText = `<h2>${selected}</h2>`;
    else if (tag === 'p') newText = `<p>${selected}</p>`;
    else if (tag === 'img') newText = `<img src="URL" alt="opis" class="rounded-xl my-4" />`;
    else if (tag === 'style') newText = `<style>\n  .custom-class {\n    color: #22d3ee;\n  }\n</style>`;
    
    setFormData({ ...formData, content: before + newText + after });
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Weryfikacja...</div>;

  return (
    <div className="min-h-screen py-32 px-4 bg-slate-950 text-white">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl font-black tracking-tighter">CMS Manifestów</h1>
            <p className="text-gray-400 mt-2 font-medium">Twórz treści zmieniające oblicze polskiej edukacji</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => {
                if (showForm) {
                  setShowForm(false);
                  setEditingId(null);
                } else {
                  setShowForm(true);
                }
              }}
              className="btn btn-primary px-8"
            >
              {showForm ? 'Anuluj' : '+ Nowy Artykuł'}
            </button>
            <Link href="/dashboard/admin" className="btn btn-outline">Wróć do Panelu</Link>
          </div>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-dark p-8 rounded-[2.5rem] border border-blue-500/20 mb-16 shadow-2xl"
            >
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-6">
                    <div>
                      <label htmlFor="title" className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-[0.2em]">Tytuł Artykułu</label>
                      <input
                        id="title"
                        type="text"
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                        className="w-full p-5 bg-slate-950/50 border border-slate-800 rounded-2xl focus:border-blue-500 outline-none transition-all font-black text-2xl"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="author" className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-[0.2em]">Autor</label>
                        <input
                          id="author"
                          type="text"
                          value={formData.author}
                          onChange={e => setFormData({...formData, author: e.target.value})}
                          className="w-full p-4 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-blue-500 outline-none transition-all font-bold"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="image" className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-[0.2em]">Emoji Ikona</label>
                        <input
                          id="image"
                          type="text"
                          value={formData.image}
                          onChange={e => setFormData({...formData, image: e.target.value})}
                          className="w-full p-4 bg-slate-950/50 border border-slate-800 rounded-xl focus:border-blue-500 outline-none transition-all text-center text-xl"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="excerpt" className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-[0.2em]">Lead (Wstęp)</label>
                    <textarea
                      id="excerpt"
                      value={formData.excerpt}
                      onChange={e => setFormData({...formData, excerpt: e.target.value})}
                      className="w-full p-5 bg-slate-950/50 border border-slate-800 rounded-2xl focus:border-blue-500 outline-none transition-all h-[168px] resize-none text-sm text-gray-400 font-medium"
                      placeholder="Krótki opis widoczny na liście..."
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-slate-900/80 p-2 rounded-2xl border border-slate-800">
                    <div className="flex gap-2">
                      {['h2', 'p', 'b', 'i', 'img', 'style'].map(tag => (
                        <button key={tag} type="button" onClick={() => insertTag(tag)} className="px-4 py-2 bg-slate-800 rounded-xl hover:bg-blue-600 transition-all text-[10px] font-black uppercase tracking-widest">{tag}</button>
                      ))}
                    </div>
                    <div className="flex items-center gap-6 pr-4">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={formData.isPublished}
                          onChange={e => setFormData({...formData, isPublished: e.target.checked})}
                          className="w-5 h-5 rounded-lg border-slate-700 bg-slate-950 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-xs font-black text-gray-500 group-hover:text-white transition-colors">OPUBLIKUJ</span>
                      </label>
                      <button 
                        type="button"
                        onClick={() => setPreviewMode(!previewMode)}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all tracking-widest ${previewMode ? 'bg-blue-600 text-white' : 'bg-slate-800 text-blue-400 border border-blue-500/20'}`}
                      >
                        {previewMode ? 'TRYB KODU' : 'PODGLĄD LIVE'}
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 h-[600px]">
                    <div className={`${previewMode ? 'hidden md:block' : 'block'} h-full`}>
                      <textarea
                        id="editor-area"
                        value={formData.content}
                        onChange={e => setFormData({...formData, content: e.target.value})}
                        className="w-full h-full p-8 bg-slate-950/80 border border-slate-800 rounded-[2rem] focus:border-blue-500 outline-none transition-all font-mono text-sm leading-relaxed text-blue-100 shadow-inner"
                        placeholder="Zacznij pisać swój manifest tutaj (HTML supported)..."
                        required
                      />
                    </div>
                    <div className={`${!previewMode ? 'hidden md:block' : 'block'} h-full bg-white border border-slate-800 rounded-[2rem] overflow-y-auto p-10 prose prose-blue max-w-none shadow-2xl`}>
                      <div 
                        className="preview-content-render text-slate-900"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(formData.content) }} 
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xl shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all hover:scale-[1.01] active:scale-95">
                  {editingId ? 'ZAKTUALIZUJ ARTYKUŁ ⚡' : 'OPUBLIKUJ MANIFEST 🚀'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-6">
          <h2 className="text-3xl font-black tracking-tight mb-8">Archiwum Treści</h2>
          <div className="grid gap-4">
            {articles.map(article => (
              <motion.div 
                key={article.id}
                layout
                className="p-8 glass-dark rounded-3xl border border-slate-800 flex flex-col md:row justify-between items-start md:items-center gap-6 group hover:border-blue-500/30 transition-all"
              >
                <div className="flex items-center gap-6">
                  <span className="text-5xl group-hover:scale-110 transition-transform duration-500">{article.image}</span>
                  <div>
                    <h3 className="text-white font-black text-2xl tracking-tight mb-1">{article.title}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 font-bold text-xs">{article.author}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-700" />
                      <span className="text-gray-600 text-xs font-medium">{new Date(article.createdAt).toLocaleDateString('pl-PL')}</span>
                      <span className={`ml-4 px-3 py-1 rounded-lg text-[9px] font-black tracking-widest ${article.isPublished ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}>
                        {article.isPublished ? 'PUBLIC' : 'DRAFT'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <button onClick={() => handleEdit(article)} className="flex-1 md:flex-none px-6 py-3 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-xl hover:bg-blue-600 hover:text-white transition-all font-black text-xs uppercase tracking-widest">Edytuj</button>
                  <button onClick={() => handleDelete(article.id)} className="flex-1 md:flex-none px-6 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-600 hover:text-white transition-all font-black text-xs uppercase tracking-widest">Usuń</button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
