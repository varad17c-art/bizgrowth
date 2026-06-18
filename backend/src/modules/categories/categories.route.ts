import { Router } from 'express';
import { CategoriesController } from './categories.controller';

const router = Router();
const controller = new CategoriesController();

// Categories routes
router.post('/', (req, res) => controller.createCategory(req, res));
router.get('/trending', (req, res) => controller.getTrendingCategories(req, res));
router.get('/search', (req, res) => controller.searchCategories(req, res));
router.get('/', (req, res) => controller.getAllCategories(req, res));
router.get('/:categoryId', (req, res) => controller.getCategory(req, res));
router.patch('/:categoryId', (req, res) => controller.updateCategory(req, res));
router.delete('/:categoryId', (req, res) => controller.deleteCategory(req, res));

// Consultant-Category routes
router.post('/:categoryId/consultants/:consultantId', (req, res) =>
  controller.addConsultantToCategory(req, res)
);
router.delete('/:categoryId/consultants/:consultantId', (req, res) =>
  controller.removeConsultantFromCategory(req, res)
);
router.get('/consultants/:consultantId', (req, res) =>
  controller.getConsultantCategories(req, res)
);
router.get('/:categoryId/consultants', (req, res) =>
  controller.getConsultantsInCategory(req, res)
);
router.post('/consultants/:consultantId/bulk-assign', (req, res) =>
  controller.bulkAssignCategories(req, res)
);

export default router;