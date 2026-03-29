import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="glass-dark border-t border-blue-500/20 py-12 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <section aria-labelledby="footer-brand">
            <p id="footer-brand" className="text-xl font-bold mb-4 gradient-text">🚀 Młodzi Mentorzy</p>
            <p className="text-gray-400">
              Platforma edukacyjna łącząca młodych mentorów z osobami chętnymi do nauki.
            </p>
          </section>

          <nav aria-label="Szybkie linki">
            <h4 className="font-semibold mb-4 text-blue-400">Nawigacja</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/kursy" className="hover:text-cyan-400 transition-colors focus:text-cyan-400 outline-none focus:underline underline-offset-4">
                  Nasze Kursy
                </Link>
              </li>
              <li>
                <Link href="/artykuly" className="hover:text-cyan-400 transition-colors focus:text-cyan-400 outline-none focus:underline underline-offset-4">
                  Artykuły
                </Link>
              </li>
              <li>
                <Link href="/mentoring" className="hover:text-cyan-400 transition-colors focus:text-cyan-400 outline-none focus:underline underline-offset-4">
                  Zostań Mentorem
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Informacje o firmie">
            <h4 className="font-semibold mb-4 text-blue-400">Informacje</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/o-nas" className="hover:text-cyan-400 transition-colors focus:text-cyan-400 outline-none focus:underline underline-offset-4">
                  O nas
                </Link>
              </li>
              <li>
                <Link href="/partnerzy" className="hover:text-cyan-400 transition-colors focus:text-cyan-400 outline-none focus:underline underline-offset-4">
                  Partnerzy
                </Link>
              </li>
              <li>
                <Link href="/kontakt" className="hover:text-cyan-400 transition-colors focus:text-cyan-400 outline-none focus:underline underline-offset-4">
                  Kontakt
                </Link>
              </li>
            </ul>
          </nav>

          <section aria-labelledby="footer-contact">
            <h4 id="footer-contact" className="font-semibold mb-4 text-blue-400">Kontakt</h4>
            <p className="text-gray-400">email@example.com</p>
            <p className="text-gray-400">+48 XXX XXX XXX</p>
          </section>
        </div>

        <div className="border-t border-blue-500/20 pt-8 text-center text-gray-400">
          <p>&copy; {currentYear} Młodzi Mentorzy. Wszelkie prawa zastrzeżone.</p>
        </div>
      </div>
    </footer>
  );
}
