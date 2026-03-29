import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Terminals ─────────────────────────────────────────────────────────────
  const terminals = await Promise.all([
    prisma.terminal.upsert({
      where: { code: 'WHM' },
      update: {},
      create: { name: 'West Hills Mall', code: 'WHM', address: 'West Hills Mall, Weija', city: 'Accra', region: 'Greater Accra', lat: 5.5929, lng: -0.3015, phone: '+233302000001' },
    }),
    prisma.terminal.upsert({
      where: { code: 'ACM' },
      update: {},
      create: { name: 'Accra Mall', code: 'ACM', address: 'Spintex Road', city: 'Accra', region: 'Greater Accra', lat: 5.6041, lng: -0.1571, phone: '+233302000002' },
    }),
    prisma.terminal.upsert({
      where: { code: 'JCM' },
      update: {},
      create: { name: 'Junction Mall', code: 'JCM', address: 'Nungua, Tema Motorway', city: 'Accra', region: 'Greater Accra', lat: 5.6024, lng: -0.1001 },
    }),
  ]);

  console.log(`✓ ${terminals.length} terminals`);

  // ── Super Admin user ──────────────────────────────────────────────────────
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@locqar.com' },
    update: {},
    create: {
      userType: 'STAFF',
      staffRole: 'SUPER_ADMIN',
      name: 'Super Admin',
      email: 'admin@locqar.com',
      passwordHash: await bcrypt.hash('Admin1234!', 12),
      terminalId: terminals[0].id,
      jobTitle: 'System Administrator',
      department: 'Management',
      employeeId: 'EMP-001',
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: 'john.doe@locqar.com' },
    update: {},
    create: {
      userType: 'STAFF',
      staffRole: 'ADMIN',
      name: 'John Doe',
      email: 'john.doe@locqar.com',
      passwordHash: await bcrypt.hash('Admin1234!', 12),
      terminalId: terminals[0].id,
      jobTitle: 'Operations Manager',
      department: 'Operations',
      employeeId: 'EMP-002',
    },
  });

  console.log(`✓ Staff users: ${superAdmin.email}, ${adminUser.email}`);

  // ── Lockers ───────────────────────────────────────────────────────────────
  const lockerSizes = ['S', 'S', 'M', 'M', 'M', 'L', 'L', 'XL'] as const;
  for (const terminal of terminals) {
    for (let i = 0; i < lockerSizes.length; i++) {
      await prisma.locker.upsert({
        where: { serialNo: `${terminal.code}-LKR-${String(i + 1).padStart(3, '0')}` },
        update: {},
        create: {
          terminalId: terminal.id,
          serialNo: `${terminal.code}-LKR-${String(i + 1).padStart(3, '0')}`,
          name: `${terminal.code} Locker ${i + 1}`,
          size: lockerSizes[i],
          compartmentNo: i + 1,
          doorNo: i + 1,
          status: 'available',
        },
      });
    }
  }

  console.log(`✓ Lockers created for ${terminals.length} terminals`);

  // ── Sample packages ───────────────────────────────────────────────────────
  const samplePackages = [
    { waybill: 'LQ-2026-00001', senderName: 'Kofi Mensah', senderPhone: '+233244123456', recipientName: 'Ama Owusu', recipientPhone: '+233244654321', size: 'M' as const, status: 'at_warehouse' as const, terminalId: terminals[0].id },
    { waybill: 'LQ-2026-00002', senderName: 'Abena Boateng', senderPhone: '+233244789012', recipientName: 'Kwame Asante', recipientPhone: '+233244210987', size: 'S' as const, status: 'delivered_to_locker' as const, terminalId: terminals[1].id },
    { waybill: 'LQ-2026-00003', senderName: 'Yaw Frimpong', senderPhone: '+233244345678', recipientName: 'Akosua Darko', recipientPhone: '+233244876543', size: 'L' as const, status: 'in_transit_to_locker' as const, terminalId: terminals[0].id },
  ];

  for (const pkg of samplePackages) {
    await prisma.package.upsert({
      where: { waybill: pkg.waybill },
      update: {},
      create: {
        ...pkg,
        deliveryMethod: 'warehouse_to_locker',
        slaDeadline: new Date(Date.now() + 24 * 3600000),
        price: 25,
      },
    });
  }

  console.log(`✓ ${samplePackages.length} sample packages`);

  // ── Subscription plans ────────────────────────────────────────────────────
  const plans = [
    { name: 'Basic', price: 0, billingCycleDays: 30, maxPackages: 5, storageLimitGb: 0.5 },
    { name: 'Standard', price: 49, billingCycleDays: 30, maxPackages: 50, storageLimitGb: 5 },
    { name: 'Business', price: 149, billingCycleDays: 30, maxPackages: 500, storageLimitGb: 50 },
    { name: 'Enterprise', price: 499, billingCycleDays: 30, maxPackages: 9999, storageLimitGb: 500 },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { name: plan.name },
      update: {},
      create: plan,
    });
  }

  console.log(`✓ ${plans.length} subscription plans`);

  // ── System settings ───────────────────────────────────────────────────────
  await prisma.systemSetting.upsert({
    where: { key: 'locker_expiry_hours' },
    update: {},
    create: { key: 'locker_expiry_hours', value: 72, description: 'Hours before an uncollected package expires' },
  });

  console.log('✓ System settings');
  console.log('\n✅ Seed complete!');
  console.log('\nLogin credentials:');
  console.log('  Super Admin: admin@locqar.com / Admin1234!');
  console.log('  Admin:       john.doe@locqar.com / Admin1234!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
