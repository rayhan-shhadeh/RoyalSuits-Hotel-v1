import { z } from 'zod';

export const availabilitySchema = z
  .object({
    checkIn: z.string().datetime({ offset: true, message: 'checkIn must be a valid ISO 8601 datetime' }),
    checkOut: z.string().datetime({ offset: true, message: 'checkOut must be a valid ISO 8601 datetime' }),
    guests: z.number().int().min(1).max(20),
  })
  .strict();

export const bookingSchema = z
  .object({
    checkIn: z.string().datetime({ offset: true, message: 'checkIn must be a valid ISO 8601 datetime' }),
    checkOut: z.string().datetime({ offset: true, message: 'checkOut must be a valid ISO 8601 datetime' }),
    guests: z.number().int().min(1).max(20),
    roomId: z.string().min(1, 'roomId is required'),
    customer: z
      .object({
        name: z.string().min(1, 'Customer name is required').max(100),
        email: z.string().email('Invalid email address'),
        phone: z.string().optional(),
      })
      .strict(),
  })
  .strict();

export type AvailabilityInput = z.infer<typeof availabilitySchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
