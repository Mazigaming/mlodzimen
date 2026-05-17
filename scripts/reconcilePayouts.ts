import { prisma } from './lib/prisma';

async function main() {
  console.log('Starting payout reconciliation...');

  // Find pending enrollments
  const pendingEnrollments = await prisma.enrollment.findMany({
    where: { payoutProcessed: false, status: 'active' },
    include: { course: { select: { mentorId: true, price: true } } }
  });

  if (!pendingEnrollments.length) {
    console.log('No pending enrollments found.');
    return;
  }

  // Ensure platform user exists
  const platformEmail = process.env.PLATFORM_PAYOUT_EMAIL || 'platform@mlodzimentorzy.local';
  let platformUser = await prisma.user.findUnique({ where: { email: platformEmail } });
  if (!platformUser) {
    platformUser = await prisma.user.create({
      data: {
        email: platformEmail,
        name: 'Platform',
        password: Math.random().toString(36),
        role: 'admin',
        isVerified: true,
      }
    });
    console.log('Created platform user:', platformUser.id);
  }

  const mentorPayouts: Record<string, number> = {};
  const creatorPayouts: Record<string, number> = {};
  let platformTotal = 0;

  for (const e of pendingEnrollments) {
    const mentorId = e.course.mentorId;
    const price = e.course.price;
    const couponCreatorId = (e as any).couponCreatorId;
    const isCouponUsed = !!e.couponCode;

    let platformFee = 0;
    let mentorShare = 0;
    let creatorShare = 0;

    if (isCouponUsed && couponCreatorId) {
      platformFee = price * 0.05;
      mentorShare = price * 0.75;
      creatorShare = price * 0.10;
    } else if (isCouponUsed) {
      platformFee = price * 0.05;
      mentorShare = price * 0.85;
    } else {
      platformFee = price * 0.25;
      mentorShare = price * 0.75;
    }

    mentorPayouts[mentorId] = (mentorPayouts[mentorId] || 0) + mentorShare;
    platformTotal += platformFee;
    if (creatorShare > 0 && couponCreatorId) creatorPayouts[couponCreatorId] = (creatorPayouts[couponCreatorId] || 0) + creatorShare;
  }

  const promises: Promise<any>[] = [];

  for (const [mentorId, amount] of Object.entries(mentorPayouts)) {
    if (amount <= 0) continue;
    promises.push(prisma.payout.create({ data: { mentorId, amount, status: 'pending' } }));
  }

  for (const [creatorId, amount] of Object.entries(creatorPayouts)) {
    if (amount <= 0) continue;
    promises.push(prisma.payout.create({ data: { mentorId: creatorId, amount, status: 'pending', notes: 'Prowizja od kuponu' } }));
  }

  if (platformTotal > 0) {
    promises.push(prisma.payout.create({ data: { mentorId: platformUser.id, amount: platformTotal, status: 'completed', notes: 'Opłaty platformy' } }));
  }

  await Promise.all(promises);

  // Mark processed
  await prisma.enrollment.updateMany({
    where: { id: { in: pendingEnrollments.map(e => e.id) } },
    data: { payoutProcessed: true }
  });

  console.log('Payout reconciliation complete. Created payouts for', Object.keys(mentorPayouts).length, 'mentors.');
}

main()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
