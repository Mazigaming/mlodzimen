'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnnouncementBanner() {
  const [config, setConfig] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch('/api/admin/config');
        if (res.ok) {
          const data = await res.json();
          if (data.config && data.config.bannerMessage) {
            setConfig(data.config);
          }
        }
      } catch (err) {
        // Silently fail if not reachable
      }
    }
    fetchConfig();
  }, []);

  if (!config || !config.bannerMessage || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-2 px-4 text-center text-xs font-black relative z-[100] border-b border-white/10"
      >
        <div className="container mx-auto flex items-center justify-center gap-4">
          <span className="animate-pulse">✨</span>
          <p className="tracking-wide uppercase">{config.bannerMessage}</p>
          <span className="animate-pulse">✨</span>
          <button 
            onClick={() => setIsVisible(false)}
            className="ml-4 hover:scale-125 transition-transform"
          >
            ✕
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
