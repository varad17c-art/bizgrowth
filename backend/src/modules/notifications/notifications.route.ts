import { Router } from 'express';
import { NotificationsController } from './notifications.controller';

const router = Router();
const controller = new NotificationsController();

// Notifications routes
router.post('/', (req, res) => controller.createNotification(req, res));
router.get('/user/:userId', (req, res) => controller.getUserNotifications(req, res));
router.get('/user/:userId/unread', (req, res) => controller.getUnreadCount(req, res));
router.patch('/:notificationId/read', (req, res) => controller.markAsRead(req, res));
router.patch('/user/:userId/mark-all-read', (req, res) => controller.markAllAsRead(req, res));
router.delete('/:notificationId', (req, res) => controller.deleteNotification(req, res));
router.delete('/user/:userId', (req, res) => controller.deleteAllNotifications(req, res));

export default router;