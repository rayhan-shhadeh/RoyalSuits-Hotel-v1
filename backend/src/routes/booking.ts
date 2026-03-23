import { NextFunction, Request, Response, Router } from 'express';
import { validate } from '../middleware/validate';
import { bookingLimiter } from '../middleware/rateLimiter';
import { bookingSchema, BookingInput } from '../schemas/bookingSchemas';
import { createBooking, getBookingById } from '../services/bookingService';
import { sendBookingNotification } from '../services/notifyService';
import { ValidationError } from '../lib/errors';

const router = Router();

router.post(
  '/book',
  bookingLimiter,
  validate(bookingSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = req.body as BookingInput;

      const checkInDate = new Date(input.checkIn);
      const checkOutDate = new Date(input.checkOut);

      if (checkInDate >= checkOutDate) {
        throw new ValidationError('checkOut must be after checkIn');
      }

      const booking = await createBooking(input);

      sendBookingNotification({
        id: booking.id,
        customerName: booking.customer.name,
        customerEmail: booking.customer.email,
        roomName: booking.room.name,
        roomType: booking.room.type,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        totalPrice: Number(booking.totalPrice),
      });

      res.status(201).json({
        bookingId: booking.id,
        status: booking.status,
        room: { name: booking.room.name, type: booking.room.type },
        customer: { name: booking.customer.name, email: booking.customer.email },
        checkIn: booking.checkIn.toISOString(),
        checkOut: booking.checkOut.toISOString(),
        totalPrice: Number(booking.totalPrice),
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get('/booking/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await getBookingById(req.params['id'] as string);

    res.json({
      bookingId: booking.id,
      status: booking.status,
      room: {
        id: booking.room.id,
        name: booking.room.name,
        type: booking.room.type,
        pricePerNight: Number(booking.room.pricePerNight),
        amenities: booking.room.amenities,
        capacity: booking.room.capacity,
      },
      customer: {
        id: booking.customer.id,
        name: booking.customer.name,
        email: booking.customer.email,
        phone: booking.customer.phone,
      },
      checkIn: booking.checkIn.toISOString(),
      checkOut: booking.checkOut.toISOString(),
      totalPrice: Number(booking.totalPrice),
      guests: booking.guests,
      createdAt: booking.createdAt.toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

export { router as bookingRouter };
