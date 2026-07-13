# Młodzi Mentorzy - Platforma Edukacyjna

> Kompletny przewodnik administratora - od podstaw po zaawansowane funkcje.

---

## 📋 Spis treści

1. [Czym jest ta platforma?](#czym-jest-ta-platforma)
2. [Wymagania](#wymagania)
3. [Pierwsze uruchomienie](#pierwsze-uruchomienie)
4. [Logowanie jako administrator](#logowanie-jako-administrator)
5. [Panel administratora - co gdzie znaleźć](#panel-administratora---co-gdzie-znaleźć)
6. [Zarządzanie użytkownikami](#zarządzanie-użytkownikami)
7. [Zarządzanie kursami](#zarządzanie-kursami)
8. [Zarządzanie artykułami](#zarządzanie-artykułami)
9. [Kupony rabatowe](#kupony-rabatowe)
10. [Wypłaty dla mentorów](#wypłaty-dla-mentorów)
11. [Aplikacje mentorskie](#aplikacje-mentorskie)
12. [Ustawienia globalne](#ustawienia-globalne)
13. [Tryb konserwacji (Maintenance Mode)](#tryb-konserwacji-maintenance-mode)
14. [Aktualizacja strony - krok po kroku](#aktualizacja-strony---krok-po-kroku)
15. [Baza danych - podstawy](#baza-danych---podstawy)
16. [Najczęstsze problemy i rozwiązania](#najczęstsze-problemy-i-rozwiązania)
17. [Struktura projektu](#struktura-projektu)

---

## Czym jest ta platforma?

**Młodzi Mentorzy** to platforma edukacyjna, gdzie:
- **Mentorzy** tworzą kursy i uczą
- **Uczniowie** kupują kursy i się uczą
- **Administrator** zarządza całą platformą

Platforma obsługuje płatności przez Stripe, przechowywanie plików w Cloudinary i wysyłanie emaili.

---

## Wymagania

| Wymaganie | Wersja | Dlaczego? |
|-----------|--------|-----------|
| Node.js | 20+ | Uruchamia aplikację |
| npm | 10+ | Instaluje zależności |
| MySQL | 8+ | Baza danych |
| PM2 | latest | Trzyma stronę online |
| Nginx | latest | Proxy do strony |
| Git | latest | Pobiera aktualizacje |

---

## Pierwsze uruchomienie

### Krok 1: Pobierz projekt na VPS

```bash
cd /root
git clone https://github.com/Mazigaming/mlodzimen.git mlodzimen
cd mlodzimen
```

### Krok 2: Zainstaluj zależności

```bash
npm install
```

### Krok 3: Skonfiguruj zmienne środowiskowe

```bash
cp .env.example .env
nano .env
```

**Wymagane zmienne w `.env`:**

| Zmienna | Opis | Przykład |
|---------|------|----------|
| `DATABASE_URL` | Połączenie do MySQL | `mysql://user:haslo@localhost:3306/mlodzi_mentorzy` |
| `JWT_SECRET` | Tajny klucz do sesji | `losowy-ciag-znakow-min-32-znaki` |
| `NEXT_PUBLIC_APP_URL` | Adres strony | `https://mlodzimentorzy.pl` |
| `STRIPE_SECRET_KEY` | Klucz Stripe (secret) | `sk_test_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Klucz Stripe (publiczny) | `pk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Sekret webhooka Stripe | `whsec_...` |
| `CLOUDINARY_CLOUD_NAME` | Nazwa Cloudinary | `twoj-cloud-name` |
| `CLOUDINARY_API_KEY` | Klucz Cloudinary | `123456789` |
| `CLOUDINARY_API_SECRET` | Sekret Cloudinary | `losowy-ciag` |
| `SMTP_HOST` | Serwer SMTP | `smtp.gmail.com` |
| `SMTP_PORT` | Port SMTP | `587` |
| `SMTP_USER` | Login SMTP | `email@gmail.com` |
| `SMTP_PASS` | Hasło SMTP | `haslo-aplikacji` |
| `SMTP_FROM` | Adres nadawcy | `noreply@mlodzimentorzy.pl` |

### Krok 4: Uruchom migracje bazy danych

```bash
npx prisma migrate deploy
```

### Krok 5: Załaduj dane początkowe

```bash
npm run seed
```

To utworzy:
- Konto admina: `admin@admin.com` / `admin123`
- Konto mentora: `admin@test.pl` / `admin123`
- Przykładowe artykuły
- Przykładowy kurs

### Krok 6: Zbuduj aplikację

```bash
npm run build
```

### Krok 7: Uruchom przez PM2

```bash
pm2 start npm --name "mlodzi-mentorzy" -- start
pm2 save
pm2 startup
```

### Krok 8: Skonfiguruj Nginx

```bash
nano /etc/nginx/sites-available/mlodzimentorzy.pl
```

```nginx
server {
    listen 80;
    server_name mlodzimentorzy.pl www.mlodzimentorzy.pl;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/mlodzimentorzy.pl /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

### Krok 9: SSL przez Certbot

```bash
certbot --nginx -d mlodzimentorzy.pl -d www.mlodzimentorzy.pl
```

---

## Logowanie jako administrator

1. Wejdź na `https://mlodzimentorzy.pl/login`
2. Zaloguj się:
   - **Email:** `admin@admin.com`
   - **Hasło:** `admin123`
3. **ZMIEŃ HASŁO** po pierwszym logowaniu!

> **Uwaga:** Konto `admin@admin.com` ma zawsze pełne uprawnienia administratora, niezależnie od roli w bazie danych.

---

## Panel administratora - co gdzie znaleźć

Po zalogowaniu wejdź na `https://mlodzimentorzy.pl/dashboard/admin`

Panel ma **8 zakładek**:

| Zakładka | Co robi |
|----------|---------|
| 📊 **Statystyki** | Podsumowanie: przychody, liczba użytkowników, ostatnie zapisy |
| 👥 **Użytkownicy** | Lista wszystkich użytkowników, zmiana ról, blokowanie |
| 📚 **Kursy** | Weryfikacja kursów, usuwanie, podgląd |
| 📝 **Zapisy** | Lista wszystkich zakupów kursów |
| 💰 **Wypłaty** | Generowanie wypłat dla mentorów |
| ✏️ **Artykuły** | Tworzenie/edycja/usuwanie artykułów |
| 🎫 **Kupony** | Tworzenie kodów rabatowych |
| ⚙️ **Ustawienia** | Nazwa strony, email kontaktowy, tryb konserwacji, baner |

---

## Zarządzanie użytkownikami

### Gdzie: Panel admina → zakładka "Użytkownicy"

| Akcja | Jak wykonać |
|-------|-------------|
| **Zobacz listę** | Automatycznie ładuje się tabela |
| **Zmień rolę** | Kliknij przycisk przy użytkowniku: Student → Mentor → Admin |
| **Zweryfikuj mentora** | Kliknij "Zweryfikuj" przy mentorze |
| **Zablokuj/odblokuj** | Kliknij przełącznik "Aktywny/Zablokowany" |

> **Uwaga:** Tylko `admin@admin.com` może nadawać rolę admina.

---

## Zarządzanie kursami

### Gdzie: Panel admina → zakładka "Kursy"

| Akcja | Jak wykonać |
|-------|-------------|
| **Zobacz wszystkie kursy** | Automatycznie ładują się karty kursów |
| **Weryfikuj/odweryfikuj** | Kliknij "Zweryfikuj" lub "Odweryfikuj" - niezweryfikowane kursy nie są widoczne publicznie |
| **Usuń kurs** | Kliknij "Usuń" - usuwa kurs razem z modułami, lekcjami i zapisami |

### Kategorie kursów:
- `web-development` - Code
- `design` - Design
- `business` - Biznes
- `mobile` - Mobile
- `python` - Python

### Poziomy:
- `beginner` - Junior
- `intermediate` - Mid
- `advanced` - Senior

---

## Zarządzanie artykułami

### Gdzie: Panel admina → zakładka "Artykuły" LUB `/dashboard/admin/articles`

| Akcja | Jak wykonać |
|-------|-------------|
| **Nowy artykuł** | Kliknij "+ Nowy Artykuł" |
| **Edytuj** | Kliknij "Edytuj" przy artykule |
| **Usuń** | Kliknij "Usuń" przy artykule |
| **Podgląd** | Włącz "Podgląd Live" aby zobaczyć jak będzie wyglądał |

### Pola artykułu:
- **Tytuł** - nagłówek artykułu
- **Treść** - HTML (można użyć paska narzędzi: H1, H2, H3, pogrubienie, kursywa, linki, listy)
- **Autor** - nazwisko autora
- **Obraz** - emoji (np. 📖, 💻, 🎨)
- **Slug** - adres URL (np. `jak-zaczac-programowac`)
- **Opublikuj** - zaznacz aby artykuł był widoczny publicznie

> **Bezpieczeństwo:** Tagi `<script>`, `<style>` i `<link>` są automatycznie usuwane z treści.

---

## Kupony rabatowe

### Gdzie: Panel admina → zakładka "Kupony"

| Akcja | Jak wykonać |
|-------|-------------|
| **Nowy kupon** | Kliknij "+ Nowy Kupon" |
| **Edytuj** | Kliknij "Edytuj" przy kuponie |
| **Usuń** | Kliknij "Usuń" przy kuponie |
| **Aktywuj/dezaktywuj** | Kliknij przełącznik "Aktywny" |

### Pola kuponu:
- **Kod** - np. `WIOSNA2024` (wielkie litery, bez spacji)
- **Typ rabatu** - `fixed` (stała kwota) lub `percent` (procent)
- **Wartość** - kwota rabatu lub procent
- **Maksymalne użycia** - 0 = bez limitu
- **Data wygaśnięcia** - kiedy kupon przestaje działać

### Jak działają kupony przy zakupie:

| Scenariusz | Platforma | Mentor | Twórca kuponu |
|------------|-----------|--------|---------------|
| Normalny zakup (bez kuponu) | 25% | 75% | - |
| Zakup z kuponem (z twórcą) | 5% | 75% | 10% |
| Zakup z kuponem (bez twórcy) | 5% | 85% | - |

---

## Wypłaty dla mentorów

### Gdzie: Panel admina → zakładka "Wypłaty"

| Akcja | Jak wykonać |
|-------|-------------|
| **Generuj wypłaty** | Kliknij "Generuj wypłaty" - system oblicza należności z nieprzetworzonych zapisów |
| **Oznacz jako wykonane** | Kliknij "Oznacz jako wykonane" przy wypłacie |

> **Ważne:** Po wygenerowaniu wypłat, zapisy są oznaczane jako `payoutProcessed: true` - nie będą liczone ponownie.

---

## Aplikacje mentorskie

### Gdzie: `/dashboard/admin/aplikacje-mentorow`

| Akcja | Jak wykonać |
|-------|-------------|
| **Zobacz aplikacje** | Lista wszystkich aplikacji z filtrami (pending/approved/rejected) |
| **Zatwierdź** | Kliknij "Zatwierdź" - automatycznie ustawia `isVerified: true` |
| **Odrzuć** | Kliknij "Odrzuć" |

---

## Ustawienia globalne

### Gdzie: Panel admina → zakładka "Ustawienia"

| Ustawienie | Opis |
|------------|------|
| **Nazwa strony** | Wyświetlana nazwa platformy |
| **Email kontaktowy** | Adres widoczny w stopce |
| **Tryb konserwacji** | Włącza/wyłącza tryb maintenance |
| **Wiadomość banera** | Tekst wyświetlany na górze strony |

---

## Tryb konserwacji (Maintenance Mode)

### Jak włączyć:
1. Panel admina → zakładka "Ustawienia"
2. Włącz przełącznik "Maintenance Mode"
3. Opcjonalnie wpisz wiadomość banera

### Co się dzieje:
- Zwykli użytkownicy widzą stronę `/maintenance`
- Administratorzy mają nadal dostęp do całej strony
- Tworzony jest plik `.maintenance` w katalogu projektu

### Jak wyłączyć:
1. Panel admina → zakładka "Ustawienia"
2. Wyłącz przełącznik "Maintenance Mode"

### Ręcznie (przez SSH):
```bash
# Włącz
touch /root/mlodzimen/.maintenance

# Wyłącz
rm /root/mlodzimen/.maintenance
```

---

## Aktualizacja strony - krok po kroku

### Metoda 1: Przez SSH (zalecana)

```bash
# 1. Połącz się z VPS
ssh root@46.247.108.173

# 2. Przejdź do katalogu projektu
cd /root/mlodzimen

# 3. Pobierz najnowsze zmiany
git pull origin master

# 4. Zainstaluj nowe zależności (jeśli były dodane)
npm install

# 5. Uruchom migracje bazy danych
npx prisma migrate deploy

# 6. Zbuduj aplikację
npm run build

# 7. Zrestartuj PM2
pm2 restart mlodzi-mentorzy

# 8. Sprawdź czy działa
curl -s -o /dev/null -w "%{http_code}" https://mlodzimentorzy.pl/
# Powinno zwrócić: 200
```

### Metoda 2: Skrypt deploy.sh

```bash
# Na swoim komputerze:
./deploy.sh 46.247.108.173
```

### Jak sprawdzić czy strona działa:

```bash
# Sprawdź status HTTP
curl -s -o /dev/null -w "%{http_code}" https://mlodzimentorzy.pl/

# Sprawdź logi PM2
pm2 logs mlodzi-mentorzy --lines 50

# Sprawdź czy proces działa
pm2 list
```

---

## Baza danych - podstawy

### Połącz się z bazą danych

```bash
# Przez SSH na VPS
mysql -u root -p mlodzi_mentorzy
```

### Przydatne komendy Prisma

```bash
# Otwórz GUI bazy danych (Prisma Studio)
npx prisma studio

# Uruchom migracje
npx prisma migrate deploy

# Stwórz nową migrację (po zmianie schema.prisma)
npx prisma migrate dev --name nazwa_zmiany

# Wygeneruj klienta Prisma
npx prisma generate

# Zresetuj bazę danych (TYLKO DEVELOPMENT!)
npx prisma migrate reset
```

### Tabele w bazie danych:

| Tabela | Opis |
|--------|------|
| `User` | Użytkownicy (studenci, mentorzy, admini) |
| `Course` | Kursy |
| `Module` | Moduły kursów |
| `Lesson` | Lekcje w modułach |
| `Enrollment` | Zapisy uczniów na kursy |
| `Coupon` | Kupony rabatowe |
| `Article` | Artykuły/blog |
| `GlobalConfig` | Ustawienia globalne (1 wiersz) |
| `Payout` | Wypłaty dla mentorów |
| `MentorApplication` | Aplikacje na mentora |

### Ręczna zmiana hasła admina (przez bazę danych):

```bash
# 1. Wygeneruj hash hasła (np. przez bcrypt online)
# 2. Połącz się z MySQL
mysql -u root -p mlodzi_mentorzy

# 3. Zaktualizuj hasło
UPDATE User SET password = '$2b$12$TWYi......' WHERE email = 'admin@admin.com';
```

---

## Najczęstsze problemy i rozwiązania

### Strona zwraca 502 Bad Gateway

```bash
# 1. Sprawdź czy PM2 działa
pm2 list

# 2. Jeśli nie ma procesu - uruchom
cd /root/mlodzimen
pm2 start npm --name "mlodzi-mentorzy" -- start

# 3. Jeśli proces jest ale nie działa - zrestartuj
pm2 restart mlodzi-mentorzy

# 4. Sprawdź logi
pm2 logs mlodzi-mentorzy --lines 100

# 5. Jeśli port 3000 jest zajęty
lsof -ti:3000 | xargs kill -9
pm2 restart mlodzi-mentorzy
```

### Strona ładuje się w nieskończoność

```bash
# Zrestartuj aplikację
cd /root/mlodzimen
pm2 restart mlodzi-mentorzy
```

### Zmiany nie są widoczne na stronie

```bash
# Upewnij się że masz najnowszy kod
cd /root/mlodzimen
git pull origin master

# Przebuduj
npm run build

# Zrestartuj
pm2 restart mlodzi-mentorzy
```

### Błąd połączenia z bazą danych

```bash
# Sprawdź czy MySQL działa
systemctl status mysql

# Sprawdź zmienne w .env
cat /root/mlodzimen/.env | grep DATABASE_URL

# Sprawdź połączenie
mysql -u root -p -e "SHOW DATABASES;"
```

### Użytkownik jest wylogowywany po kliknięciu w logo

```bash
# Sprawdź czy JWT_SECRET jest taki sam w .env
cat /root/mlodzimen/.env | grep JWT_SECRET

# Upewnij się że middleware.ts ma runtime: 'nodejs'
cat /root/mlodzimen/middleware.ts | head -10
```

### Strona jest w trybie konserwacji i nie można się dostać

```bash
# Usuń plik maintenance
rm /root/mlodzimen/.maintenance

# Lub przez bazę danych
mysql -u root -p mlodzi_mentorzy -e "UPDATE GlobalConfig SET maintenanceMode = false;"

# Zrestartuj
pm2 restart mlodzi-mentorzy
```

### PM2 ma wiele procesów i się gryzą

```bash
# Usuń wszystkie procesy
pm2 delete all

# Uruchom jeden
cd /root/mlodzimen
pm2 start npm --name "mlodzi-mentorzy" -- start

# Zapisz
pm2 save

# Sprawdź
pm2 list
# Powinien być tylko 1 proces "mlodzi-mentorzy"
```

---

## Struktura projektu

```
mlodzi-mentorzy/
├── app/                          # Strony i API (Next.js App Router)
│   ├── (auth)/                   # Strony logowania/rejestracji
│   │   ├── login/page.tsx        # Logowanie
│   │   ├── register/page.tsx     # Rejestracja
│   │   ├── forgot-password/      # Zapomniałem hasła
│   │   └── reset-password/       # Reset hasła
│   ├── dashboard/                # Panel użytkownika
│   │   ├── page.tsx              # Dashboard użytkownika
│   │   ├── admin/page.tsx        # Panel administratora
│   │   ├── admin/aplikacje-mentorow/  # Aplikacje mentorów
│   │   ├── admin/articles/       # Zarządzanie artykułami
│   │   ├── create-course/        # Tworzenie kursu
│   │   ├── edit-course/[id]/     # Edycja kursu
│   │   ├── profile/              # Profil użytkownika
│   │   └── coupons/              # Kupony użytkownika
│   ├── api/                      # API routes
│   │   ├── auth/                 # Logowanie, rejestracja, reset hasła
│   │   ├── admin/                # Endpointy administratora
│   │   ├── courses/              # Kursy
│   │   ├── articles/             # Artykuły
│   │   ├── user/                 # Profil, avatar
│   │   ├── checkout/             # Płatności Stripe
│   │   ├── webhook/stripe/       # Webhook Stripe
│   │   └── mentor/application/   # Aplikacja mentora
│   ├── kursy/                    # Lista kursów
│   ├── artykuly/                 # Blog
│   ├── mentoring/                # Zostań mentorem
│   ├── o-nas/                    # O nas
│   ├── partnerzy/                # Partnerzy
│   ├── kontakt/                  # Kontakt
│   ├── page.tsx                  # Strona główna
│   ├── layout.tsx                # Główny layout
│   └── globals.css               # Style globalne
├── components/                   # Komponenty React
│   ├── layout/                   # Navbar, Footer
│   ├── MarkdownEditorToolbar.tsx # Pasek narzędzi Markdown
│   └── LayoutClient.tsx          # Wrapper layoutu
├── lib/                          # Biblioteki i utilsy
│   ├── auth/                     # JWT, hashowanie haseł
│   ├── api-utils.ts              # Helpery API
│   ├── cloudinary.ts             # Upload plików
│   ├── email.ts                  # Wysyłanie emaili
│   ├── prisma.ts                 # Klient bazy danych
│   └── security/                 # Rate limiting
├── prisma/
│   ├── schema.prisma             # Model bazy danych
│   └── seed.ts                   # Dane początkowe
├── public/                       # Statyczne pliki (obrazy, fonty)
├── middleware.ts                 # Middleware (auth, routing)
├── next.config.js                # Konfiguracja Next.js
├── tailwind.config.js            # Konfiguracja Tailwind
├── package.json                  # Zależności i skrypty
└── .env                          # Zmienne środowiskowe (NIE commituj!)
```

---

## Dostępne komendy npm

| Komenda | Co robi |
|---------|---------|
| `npm run dev` | Uruchamia serwer developerski |
| `npm run build` | Generuje Prisma client + buduje aplikację |
| `npm start` | Migracje + seed + start produkcji |
| `npm run seed` | Ładuje dane początkowe |
| `npm run lint` | Sprawdza kod pod kątem błędów |

---

## Bezpieczeństwo - co pamiętać

1. **ZMIEŃ `JWT_SECRET`** w `.env` na losowy ciąg min. 32 znaków
2. **ZMIEŃ HASŁO** admina po pierwszym logowaniu
3. **NIE COMMITUJ** pliku `.env` do Gita
4. **Używaj HTTPS** - Certbot za darmo
5. **Regularne backupy** bazy danych:
   ```bash
   mysqldump -u root -p mlodzi_mentorzy > backup_$(date +%Y%m%d).sql
   ```
6. **Aktualizuj zależności** co miesiąc:
   ```bash
   npm update
   npm audit fix
   ```

---

## Kontakt i wsparcie

- **Email:** mlodzimentorzy@gmail.com
- **Telefon:** +48 729 969 667 / +48 789 303 588

---

*Ostatnia aktualizacja: Czerwiec 2026*
