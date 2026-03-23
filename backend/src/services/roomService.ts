import { Room } from '@prisma/client';
import { prisma } from '../lib/prisma';

export async function getAvailableRooms(
  checkIn: Date,
  checkOut: Date,
  guests: number,
): Promise<Room[]> {
  const bookedRoomIds = await prisma.booking.findMany({
    where: {
      status: { not: 'CANCELLED' },
      AND: [{ checkIn: { lt: checkOut } }, { checkOut: { gt: checkIn } }],
    },
    select: { roomId: true },
  });

  const bookedIds = bookedRoomIds.map((b) => b.roomId);

  return prisma.room.findMany({
    where: {
      capacity: { gte: guests },
      id: { notIn: bookedIds },
    },
    orderBy: { pricePerNight: 'asc' },
  });
}
