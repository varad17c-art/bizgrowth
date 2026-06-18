import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import db from '../../config/db';

class PortfolioController {
  /**
   * GET /api/portfolio/consultant/:consultantId
   * Fetch all portfolio items for a specific consultant profile ID
   */
  async getConsultantPortfolio(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { consultantId } = req.params;

      if (!consultantId) {
        res.status(400).json({ success: false, message: 'Consultant ID is required.' });
        return;
      }

      const { rows } = await db.query(
        `SELECT id, consultant_id AS "consultantId", title, description, project_url AS "projectUrl", image_url AS "imageUrl", created_at AS "createdAt"
         FROM public.portfolio_items
         WHERE consultant_id = $1
         ORDER BY created_at DESC`,
        [consultantId]
      );

      res.status(200).json({ success: true, data: rows });
    } catch (error) {
      const err = error as any;
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch portfolio items' });
    }
  }

  /**
   * GET /api/portfolio/my
   * Fetch portfolio items belonging to the currently logged in consultant
   */
  async getMyPortfolio(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUserId = req.user!.userId;

      // 1. Get consultant profile
      const profileRes = await db.query(
        `SELECT id FROM public.consultant_profiles WHERE user_id = $1 LIMIT 1`,
        [currentUserId]
      );

      if (profileRes.rows.length === 0) {
        res.status(200).json({ success: true, data: [] });
        return;
      }

      const consultantId = profileRes.rows[0].id;

      // 2. Fetch items
      const { rows } = await db.query(
        `SELECT id, consultant_id AS "consultantId", title, description, project_url AS "projectUrl", image_url AS "imageUrl", created_at AS "createdAt"
         FROM public.portfolio_items
         WHERE consultant_id = $1
         ORDER BY created_at DESC`,
        [consultantId]
      );

      res.status(200).json({ success: true, data: rows });
    } catch (error) {
      const err = error as any;
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch your portfolio items' });
    }
  }

  /**
   * POST /api/portfolio
   * Create a new portfolio item (must be logged in as consultant)
   */
  async createPortfolioItem(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUserId = req.user!.userId;
      const { title, description, projectUrl, imageUrl } = req.body;

      if (!title || title.trim() === '') {
        res.status(400).json({ success: false, message: 'Title is required.' });
        return;
      }

      // 1. Get consultant profile ID
      const profileRes = await db.query(
        `SELECT id FROM public.consultant_profiles WHERE user_id = $1 LIMIT 1`,
        [currentUserId]
      );

      if (profileRes.rows.length === 0) {
        res.status(403).json({ success: false, message: 'Only consultants can create portfolio items.' });
        return;
      }

      const consultantId = profileRes.rows[0].id;

      // 2. Insert portfolio item
      const { rows } = await db.query(
        `INSERT INTO public.portfolio_items (consultant_id, title, description, project_url, image_url)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, consultant_id AS "consultantId", title, description, project_url AS "projectUrl", image_url AS "imageUrl", created_at AS "createdAt"`,
        [consultantId, title.trim(), description || '', projectUrl || '', imageUrl || '']
      );

      res.status(201).json({ success: true, data: rows[0] });
    } catch (error) {
      const err = error as any;
      res.status(500).json({ success: false, message: err.message || 'Failed to create portfolio item' });
    }
  }

  /**
   * PUT /api/portfolio/:itemId
   * Update an existing portfolio item (must own it)
   */
  async updatePortfolioItem(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUserId = req.user!.userId;
      const { itemId } = req.params;
      const { title, description, projectUrl, imageUrl } = req.body;

      if (!title || title.trim() === '') {
        res.status(400).json({ success: false, message: 'Title is required.' });
        return;
      }

      // 1. Check ownership
      const checkRes = await db.query(
        `SELECT pi.id 
         FROM public.portfolio_items pi
         INNER JOIN public.consultant_profiles cp ON pi.consultant_id = cp.id
         WHERE pi.id = $1 AND cp.user_id = $2`,
        [itemId, currentUserId]
      );

      if (checkRes.rows.length === 0) {
        res.status(404).json({ success: false, message: 'Portfolio item not found or unauthorized.' });
        return;
      }

      // 2. Update item
      const { rows } = await db.query(
        `UPDATE public.portfolio_items
         SET title = $1,
             description = $2,
             project_url = $3,
             image_url = $4
         WHERE id = $5
         RETURNING id, consultant_id AS "consultantId", title, description, project_url AS "projectUrl", image_url AS "imageUrl", created_at AS "createdAt"`,
        [title.trim(), description || '', projectUrl || '', imageUrl || '', itemId]
      );

      res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
      const err = error as any;
      res.status(500).json({ success: false, message: err.message || 'Failed to update portfolio item' });
    }
  }

  /**
   * DELETE /api/portfolio/:itemId
   * Delete a portfolio item (must own it)
   */
  async deletePortfolioItem(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const currentUserId = req.user!.userId;
      const { itemId } = req.params;

      // 1. Check ownership
      const checkRes = await db.query(
        `SELECT pi.id 
         FROM public.portfolio_items pi
         INNER JOIN public.consultant_profiles cp ON pi.consultant_id = cp.id
         WHERE pi.id = $1 AND cp.user_id = $2`,
        [itemId, currentUserId]
      );

      if (checkRes.rows.length === 0) {
        res.status(404).json({ success: false, message: 'Portfolio item not found or unauthorized.' });
        return;
      }

      // 2. Delete item
      await db.query(`DELETE FROM public.portfolio_items WHERE id = $1`, [itemId]);

      res.status(200).json({ success: true, message: 'Portfolio item deleted successfully.' });
    } catch (error) {
      const err = error as any;
      res.status(500).json({ success: false, message: err.message || 'Failed to delete portfolio item' });
    }
  }
}

export default new PortfolioController();
