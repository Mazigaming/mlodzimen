import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
2
async function main() {
  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@test.pl' },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 12);

      const admin = await prisma.user.create({
        data: {
          email: 'admin@test.pl',
          name: 'Admin Test',
          password: hashedPassword,
          role: 'mentor',
        },
      });

      console.log('✅ Mentor account created:');
      console.log(`Email: ${admin.email}`);
      console.log(`Password: admin123`);
    }

    const realAdmin = await prisma.user.findUnique({
      where: { email: 'admin@admin.com' },
    });

    if (!realAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      await prisma.user.create({
        data: {
          email: 'admin@admin.com',
          name: 'Administrator',
          password: hashedPassword,
          role: 'admin', 
          isVerified: true,
        },
      });
      console.log('✅ Main Admin account created: admin@admin.com');
    } else {
      await prisma.user.update({
        where: { email: 'admin@admin.com' },
        data: { role: 'admin', isVerified: true }
      });
      console.log('✅ Main Admin account updated/verified: admin@admin.com');
    }

    // Seed Articles
    const articlesData = [
      {
        title: 'Jak zacząć w IT w 2025?',
        content: `
          <h2>Przyszłość jest cyfrowa</h2>
          <p>Rozpoczęcie kariery w technologii w 2025 roku wymaga zupełnie innego podejścia niż dekadę temu. Dzisiaj liczy się nie tylko czysty kod, ale umiejętność współpracy z AI.</p>
          <img src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1000" alt="it work" class="rounded-xl my-4" />
          <h2>Skup się na podstawach</h2>
          <p>Niezależnie od trendów, fundamenty pozostają te same:</p>
          <ul>
            <li>Algorytmy i struktury danych</li>
            <li>Architektura systemów</li>
            <li>Czysty kod i SOLID</li>
          </ul>
          <blockquote>"Najlepszym sposobem na przewidzenie przyszłości jest jej stworzenie."</blockquote>
        `,
        excerpt: 'Przewodnik dla początkujących o tym, jak wejść do świata technologii w dobie AI.',
        author: 'Dominik Popek',
        image: '💻',
        slug: 'jak-zaczac-w-it-2025',
        isPublished: true
      },
      {
        title: 'Manifest Młodego Mentora',
        content: `
          <h2>Edukacja potrzebuje rewolucji</h2>
          <p>Tradycyjny system szkolnictwa zawodzi. Potrzebujemy mentorów, którzy nie tylko przekazują wiedzę, ale inspirują do działania.</p>
          <style>
            .highlight { color: #22d3ee; font-weight: bold; }
          </style>
          <p>Nasza misja to <span class="highlight">demokratyzacja wiedzy</span> i budowanie społeczności opartej na wzajemnym wsparciu.</p>
          <h2>Dlaczego teraz?</h2>
          <p>Żyjemy w czasach najszybszego postępu w historii ludzkości. Albo się uczysz, albo zostajesz w tyle.</p>
        `,
        excerpt: 'Dlaczego tradycyjna edukacja umiera i co musimy z tym zrobić jako pokolenie Z.',
        author: 'Administrator',
        image: '📢',
        slug: 'manifest-mlodego-mentora',
        isPublished: true
      }
    ];

    for (const art of articlesData) {
      await prisma.article.upsert({
        where: { slug: art.slug },
        update: art,
        create: art
      });
    }

    // Seed a sample course for the main admin
    if (realAdmin || !realAdmin) {
      const adminUser = await prisma.user.findUnique({ where: { email: 'admin@admin.com' } });
      if (adminUser) {
        await prisma.course.upsert({
          where: { id: 'sample-course-1' },
          update: {},
          create: {
            id: 'sample-course-1',
            title: 'Mistrz Produktywności',
            description: 'Kompletny kurs zarządzania czasem i energią dla młodych profesjonalistów.',
            price: 199.99,
            category: 'business',
            level: 'beginner',
            isVerified: true,
            mentorId: adminUser.id,
            modules: {
              create: [
                {
                  title: 'Fundamenty',
                  order: 0,
                  lessons: {
                    create: [
                      {
                        title: 'Wstęp do produktywności',
                        description: 'Dowiedz się dlaczego tradycyjne metody nie działają.',
                        videoUrl: 'https://www.youtube.com/watch?v=iONDebHX9qk',
                        content: 'W tej lekcji omówimy podstawy...',
                        order: 0
                      }
                    ]
                  }
                }
              ]
            }
          }
        });
        console.log('✅ Sample course created');
      }
    }

    console.log('✅ Seeding completed successfully');
  } catch (error) {
    console.error('Error creating test accounts:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
