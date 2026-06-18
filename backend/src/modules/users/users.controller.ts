import { Request, Response, NextFunction } from 'express';
import usersService from './users.service';
import { AuthenticatedRequest, PaginationQuery } from '../../types';

// ============================================================
// Users Controller — Thin layer delegating to UsersService
// ============================================================

class UsersController {
  /**
   * GET /api/users/profile
   * Get own profile (authenticated user)
   */
  async getOwnProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const user = await usersService.getUserProfile(req.user.userId);

      res.status(200).json({ success: true, user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users/:id
   * Get a user's public profile
   */
  async getUserById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id as string;
      const user = await usersService.getUserProfile(id);

      res.status(200).json({ success: true, user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/users/profile
   * Update own profile
   */
  async updateOwnProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const user = await usersService.updateOwnProfile(
        req.user.userId,
        req.body
      );

      res.status(200).json({ success: true, user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users
   * List all users (admin only, paginated)
   */
  async listUsers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query: PaginationQuery = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
        search: req.query.search as string | undefined,
        role: req.query.role as PaginationQuery['role'],
        status: req.query.status as PaginationQuery['status'],
        industry: req.query.industry as string | undefined,
        sortBy: (req.query.sortBy as PaginationQuery['sortBy']) || 'created_at',
        sortOrder: (req.query.sortOrder as PaginationQuery['sortOrder']) || 'desc',
      };

      const result = await usersService.listUsers(query);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/users/:id
   * Admin update any user (role, status, email, profile fields)
   */
  async adminUpdateUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id as string;
      const user = await usersService.adminUpdateUser(id, req.body);

      res.status(200).json({ success: true, user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/users/:id
   * Admin delete a user
   */
  async deleteUser(
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
      await usersService.deleteUser(id, req.user.userId);

      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new UsersController();
