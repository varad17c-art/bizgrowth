import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import db from '../../config/db';

const qs = (val: any): string | undefined => Array.isArray(val) ? val[0] : val;

class MessagesController {
  /**
   * GET /api/messages/conversations
   * Get all conversations for the authenticated user, including the other participant's profile
   * and the last message.
   */
  async listConversations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUserId = req.user!.userId;

      const queryText = `
        SELECT 
          c.id AS conversation_id,
          c.created_at AS conversation_created_at,
          p.auth_user_id AS other_user_id,
          p.first_name AS other_user_first_name,
          p.last_name AS other_user_last_name,
          p.avatar_url AS other_user_avatar_url,
          p.role::text AS other_user_role,
          m.id AS last_message_id,
          m.text_content AS last_message_text,
          m.sender_id AS last_message_sender_id,
          m.is_read AS last_message_is_read,
          m.created_at AS last_message_created_at
        FROM public.conversations c
        INNER JOIN public.profiles p ON (
          (c.participant_one = p.auth_user_id AND c.participant_two = $1) OR
          (c.participant_two = p.auth_user_id AND c.participant_one = $1)
        )
        LEFT JOIN LATERAL (
          SELECT id, text_content, sender_id, is_read, created_at
          FROM public.messages
          WHERE conversation_id = c.id
          ORDER BY created_at DESC
          LIMIT 1
        ) m ON true
        ORDER BY COALESCE(m.created_at, c.created_at) DESC;
      `;

      const { rows } = await db.query(queryText, [currentUserId]);

      const conversations = rows.map((row: any) => ({
        id: row.conversation_id,
        createdAt: row.conversation_created_at,
        otherUser: {
          id: row.other_user_id,
          firstName: row.other_user_first_name,
          lastName: row.other_user_last_name,
          name: `${row.other_user_first_name || ''} ${row.other_user_last_name || ''}`.trim(),
          avatarUrl: row.other_user_avatar_url || '',
          role: row.other_user_role,
        },
        lastMessage: row.last_message_id ? {
          id: row.last_message_id,
          textContent: row.last_message_text,
          senderId: row.last_message_sender_id,
          isRead: row.last_message_is_read,
          createdAt: row.last_message_created_at,
        } : null,
      }));

