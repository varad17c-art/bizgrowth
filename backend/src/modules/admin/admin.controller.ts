import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import Admin from './admin.model';

const qs = (val: any): string | undefined => Array.isArray(val) ? val[0] : val;

// ============================================================
// Admin Controller — Platform Management
// ============================================================

class AdminController {
  /** GET /api/admin/stats */
  async getStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const stats = await Admin.getPlatformStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      const err = error as any;
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  }

  /** GET /api/admin/users/recent */
  async getRecentUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const limitStr = qs(req.query.limit);
      const limit = limitStr ? parseInt(limitStr) : 10;
      const users = await Admin.getRecentUsers(limit);
      res.status(200).json({ success: true, data: users });
    } catch (error) {
      const err = error as any;
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  }

  /** PATCH /api/admin/users/:id/status */
  async updateUserStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { status } = req.body as { status: string };
      const validStatuses = ['active', 'suspended', 'pending', 'inactive'];
      if (!status || !validStatuses.includes(status)) {
        res.status(400).json({
          success: false,
          message: `Status must be one of: ${validStatuses.join(', ')}`,
        });
        return;
      }
      await Admin.updateUserStatus(req.params.id, status);
      res.status(200).json({ success: true, message: `User status updated to '${status}'` });
    } catch (error) {
      const err = error as any;
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  }

  /** PATCH /api/admin/users/:id/role */
  async updateUserRole(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { role } = req.body as { role: string };
      const validRoles = ['client', 'consultant', 'admin'];
      if (!role || !validRoles.includes(role)) {
        res.status(400).json({
          success: false,
          message: `Role must be one of: ${validRoles.join(', ')}`,
        });
        return;
      }
      await Admin.updateUserRole(req.params.id, role);
      res.status(200).json({ success: true, message: `User role updated to '${role}'` });
    } catch (error) {
      const err = error as any;
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  }

  /** PATCH /api/admin/consultants/:id/verify */
  async verifyConsultant(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      await Admin.verifyConsultant(req.params.id);
      res.status(200).json({ success: true, message: 'Consultant verified successfully' });
    } catch (error) {
      const err = error as any;
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  }

  /** GET /api/admin/activity */
  async getRecentActivity(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const activity = await Admin.getRecentActivity();
      res.status(200).json({ success: true, data: activity });
    } catch (error) {
      const err = error as any;
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  }
}

const adminController = new AdminController();
export default adminController;
