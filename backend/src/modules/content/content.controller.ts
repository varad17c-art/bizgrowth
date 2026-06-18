import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import contentService from './content.service';

const qs = (val: any): string | undefined => Array.isArray(val) ? val[0] : val;

class ContentController {
  /** GET /api/content */
  async listContent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = qs(req.query.page);
      const limit = qs(req.query.limit);
      const result = await contentService.listContent({
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 20,
        search: qs(req.query.search),
        industry: qs(req.query.industry),
        type: qs(req.query.type),
        status: qs(req.query.status),
      });
      res.status(200).json({
        success: true,
        data: result.content,
        pagination: {
          page: parseInt(page || '1'),
          limit: parseInt(limit || '20'),
          total: result.total,
          totalPages: Math.ceil(result.total / parseInt(limit || '20')),
        },
      });
    } catch (error) {
      const err = error as any;
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  }

  /** GET /api/content/my */
  async getMyContent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const items = await contentService.getMyContent(req.user!.userId);
      res.status(200).json({ success: true, data: items });
    } catch (error) {
      const err = error as any;
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  }

  /** GET /api/content/:id */
  async getContentById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const item = await contentService.getContentById(req.params.id);
      res.status(200).json({ success: true, data: item });
    } catch (error) {
      const err = error as any;
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  }

  /** POST /api/content */
  async createContent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const item = await contentService.createContent(req.user!.userId, req.body);
      res.status(201).json({ success: true, data: item, message: 'Content created successfully' });
    } catch (error) {
      const err = error as any;
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  }

  /** PATCH /api/content/:id */
  async updateContent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const item = await contentService.updateContent(
        req.params.id, req.user!.userId, req.body, req.user!.role === 'admin'
      );
      res.status(200).json({ success: true, data: item, message: 'Content updated successfully' });
    } catch (error) {
      const err = error as any;
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  }

  /** POST /api/content/:id/publish */
  async publishContent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const item = await contentService.publishContent(
        req.params.id, req.user!.userId, req.user!.role === 'admin'
      );
      res.status(200).json({ success: true, data: item, message: 'Content published successfully' });
    } catch (error) {
      const err = error as any;
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  }

  /** DELETE /api/content/:id */
  async deleteContent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      await contentService.deleteContent(req.params.id, req.user!.userId, req.user!.role === 'admin');
      res.status(200).json({ success: true, message: 'Content deleted successfully' });
    } catch (error) {
      const err = error as any;
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  }
}

const contentController = new ContentController();
export default contentController;
