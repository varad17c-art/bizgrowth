import { Router } from 'express';
import marketplaceController from './marketplace.controller';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

// ============================================================
// Marketplace Routes — /api/marketplace
// ============================================================

/**
 * @route   GET /api/marketplace
 * @desc    List all active listings (paginated, filterable)
 * @access  Public
 * @query   page, limit, search, industry, type, status, sortBy, sortOrder
 */
router.get('/', marketplaceController.listListings);

/**
 * @route   GET /api/marketplace/my
 * @desc    Get current user's listings
 * @access  Private
 */
router.get('/my', authenticate, marketplaceController.getMyListings);

/**
 * @route   GET /api/marketplace/:id
 * @desc    Get a listing by ID
 * @access  Public
 */
router.get('/:id', marketplaceController.getListingById);

/**
 * @route   POST /api/marketplace
 * @desc    Create a new listing
 * @access  Private
 * @body    { title, description, type, industry, budget, currency, location, tags, orgId }
 */
router.post('/', authenticate, marketplaceController.createListing);

/**
 * @route   PATCH /api/marketplace/:id
 * @desc    Update a listing (owner or admin)
 * @access  Private
 */
router.patch('/:id', authenticate, marketplaceController.updateListing);

/**
 * @route   PUT /api/marketplace/:id
 * @desc    Full update a listing (alias)
 * @access  Private
 */
router.put('/:id', authenticate, marketplaceController.updateListing);

/**
 * @route   DELETE /api/marketplace/:id
 * @desc    Delete a listing (owner or admin)
 * @access  Private
 */
router.delete('/:id', authenticate, marketplaceController.deleteListing);

export default router;
