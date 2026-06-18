import { Request, Response } from 'express';
import { AvailabilityService } from './availability.service';

const availabilityService = new AvailabilityService();

// Helper to safely get a string param
const qs = (v: string | string[] | undefined): string => (Array.isArray(v) ? v[0] : v ?? '');

export class AvailabilityController {
  /**
   * POST /api/availability
   * Create availability
   */
  async createAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { consultantId, slots, timezone, maxConsultationsPerDay } = req.body;

      if (!consultantId || !slots) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const availability = await availabilityService.createAvailability(
        consultantId,
        slots,
        timezone,
        maxConsultationsPerDay
      );

      res.status(201).json(availability);
    } catch (error) {
      res.status(500).json({ error: `Failed to create availability: ${error}` });
    }
  }

  /**
   * GET /api/availability/:consultantId
   * Get availability
   */
  async getAvailability(req: Request, res: Response): Promise<void> {
    try {
      const consultantId = qs(req.params['consultantId']);
      const availability = await availabilityService.getAvailability(consultantId);

      if (!availability) {
        res.status(404).json({ error: 'Availability not found' });
        return;
      }

      res.json(availability);
    } catch (error) {
      res.status(500).json({ error: `Failed to fetch availability: ${error}` });
    }
  }

  /**
   * PUT /api/availability/:consultantId/slots
   * Update availability slots
   */
  async updateSlots(req: Request, res: Response): Promise<void> {
    try {
      const consultantId = qs(req.params['consultantId']);
      const { slots } = req.body;

      if (!slots) {
        res.status(400).json({ error: 'Slots are required' });
        return;
      }

      const availability = await availabilityService.updateAvailabilitySlots(
        consultantId,
        slots
      );

      if (!availability) {
        res.status(404).json({ error: 'Availability not found' });
        return;
      }

      res.json(availability);
    } catch (error) {
      res.status(500).json({ error: `Failed to update slots: ${error}` });
    }
  }

  /**
   * POST /api/availability/:consultantId/blocked-dates
   * Add blocked dates
   */
  async addBlockedDates(req: Request, res: Response): Promise<void> {
    try {
      const consultantId = qs(req.params['consultantId']);
      const { dates } = req.body;

      if (!dates || !Array.isArray(dates)) {
        res.status(400).json({ error: 'Dates array is required' });
        return;
      }

      const availability = await availabilityService.addBlockedDates(
        consultantId,
        dates.map((d) => new Date(d))
      );

      if (!availability) {
        res.status(404).json({ error: 'Availability not found' });
        return;
      }

      res.json(availability);
    } catch (error) {
      res.status(500).json({ error: `Failed to add blocked dates: ${error}` });
    }
  }

  /**
   * DELETE /api/availability/:consultantId/blocked-dates/:date
   * Remove blocked date
   */
  async removeBlockedDate(req: Request, res: Response): Promise<void> {
    try {
      const consultantId = qs(req.params['consultantId']);
      const date = qs(req.params['date']);

      const availability = await availabilityService.removeBlockedDate(
        consultantId,
        new Date(date)
      );

      if (!availability) {
        res.status(404).json({ error: 'Availability not found' });
        return;
      }

      res.json(availability);
    } catch (error) {
      res.status(500).json({ error: `Failed to remove blocked date: ${error}` });
    }
  }

  /**
   * POST /api/availability/:consultantId/break-time
   * Add break time
   */
  async addBreakTime(req: Request, res: Response): Promise<void> {
    try {
      const consultantId = qs(req.params['consultantId']);
      const { startTime, endTime } = req.body;

      if (!startTime || !endTime) {
        res.status(400).json({ error: 'Start and end times are required' });
        return;
      }

      const availability = await availabilityService.addBreakTime(
        consultantId,
        startTime,
        endTime
      );

      if (!availability) {
        res.status(404).json({ error: 'Availability not found' });
        return;
      }

      res.json(availability);
    } catch (error) {
      res.status(500).json({ error: `Failed to add break time: ${error}` });
    }
  }

  /**
   * GET /api/availability/:consultantId/available-slots
   * Get available slots
   */
  async getAvailableSlots(req: Request, res: Response): Promise<void> {
    try {
      const consultantId = qs(req.params['consultantId']);
      const fromDate = qs(req.query['fromDate'] as string | string[]);
      const toDate = qs(req.query['toDate'] as string | string[]);
      const durationMinutes = qs(req.query['durationMinutes'] as string | string[]);

      if (!fromDate || !toDate) {
        res.status(400).json({ error: 'From and to dates are required' });
        return;
      }

      const slots = await availabilityService.getAvailableSlots(
        consultantId,
        new Date(fromDate),
        new Date(toDate),
        parseInt(durationMinutes) || 60
      );

      res.json({ slots });
    } catch (error) {
      res.status(500).json({ error: `Failed to fetch available slots: ${error}` });
    }
  }

  /**
   * DELETE /api/availability/:consultantId
   * Delete availability
   */
  async deleteAvailability(req: Request, res: Response): Promise<void> {
    try {
      const consultantId = qs(req.params['consultantId']);
      const deleted = await availabilityService.deleteAvailability(consultantId);

      if (!deleted) {
        res.status(404).json({ error: 'Availability not found' });
        return;
      }

      res.json({ message: 'Availability deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: `Failed to delete availability: ${error}` });
    }
  }
}