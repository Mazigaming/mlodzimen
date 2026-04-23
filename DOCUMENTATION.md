# Dokumentacja Platformy Młodzi Mentorzy

## Wprowadzenie

Platforma Młodzi Mentorzy to nowoczesna platforma edukacyjna łącząca mentorów z uczniami. System umożliwia tworzenie kursów, sprzedaż dostępu do nich oraz zarządzanie płatnościami.

## Architektura Techniczna

### Frontend
- **Next.js 15** - React framework z App Router
- **TypeScript** - Typowany JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animacje i przejścia

### Backend
- **Next.js API Routes** - Server-side API
- **Prisma ORM** - Database ORM dla TypeScript
- **MySQL** - Relacyjna baza danych

### Płatności
- **Stripe** - Przetwarzanie płatności
- **Webhooki** - Automatyczne przetwarzanie płatności

### Infrastruktura
- **PM2** - Process manager dla Node.js
- **Nginx** - Reverse proxy i load balancer
- **SSL** - Certyfikaty Let's Encrypt

## Baza Danych

### Główne Tabele

#### Users (Użytkownicy)
```sql
- id: String (CUID)
- email: String (unique)
- name: String
- nickname: String?
- password: String (hashed)
- role: String (student|mentor|admin)
- avatar: String?
- isVerified: Boolean
- isActive: Boolean
- verificationToken: String?
- passwordResetToken: String?
- passwordResetExpires: DateTime?
```

#### Courses (Kursy)
```sql
- id: String (CUID)
- title: String
- description: String
- price: Float
- category: String
- level: String (beginner|intermediate|advanced)
- isVerified: Boolean
- mentorId: String (FK do Users)
```

#### Modules (Moduły)
```sql
- id: String (CUID)
- title: String
- order: Int
- courseId: String (FK do Courses)
```

#### Lessons (Lekcje)
```sql
- id: String (CUID)
- title: String
- description: String?
- videoUrl: String?
- content: String?
- order: Int
- moduleId: String (FK do Modules)
```

#### Enrollments (Zapisy)
```sql
- userId: String (FK do Users)
- courseId: String (FK do Courses)
- status: String (active|completed)
- paidAmount: Float
- payoutProcessed: Boolean
- couponCode: String?
- couponCreatorId: String?
```

#### Coupons (Kupony)
```sql
- id: String (CUID)
- code: String (unique, uppercase)
- discountType: String (fixed|percent)
- discountValue: Float
- maxUses: Int?
- usedCount: Int
- expiresAt: DateTime?
- isActive: Boolean
- creatorId: String (FK do Users)
```

#### Payouts (Wypłaty)
```sql
- id: String (CUID)
- mentorId: String (FK do Users)
- amount: Float
- status: String (pending|paid|cancelled)
- notes: String?
```

#### Articles (Artykuły)
```sql
- id: String (CUID)
- title: String
- content: String (LongText)
- excerpt: String
- author: String
- image: String (emoji)
- slug: String (unique)
- isPublished: Boolean
```

### Relacje
- User → Courses (1:many jako mentor)
- User → Enrollments (1:many)
- User → Coupons (1:many jako creator)
- User → Payouts (1:many jako mentor)
- Course → Modules (1:many)
- Course → Enrollments (1:many)
- Module → Lessons (1:many)

## System Płatności

### Proces Płatności
1. Użytkownik dodaje kurs do koszyka
2. Wprowadza opcjonalny kod kuponu
3. Stripe oblicza finalną cenę z rabatem
4. Przekierowanie do Stripe Checkout
5. Po płatności: webhook aktualizuje enrollment
6. Payout jest przetwarzany przez admina

### Rozdział Pieniędzy

#### Sprzedaż Normalna (bez kuponu)
- Cena kursu: 100 PLN
- Platforma: 15% = 15 PLN
- Mentor: 85% = 85 PLN

#### Sprzedaż z Kuponem (10% zniżki)
- Oryginalna cena: 100 PLN
- Cena po rabacie: 90 PLN
- Platforma: 5% z oryginalnej ceny = 5 PLN
- Mentor: 75% z oryginalnej ceny = 75 PLN
- Twórca kuponu: 10% z oryginalnej ceny = 10 PLN

### Payout Processing
1. Admin uruchamia `/api/admin/payouts` (POST)
2. System grupuje enrollmenty po mentorach
3. Tworzy payout records z odpowiednimi kwotami
4. Oznacza enrollmenty jako processed
5. Admin może zmienić status payout na "paid"

## Kursy i Treści

### Struktura Kursu
```
Kurs
├── Moduł 1
│   ├── Lekcja 1.1 (video + content)
│   └── Lekcja 1.2 (video + content)
└── Moduł 2
    ├── Lekcja 2.1 (video + content)
    └── Lekcja 2.2 (video + content)
```

### Tworzenie Kursu
1. Mentor loguje się i przechodzi do "Create Course"
2. Wprowadza tytuł, opis, cenę, kategorię, poziom
3. Dodaje moduły i lekcje z video URL
4. Kurs wymaga weryfikacji przez admina przed publikacją

### Dostęp do Kursu
- Po zapłaceniu użytkownik ma lifetime access
- Kursy są zorganizowane w moduły i lekcje
- Video są hostowane na YouTube/Vimeo

## System Użytkowników

