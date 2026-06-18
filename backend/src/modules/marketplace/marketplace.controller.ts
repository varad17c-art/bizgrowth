import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import marketplaceService from './marketplace.service';

// Helper to safely extract string from req.query
const qs = (val: string | string[] | undefined): string | undefined =>
  Array.isArray(val) ? val[0] : val;

// ============================================================
// Marketplace Controller — Request / Response Handlers
// ============================================================

class MarketplaceController {
  /** GET /api/marketplace */
  async listListings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = qs(req.query.page as any);
      const limit = qs(req.query.limit as any);
      const result = await marketplaceService.listListings({
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 20,
        search: qs(req.query.search as any),
        industry: qs(req.query.industry as any),
        type: qs(req.query.type as any),
        status: qs(req.query.status as any),
        sortBy: qs(req.query.sortBy as any) as any,
        sortOrder: qs(req.query.sortOrder as any) as any,
      });
      res.status(200).json({
        success: true,
        data: result.listings,
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

  /** GET /api/marketplace/my */
  async getMyListings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const listings = await marketplaceService.getMyListings(req.user!.userId);
      res.status(200).json({ success: true, data: listings });
    } catch (error) {
      const err = error as any;
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  }

  /** GET /api/marketplace/:id */
  async getListingById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const listing = await marketplaceService.getListingById(req.params.id);
      res.status(200).json({ success: true, data: listing });
    } catch (error) {
      const err = error as any;
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  }

  /** POST /api/marketplace */
  async createListing(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const listing = await marketplaceService.createListing(req.user!.userId, req.body);
      res.status(201).json({ success: true, data: listing, message: 'Listing created successfully' });
    } catch (error) {
      const err = error as any;
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  }

  /** PATCH /api/marketplace/:id */
  async updateListing(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const isAdmin = req.user!.role === 'admin';
      const listing = await marketplaceService.updateListing(
        req.params.id,
        req.user!.userId,
        req.body,
        isAdmin
      );
      res.status(200).json({ success: true, data: listing, message: 'Listing updated successfully' });
    } catch (error) {
      const err = error as any;
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  }

  /** DELETE /api/marketplace/:id */
  async deleteListing(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const isAdmin = req.user!.role === 'admin';
      await marketplaceService.deleteListing(req.params.id, req.user!.userId, isAdmin);
      res.status(200).json({ success: true, message: 'Listing deleted successfully' });
    } catch (error) {
      const err = error as any;
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  }
}

const marketplaceController = new MarketplaceController();
export default marketplaceController;
