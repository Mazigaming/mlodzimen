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

interface Article {
  id: string;
  title: string;
  author: string;
  createdAt: string;
  image: string;
  excerpt: string;
  slug: string;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticles() {
      try {
        const response = await fetch('/api/articles');
        if (response.ok) {
          const data = await response.json();
          setArticles(data.articles || []);
        }
      } catch (err) {
        console.error('Error fetching articles:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, []);

  return (
    <div className="min-h-screen py-32 px-4 bg-gradient-to-b from-slate-950/40 via-blue-950/20 to-slate-950/40 relative overflow-hidden">
      {/* Decorative Stickers */}
      <div className="absolute inset-0 overflow-visible pointer-events-none">
        <div className="absolute top-40 left-5 w-32 h-32 sticker sticker-cyan opacity-45 md:flex hidden" />
        <div className="absolute bottom-40 right-10 w-24 h-24 sticker sticker-blue opacity-35 md:flex hidden" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto max-w-5xl relative z-10"
      >
        <motion.div variants={itemVariants} className="text-center mb-16 space-y-4">
          <span className="speech-bubble inline-block">
            Artykuły 📝
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white">
            Edukacja Okiem <span className="text-gradient-warm">Młodych</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Artykuły i manifesty od naszych mentorów na temat przyszłości edukacji
          </p>
        </motion.div>

        <motion.div variants={containerVariants} className="grid md:grid-cols-2 gap-8" role="feed" aria-busy={loading}>
          {loading ? (
            <div className="col-span-full text-center text-white py-20 text-xl">Ładowanie artykułów...</div>
          ) : articles.map((article) => (
            <motion.article
              key={article.id}
              variants={itemVariants}
              whileHover={{ translateY: -8 }}
              className="rounded-2xl border border-slate-700/50 overflow-hidden interactive-card"
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(10px)',
              }}
              aria-labelledby={`article-title-${article.id}`}
            >
              <div className="bg-gradient-to-br from-blue-600/30 to-cyan-600/30 p-12 text-center text-6xl border-b border-slate-700/50" aria-hidden="true">
                {article.image}
              </div>
              <div className="p-8 space-y-4">
                <div>
                  <h2 id={`article-title-${article.id}`} className="text-2xl font-black text-white mb-3">{article.title}</h2>
                  <p className="text-gray-400 text-sm">
                    by {article.author} • <time dateTime={article.createdAt}>{new Date(article.createdAt).toLocaleDateString('pl-PL')}</time>
                  </p>
                </div>
                <p className="text-gray-400 leading-relaxed line-clamp-3">{article.excerpt}</p>
                <Link 
                  href={`/artykuly/${article.slug}`}
                  className="text-blue-400 hover:text-blue-300 font-bold transition-colors flex items-center gap-2 focus:underline outline-none"
                  aria-label={`Czytaj więcej o: ${article.title}`}
                >
                  Czytaj więcej <span aria-hidden="true">→</span>
                </Link>
              </div>
            </motion.article>
          ))}
          {!loading && articles.length === 0 && (
            <div className="col-span-full text-center py-20 text-gray-500 bg-slate-900/20 rounded-2xl border border-dashed border-slate-800">
              Brak artykułów do wyświetlenia.
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
