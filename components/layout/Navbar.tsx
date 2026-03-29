'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  async function checkAuth() {
    try {
      const res = await fetch('/api/user/profile', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  }

  const navLinks = [
    { href: '/', label: 'Start' },
    { href: '/kursy', label: 'Kursy' },
    { href: '/artykuly', label: 'Artykuły' },
    { href: '/mentoring', label: 'Mentorzy' },
    { href: '/partnerzy', label: 'Partnerzy' },
    { href: '/o-nas', label: 'O Nas' },
    { href: '/kontakt', label: 'Kontakt' },
  ];

  return (
    <nav className="glass-dark sticky top-0 z-50 border-b border-blue-500/20" aria-label="Główna nawigacja">
      <div className="max-w-full mx-auto px-6 py-6">
        <div className="flex items-center w-full gap-4">
          {/* Logo - flex to grow with content */}
          <div className="flex-shrink-0 pr-2">
            <Link href="/" className="text-xl md:text-2xl font-bold gradient-text whitespace-nowrap block" aria-label="Młodzi Mentorzy - Strona główna">
              🚀 Młodzi Mentorzy
            </Link>
          </div>

          {/* Navigation - centered with equal margins */}
          <div className="hidden md:flex flex-1 mx-2 lg:mx-4">
            <ul className="flex items-center list-none m-0 p-0 w-full justify-evenly gap-x-2 lg:gap-x-4">
              {navLinks.map((link) => (
                <li key={link.href} className="flex-shrink-0">
                  <Link
                    href={link.href}
                    className="text-xs md:text-sm font-medium text-gray-300 hover:text-cyan-400 transition-colors duration-300 whitespace-nowrap px-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Auth */}
          <div className="flex-shrink-0 pl-2 flex justify-end items-center gap-4">
            <div className="hidden md:block">
              {user ? (
                <div className="flex items-center gap-6">
                  <Link href="/dashboard" className="flex items-center gap-2 group focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded-lg p-1" aria-label="Przejdź do dashboardu">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 p-0.5 group-hover:ring-2 group-hover:ring-cyan-400/50 transition-all" aria-hidden="true">
                      {user?.avatar ? (
                        <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover bg-slate-900" />
                      ) : (
                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-lg">👤</div>
                      )}
                    </div>
                    <span className="text-gray-300 group-hover:text-cyan-400 font-bold transition-colors">Panel</span>
                  </Link>
                  <span className="text-gray-600">|</span>
                  <button 
                    onClick={handleLogout}
                    className="text-gray-400 hover:text-red-400 text-sm font-bold transition-colors"
                  >
                    Wyloguj
                  </button>
                </div>
              ) : (
                <Link href="/login" className="btn btn-primary text-sm focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400" aria-label="Zaloguj się do platformy">
                  Logowanie
                </Link>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden flex flex-col gap-1 p-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded-lg"
              aria-label={isOpen ? "Zamknij menu" : "Otwórz menu"}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              <span className={`w-6 h-0.5 bg-blue-400 block transition-transform ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
              <span className={`w-6 h-0.5 bg-blue-400 block transition-opacity ${isOpen ? 'opacity-0' : ''}`}></span>
              <span className={`w-6 h-0.5 bg-blue-400 block transition-transform ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div id="mobile-menu" className="md:hidden mt-4 space-y-2 animate-fade-in-up" role="menu">
            <ul className="list-none p-0 m-0">
              {navLinks.map((link) => (
                <li key={link.href} role="none">
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    role="menuitem"
                    className="block py-2 px-4 text-gray-300 hover:text-cyan-400 hover:bg-blue-500/10 rounded transition-colors focus:bg-blue-500/20"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {user ? (
                <>
                  <li role="none">
                    <Link href="/dashboard" onClick={() => setIsOpen(false)} role="menuitem" className="block py-2 px-4 text-cyan-400 font-bold hover:bg-blue-500/10 rounded transition-colors">
                      Mój Panel 👤
                    </Link>
                  </li>
                  <li role="none">
                    <button 
                      onClick={() => { setIsOpen(false); handleLogout(); }}
                      className="w-full text-left py-2 px-4 text-red-400 font-bold hover:bg-red-500/10 rounded transition-colors"
                    >
                      Wyloguj się
                    </button>
                  </li>
                </>
              ) : (
                <li role="none">
                  <Link href="/login" onClick={() => setIsOpen(false)} role="menuitem" className="block btn btn-primary text-center">
                    Logowanie
                  </Link>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}
