import { Router } from 'express';
import { BookingsController } from './bookings.controller';

const router = Router();
const controller = new BookingsController();

// Bookings routes
router.post('/', (req, res) => controller.createBooking(req, res));
router.get('/availability/check', (req, res) => controller.checkAvailability(req, res));
router.get('/:bookingId', (req, res) => controller.getBooking(req, res));
router.get('/consultant/:consultantId', (req, res) => controller.getConsultantBookings(req, res));
router.get('/client/:clientId', (req, res) => controller.getClientBookings(req, res));
router.patch('/:bookingId/status', (req, res) => controller.updateBookingStatus(req, res));
router.delete('/:bookingId', (req, res) => controller.cancelBooking(req, res));

export default router;