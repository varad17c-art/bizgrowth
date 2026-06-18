import db from '../../config/db';
import {
  IEvent,
  IEventRegistration,
  EventRow,
  EventRegistrationRow,
  CreateEventInput,
  UpdateEventInput,
  PaginationQuery,
} from '../../types';

// ============================================================
// Row ↔ Application Mapping
// ============================================================

export function mapRowToEvent(row: EventRow, attendeeCount?: number): IEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    type: row.type,
    status: row.status,
    eventDate: new Date(row.event_date),
    endDate: row.end_date ? new Date(row.end_date) : null,
    location: row.location || '',
    isVirtual: row.is_virtual,
    virtualLink: row.virtual_link || '',
    capacity: row.capacity ?? null,
    registrationFee: row.registration_fee ? parseFloat(row.registration_fee) : 0,
    currency: row.currency || 'INR',
    thumbnailUrl: row.thumbnail_url || '',
    tags: row.tags || [],
    organizerId: row.organizer_id,
    orgId: row.org_id || null,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    attendeeCount,
  };
}

export function mapRowToRegistration(row: EventRegistrationRow): IEventRegistration {
  return {
    id: row.id,
    eventId: row.event_id,
    userId: row.user_id,
    status: row.status,
    registeredAt: new Date(row.registered_at),
  };
}

// ============================================================
// Events Model — Data Access Layer
// ============================================================