### Role
- **Student**: Może kupować kursy, używać kuponów
- **Mentor**: Może tworzyć kursy, zarządzać nimi, otrzymywać wypłaty
- **Admin**: Pełne uprawnienia, weryfikacja mentorów, zarządzanie systemem

### Rejestracja i Weryfikacja
1. Użytkownik rejestruje się
2. Otrzymuje email weryfikacyjny
3. Po weryfikacji może się logować
4. Mentorzy wymagają dodatkowej weryfikacji przez admina

### Konta Mentorów
- Muszą być zweryfikowani przez admina
- Mogą tworzyć maksymalnie 1 kupon rabatowy (10%)
- Otrzymują wypłaty za sprzedaż kursów

## System Kuponów

### Tworzenie Kuponów
- Każdy użytkownik może stworzyć 1 kupon
- Stała zniżka 10%
- Kupon może mieć limit użyć i datę wygaśnięcia

### Korzystanie z Kuponów
1. Przy zakupie kursu użytkownik wprowadza kod
2. System waliduje kupon (aktywny, nie wygasł, limit użyć)
3. Oblicza cenę z rabatem
4. Po płatności: zwiększa usedCount, tworzy payout dla twórcy kuponu

## Artykuły i CMS

### Zarządzanie Treściami
- Admin może tworzyć artykuły w systemie CMS
- Artykuły mają tytuł, content (HTML), excerpt, autora
- Mogą być opublikowane lub w draft
- Każdy artykuł ma unikalny slug dla URL

### Funkcje CMS
- Rich text editor z HTML support
- Podgląd na żywo
- Emoji ikony dla artykułów
- Zarządzanie statusem publikacji

## API Endpoints

### Auth
- `POST /api/auth/register` - Rejestracja
- `POST /api/auth/login` - Logowanie
- `POST /api/auth/logout` - Wylogowanie
- `GET /api/auth/me` - Informacje o użytkowniku
- `POST /api/auth/verify-email` - Weryfikacja email
- `POST /api/auth/forgot-password` - Reset hasła

### Kursy
- `GET /api/courses` - Lista kursów
- `GET /api/courses/[id]` - Szczegóły kursu
- `POST /api/courses/create` - Tworzenie kursu
- `PATCH /api/courses/[id]` - Edycja kursu

### Płatności
- `POST /api/checkout` - Inicjalizacja płatności Stripe
- `POST /api/webhook/stripe` - Webhook Stripe

### Admin
- `GET /api/admin/users` - Lista użytkowników
- `PATCH /api/admin/users` - Zarządzanie użytkownikami
- `GET /api/admin/courses` - Lista kursów
- `POST /api/admin/payouts` - Przetwarzanie wypłat
- `GET /api/admin/articles` - Lista artykułów
- `POST /api/admin/articles` - Zarządzanie artykułami

## Przydatne Linki do Nauki

### Bazy Danych
- [SQLZoo](https://sqlzoo.net/) - Ćwiczenia SQL
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/) - Kurs PostgreSQL
- [MySQL Documentation](https://dev.mysql.com/doc/) - Dokumentacja MySQL
- [Prisma Documentation](https://www.prisma.io/docs) - Dokumentacja Prisma ORM

### Next.js & React
- [Next.js Documentation](https://nextjs.org/docs) - Oficjalna dokumentacja
- [React Documentation](https://react.dev/) - Dokumentacja React
- [Vercel Learn](https://vercel.com/docs/concepts/get-started-with-nextjs) - Kurs Next.js

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - Podręcznik TypeScript
- [TypeScript Exercises](https://typescript-exercises.github.io/) - Ćwiczenia

### Płatności
- [Stripe Documentation](https://stripe.com/docs) - Dokumentacja Stripe
- [Stripe Testing](https://stripe.com/docs/testing) - Testowanie płatności

## Deployment

### VPS Setup
1. Ubuntu 22.04 LTS
2. Node.js 18+
3. MySQL 8.0
4. Nginx
5. PM2
6. SSL (Let's Encrypt)

### Środowisko Produkcyjne
```bash
# Instalacja zależności
npm install

# Build aplikacji
npm run build

# Uruchomienie przez PM2
pm2 start npm --name "mlodzi-mentorzy" -- start

# Konfiguracja Nginx
sudo nano /etc/nginx/sites-available/mlodzimentorzy.pl

# SSL przez Certbot
sudo certbot --nginx -d mlodzimentorzy.pl
```

## Troubleshooting

### Częste Problemy

#### Błąd połączenia z bazą danych
- Sprawdź DATABASE_URL w .env
- Upewnij się że MySQL działa
- Sprawdź uprawnienia użytkownika bazy

#### Płatności nie działają
- Sprawdź STRIPE_SECRET_KEY
- Upewnij się że webhook endpoint jest dostępny
- Sprawdź logi Stripe dashboard

#### Kursy nie ładują się
- Sprawdź czy kurs jest zweryfikowany przez admina
- Upewnij się że użytkownik ma enrollment

#### Email nie wysyłają się
- Obecnie tylko logowanie do konsoli
- Dla produkcji: skonfiguruj SMTP lub EmailJS

## Kontakt

W przypadku problemów lub pytań:
- Sprawdź logi aplikacji: `pm2 logs mlodzi-mentorzy`
- Sprawdź logi Nginx: `sudo tail -f /var/log/nginx/error.log`
- Monitoruj bazę danych: `sudo mysql -u root -p`