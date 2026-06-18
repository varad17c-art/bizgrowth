import { Router } from 'express';
import { AvailabilityController } from './availability.controller';

const router = Router();
const controller = new AvailabilityController();

// Availability routes
router.post('/', (req, res) => controller.createAvailability(req, res));
router.get('/:consultantId', (req, res) => controller.getAvailability(req, res));
router.put('/:consultantId/slots', (req, res) => controller.updateSlots(req, res));
router.post('/:consultantId/blocked-dates', (req, res) => controller.addBlockedDates(req, res));
router.delete('/:consultantId/blocked-dates/:date', (req, res) => controller.removeBlockedDate(req, res));
router.post('/:consultantId/break-time', (req, res) => controller.addBreakTime(req, res));
router.get('/:consultantId/available-slots', (req, res) => controller.getAvailableSlots(req, res));
router.delete('/:consultantId', (req, res) => controller.deleteAvailability(req, res));

export default router;