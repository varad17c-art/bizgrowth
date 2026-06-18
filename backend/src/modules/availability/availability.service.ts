import { supabase } from '../../config/supabase';
import { IAvailability, IAvailabilitySlot } from './availability.model';

const AVAILABILITY_TABLE = 'availability';
const BOOKINGS_TABLE = 'bookings';

export class AvailabilityService {
  /**
   * Create availability schedule
   */
  async createAvailability(
    consultantId: string,
    slots: IAvailabilitySlot[],
    timezone: string = 'Asia/Kolkata',
    maxConsultationsPerDay: number = 10
  ): Promise<IAvailability> {
    try {
      const { data, error } = await supabase
        .from(AVAILABILITY_TABLE)
        .insert([
          {
            consultant_id: consultantId,
            slots,
            timezone,
            max_consultations_per_day: maxConsultationsPerDay,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to create availability: ${error}`);
    }
  }

  /**
   * Get availability for consultant
   */
  async getAvailability(consultantId: string): Promise<IAvailability | null> {
    try {
      const { data, error } = await supabase
        .from(AVAILABILITY_TABLE)
        .select('*')
        .eq('consultant_id', consultantId)
        .single();

      if (error) return null;
      return data;
    } catch (error) {
      console.error(`Failed to fetch availability: ${error}`);
      return null;
    }
  }

  /**
   * Update availability slots
   */
  async updateAvailabilitySlots(
    consultantId: string,
    slots: IAvailabilitySlot[]
  ): Promise<IAvailability | null> {
    try {
      const { data, error } = await supabase
        .from(AVAILABILITY_TABLE)
        .update({ slots, updated_at: new Date().toISOString() })
        .eq('consultant_id', consultantId)
        .select()
        .single();

      if (error) return null;
      return data;
    } catch (error) {
      console.error(`Failed to update availability slots: ${error}`);
      return null;
    }
  }

  /**
   * Add blocked dates
   */
  async addBlockedDates(
    consultantId: string,
    dates: Date[]
  ): Promise<IAvailability | null> {
    try {
      const availability = await this.getAvailability(consultantId);
      if (!availability) return null;

      const blockedDates = Array.isArray(availability.blocked_dates)
        ? [...availability.blocked_dates, ...dates]
        : dates;

      const { data, error } = await supabase
        .from(AVAILABILITY_TABLE)
        .update({ blocked_dates: blockedDates, updated_at: new Date().toISOString() })
        .eq('consultant_id', consultantId)
        .select()
        .single();

      if (error) return null;
      return data;
    } catch (error) {
      console.error(`Failed to add blocked dates: ${error}`);
      return null;
    }
  }

  /**
   * Remove blocked dates
   */
  async removeBlockedDate(
    consultantId: string,
    date: Date
  ): Promise<IAvailability | null> {
    try {
      const availability = await this.getAvailability(consultantId);
      if (!availability) return null;

      const blockedDates = (availability.blocked_dates || []).filter(
        (bd) => new Date(bd).toDateString() !== new Date(date).toDateString()
      );

      const { data, error } = await supabase
        .from(AVAILABILITY_TABLE)
        .update({ blocked_dates: blockedDates, updated_at: new Date().toISOString() })
        .eq('consultant_id', consultantId)
        .select()
        .single();

      if (error) return null;
      return data;
    } catch (error) {
      console.error(`Failed to remove blocked date: ${error}`);
      return null;
    }
  }

  /**
   * Add break time
   */
  async addBreakTime(
    consultantId: string,
    startTime: string,
    endTime: string
  ): Promise<IAvailability | null> {
    try {
      const availability = await this.getAvailability(consultantId);
      if (!availability) return null;

      const breakTimes = availability.break_times || [];
      breakTimes.push({ start_time: startTime, end_time: endTime });

      const { data, error } = await supabase
        .from(AVAILABILITY_TABLE)
        .update({ break_times: breakTimes, updated_at: new Date().toISOString() })
        .eq('consultant_id', consultantId)
        .select()
        .single();

      if (error) return null;
      return data;
    } catch (error) {
      console.error(`Failed to add break time: ${error}`);
      return null;
    }
  }

  /**
   * Check if consultant is available
   */
  async isAvailable(
    consultantId: string,
    scheduledAt: Date,
    durationMinutes: number
  ): Promise<boolean> {
    try {
      const availability = await this.getAvailability(consultantId);

      if (!availability) {
        return false;
      }

      // Check if date is blocked
      const dateOnly = new Date(
        scheduledAt.getFullYear(),
        scheduledAt.getMonth(),
        scheduledAt.getDate()
      );
      const isBlocked = availability.blocked_dates?.some(
        (bd) => new Date(bd).toDateString() === dateOnly.toDateString()
      );

      if (isBlocked) {
        return false;
      }

      // Check day of week and time slots
      const dayOfWeek = scheduledAt.getDay();
      const timeStr = `${String(scheduledAt.getHours()).padStart(2, '0')}:${
        String(scheduledAt.getMinutes()).padStart(2, '0')
      }`;

      const slot = availability.slots?.find(
        (s) => s.day_of_week === dayOfWeek && s.is_available
      );

      if (!slot) {
        return false;
      }

      // Check if time is within slot
      const isWithinSlot = timeStr >= slot.start_time && timeStr < slot.end_time;

      if (!isWithinSlot) {
        return false;
      }

      // Check break times
      const endTime = new Date(scheduledAt.getTime() + durationMinutes * 60000);
      const endTimeStr = `${String(endTime.getHours()).padStart(2, '0')}:${
        String(endTime.getMinutes()).padStart(2, '0')
      }`;

      const isInBreak = availability.break_times?.some(
        (bt) => timeStr < (bt.end_time || '') && endTimeStr > (bt.start_time || '')
      );

      if (isInBreak) {
        return false;
      }

      // Check max consultations per day
      const dayStart = new Date(scheduledAt);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(scheduledAt);
      dayEnd.setHours(23, 59, 59, 999);

      const { count } = await supabase
        .from(BOOKINGS_TABLE)
        .select('*', { count: 'exact', head: true })
        .eq('consultant_id', consultantId)
        .gte('scheduled_at', dayStart.toISOString())
        .lte('scheduled_at', dayEnd.toISOString())
        .in('status', ['pending', 'confirmed', 'completed']);

      if ((count || 0) >= (availability.max_consultations_per_day || 10)) {
        return false;
      }

      return true;
    } catch (error) {
      console.error(`Failed to check availability: ${error}`);
      return false;
    }
  }

  /**
   * Get available time slots for a date range
   */
  async getAvailableSlots(
    consultantId: string,
    fromDate: Date,
    toDate: Date,
    durationMinutes: number = 60
  ): Promise<Date[]> {
    try {
      const availability = await this.getAvailability(consultantId);
      const slots: Date[] = [];

      if (!availability) {
        return slots;
      }

      let currentDate = new Date(fromDate);

      while (currentDate <= toDate) {
        const dayOfWeek = currentDate.getDay();
        const availabilitySlot = availability.slots?.find(
          (s) => s.day_of_week === dayOfWeek && s.is_available
        );

        if (availabilitySlot) {
          const [startHour, startMin] = availabilitySlot.start_time
            .split(':')
            .map(Number);
          const [endHour, endMin] = availabilitySlot.end_time.split(':').map(Number);

          let slotTime = new Date(currentDate);
          slotTime.setHours(startHour, startMin, 0);

          const slotEndTime = new Date(currentDate);
          slotEndTime.setHours(endHour, endMin, 0);

          while (
            slotTime.getTime() + durationMinutes * 60000 <=
            slotEndTime.getTime()
          ) {
            if (await this.isAvailable(consultantId, slotTime, durationMinutes)) {
              slots.push(new Date(slotTime));
            }
            slotTime = new Date(slotTime.getTime() + durationMinutes * 60000);
          }
        }

        currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
      }

      return slots;
    } catch (error) {
      console.error(`Failed to get available slots: ${error}`);
      return [];
    }
  }

  /**
   * Delete availability
   */
  async deleteAvailability(consultantId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(AVAILABILITY_TABLE)
        .delete()
        .eq('consultant_id', consultantId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Failed to delete availability: ${error}`);
      return false;
    }
  }
}
