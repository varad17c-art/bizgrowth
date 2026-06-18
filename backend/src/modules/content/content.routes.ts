import { Router } from 'express';
import contentController from './content.controller';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

// ============================================================
// Content Routes — /api/content
// ============================================================

/** GET /api/content — List published content (public) */
router.get('/', contentController.listContent);

/** GET /api/content/my — Current user's content */
router.get('/my', authenticate, contentController.getMyContent);

/** GET /api/content/:id — Get content by ID */
router.get('/:id', contentController.getContentById);

/** POST /api/content — Create new content */
router.post('/', authenticate, contentController.createContent);

/** PATCH /api/content/:id — Update content (author or admin) */
router.patch('/:id', authenticate, contentController.updateContent);

/** PUT /api/content/:id — Full update alias */
router.put('/:id', authenticate, contentController.updateContent);

/** POST /api/content/:id/publish — Publish content (author or admin) */
router.post('/:id/publish', authenticate, contentController.publishContent);

/** DELETE /api/content/:id — Delete content (author or admin) */
router.delete('/:id', authenticate, contentController.deleteContent);

export default router;
