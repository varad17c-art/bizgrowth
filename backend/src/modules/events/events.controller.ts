import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import eventsService from './events.service';

const qs = (val: any): string | undefined => Array.isArray(val) ? val[0] : val;

class EventsController {
  /** GET /api/events */
  async listEvents(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = qs(req.query.page);
      const limit = qs(req.query.limit);
      const result = await eventsService.listEvents({
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 20,
        search: qs(req.query.search),
        type: qs(req.query.type),
        status: qs(req.query.status),
      });
      res.status(200).json({
        success: true,
        data: result.events,
        pagination: {
          page: parseInt(page || '1'),
          limit: parseInt(limit || '20'),
          total: result.total,
          totalPages: Math.ceil(result.total / parseInt(limit || '20')),
        },
      });
    } catch (error) {
      const err = error as any;
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  }

  /** GET /api/events/my */
  async getMyEvents(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const events = await eventsService.getMyEvents(req.user!.userId);
      res.status(200).json({ success: true, data: events });
    } catch (error) {
      const err = error as any;
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  }

  /** GET /api/events/registered */
  async getRegisteredEvents(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const events = await eventsService.getRegisteredEvents(req.user!.userId);
      res.status(200).json({ success: true, data: events });
    } catch (error) {
      const err = error as any;
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  }

  /** GET /api/events/:id */
  async getEventById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const event = await eventsService.getEventById(req.params.id);
      res.status(200).json({ success: true, data: event });
    } catch (error) {
      const err = error as any;
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  }

  /** POST /api/events */
  async createEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const event = await eventsService.createEvent(req.user!.userId, req.body);
      res.status(201).json({ success: true, data: event, message: 'Event created successfully' });
    } catch (error) {
      const err = error as any;
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  }

  /** PATCH /api/events/:id */
  async updateEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const event = await eventsService.updateEvent(
        req.params.id, req.user!.userId, req.body, req.user!.role === 'admin'
      );
      res.status(200).json({ success: true, data: event, message: 'Event updated successfully' });
    } catch (error) {
      const err = error as any;
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  }

  /** DELETE /api/events/:id */
  async deleteEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      await eventsService.deleteEvent(req.params.id, req.user!.userId, req.user!.role === 'admin');
      res.status(200).json({ success: true, message: 'Event deleted successfully' });
    } catch (error) {
      const err = error as any;
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  }

  /** POST /api/events/:id/register */
  async registerForEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const registration = await eventsService.registerForEvent(req.params.id, req.user!.userId);
      res.status(201).json({ success: true, data: registration, message: 'Successfully registered for the event' });
    } catch (error) {
      const err = error as any;
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  }

  /** DELETE /api/events/:id/register */
  async cancelRegistration(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      await eventsService.cancelRegistration(req.params.id, req.user!.userId);
      res.status(200).json({ success: true, message: 'Registration cancelled successfully' });
    } catch (error) {
      const err = error as any;
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  }

  /** GET /api/events/:id/attendees */
  async getAttendees(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const attendees = await eventsService.getAttendees(
        req.params.id, req.user!.userId, req.user!.role === 'admin'
      );
      res.status(200).json({ success: true, data: attendees });
    } catch (error) {
      const err = error as any;
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  }
}

const eventsController = new EventsController();
export default eventsController;
