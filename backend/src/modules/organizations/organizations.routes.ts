import { Router } from 'express';
import orgsController from './organizations.controller';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

// ============================================================
// Organizations Routes — /api/organizations
// ============================================================

/**
 * @route   GET /api/organizations/my
 * @desc    Get all organizations owned by the current user
 * @access  Private
 */
router.get('/my', authenticate, orgsController.getMyOrganizations);

/**
 * @route   GET /api/organizations/:id
 * @desc    Get organization by ID
 * @access  Public
 */
router.get('/:id', orgsController.getOrganizationById);

/**
 * @route   POST /api/organizations
 * @desc    Create a new organization
 * @access  Private
 */
router.post('/', authenticate, orgsController.createOrganization);

/**
 * @route   PUT /api/organizations/:id
 * @desc    Update organization details
 * @access  Private
 */
router.put('/:id', authenticate, orgsController.updateOrganization);

/**
 * @route   PATCH /api/organizations/:id
 * @desc    Partially update organization details
 * @access  Private
 */
router.patch('/:id', authenticate, orgsController.updateOrganization);

/**
 * @route   DELETE /api/organizations/:id
 * @desc    Delete an organization
 * @access  Private
 */
router.delete('/:id', authenticate, orgsController.deleteOrganization);

/**
 * @route   GET /api/organizations
 * @desc    List all organizations (paginated, searchable)
 * @access  Public
 */
router.get('/', orgsController.listOrganizations);

export default router;