class EventsModel {
  /**
   * Find an event by ID (with attendee count).
   */
  async findById(id: string): Promise<IEvent | null> {
    try {
      const { rows } = await db.query(
        `SELECT e.*,
           (SELECT COUNT(*) FROM public.event_registrations r WHERE r.event_id = e.id AND r.status = 'confirmed') AS attendee_count
         FROM public.events e
         WHERE e.id = $1 LIMIT 1`,
        [id]
      );
      if (rows.length === 0) return null;
      const row = rows[0];
      return mapRowToEvent(row as EventRow, parseInt(row.attendee_count || '0'));
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }

  /**
   * Find all events organized by a specific user.
   */
  async findByOrganizerId(organizerId: string): Promise<IEvent[]> {
    try {
      const { rows } = await db.query(
        `SELECT * FROM public.events WHERE organizer_id = $1 ORDER BY event_date DESC`,
        [organizerId]
      );
      return rows.map((row) => mapRowToEvent(row as EventRow));
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }

  /**
   * Create a new event.
   */
  async create(organizerId: string, input: CreateEventInput): Promise<IEvent> {
    try {
      const { rows } = await db.query(
        `INSERT INTO public.events
          (title, description, type, event_date, end_date, location, is_virtual, virtual_link,
           capacity, registration_fee, currency, thumbnail_url, tags, organizer_id, org_id, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'upcoming')
         RETURNING *`,
        [
          input.title,
          input.description || '',
          input.type || 'other',
          input.eventDate,
          input.endDate || null,
          input.location || '',
          input.isVirtual || false,
          input.virtualLink || '',
          input.capacity || null,
          input.registrationFee || 0,
          input.currency || 'INR',
          input.thumbnailUrl || '',
          input.tags || [],
          organizerId,
          input.orgId || null,
        ]
      );
      return mapRowToEvent(rows[0] as EventRow, 0);
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }

  /**
   * Update an event.
   */
  async update(id: string, input: UpdateEventInput): Promise<IEvent> {
    const updates: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (input.title !== undefined) { updates.push(`title = $${idx++}`); params.push(input.title); }
    if (input.description !== undefined) { updates.push(`description = $${idx++}`); params.push(input.description); }
    if (input.type !== undefined) { updates.push(`type = $${idx++}`); params.push(input.type); }
    if (input.status !== undefined) { updates.push(`status = $${idx++}`); params.push(input.status); }
    if (input.eventDate !== undefined) { updates.push(`event_date = $${idx++}`); params.push(input.eventDate); }
    if (input.endDate !== undefined) { updates.push(`end_date = $${idx++}`); params.push(input.endDate); }
    if (input.location !== undefined) { updates.push(`location = $${idx++}`); params.push(input.location); }
    if (input.isVirtual !== undefined) { updates.push(`is_virtual = $${idx++}`); params.push(input.isVirtual); }
    if (input.virtualLink !== undefined) { updates.push(`virtual_link = $${idx++}`); params.push(input.virtualLink); }
    if (input.capacity !== undefined) { updates.push(`capacity = $${idx++}`); params.push(input.capacity); }
    if (input.registrationFee !== undefined) { updates.push(`registration_fee = $${idx++}`); params.push(input.registrationFee); }
    if (input.thumbnailUrl !== undefined) { updates.push(`thumbnail_url = $${idx++}`); params.push(input.thumbnailUrl); }
    if (input.tags !== undefined) { updates.push(`tags = $${idx++}`); params.push(input.tags); }

    if (updates.length === 0) {
      throw Object.assign(new Error('No fields to update'), { statusCode: 400 });
    }

    params.push(id);
    try {
      const { rows } = await db.query(
        `UPDATE public.events SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
        params
      );
      if (rows.length === 0) {
        throw Object.assign(new Error('Event not found'), { statusCode: 404 });
      }
      return mapRowToEvent(rows[0] as EventRow);
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }

  /**
   * Delete an event.
   */
  async delete(id: string): Promise<void> {
    try {
      await db.query(`DELETE FROM public.events WHERE id = $1`, [id]);
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }

  /**
   * List events with pagination and filtering.
   */
  async list(query: PaginationQuery & { type?: string; status?: string }): Promise<{
    events: IEvent[];
    total: number;
  }> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (query.search) {
      conditions.push(`(title ILIKE $${idx} OR description ILIKE $${idx})`);
      params.push(`%${query.search}%`);
      idx++;
    }
    if ((query as any).type) {
      conditions.push(`type = $${idx++}`);
      params.push((query as any).type);
    }
    if ((query as any).status) {
      conditions.push(`status = $${idx++}`);
      params.push((query as any).status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    try {
      const countRes = await db.query(
        `SELECT COUNT(*) FROM public.events ${whereClause}`,
        params
      );
      const total = parseInt(countRes.rows[0].count, 10);

      const dataParams = [...params, limit, offset];
      const { rows } = await db.query(
        `SELECT * FROM public.events ${whereClause} ORDER BY event_date ASC LIMIT $${idx++} OFFSET $${idx++}`,
        dataParams
      );

      return {
        events: rows.map((row) => mapRowToEvent(row as EventRow)),
        total,
      };
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }

  // ---- Registrations ----

  /**
   * Register a user for an event.
   */
  async registerAttendee(eventId: string, userId: string): Promise<IEventRegistration> {
    try {
      const { rows } = await db.query(
        `INSERT INTO public.event_registrations (event_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT (event_id, user_id) DO UPDATE SET status = 'confirmed'
         RETURNING *`,
        [eventId, userId]
      );
      return mapRowToRegistration(rows[0] as EventRegistrationRow);
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }

  /**
   * Cancel a user's registration.
   */
  async cancelRegistration(eventId: string, userId: string): Promise<void> {
    try {
      await db.query(
        `UPDATE public.event_registrations SET status = 'cancelled' WHERE event_id = $1 AND user_id = $2`,
        [eventId, userId]
      );
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }

  /**
   * Get all registrations for an event.
   */
  async getAttendees(eventId: string): Promise<IEventRegistration[]> {
    try {
      const { rows } = await db.query(
        `SELECT * FROM public.event_registrations WHERE event_id = $1 AND status = 'confirmed' ORDER BY registered_at ASC`,
        [eventId]
      );
      return rows.map((row) => mapRowToRegistration(row as EventRegistrationRow));
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }

  /**
   * Check if user is registered for an event.
   */
  async isRegistered(eventId: string, userId: string): Promise<boolean> {
    try {
      const { rows } = await db.query(
        `SELECT 1 FROM public.event_registrations WHERE event_id = $1 AND user_id = $2 AND status = 'confirmed'`,
        [eventId, userId]
      );
      return rows.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get events a user is registered for.
   */
  async getRegisteredEvents(userId: string): Promise<IEvent[]> {
    try {
      const { rows } = await db.query(
        `SELECT e.* FROM public.events e
         INNER JOIN public.event_registrations r ON r.event_id = e.id
         WHERE r.user_id = $1 AND r.status = 'confirmed'
         ORDER BY e.event_date ASC`,
        [userId]
      );
      return rows.map((row) => mapRowToEvent(row as EventRow));
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }
}

const Events = new EventsModel();
export default Events;
