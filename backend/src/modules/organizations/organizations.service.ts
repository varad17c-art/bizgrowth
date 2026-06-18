import Organizations from './organizations.model';
import { AppError } from '../auth/auth.service';
import {
  IOrganization,
  CreateOrganizationInput,
  UpdateOrganizationInput,
  PaginationQuery,
  PaginatedResponse
} from '../../types';

// ============================================================
// Organizations Service — Business Logic & Access Control
// ============================================================

class OrganizationsService {
  /**
   * Get an organization by ID.
   */
  async getOrganizationById(id: string): Promise<IOrganization> {
    const org = await Organizations.findById(id);
    if (!org) {
      throw new AppError('Organization not found', 404);
    }
    return org;
  }

  /**
   * Get all organizations belonging to the authenticated user.
   */
  async getMyOrganizations(userId: string): Promise<IOrganization[]> {
    return Organizations.findByUserId(userId);
  }

  /**
   * Create a new organization.
   */
  async createOrganization(
    userId: string,
    input: CreateOrganizationInput
  ): Promise<IOrganization> {
    if (!input.name || input.name.trim().length < 2) {
      throw new AppError('Organization name must be at least 2 characters', 400);
    }
    return Organizations.create(userId, input);
  }

  /**
   * Update an organization (owner or admin only).
   */
  async updateOrganization(
    id: string,
    userId: string,
    userRole: string,
    input: UpdateOrganizationInput
  ): Promise<IOrganization> {
    const existingOrg = await Organizations.findById(id);
    if (!existingOrg) {
      throw new AppError('Organization not found', 404);
    }

    // Access control: must be owner or admin
    if (existingOrg.userId !== userId && userRole !== 'admin') {
      throw new AppError('You do not have permission to edit this organization', 403);
    }

    // Validate name if provided
    if (input.name !== undefined && input.name.trim().length < 2) {
      throw new AppError('Organization name must be at least 2 characters', 400);
    }

    return Organizations.update(id, input);
  }

  /**
   * Delete an organization (owner or admin only).
   */
  async deleteOrganization(
    id: string,
    userId: string,
    userRole: string
  ): Promise<void> {
    const existingOrg = await Organizations.findById(id);
    if (!existingOrg) {
      throw new AppError('Organization not found', 404);
    }

    // Access control: must be owner or admin
    if (existingOrg.userId !== userId && userRole !== 'admin') {
      throw new AppError('You do not have permission to delete this organization', 403);
    }

    await Organizations.delete(id);
  }

  /**
   * List organizations with pagination.
   */
  async listOrganizations(
    query: PaginationQuery
  ): Promise<PaginatedResponse<IOrganization>> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));

    const { organizations, total } = await Organizations.list(query);

    return {
      success: true,
      data: organizations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

// ============================================================
// Singleton Export
// ============================================================

const orgsService = new OrganizationsService();
export default orgsService;
