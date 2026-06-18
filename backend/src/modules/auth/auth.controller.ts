import { Request, Response, NextFunction } from 'express';
import authService from './auth.service';
import { AuthenticatedRequest } from '../../types';

// ============================================================
// Auth Controller — Thin layer delegating to AuthService
// ============================================================

class AuthController {
  /**
   * POST /api/auth/register
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/refresh
   * Exchange a valid refresh token for a new access + refresh token pair.
   */
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({ success: false, message: 'refreshToken is required in request body' });
        return;
      }
      const result = await authService.refreshAccessToken(refreshToken);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/me
   * Get the currently authenticated user.
   */
  async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }
      const user = await authService.getCurrentUser(req.user.userId);
      res.status(200).json({ success: true, user });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
