import type { Metadata } from 'next';
import './globals.css';
import { Poppins, Inter } from 'next/font/google';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import LayoutClient from '@/components/LayoutClient';
import AnnouncementBanner from '@/components/layout/AnnouncementBanner';

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

const inter = Inter({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Młodzi Mentorzy - Platforma Edukacyjna',
  description: 'Połącz się z młodymi mentorami i rozwijaj swoje umiejętności',
  keywords: 'mentoring, edukacja, młodzież, praktyka',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" className={`${poppins.variable} ${inter.variable}`}>
      <body className="bg-slate-950 text-white antialiased">
        <AnnouncementBanner />
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-blue-600 focus:text-white focus:px-6 focus:py-3 focus:rounded-xl focus:font-bold focus:shadow-2xl focus:shadow-blue-500/50 outline-none transition-all"
        >
          Skocz do treści głównej
        </a>
        <LayoutClient>
          <Navbar />
          <main id="main-content" className="min-h-screen">
            {children}
          </main>
          <Footer />
        </LayoutClient>
      </body>
    </html>
  );
}
