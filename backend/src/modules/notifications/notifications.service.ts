import { supabase } from '../../config/supabase';
import { INotification } from './notifications.model';

const NOTIFICATIONS_TABLE = 'notifications';

export class NotificationsService {
  /**
   * Create notification
   */
  async createNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    channels: string[] = ['in-app'],
    data?: any,
    relatedId?: string,
    relatedModel?: string
  ): Promise<INotification> {
    try {
      const { data: notification, error } = await supabase
        .from(NOTIFICATIONS_TABLE)
        .insert([
          {
            user_id: userId,
            type,
            title,
            message,
            channels,
            data,
            related_id: relatedId,
            related_model: relatedModel,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Send via channels
      await this.sendViaChannels(notification);

      return notification;
    } catch (error) {
      throw new Error(`Failed to create notification: ${error}`);
    }
  }

  /**
   * Send notification via channels
   */
  async sendViaChannels(notification: INotification): Promise<void> {
    try {
      for (const channel of notification.channels) {
        switch (channel) {
          case 'email':
            await this.sendEmail(notification);
            break;
          case 'sms':
            await this.sendSMS(notification);
            break;
          case 'push':
            await this.sendPushNotification(notification);
            break;
          case 'in-app':
            // In-app notifications are stored in DB
            break;
        }
      }

      // Update sent timestamp
      await supabase
        .from(NOTIFICATIONS_TABLE)
        .update({ sent_at: new Date().toISOString() })
        .eq('id', notification.id);
    } catch (error) {
      console.error(`Failed to send via channels: ${error}`);
    }
  }

  /**
   * Send email notification
   */
  async sendEmail(notification: INotification): Promise<void> {
    // TODO: Integrate with email service (SendGrid, Mailgun, etc.)
    console.log(`Email sent to user ${notification.user_id}: ${notification.title}`);
  }

  /**
   * Send SMS notification
   */
  async sendSMS(notification: INotification): Promise<void> {
    // TODO: Integrate with SMS service (Twilio, etc.)
    console.log(`SMS sent to user ${notification.user_id}: ${notification.title}`);
  }

  /**
   * Send push notification
   */
  async sendPushNotification(notification: INotification): Promise<void> {
    // TODO: Integrate with push service (Firebase Cloud Messaging, etc.)
    console.log(`Push notification sent to user ${notification.user_id}: ${notification.title}`);
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(
    userId: string,
    read?: boolean,
    limit: number = 10,
    skip: number = 0
  ): Promise<{ notifications: INotification[]; total: number }> {
    try {
      // Get total count
      let countQuery = supabase
        .from(NOTIFICATIONS_TABLE)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (read !== undefined) {
        countQuery = countQuery.eq('read', read);
      }

      const { count: total } = await countQuery;

      // Get paginated data
      let query = supabase
        .from(NOTIFICATIONS_TABLE)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(skip, skip + limit - 1);

      if (read !== undefined) {
        query = query.eq('read', read);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { notifications: data || [], total: total || 0 };
    } catch (error) {
      console.error(`Failed to fetch notifications: ${error}`);
      return { notifications: [], total: 0 };
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<INotification | null> {
    try {
      const { data, error } = await supabase
        .from(NOTIFICATIONS_TABLE)
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId)
        .select()
        .single();

      if (error) return null;
      return data;
    } catch (error) {
      console.error(`Failed to mark notification as read: ${error}`);
      return null;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<any> {
    try {
      const { error } = await supabase
        .from(NOTIFICATIONS_TABLE)
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error(`Failed to mark all as read: ${error}`);
      return { success: false };
    }
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from(NOTIFICATIONS_TABLE)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error(`Failed to get unread count: ${error}`);
      return 0;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(NOTIFICATIONS_TABLE)
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Failed to delete notification: ${error}`);
      return false;
    }
  }

  /**
   * Delete all notifications for user
   */
  async deleteAllNotifications(userId: string): Promise<any> {
    try {
      const { error } = await supabase
        .from(NOTIFICATIONS_TABLE)
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error(`Failed to delete all notifications: ${error}`);
      return { success: false };
    }
  }

  /**
   * Send booking notification
   */
  async notifyBookingCreated(
    consultantId: string,
    clientId: string,
    bookingId: string,
    bookingTime: string
  ): Promise<void> {
    // Notify consultant
    await this.createNotification(
      consultantId,
      'booking',
      'New Booking Received',
      `You have a new booking scheduled for ${bookingTime}`,
      ['email', 'push', 'in-app'],
      { bookingTime },
      bookingId,
      'Booking'
    );

    // Notify client
    await this.createNotification(
      clientId,
      'booking',
      'Booking Confirmed',
      'Your booking has been confirmed',
      ['email', 'in-app'],
      {},
      bookingId,
      'Booking'
    );
  }

  /**
   * Send payment notification
   */
  async notifyPaymentSuccess(
    consultantId: string,
    clientId: string,
    amount: number,
    paymentId: string
  ): Promise<void> {
    // Notify consultant
    await this.createNotification(
      consultantId,
      'payment',
      'Payment Received',
      `You received ₹${amount} for a booking`,
      ['email', 'push', 'in-app'],
      { amount },
      paymentId,
      'Payment'
    );

    // Notify client
    await this.createNotification(
      clientId,
      'payment',
      'Payment Successful',
      `Your payment of ₹${amount} has been processed`,
      ['email', 'in-app'],
      { amount },
      paymentId,
      'Payment'
    );
  }

  /**
   * Send review notification
   */
  async notifyReviewReceived(
    consultantId: string,
    rating: number,
    reviewId: string
  ): Promise<void> {
    await this.createNotification(
      consultantId,
      'review',
      'New Review Received',
      `You received a ${rating}-star review`,
      ['email', 'push', 'in-app'],
      { rating },
      reviewId,
      'Review'
    );
  }

  /**
   * Send reminder notification
   */
  async sendReminder(
    userId: string,
    title: string,
    message: string,
    bookingId?: string
  ): Promise<void> {
    await this.createNotification(
      userId,
      'reminder',
      title,
      message,
      ['email', 'push', 'in-app'],
      {},
      bookingId,
      'Booking'
    );
  }
}
