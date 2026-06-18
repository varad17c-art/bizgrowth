import { supabase } from '../../config/supabase';
import { IBooking } from './bookings.model';

const BOOKINGS_TABLE = 'bookings';

export class BookingsService {
  /**
   * Create a new booking
   */
  async createBooking(bookingData: Partial<IBooking>): Promise<IBooking> {
    try {
      const { data, error } = await supabase
        .from(BOOKINGS_TABLE)
        .insert([bookingData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to create booking: ${error}`);
    }
  }

  /**
   * Get booking by ID
   */
  async getBookingById(bookingId: string): Promise<IBooking | null> {
    try {
      const { data, error } = await supabase
        .from(BOOKINGS_TABLE)
        .select('*')
        .eq('id', bookingId)
        .single();

      if (error) return null;
      return data;
    } catch (error) {
      console.error(`Failed to fetch booking: ${error}`);
      return null;
    }
  }

  /**
   * Get all bookings for a consultant
   */
  async getConsultantBookings(
    consultantId: string,
    status?: string
  ): Promise<IBooking[]> {
    try {
      let query = supabase
        .from(BOOKINGS_TABLE)
        .select('*')
        .eq('consultant_id', consultantId)
        .order('scheduled_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Failed to fetch bookings: ${error}`);
      return [];
    }
  }

  /**
   * Get all bookings for a client
   */
  async getClientBookings(clientId: string, status?: string): Promise<IBooking[]> {
    try {
      let query = supabase
        .from(BOOKINGS_TABLE)
        .select('*')
        .eq('client_id', clientId)
        .order('scheduled_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Failed to fetch bookings: ${error}`);
      return [];
    }
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(
    bookingId: string,
    status: string
  ): Promise<IBooking | null> {
    try {
      const { data, error } = await supabase
        .from(BOOKINGS_TABLE)
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) return null;
      return data;
    } catch (error) {
      console.error(`Failed to update booking: ${error}`);
      return null;
    }
  }

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId: string): Promise<IBooking | null> {
    return this.updateBookingStatus(bookingId, 'cancelled');
  }

  /**
   * Check consultant availability
   */
  async checkAvailability(
    consultantId: string,
    scheduledAt: Date,
    durationMinutes: number
  ): Promise<boolean> {
    try {
      const endTime = new Date(
        scheduledAt.getTime() + durationMinutes * 60000
      ).toISOString();
      const startTime = scheduledAt.toISOString();

      const { data, error } = await supabase
        .from(BOOKINGS_TABLE)
        .select('*')
        .eq('consultant_id', consultantId)
        .in('status', ['pending', 'confirmed', 'completed'])
        .lt('scheduled_at', endTime)
        .gte('scheduled_at', startTime);

      if (error) throw error;
      return !data || data.length === 0;
    } catch (error) {
      console.error(`Failed to check availability: ${error}`);
      return false;
    }
  }

  /**
   * Get bookings in date range
   */
  async getBookingsInRange(
    consultantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<IBooking[]> {
    try {
      const { data, error } = await supabase
        .from(BOOKINGS_TABLE)
        .select('*')
        .eq('consultant_id', consultantId)
        .gte('scheduled_at', startDate.toISOString())
        .lte('scheduled_at', endDate.toISOString())
        .neq('status', 'cancelled');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Failed to fetch bookings in range: ${error}`);
      return [];
    }
  }

  /**
   * Delete booking
   */
  async deleteBooking(bookingId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(BOOKINGS_TABLE)
        .delete()
        .eq('id', bookingId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Failed to delete booking: ${error}`);
      return false;
    }
  }
}
