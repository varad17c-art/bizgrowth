import Users from './users.model';
import { AppError } from '../auth/auth.service';
import {
  SafeUser,
  UpdateProfileInput,
  AdminUpdateUserInput,
  PaginationQuery,
  PaginatedResponse,
} from '../../types';

// ============================================================
// Users Service — Business Logic
// ============================================================

class UsersService {
  // ----------------------------------------------------------
  // Get User Profile (public)
  // ----------------------------------------------------------

  async getUserProfile(userId: string): Promise<SafeUser> {
    const user = await Users.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return Users.sanitize(user);
  }

  // ----------------------------------------------------------
  // Update Own Profile
  // ----------------------------------------------------------

  async updateOwnProfile(
    userId: string,
    input: UpdateProfileInput
  ): Promise<SafeUser> {
    // Validate name if provided
    if (input.name !== undefined && input.name.trim().length < 2) {
      throw new AppError('Name must be at least 2 characters', 400);
    }

    // Validate phone if provided
    if (input.phone !== undefined && input.phone.length > 0) {
      const phoneRegex = /^[+]?[\d\s()-]{7,20}$/;
      if (!phoneRegex.test(input.phone)) {
        throw new AppError('Invalid phone number format', 400);
      }
    }

    // Validate website URL if provided
    if (input.website !== undefined && input.website.length > 0) {
      try {
        new URL(input.website);
      } catch {
        throw new AppError('Invalid website URL', 400);
      }
    }

    // Validate LinkedIn URL if provided
    if (input.linkedinUrl !== undefined && input.linkedinUrl.length > 0) {
      try {
        const url = new URL(input.linkedinUrl);
        if (!url.hostname.includes('linkedin.com')) {
          throw new AppError('LinkedIn URL must be from linkedin.com', 400);
        }
      } catch (e) {
        if (e instanceof AppError) throw e;
        throw new AppError('Invalid LinkedIn URL', 400);
      }
    }

    // Validate experience years if provided
    if (input.experienceYears !== undefined) {
      if (input.experienceYears < 0 || input.experienceYears > 80) {
        throw new AppError('Experience years must be between 0 and 80', 400);
      }
    }

    const user = await Users.updateProfile(userId, input);
    return Users.sanitize(user);
  }

  // ----------------------------------------------------------
  // Admin: List All Users (paginated)
  // ----------------------------------------------------------

  async listUsers(
    query: PaginationQuery
  ): Promise<PaginatedResponse<SafeUser>> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));

    const { users, total } = await Users.listUsers(query);

    return {
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ----------------------------------------------------------
  // Admin: Update Any User
  // ----------------------------------------------------------

  async adminUpdateUser(
    targetUserId: string,
    input: AdminUpdateUserInput
  ): Promise<SafeUser> {
    // Verify target user exists
    const existingUser = await Users.findById(targetUserId);
    if (!existingUser) {
      throw new AppError('User not found', 404);
    }

    // Validate role if provided
    if (input.role !== undefined) {
      const validRoles = ['client', 'consultant', 'admin'];
      if (!validRoles.includes(input.role)) {
        throw new AppError('Invalid role. Must be: client, consultant, or admin', 400);
      }
    }

    // Validate status if provided
    if (input.status !== undefined) {
      const validStatuses = ['active', 'suspended', 'pending'];
      if (!validStatuses.includes(input.status)) {
        throw new AppError('Invalid status. Must be: active, suspended, or pending', 400);
      }
    }

    // Validate email if provided
    if (input.email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input.email)) {
        throw new AppError('Invalid email format', 400);
      }
    }

    const user = await Users.adminUpdateUser(targetUserId, input);
    return Users.sanitize(user);
  }

  // ----------------------------------------------------------
  // Admin: Delete User
  // ----------------------------------------------------------

  async deleteUser(
    targetUserId: string,
    requestingUserId: string
  ): Promise<void> {
    // Prevent self-deletion
    if (targetUserId === requestingUserId) {
      throw new AppError('You cannot delete your own account', 400);
    }

    // Verify target user exists
    const user = await Users.findById(targetUserId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    await Users.deleteUser(targetUserId);
  }
}

export default new UsersService();
