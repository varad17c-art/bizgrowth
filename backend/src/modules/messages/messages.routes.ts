import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import messagesController from './messages.controller';

const router = Router();

// Apply authenticate middleware to all message/conversation routes
router.use(authenticate);

// Conversation endpoints
router.get('/conversations', (req, res) => messagesController.listConversations(req, res));
router.post('/conversations', (req, res) => messagesController.getOrCreateConversation(req, res));

// Message endpoints inside a conversation
router.get('/conversations/:conversationId/messages', (req, res) => messagesController.listMessages(req, res));
router.post('/conversations/:conversationId/messages', (req, res) => messagesController.sendMessage(req, res));

// Directory endpoint to start chat with users
router.get('/users', (req, res) => messagesController.listUsers(req, res));

export default router;
