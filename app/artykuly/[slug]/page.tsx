'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

// Sanitize HTML to prevent style/script injection
function sanitizeHtml(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<link[^>]*rel="stylesheet"[^>]*>/gi, '');
}

export default function ArticleDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticle() {
      try {
        const response = await fetch(`/api/articles/slug/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setArticle(data.article);
        } else {
          router.push('/artykuly');
        }
      } catch (err) {
        console.error('Error fetching article:', err);
        router.push('/artykuly');
      } finally {
        setLoading(false);
      }
    }
    if (slug) fetchArticle();
  }, [slug, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="text-xl animate-pulse">Wczytywanie treści...</div>
      </div>
    );
  }

  if (!article) return null;

  return (
    <div className="min-h-screen py-32 px-4 bg-slate-950 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />
      <div className="absolute top-40 right-10 w-64 h-64 bg-cyan-500/5 blur-3xl rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto max-w-4xl relative z-10"
      >
        <Link 
          href="/artykuly" 
          className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-all mb-12 font-bold group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Powrót do artykułów
        </Link>

        <header className="mb-16 space-y-6">
          <div className="text-6xl mb-6">{article.image}</div>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-tight">
            {article.title}
          </h1>
          <div className="flex items-center gap-4 text-gray-400 font-medium border-l-2 border-blue-500 pl-4 py-1">
            <span>Autor: <span className="text-white">{article.author}</span></span>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <time dateTime={article.createdAt}>{new Date(article.createdAt).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}</time>
          </div>
        </header>

        {/* Dynamic CMS Content with Raw HTML Support */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="prose prose-invert prose-blue max-w-none 
            prose-headings:font-black prose-headings:text-white
            prose-p:text-gray-300 prose-p:leading-relaxed prose-p:text-lg
            prose-a:text-blue-400 prose-a:font-bold prose-a:no-underline hover:prose-a:underline
            prose-strong:text-white prose-strong:font-black
            prose-img:rounded-3xl prose-img:border prose-img:border-slate-800
            prose-hr:border-slate-800"
        >
          <div 
            className="article-body"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content) }} 
          />
        </motion.div>

        <footer className="mt-24 pt-12 border-t border-slate-800 flex justify-between items-center">
          <div className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Młodzi Mentorzy. Artykuł edukacyjny.
          </div>
          <div className="flex gap-4">
             <button className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-gray-400 hover:text-white transition-all">𝕏</button>
             <button className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-gray-400 hover:text-white transition-all">FB</button>
          </div>
        </footer>
      </motion.div>

      {/* Polish Manifesto Sticker (EAA 2025 compliant visual) */}
      <div className="fixed bottom-10 right-10 w-24 h-24 sticker sticker-pink opacity-40 rotate-12 md:flex hidden pointer-events-none" />
    </div>
  );
}
