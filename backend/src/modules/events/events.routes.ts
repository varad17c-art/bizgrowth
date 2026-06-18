import { Router } from 'express';
import eventsController from './events.controller';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

// ============================================================
// Events Routes — /api/events
// ============================================================

/** GET /api/events — List all events (public) */
router.get('/', eventsController.listEvents);

/** GET /api/events/my — Current user's organized events */
router.get('/my', authenticate, eventsController.getMyEvents);

/** GET /api/events/registered — Events user is registered for */
router.get('/registered', authenticate, eventsController.getRegisteredEvents);

/** GET /api/events/:id — Get event by ID */
router.get('/:id', eventsController.getEventById);

/** POST /api/events — Create a new event */
router.post('/', authenticate, eventsController.createEvent);

/** PATCH /api/events/:id — Update an event (organizer or admin) */
router.patch('/:id', authenticate, eventsController.updateEvent);

/** PUT /api/events/:id — Full update alias */
router.put('/:id', authenticate, eventsController.updateEvent);

/** DELETE /api/events/:id — Delete an event (organizer or admin) */
router.delete('/:id', authenticate, eventsController.deleteEvent);

/** POST /api/events/:id/register — Register for an event */
router.post('/:id/register', authenticate, eventsController.registerForEvent);

/** DELETE /api/events/:id/register — Cancel registration */
router.delete('/:id/register', authenticate, eventsController.cancelRegistration);

/** GET /api/events/:id/attendees — Get attendee list (organizer or admin) */
router.get('/:id/attendees', authenticate, eventsController.getAttendees);

export default router;
