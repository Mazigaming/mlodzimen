'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function useRevealAnimations() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Set initial state for all reveal elements immediately
      gsap.set('[data-scroll-reveal]', { autoAlpha: 0, y: 50 });
      gsap.set('.hero-reveal', { autoAlpha: 0, y: 30 });
      
      // Mark as ready to show elements
      document.body.classList.add('reveal-ready');

      // Hero Animations
      gsap.to('.hero-reveal', {
        autoAlpha: 1,
        y: 0,
        duration: 1,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.3
      });

      // Parallax
      const parallaxElements = document.querySelectorAll('[data-parallax]');
      parallaxElements.forEach((el) => {
        gsap.to(el, {
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.5,
          },
          y: -50,
          ease: 'none',
        });
      });

      // Scroll Reveal
      const revealElements = document.querySelectorAll('[data-scroll-reveal]');
      revealElements.forEach((el) => {
        gsap.to(el, {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        });
      });
    });

    return () => {
      ctx.revert();
      document.body.classList.remove('reveal-ready');
    };
  }, []);
}

export default function Home() {
  useRevealAnimations();

  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-32 md:pt-48 pb-32 md:pb-48 overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950/40 to-slate-950">
        {/* Decorative Stickers */}
        <div className="absolute inset-0 overflow-visible pointer-events-none">
          <div className="absolute top-20 right-10 w-32 h-32 sticker sticker-blue opacity-50" />
          <div className="absolute bottom-40 left-5 w-24 h-24 sticker sticker-cyan opacity-40 md:flex hidden" />
          <div className="absolute top-1/3 right-1/4 w-20 h-20 sticker sticker-cyan opacity-45 md:flex hidden" />
          <div className="absolute bottom-20 right-20 w-28 h-28 sticker sticker-pink opacity-40 md:flex hidden" />
        </div>
        
        {/* Background Glows */}
        <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-20 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
        
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-20 lg:gap-32 items-center relative z-10">
            {/* Text Content */}
            <div className="space-y-10">
              {/* Speech Bubble Intro */}
              <div className="flex items-center gap-3 mb-6 hero-reveal">
                <span className="speech-bubble">Cześć! 👋</span>
              </div>

              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black leading-tight tracking-tight hero-reveal">
                <span className="text-gradient-warm">Podziel</span>
                <span className="block text-white mt-3">się</span>
                <span className="block text-white mt-3">wiedzą!</span>
              </h1>

              <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-lg font-light hero-reveal">
                Młodzi Mentorzy to miejsce, gdzie wiedza staje się wsparciem, inspiracją i realną pomocą dla innych.
              </p>

              <div className="flex gap-4 flex-wrap pt-6 hero-reveal">
                <Link
                  href="/kursy"
                  className="btn btn-primary"
                >
                  Odkryj Kursy
                </Link>
                <Link
                  href="/mentoring"
                  className="btn btn-outline"
                >
                  Zostań Mentorem
                </Link>
              </div>
            </div>

            {/* Image Placeholder with Stickers */}
            <div className="relative hidden md:flex items-center justify-center overflow-visible hero-reveal">
              <div className="relative w-full">
                {/* Decorative Elements Around Image */}
                <div className="absolute -top-8 -right-8 w-32 h-32 sticker sticker-pink opacity-40 pointer-events-none" />
                <div className="absolute -bottom-12 left-0 w-28 h-28 sticker sticker-cyan opacity-45 pointer-events-none" />
                
                <div className="relative group">
                  <div className="relative rounded-3xl overflow-hidden border-2 border-blue-500/30 hover:border-amber-400/50 transition-all duration-300">
                    <img
                      src="/podzielsiewiedza.jpg"
                      alt="hero"
                      className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent group-hover:from-amber-900/20 transition-all duration-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="h-32 md:h-48 lg:h-64" />

      {/* About Project Section */}
      <section className="relative py-32 md:py-48 bg-gradient-to-b from-slate-950/40 via-blue-950/20 to-slate-950/40">
        {/* Decorative Stickers - Subtle */}
        <div className="absolute inset-0 overflow-visible pointer-events-none">
          <div className="absolute top-40 left-5 w-32 h-32 sticker sticker-cyan opacity-45 md:flex hidden" />
          <div className="absolute bottom-40 right-10 w-24 h-24 sticker sticker-blue opacity-35 md:flex hidden" />
        </div>
        
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="space-y-32">
            {/* Featured Image */}
            <div data-scroll-reveal className="relative overflow-hidden rounded-2xl border border-slate-700/50 group hover:border-white/30 transition-all duration-300 hover:shadow-xl">
              <div className="relative h-96 md:h-[480px] lg:h-[580px] overflow-hidden flex items-center justify-center h-screen">
                <svg  width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="32" cy="32" r="30" fill="#001aff" stroke="#FFFFFF" stroke-width="4"/>
                  <path d="M26 22L42 32L26 42Z" fill="#FFFFFF"/>
                </svg>  
                {/* <img
                  data-parallax
                  src="/placeholder.png"
                  alt="featured"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                /> */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent group-hover:from-slate-950/30 transition-all duration-300" />
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid md:grid-cols-2 gap-20 lg:gap-32 items-start">
              {/* Text */}
              <div className="space-y-8">
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-black">
                  <span className="text-gradient-warm">Dlaczego</span> <span className="text-white">Młodzi</span> <span className="text-gradient-warm">Mentorzy?</span>
                </h2>
                <div className="space-y-6 border-l-4 border-l-amber-400 pl-8">
                  <p className="text-gray-300 text-lg leading-relaxed">
                    Polska szkoła często skutecznie zniechęca do nauki i sprawia, że człowiek ma po prostu dość. My chcemy to odkręcić - każdy ma coś wartościowego do przekazania. Każdy może rozwijać innych i przy okazji zarobić pierwsze pieniądze.
                  </p>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    Młodzi Mentorzy to umożliwiają - jesteśmy tu po to, aby sworzyć społeczność, która dzieli się swoją wiedzą - czy to przedmioty szkolne, plany treningowe, czy gra na instrumencie - w przystępnej dla nas, młodzieży, cenie.
                  </p>
                </div>
              </div>

                {/* Images Grid */}
                <div className="grid grid-cols-2 gap-5">
                {[
                  '/nagrywki.jpeg',
                  '/bruh.jpeg',
                  '/dominikpopek.jpg',
                  '/jakubwenerski.png',
                ].map((src, i) => (
                  <div
                  key={i}
                  data-scroll-reveal
                  className="relative overflow-hidden rounded-xl border border-slate-700/50 group aspect-square hover:border-white/30 transition-all duration-300 hover:shadow-lg"
                  >
                  <img
                    src={src}
                    alt="placeholder"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 to-transparent" />
                  </div>
                ))}
                </div>
            </div>
          </div>
        </div>
      </section>

      <div className="h-16 md:h-24 lg:h-32" />

      {/* Features Section */}
      <section className="relative py-24 md:py-32 lg:py-40 bg-gradient-to-b from-slate-950/30 via-blue-950/30 to-slate-950/30">
        {/* Decorative Stickers - Behind Content */}
        <div className="absolute inset-0 overflow-visible pointer-events-none">
          <div className="absolute top-20 left-5 w-24 h-24 sticker sticker-blue opacity-40 md:flex hidden" />
          <div className="absolute bottom-40 right-10 w-20 h-20 sticker sticker-cyan opacity-50 md:flex hidden" />
        </div>
        
        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
            {[
              {
                title: 'Społeczność',
                description: 'Razem z innymi twórz kursy, pisz artykuły i zdobywaj wiedzę!',
                icon: '👥',
                accent: 'border-l-4 border-l-blue-400',
              },
              {
                title: 'Inwestycja',
                description: 'Zarób pierwsze pieniądze na dalszy rozwój.',
                icon: '⚡',
                accent: 'border-l-4 border-l-amber-400',
              },
              {
                title: 'Rozwój',
                description: 'Nie certyfikaty - rzeczywiste umiejątności, które Ci pomogą.',
                icon: '🚀',
                accent: 'border-l-4 border-l-cyan-400',
              },
            ].map((feature) => (
              <div key={feature.title} data-scroll-reveal className="group h-full interactive-card">
                <div className={`rounded-2xl border border-slate-700/50 p-8 h-full flex flex-col items-start text-left ${feature.accent} hover:border-white/30 hover:bg-white/5 transition-all duration-300`}>
                  <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-16 md:h-24 lg:h-32" />

      {/* Two Path Section */}
      <section className="relative py-24 md:py-32 lg:py-40 bg-gradient-to-br from-slate-950/50 via-blue-950/25 to-slate-950/50">
        {/* Decorative Stickers - Subtle Backdrop */}
        <div className="absolute inset-0 overflow-visible pointer-events-none">
          <div className="absolute top-32 right-5 w-28 h-28 sticker sticker-pink opacity-35 md:flex hidden" />
          <div className="absolute bottom-32 left-10 w-24 h-24 sticker sticker-blue opacity-40 md:flex hidden" />
        </div>
        
        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-center mb-28 md:mb-40">
            <span className="text-gradient-warm">Wybierz</span> <span className="text-white">Swoją</span> <span className="text-gradient-warm">Ścieżkę</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-10 lg:gap-14">
            {/* Student Path */}
            <div data-scroll-reveal className="interactive-card rounded-2xl p-10 border-l-4 border-l-blue-400 border border-slate-700/50 h-full flex flex-col hover:border-slate-600 hover:bg-white/5 transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-8 text-4xl shadow-lg group-hover:scale-110 transition-transform">
                📚
              </div>
              <h3 className="text-3xl font-black text-white mb-5">Zostań Uczniem</h3>
              <p className="text-gray-300 mb-10 text-lg leading-relaxed flex-grow">
                Praktyczna wiedza. Od mentorów, którzy nauczają bo chcą, a nie bo muszą.
              </p>
              <ul className="space-y-4 mb-10 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-cyan-400 text-xl flex-shrink-0 mt-0.5">→</span>
                  <span className="text-base font-medium">Kupuj kursy w przystępnej cenie</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cyan-400 text-xl flex-shrink-0 mt-0.5">→</span>
                  <span className="text-base font-medium">Zdobywaj przydatną wiedzę</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cyan-400 text-xl flex-shrink-0 mt-0.5">→</span>
                  <span className="text-base font-medium">Dziel się przemyśleniami tworząc artykuły</span>
                </li>
              </ul>
              <Link href="/register?type=student" className="btn btn-primary block text-center w-full mt-auto">
                Ucz się już teraz!
              </Link>
            </div>

            {/* Mentor Path */}
            <div data-scroll-reveal className="interactive-card rounded-2xl p-10 border-l-4 border-l-cyan-400 border border-slate-700/50 h-full flex flex-col hover:border-slate-600 hover:bg-white/5 transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center mb-8 text-4xl shadow-lg group-hover:scale-110 transition-transform">
                🎓
              </div>
              <h3 className="text-3xl font-black text-white mb-5">Zostań Mentorem</h3>
              <p className="text-gray-300 mb-10 text-lg leading-relaxed flex-grow">
                Dziel się wiedzą. Sposób na uczciwe zarabianie online.
              </p>
              <ul className="space-y-4 mb-10 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-blue-400 text-xl flex-shrink-0 mt-0.5">→</span>
                  <span className="text-base font-medium">Własne kursy i programy</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-400 text-xl flex-shrink-0 mt-0.5">→</span>
                  <span className="text-base font-medium">Dedykowane wsparcie</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-400 text-xl flex-shrink-0 mt-0.5">→</span>
                  <span className="text-base font-medium">Natychmiastowe wypłaty</span>
                </li>
              </ul>
              <Link href="/register?type=mentor" className="btn btn-secondary block text-center w-full mt-auto">
                Zarabiaj już teraz!
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="h-32 md:h-48 lg:h-64" />

      {/* CTA Section */}
      <section className="py-32 md:py-48 lg:py-64 relative overflow-hidden bg-gradient-to-br from-blue-950/40 via-blue-900/30 to-slate-950/50">
        {/* Decorative Stickers - Very Subtle */}
        <div className="absolute inset-0 overflow-visible pointer-events-none">
          <div className="absolute top-20 left-10 w-24 h-24 sticker sticker-pink opacity-30 md:flex hidden" />
          <div className="absolute bottom-40 right-5 w-28 h-28 sticker sticker-cyan opacity-40 md:flex hidden" />
          <div className="absolute top-1/2 left-1/4 w-20 h-20 sticker sticker-blue opacity-35 md:flex hidden" />
        </div>
        
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-1/4 w-96 h-96 rounded-full bg-blue-500/6 blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-72 h-72 rounded-full bg-blue-500/6 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 text-center max-w-4xl relative z-10">
          <div data-scroll-reveal className="space-y-12">
            <div className="inline-block speech-bubble mb-8">
              <span className="text-2xl">Nie ma na co czekać! 🚀</span>
            </div>

            <h2 className="text-6xl md:text-7xl lg:text-8xl font-black">
              <span className="text-white">Gotowy</span> <span className="text-gradient-warm">na zmianę?</span>
            </h2>

            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
              <Link href="/register" className="btn btn-primary px-12 md:px-16 py-5 md:py-6 text-base md:text-lg">
                Dołącz Teraz
              </Link>
              <Link href="/kontakt" className="btn btn-outline px-12 md:px-16 py-5 md:py-6 text-base md:text-lg">
                Dowiedz Się Więcej
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="h-32 md:h-48 lg:h-64" />
    </>
  );
}
