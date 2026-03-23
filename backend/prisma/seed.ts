import { PrismaClient, RoomType } from '@prisma/client';

const prisma = new PrismaClient();

const rooms = [
  {
    name: 'Standard City View',
    type: RoomType.STANDARD,
    capacity: 2,
    pricePerNight: 89.0,
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'En-Suite Bathroom'],
  },
  {
    name: 'Standard Garden View',
    type: RoomType.STANDARD,
    capacity: 2,
    pricePerNight: 95.0,
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Garden View', 'En-Suite Bathroom'],
  },
  {
    name: 'Deluxe King Room',
    type: RoomType.DELUXE,
    capacity: 2,
    pricePerNight: 149.0,
    amenities: ['WiFi', 'Smart TV', 'Mini Bar', 'Bathrobe', 'City View', 'King Bed'],
  },
  {
    name: 'Deluxe Family Room',
    type: RoomType.DELUXE,
    capacity: 4,
    pricePerNight: 189.0,
    amenities: ['WiFi', 'Smart TV', 'Mini Bar', 'Extra Beds', 'Balcony', 'Sofa Bed'],
  },
  {
    name: 'Royal Suite',
    type: RoomType.SUITE,
    capacity: 2,
    pricePerNight: 299.0,
    amenities: [
      'WiFi',
      '4K TV',
      'Jacuzzi',
      'Butler Service',
      'Panoramic View',
      'Living Room',
      'Nespresso Machine',
    ],
  },
  {
    name: 'Presidential Suite',
    type: RoomType.SUITE,
    capacity: 4,
    pricePerNight: 499.0,
    amenities: [
      'WiFi',
      '4K TV',
      'Private Pool',
      'Butler Service',
      'Panoramic View',
      'Dining Area',
      'Full Kitchen',
      'Two Bathrooms',
    ],
  },
];

async function main(): Promise<void> {
  for (const room of rooms) {
    const existing = await prisma.room.findFirst({ where: { name: room.name } });
    if (!existing) {
      await prisma.room.create({ data: room });
      console.log(`Created room: ${room.name}`);
    } else {
      console.log(`Skipped (already exists): ${room.name}`);
    }
  }
  console.log('Seed complete.');
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect().catch(() => undefined);
  });
