import { Request, Response } from 'express';
import { NotificationsService } from './notifications.service';

const notificationsService = new NotificationsService();

// Helper to safely get a string param
const qs = (v: string | string[] | undefined): string => (Array.isArray(v) ? v[0] : v ?? '');

export class NotificationsController {
  /**
   * POST /api/notifications
   * Create notification
   */
  async createNotification(req: Request, res: Response): Promise<void> {
    try {
      const { userId, type, title, message, channels, data, relatedId, relatedModel } = req.body;

      if (!userId || !type || !title || !message) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const notification = await notificationsService.createNotification(
        userId,
        type,
        title,
        message,
        channels || ['in-app'],
        data,
        relatedId,
        relatedModel
      );

      res.status(201).json(notification);
    } catch (error) {
      res.status(500).json({ error: `Failed to create notification: ${error}` });
    }
  }

  /**
   * GET /api/notifications/user/:userId
   * Get user notifications
   */
  async getUserNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = qs(req.params['userId']);
      const read = qs(req.query['read'] as string | string[]);
      const limit = parseInt(qs(req.query['limit'] as string | string[])) || 10;
      const skip = parseInt(qs(req.query['skip'] as string | string[])) || 0;

      const { notifications, total } = await notificationsService.getUserNotifications(
        userId,
        read === 'true' ? true : read === 'false' ? false : undefined,
        limit,
        skip
      );

      res.json({
        notifications,
        pagination: { limit, skip, total },
      });
    } catch (error) {
      res.status(500).json({ error: `Failed to fetch notifications: ${error}` });
    }
  }

  /**
   * GET /api/notifications/user/:userId/unread
   * Get unread notification count
   */
  async getUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      const userId = qs(req.params['userId']);
      const count = await notificationsService.getUnreadCount(userId);

      res.json({ unreadCount: count });
    } catch (error) {
      res.status(500).json({ error: `Failed to fetch unread count: ${error}` });
    }
  }

  /**
   * PATCH /api/notifications/:notificationId/read
   * Mark notification as read
   */
  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const notificationId = qs(req.params['notificationId']);
      const notification = await notificationsService.markAsRead(notificationId);

      if (!notification) {
        res.status(404).json({ error: 'Notification not found' });
        return;
      }

      res.json(notification);
    } catch (error) {
      res.status(500).json({ error: `Failed to mark as read: ${error}` });
    }
  }

  /**
   * PATCH /api/notifications/user/:userId/mark-all-read
   * Mark all notifications as read
   */
  async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = qs(req.params['userId']);
      await notificationsService.markAllAsRead(userId);

      res.json({ message: 'All notifications marked as read' });
    } catch (error) {
      res.status(500).json({ error: `Failed to mark all as read: ${error}` });
    }
  }

  /**
   * DELETE /api/notifications/:notificationId
   * Delete notification
   */
  async deleteNotification(req: Request, res: Response): Promise<void> {
    try {
      const notificationId = qs(req.params['notificationId']);
      const deleted = await notificationsService.deleteNotification(notificationId);

      if (!deleted) {
        res.status(404).json({ error: 'Notification not found' });
        return;
      }

      res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: `Failed to delete notification: ${error}` });
    }
  }

  /**
   * DELETE /api/notifications/user/:userId
   * Delete all notifications for user
   */
  async deleteAllNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = qs(req.params['userId']);
      await notificationsService.deleteAllNotifications(userId);

      res.json({ message: 'All notifications deleted' });
    } catch (error) {
      res.status(500).json({ error: `Failed to delete notifications: ${error}` });
    }
  }
}