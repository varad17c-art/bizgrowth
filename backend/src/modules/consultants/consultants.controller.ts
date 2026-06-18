import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import consultantsService from './consultants.service';

const qs = (val: any): string | undefined => Array.isArray(val) ? val[0] : val;

class ConsultantsController {
  /** GET /api/consultants */
  async listConsultants(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = qs(req.query.page);
      const limit = qs(req.query.limit);
      const result = await consultantsService.listConsultants({
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 20,
        search: qs(req.query.search),
        availability: qs(req.query.availability),
      });
      res.status(200).json({
        success: true,
        data: result.consultants,
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

  /** GET /api/consultants/me */
  async getMyProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const profile = await consultantsService.getMyProfile(req.user!.userId);
      if (!profile) {
        res.status(404).json({ success: false, message: 'You do not have a consultant profile yet' });
        return;
      }
      res.status(200).json({ success: true, data: profile });
    } catch (error) {
      const err = error as any;
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  }

  /** GET /api/consultants/:id */
  async getConsultantById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const profile = await consultantsService.getConsultantById(req.params.id);
      res.status(200).json({ success: true, data: profile });
    } catch (error) {
      const err = error as any;
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  }

  /** POST /api/consultants/profile */
  async createProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const profile = await consultantsService.createProfile(req.user!.userId, req.body);
      res.status(201).json({ success: true, data: profile, message: 'Consultant profile created successfully' });
    } catch (error) {
      const err = error as any;
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  }

  /** PATCH /api/consultants/profile */
  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const profile = await consultantsService.updateProfile(req.user!.userId, req.body);
      res.status(200).json({ success: true, data: profile, message: 'Consultant profile updated successfully' });
    } catch (error) {
      const err = error as any;
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  }

  /** GET /api/consultants/:id/services */
  async getServices(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const services = await consultantsService.getServices(req.params.id);
      res.status(200).json({ success: true, data: services });
    } catch (error) {
      const err = error as any;
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  }

  /** GET /api/consultants/services/my */
  async getMyServices(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const services = await consultantsService.getMyServices(req.user!.userId);
      res.status(200).json({ success: true, data: services });
    } catch (error) {
      const err = error as any;
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  }

  /** POST /api/consultants/services */
  async createService(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const service = await consultantsService.createService(req.user!.userId, req.body);
      res.status(201).json({ success: true, data: service, message: 'Service created successfully' });
    } catch (error) {
      const err = error as any;
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  }

  /** PATCH /api/consultants/services/:serviceId */
  async updateService(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const service = await consultantsService.updateService(
        req.user!.userId, req.params.serviceId, req.body
      );
      res.status(200).json({ success: true, data: service, message: 'Service updated successfully' });
    } catch (error) {
      const err = error as any;
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  }

  /** DELETE /api/consultants/services/:serviceId */
  async deleteService(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      await consultantsService.deleteService(req.user!.userId, req.params.serviceId);
      res.status(200).json({ success: true, message: 'Service deleted successfully' });
    } catch (error) {
      const err = error as any;
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  }
}

const consultantsController = new ConsultantsController();
export default consultantsController;