      res.status(200).json({ success: true, data: conversations });
    } catch (error) {
      const err = error as any;
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch conversations' });
    }
  }

  /**
   * POST /api/messages/conversations
   * Start or retrieve a conversation with a recipient.
   */
  async getOrCreateConversation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUserId = req.user!.userId;
      const { recipientId } = req.body;

      if (!recipientId) {
        res.status(400).json({ success: false, message: 'Recipient ID is required.' });
        return;
      }

      if (recipientId === currentUserId) {
        res.status(400).json({ success: false, message: 'Cannot start a conversation with yourself.' });
        return;
      }

      // Sort participant IDs lexicographically
      const participantOne = currentUserId < recipientId ? currentUserId : recipientId;
      const participantTwo = currentUserId < recipientId ? recipientId : currentUserId;

      // 1. Check if the conversation already exists
      let convRes = await db.query(
        `SELECT id, participant_one, participant_two, created_at 
         FROM public.conversations 
         WHERE participant_one = $1 AND participant_two = $2`,
        [participantOne, participantTwo]
      );

      let conversationId = '';

      if (convRes.rows.length === 0) {
        // 2. Create the conversation
        const insertRes = await db.query(
          `INSERT INTO public.conversations (participant_one, participant_two)
           VALUES ($1, $2)
           RETURNING id`,
          [participantOne, participantTwo]
        );
        conversationId = insertRes.rows[0].id;
      } else {
        conversationId = convRes.rows[0].id;
      }

      // Fetch full details of the conversation
      const queryText = `
        SELECT 
          c.id AS conversation_id,
          c.created_at AS conversation_created_at,
          p.auth_user_id AS other_user_id,
          p.first_name AS other_user_first_name,
          p.last_name AS other_user_last_name,
          p.avatar_url AS other_user_avatar_url,
          p.role::text AS other_user_role
        FROM public.conversations c
        INNER JOIN public.profiles p ON (
          (c.participant_one = p.auth_user_id AND c.participant_two = $1) OR
          (c.participant_two = p.auth_user_id AND c.participant_one = $1)
        )
        WHERE c.id = $2
        LIMIT 1;
      `;

      const { rows } = await db.query(queryText, [currentUserId, conversationId]);

      if (rows.length === 0) {
        res.status(404).json({ success: false, message: 'Conversation profile not found.' });
        return;
      }

      const row = rows[0];
      const conversation = {
        id: row.conversation_id,
        createdAt: row.conversation_created_at,
        otherUser: {
          id: row.other_user_id,
          firstName: row.other_user_first_name,
          lastName: row.other_user_last_name,
          name: `${row.other_user_first_name || ''} ${row.other_user_last_name || ''}`.trim(),
          avatarUrl: row.other_user_avatar_url || '',
          role: row.other_user_role,
        },
        lastMessage: null,
      };

      res.status(200).json({ success: true, data: conversation });
    } catch (error) {
      const err = error as any;
      res.status(500).json({ success: false, message: err.message || 'Failed to start conversation' });
    }
  }

  /**
   * GET /api/messages/conversations/:conversationId/messages
   * Get all messages for a specific conversation.
   * Marks unread messages sent by the other user as read.
   */
  async listMessages(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUserId = req.user!.userId;
      const conversationId = req.params.conversationId;

      // 1. Verify user is participant in conversation
      const checkRes = await db.query(
        `SELECT participant_one, participant_two 
         FROM public.conversations 
         WHERE id = $1`,
        [conversationId]
      );

      if (checkRes.rows.length === 0) {
        res.status(404).json({ success: false, message: 'Conversation not found.' });
        return;
      }

      const { participant_one, participant_two } = checkRes.rows[0];
      if (participant_one !== currentUserId && participant_two !== currentUserId) {
        res.status(403).json({ success: false, message: 'Access denied. You are not a participant in this conversation.' });
        return;
      }

      // 2. Mark incoming messages as read
      await db.query(
        `UPDATE public.messages 
         SET is_read = true 
         WHERE conversation_id = $1 AND sender_id != $2 AND is_read = false`,
        [conversationId, currentUserId]
      );

      // 3. Fetch messages
      const messagesRes = await db.query(
        `SELECT id, conversation_id AS "conversationId", sender_id AS "senderId", text_content AS "textContent", is_read AS "isRead", created_at AS "createdAt"
         FROM public.messages
         WHERE conversation_id = $1
         ORDER BY created_at ASC`,
        [conversationId]
      );

      res.status(200).json({ success: true, data: messagesRes.rows });
    } catch (error) {
      const err = error as any;
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch messages' });
    }
  }

  /**
   * POST /api/messages/conversations/:conversationId/messages
   * Send a message to a specific conversation.
   */
  async sendMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUserId = req.user!.userId;
      const conversationId = req.params.conversationId;
      const { textContent } = req.body;

      if (!textContent || textContent.trim() === '') {
        res.status(400).json({ success: false, message: 'Message text cannot be empty.' });
        return;
      }

      // 1. Verify user is participant
      const checkRes = await db.query(
        `SELECT participant_one, participant_two 
         FROM public.conversations 
         WHERE id = $1`,
        [conversationId]
      );

      if (checkRes.rows.length === 0) {
        res.status(404).json({ success: false, message: 'Conversation not found.' });
        return;
      }

      const { participant_one, participant_two } = checkRes.rows[0];
      if (participant_one !== currentUserId && participant_two !== currentUserId) {
        res.status(403).json({ success: false, message: 'Access denied. You are not a participant in this conversation.' });
        return;
      }

      // 2. Insert message
      const insertRes = await db.query(
        `INSERT INTO public.messages (conversation_id, sender_id, text_content)
         VALUES ($1, $2, $3)
         RETURNING id, conversation_id AS "conversationId", sender_id AS "senderId", text_content AS "textContent", is_read AS "isRead", created_at AS "createdAt"`,
        [conversationId, currentUserId, textContent.trim()]
      );

      res.status(201).json({ success: true, data: insertRes.rows[0] });
    } catch (error) {
      const err = error as any;
      res.status(500).json({ success: false, message: err.message || 'Failed to send message' });
    }
  }

  /**
   * GET /api/messages/users
   * Get all users to start a conversation with.
   */
  async listUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUserId = req.user!.userId;

      const { rows } = await db.query(
        `SELECT 
          u.id, 
          p.first_name AS "firstName", 
          p.last_name AS "lastName", 
          p.avatar_url AS "avatarUrl", 
          p.role::text AS "role"
         FROM public.users u
         INNER JOIN public.profiles p ON u.id = p.auth_user_id
         WHERE u.id != $1 AND p.status = 'active'
         ORDER BY p.first_name ASC, p.last_name ASC`,
        [currentUserId]
      );

      const formattedUsers = rows.map((r: any) => ({
        id: r.id,
        firstName: r.firstName,
        lastName: r.lastName,
        name: `${r.firstName || ''} ${r.lastName || ''}`.trim(),
        avatarUrl: r.avatarUrl || '',
        role: r.role,
      }));

      res.status(200).json({ success: true, data: formattedUsers });
    } catch (error) {
      const err = error as any;
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch users' });
    }
  }
}

export default new MessagesController();
