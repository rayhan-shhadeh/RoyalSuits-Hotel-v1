import { NextFunction, Request, Response, Router } from 'express';
import { validate } from '../middleware/validate';
import { availabilitySchema, AvailabilityInput } from '../schemas/bookingSchemas';
import { getAvailableRooms } from '../services/roomService';
import { ValidationError } from '../lib/errors';

const router = Router();

router.post('/', validate(availabilitySchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { checkIn, checkOut, guests } = req.body as AvailabilityInput;

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
      throw new ValidationError('checkOut must be after checkIn');
    }

    const availableRooms = await getAvailableRooms(checkInDate, checkOutDate, guests);

    res.json({ availableRooms });
  } catch (err) {
    next(err);
  }
});

export { router as availabilityRouter };
