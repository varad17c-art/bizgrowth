import { Request, Response } from 'express';
import { BookingsService } from './bookings.service';

const bookingsService = new BookingsService();

// Helper to safely get a string param
const qs = (v: string | string[] | undefined): string => (Array.isArray(v) ? v[0] : v ?? '');

export class BookingsController {
  /**
   * POST /api/bookings
   */
  async createBooking(req: Request, res: Response): Promise<void> {
    try {
      const { consultantId, clientId, scheduledAt, durationMinutes, notes } = req.body;

      if (!consultantId || !clientId || !scheduledAt) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const isAvailable = await bookingsService.checkAvailability(
        consultantId,
        new Date(scheduledAt),
        durationMinutes || 60
      );

      if (!isAvailable) {
        res.status(409).json({ error: 'Consultant not available at this time' });
        return;
      }

      const booking = await bookingsService.createBooking({
        consultant_id: consultantId,
        client_id: clientId,
        scheduled_at: new Date(scheduledAt),
        duration_minutes: durationMinutes || 60,
        notes,
        status: 'pending',
      });

      res.status(201).json(booking);
    } catch (error) {
      res.status(500).json({ error: `Failed to create booking: ${error}` });
    }
  }

  /**
   * GET /api/bookings/:bookingId
   */
  async getBooking(req: Request, res: Response): Promise<void> {
    try {
      const bookingId = qs(req.params['bookingId']);
      const booking = await bookingsService.getBookingById(bookingId);

      if (!booking) {
        res.status(404).json({ error: 'Booking not found' });
        return;
      }

      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: `Failed to fetch booking: ${error}` });
    }
  }

  /**
   * GET /api/bookings/consultant/:consultantId
   */
  async getConsultantBookings(req: Request, res: Response): Promise<void> {
    try {
      const consultantId = qs(req.params['consultantId']);
      const status = qs(req.query['status'] as string | string[]);
      const bookings = await bookingsService.getConsultantBookings(consultantId, status || undefined);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: `Failed to fetch bookings: ${error}` });
    }
  }

  /**
   * GET /api/bookings/client/:clientId
   */
  async getClientBookings(req: Request, res: Response): Promise<void> {
    try {
      const clientId = qs(req.params['clientId']);
      const status = qs(req.query['status'] as string | string[]);
      const bookings = await bookingsService.getClientBookings(clientId, status || undefined);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: `Failed to fetch bookings: ${error}` });
    }
  }

  /**
   * PATCH /api/bookings/:bookingId/status
   */
  async updateBookingStatus(req: Request, res: Response): Promise<void> {
    try {
      const bookingId = qs(req.params['bookingId']);
      const { status } = req.body;

      if (!status) {
        res.status(400).json({ error: 'Status is required' });
        return;
      }

      const booking = await bookingsService.updateBookingStatus(bookingId, status);

      if (!booking) {
        res.status(404).json({ error: 'Booking not found' });
        return;
      }

      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: `Failed to update booking: ${error}` });
    }
  }

  /**
   * DELETE /api/bookings/:bookingId
   */
  async cancelBooking(req: Request, res: Response): Promise<void> {
    try {
      const bookingId = qs(req.params['bookingId']);
      const booking = await bookingsService.cancelBooking(bookingId);

      if (!booking) {
        res.status(404).json({ error: 'Booking not found' });
        return;
      }

      res.json({ message: 'Booking cancelled successfully', booking });
    } catch (error) {
      res.status(500).json({ error: `Failed to cancel booking: ${error}` });
    }
  }

  /**
   * GET /api/bookings/availability/check
   */
  async checkAvailability(req: Request, res: Response): Promise<void> {
    try {
      const consultantId = qs(req.query['consultantId'] as string | string[]);
      const scheduledAt = qs(req.query['scheduledAt'] as string | string[]);
      const durationMinutes = qs(req.query['durationMinutes'] as string | string[]);

      if (!consultantId || !scheduledAt) {
        res.status(400).json({ error: 'Missing required parameters' });
        return;
      }

      const isAvailable = await bookingsService.checkAvailability(
        consultantId,
        new Date(scheduledAt),
        parseInt(durationMinutes) || 60
      );

      res.json({ available: isAvailable });
    } catch (error) {
      res.status(500).json({ error: `Failed to check availability: ${error}` });
    }
  }
}