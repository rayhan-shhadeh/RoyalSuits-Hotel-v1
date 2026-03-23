import { Booking, Customer, Room } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { ConflictError, NotFoundError } from '../lib/errors';
import { BookingInput } from '../schemas/bookingSchemas';

export type BookingWithDetails = Booking & { room: Room; customer: Customer };

export async function createBooking(data: BookingInput): Promise<BookingWithDetails> {
  const checkIn = new Date(data.checkIn);
  const checkOut = new Date(data.checkOut);

  return prisma.$transaction(async (tx) => {
    const room = await tx.room.findUnique({ where: { id: data.roomId } });
    if (!room) {
      throw new NotFoundError(`Room with id "${data.roomId}" not found`);
    }

    const conflict = await tx.booking.findFirst({
      where: {
        roomId: data.roomId,
        status: { not: 'CANCELLED' },
        AND: [{ checkIn: { lt: checkOut } }, { checkOut: { gt: checkIn } }],
      },
    });

    if (conflict) {
      throw new ConflictError('Room is no longer available for the selected dates');
    }

    const customer = await tx.customer.upsert({
      where: { email: data.customer.email },
      update: {
        name: data.customer.name,
        phone: data.customer.phone ?? null,
      },
      create: {
        name: data.customer.name,
        email: data.customer.email,
        phone: data.customer.phone ?? null,
      },
    });

    const nights = Math.max(
      1,
      Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)),
    );
    const totalPrice = Number(room.pricePerNight) * nights;

    const booking = await tx.booking.create({
      data: {
        roomId: data.roomId,
        customerId: customer.id,
        checkIn,
        checkOut,
        guests: data.guests,
        totalPrice,
        status: 'CONFIRMED',
      },
      include: { room: true, customer: true },
    });

    return booking;
  });
}

export async function getBookingById(id: string): Promise<BookingWithDetails> {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { room: true, customer: true },
  });

  if (!booking) {
    throw new NotFoundError(`Booking with id "${id}" not found`);
  }

  return booking;
}
