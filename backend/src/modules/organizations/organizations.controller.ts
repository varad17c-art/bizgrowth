import { Request, Response, NextFunction } from 'express';
import orgsService from './organizations.service';
import { AuthenticatedRequest, PaginationQuery } from '../../types';

// ============================================================
// Organizations Controller
// ============================================================

class OrganizationsController {
  /**
   * GET /api/organizations/my
   * Get all organizations belonging to the authenticated user.
   */
  async getMyOrganizations(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const organizations = await orgsService.getMyOrganizations(req.user.userId);
      res.status(200).json({ success: true, data: organizations });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/organizations/:id
   * Get an organization by ID (public access).
   */
  async getOrganizationById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id as string;
      const organization = await orgsService.getOrganizationById(id);
      res.status(200).json({ success: true, data: organization });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/organizations
   * Create a new organization.
   */
  async createOrganization(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const organization = await orgsService.createOrganization(
        req.user.userId,
        req.body
      );
      res.status(201).json({ success: true, data: organization });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/organizations/:id
   * PATCH /api/organizations/:id
   * Update own organization details (owner or admin only).
   */
  async updateOrganization(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const id = req.params.id as string;
      const organization = await orgsService.updateOrganization(
        id,
        req.user.userId,
        req.user.role,
        req.body
      );

      res.status(200).json({ success: true, data: organization });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/organizations/:id
   * Delete own organization (owner or admin only).
   */
  async deleteOrganization(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const id = req.params.id as string;
      await orgsService.deleteOrganization(id, req.user.userId, req.user.role);

      res.status(200).json({
        success: true,
        message: 'Organization deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/organizations
   * List organizations with pagination and search.
   */
  async listOrganizations(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query: PaginationQuery = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
        search: req.query.search as string | undefined,
        industry: req.query.industry as string | undefined,
        sortBy: (req.query.sortBy as PaginationQuery['sortBy']) || 'created_at',
        sortOrder: (req.query.sortOrder as PaginationQuery['sortOrder']) || 'desc',
      };

      const result = await orgsService.listOrganizations(query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

// ============================================================
// Singleton Export
// ============================================================

const orgsController = new OrganizationsController();
export default orgsController;
