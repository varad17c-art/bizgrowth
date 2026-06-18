import { Router } from 'express';
import consultantsController from './consultants.controller';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

// ============================================================
// Consultants Routes — /api/consultants
// ============================================================

/** GET /api/consultants — List all consultants (public) */
router.get('/', consultantsController.listConsultants);

/** GET /api/consultants/me — Get own consultant profile */
router.get('/me', authenticate, consultantsController.getMyProfile);

/** POST /api/consultants/profile — Create consultant profile */
router.post('/profile', authenticate, consultantsController.createProfile);

/** PATCH /api/consultants/profile — Update own consultant profile */
router.patch('/profile', authenticate, consultantsController.updateProfile);

/** GET /api/consultants/services/my — Get own services */
router.get('/services/my', authenticate, consultantsController.getMyServices);

/** POST /api/consultants/services — Create a new service */
router.post('/services', authenticate, consultantsController.createService);

/** PATCH /api/consultants/services/:serviceId — Update a service */
router.patch('/services/:serviceId', authenticate, consultantsController.updateService);

/** DELETE /api/consultants/services/:serviceId — Delete a service */
router.delete('/services/:serviceId', authenticate, consultantsController.deleteService);

/** GET /api/consultants/:id — Get consultant by ID */
router.get('/:id', consultantsController.getConsultantById);

/** GET /api/consultants/:id/services — Get consultant's services (public) */
router.get('/:id/services', consultantsController.getServices);

export default router;
