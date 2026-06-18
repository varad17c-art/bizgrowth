import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import portfolioController from './portfolio.controller';

const router = Router();

// Public route to view portfolio of a consultant
router.get('/consultant/:consultantId', (req, res) => portfolioController.getConsultantPortfolio(req, res));

// Authenticated routes to manage own portfolio
router.get('/my', authenticate, (req, res) => portfolioController.getMyPortfolio(req, res));
router.post('/', authenticate, (req, res) => portfolioController.createPortfolioItem(req, res));
router.put('/:itemId', authenticate, (req, res) => portfolioController.updatePortfolioItem(req, res));
router.delete('/:itemId', authenticate, (req, res) => portfolioController.deletePortfolioItem(req, res));

export default router;
