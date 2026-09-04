// Run with: npm run seed
// Creates one demo account per role, plus several salons each with
// their own services, staff, and working hours — enough to properly
// test search/discovery, not just a single salon.
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Creates one salon + its owner + services + one stylist, and sets
// Mon-Fri working hours for that stylist. Pulling this into a
// function means adding a new salon is just one more call at the
// bottom of main(), instead of copy-pasting this whole block.
async function createSalonWithData({
  ownerEmail,
  ownerName,
  salonId,
  salonName,
  description,
  address,
  city,
  imageUrl,
  services, // [{ id, name, durationMinutes, price }]
  stylistEmail,
  stylistName,
  stylistBio,
  password,
}) {
  const owner = await prisma.user.upsert({
    where: { email: ownerEmail },
    update: {},
    create: { name: ownerName, email: ownerEmail, passwordHash: password, role: 'SALON_OWNER' },
  });

  const salon = await prisma.salon.upsert({
    where: { id: salonId },
    update: { name: salonName, description, address, city, imageUrl },
    create: {
      id: salonId,
      ownerId: owner.id,
      name: salonName,
      description,
      address,
      city,
      imageUrl,
      isActive: true,
    },
  });

  const createdServices = [];
  for (const svc of services) {
    const service = await prisma.service.upsert({
      where: { id: svc.id },
      update: {},
      create: {
        id: svc.id,
        salonId: salon.id,
        name: svc.name,
        durationMinutes: svc.durationMinutes,
        price: svc.price,
      },
    });
    createdServices.push(service);
  }

  const stylistUser = await prisma.user.upsert({
    where: { email: stylistEmail },
    update: {},
    create: { name: stylistName, email: stylistEmail, passwordHash: password, role: 'STAFF' },
  });

  const staff = await prisma.staff.upsert({
    where: { userId: stylistUser.id },
    update: {},
    create: {
      userId: stylistUser.id,
      salonId: salon.id,
      bio: stylistBio,
      services: { create: createdServices.map((s) => ({ serviceId: s.id })) },
    },
  });

  // Mon-Fri, 9am-6pm. Clear first so re-running seed doesn't duplicate rows.
  await prisma.workingHour.deleteMany({ where: { staffId: staff.id } });
  for (let day = 1; day <= 5; day++) {
    await prisma.workingHour.create({
      data: { staffId: staff.id, dayOfWeek: day, startTime: '09:00', endTime: '18:00' },
    });
  }

  return { salon, staff, services: createdServices };
}

async function main() {
  const password = await bcrypt.hash('Password123!', 10);

  await prisma.user.upsert({
    where: { email: 'admin@salonapp.com' },
    update: {},
    create: { name: 'Platform Admin', email: 'admin@salonapp.com', passwordHash: password, role: 'ADMIN' },
  });

  await prisma.user.upsert({
    where: { email: 'customer@salonapp.com' },
    update: {},
    create: { name: 'Test Customer', email: 'customer@salonapp.com', passwordHash: password, role: 'CUSTOMER' },
  });

  // --- Salon 1: Glow Studio (kept as the original demo salon/owner/stylist) ---
  await createSalonWithData({
    password,
    ownerEmail: 'owner@salonapp.com',
    ownerName: 'Priya Owner',
    salonId: 'demo-salon-id',
    salonName: 'Glow Studio',
    description: 'A modern salon offering hair, skin, and spa services.',
    address: '12 MG Road',
    city: 'Chennai',
    imageUrl: 'https://images.unsplash.com/photo-1633681117690-262b94a01378?w=800&auto=format&fit=crop&q=80',
    services: [
      { id: 'demo-service-haircut', name: 'Haircut & Styling', durationMinutes: 45, price: 799 },
      { id: 'demo-service-color', name: 'Hair Color', durationMinutes: 90, price: 2499 },
    ],
    stylistEmail: 'stylist@salonapp.com',
    stylistName: 'Alex Stylist',
    stylistBio: 'Senior stylist, 8 years experience.',
  });

  // --- Salon 2 ---
  await createSalonWithData({
    password,
    ownerEmail: 'owner2@salonapp.com',
    ownerName: 'Ravi Kumar',
    salonId: 'demo-salon-2',
    salonName: 'Urban Edge Barbershop',
    description: 'Classic cuts and modern fades in a relaxed, no-frills space.',
    address: '45 Anna Salai',
    city: 'Chennai',
    imageUrl: 'https://images.unsplash.com/photo-1702865272115-5afdbae975af?w=800&auto=format&fit=crop&q=80',
    services: [
      { id: 'demo-service-fade', name: "Men's Fade Cut", durationMinutes: 30, price: 349 },
      { id: 'demo-service-beard', name: 'Beard Trim & Shape', durationMinutes: 20, price: 199 },
    ],
    stylistEmail: 'stylist2@salonapp.com',
    stylistName: 'Marcus Lee',
    stylistBio: 'Barber specializing in fades and beard sculpting.',
  });

  // --- Salon 3 ---
  await createSalonWithData({
    password,
    ownerEmail: 'owner3@salonapp.com',
    ownerName: 'Ananya Rao',
    salonId: 'demo-salon-3',
    salonName: 'Serenity Spa & Nails',
    description: 'A calm retreat for nail care, waxing, and skin treatments.',
    address: '9 Cathedral Road',
    city: 'Madurai',
    imageUrl: 'https://images.unsplash.com/photo-1661531603040-301bdcb9148b?w=800&auto=format&fit=crop&q=80',
    services: [
      { id: 'demo-service-manicure', name: 'Classic Manicure', durationMinutes: 40, price: 599 },
      { id: 'demo-service-facial', name: 'Rejuvenating Facial', durationMinutes: 60, price: 1299 },
    ],
    stylistEmail: 'stylist3@salonapp.com',
    stylistName: 'Divya Menon',
    stylistBio: 'Licensed esthetician and nail technician.',
  });

  // --- Salon 4 ---
  await createSalonWithData({
    password,
    ownerEmail: 'owner4@salonapp.com',
    ownerName: 'Karthik Iyer',
    salonId: 'demo-salon-4',
    salonName: 'The Color Lab',
    description: 'A color-focused studio for balayage, highlights, and bold transformations.',
    address: '78 Bypass Road',
    city: 'Madurai',
    imageUrl: 'https://images.unsplash.com/photo-1595475884562-073c30d45670?w=800&auto=format&fit=crop&q=80',
    services: [
      { id: 'demo-service-balayage', name: 'Balayage', durationMinutes: 120, price: 3499 },
      { id: 'demo-service-blowout', name: 'Blowout & Style', durationMinutes: 35, price: 449 },
    ],
    stylistEmail: 'stylist4@salonapp.com',
    stylistName: 'Nina Torres',
    stylistBio: 'Color specialist with a background in editorial styling.',
  });

  console.log('Seed complete. Demo credentials (password for all: Password123!):');
  console.log('  Admin:     admin@salonapp.com');
  console.log('  Customer:  customer@salonapp.com');
  console.log('  Owners:    owner@salonapp.com, owner2@..., owner3@..., owner4@salonapp.com');
  console.log('  Stylists:  stylist@salonapp.com, stylist2@..., stylist3@..., stylist4@salonapp.com');
  console.log('  Salons:    Glow Studio, Urban Edge Barbershop, Serenity Spa & Nails, The Color Lab');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
