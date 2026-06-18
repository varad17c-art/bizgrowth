import Events from './events.model';
import {
  IEvent,
  IEventRegistration,
  CreateEventInput,
  UpdateEventInput,
  PaginationQuery,
} from '../../types';

// ============================================================
// Events Service — Business Logic Layer
// ============================================================

class EventsService {
  async getEventById(id: string): Promise<IEvent> {
    const event = await Events.findById(id);
    if (!event) {
      throw Object.assign(new Error('Event not found'), { statusCode: 404 });
    }
    return event;
  }

  async getMyEvents(userId: string): Promise<IEvent[]> {
    return Events.findByOrganizerId(userId);
  }

  async getRegisteredEvents(userId: string): Promise<IEvent[]> {
    return Events.getRegisteredEvents(userId);
  }

  async createEvent(organizerId: string, input: CreateEventInput): Promise<IEvent> {
    if (!input.title || !input.eventDate) {
      throw Object.assign(new Error('Title and event date are required'), { statusCode: 400 });
    }
    return Events.create(organizerId, input);
  }

  async updateEvent(
    eventId: string,
    userId: string,
    input: UpdateEventInput,
    isAdmin: boolean
  ): Promise<IEvent> {
    const existing = await Events.findById(eventId);
    if (!existing) {
      throw Object.assign(new Error('Event not found'), { statusCode: 404 });
    }
    if (!isAdmin && existing.organizerId !== userId) {
      throw Object.assign(new Error('You do not have permission to update this event'), { statusCode: 403 });
    }
    return Events.update(eventId, input);
  }

  async deleteEvent(eventId: string, userId: string, isAdmin: boolean): Promise<void> {
    const existing = await Events.findById(eventId);
    if (!existing) {
      throw Object.assign(new Error('Event not found'), { statusCode: 404 });
    }
    if (!isAdmin && existing.organizerId !== userId) {
      throw Object.assign(new Error('You do not have permission to delete this event'), { statusCode: 403 });
    }
    await Events.delete(eventId);
  }

  async listEvents(
    query: PaginationQuery & { type?: string; status?: string }
  ): Promise<{ events: IEvent[]; total: number }> {
    return Events.list(query);
  }

  async registerForEvent(eventId: string, userId: string): Promise<IEventRegistration> {
    const event = await Events.findById(eventId);
    if (!event) {
      throw Object.assign(new Error('Event not found'), { statusCode: 404 });
    }
    if (event.status === 'cancelled' || event.status === 'completed') {
      throw Object.assign(new Error(`Cannot register for a ${event.status} event`), { statusCode: 400 });
    }
    // Check capacity
    if (event.capacity !== null && event.attendeeCount !== undefined && event.attendeeCount >= event.capacity) {
      throw Object.assign(new Error('Event is at full capacity'), { statusCode: 409 });
    }
    return Events.registerAttendee(eventId, userId);
  }

  async cancelRegistration(eventId: string, userId: string): Promise<void> {
    const isReg = await Events.isRegistered(eventId, userId);
    if (!isReg) {
      throw Object.assign(new Error('You are not registered for this event'), { statusCode: 404 });
    }
    await Events.cancelRegistration(eventId, userId);
  }

  async getAttendees(eventId: string, requesterId: string, isAdmin: boolean): Promise<IEventRegistration[]> {
    const event = await Events.findById(eventId);
    if (!event) {
      throw Object.assign(new Error('Event not found'), { statusCode: 404 });
    }
    if (!isAdmin && event.organizerId !== requesterId) {
      throw Object.assign(new Error('Only the organizer or admin can view attendees'), { statusCode: 403 });
    }
    return Events.getAttendees(eventId);
  }
}

const eventsService = new EventsService();
export default eventsService;
