import db from '../../config/db';
import { mapRowToUser, sanitize } from '../auth/auth.model';
import {
  IUser,
  SafeUser,
  UserRow,
  UserRole,
  UserStatus,
  UpdateProfileInput,
  AdminUpdateUserInput,
  PaginationQuery,
} from '../../types';

// ============================================================
// Users Model — Data Access Layer
// ============================================================

class UsersModel {
  // ----------------------------------------------------------
  // Find by ID (no password)
  // ----------------------------------------------------------

  async findById(id: string): Promise<IUser | null> {
    const queryText = `
      SELECT 
        u.id,
        u.email,
        p.id AS profile_id,
        p.first_name,
        p.last_name,
        p.role::text AS role,
        p.status::text AS status,
        p.bio,
        p.phone,
        p.avatar_url,
        p.company_name,
        p.industry,
        p.city,
        p.state,
        p.country,
        p.website,
        p.linkedin_url,
        p.experience_years,
        p.created_at,
        p.updated_at
      FROM public.users u
      LEFT JOIN public.profiles p ON u.id = p.auth_user_id
      WHERE u.id = $1
      LIMIT 1
    `;
    
    try {
      const { rows } = await db.query(queryText, [id]);
      if (rows.length === 0) return null;
      return mapRowToUser(rows[0] as UserRow);
    } catch (error) {
      const err = error as Error;
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // ----------------------------------------------------------
  // Update Profile (own profile — limited fields)
  // ----------------------------------------------------------

  async updateProfile(
    userId: string,
    input: UpdateProfileInput
  ): Promise<IUser> {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      const profileUpdates: string[] = [];
      const profileParams: any[] = [];
      let paramIdx = 1;

      const userUpdates: string[] = [];
      const userParams: any[] = [];
      let userParamIdx = 1;

      // Handle split name if provided
      let firstName = input.firstName;
      let lastName = input.lastName;
      if (input.name !== undefined && firstName === undefined && lastName === undefined) {
        const nameParts = input.name.trim().split(/\s+/);
        firstName = nameParts[0] || '';
        lastName = nameParts.slice(1).join(' ') || '';
      }

      if (firstName !== undefined) {
        profileUpdates.push(`first_name = $${paramIdx++}`);
        profileParams.push(firstName);
        userUpdates.push(`first_name = $${userParamIdx++}`);
        userParams.push(firstName);
      }
      if (lastName !== undefined) {
        profileUpdates.push(`last_name = $${paramIdx++}`);
        profileParams.push(lastName);
        userUpdates.push(`last_name = $${userParamIdx++}`);
        userParams.push(lastName);
      }
      if (input.bio !== undefined) {
        profileUpdates.push(`bio = $${paramIdx++}`);
        profileParams.push(input.bio);
      }
      if (input.phone !== undefined) {
        profileUpdates.push(`phone = $${paramIdx++}`);
        profileParams.push(input.phone);
      }
      if (input.avatarUrl !== undefined) {
        profileUpdates.push(`avatar_url = $${paramIdx++}`);
        profileParams.push(input.avatarUrl);
      }

      const companyVal = input.companyName !== undefined ? input.companyName : input.company;
      if (companyVal !== undefined) {
        profileUpdates.push(`company_name = $${paramIdx++}`);
        profileParams.push(companyVal);
      }

      if (input.industry !== undefined) {
        profileUpdates.push(`industry = $${paramIdx++}`);
        profileParams.push(input.industry);
      }
      if (input.city !== undefined) {
        profileUpdates.push(`city = $${paramIdx++}`);
        profileParams.push(input.city);
      }
      if (input.state !== undefined) {
        profileUpdates.push(`state = $${paramIdx++}`);
        profileParams.push(input.state);
      }
      if (input.country !== undefined) {
        profileUpdates.push(`country = $${paramIdx++}`);
        profileParams.push(input.country);
      }
      if (input.website !== undefined) {
        profileUpdates.push(`website = $${paramIdx++}`);
        profileParams.push(input.website);
      }
      if (input.linkedinUrl !== undefined) {
        profileUpdates.push(`linkedin_url = $${paramIdx++}`);
        profileParams.push(input.linkedinUrl);
      }
      if (input.experienceYears !== undefined) {
        profileUpdates.push(`experience_years = $${paramIdx++}`);
        profileParams.push(input.experienceYears);
      }

      if (profileUpdates.length === 0 && userUpdates.length === 0) {
        throw Object.assign(new Error('No fields to update'), { statusCode: 400 });
      }

      // Update public.users credentials
      if (userUpdates.length > 0) {
        userParams.push(userId);
        const updateUserQuery = `
          UPDATE public.users 
          SET ${userUpdates.join(', ')}, updated_at = NOW() 
          WHERE id = $${userParamIdx}
        `;
        await client.query(updateUserQuery, userParams);
      }

      // Update public.profiles
      if (profileUpdates.length > 0) {
        profileParams.push(userId);
        const updateProfileQuery = `
          UPDATE public.profiles 
          SET ${profileUpdates.join(', ')}, updated_at = NOW() 
          WHERE auth_user_id = $${paramIdx}
        `;
        await client.query(updateProfileQuery, profileParams);
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    const updatedUser = await this.findById(userId);
    if (!updatedUser) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }
    return updatedUser;
  }

  // ----------------------------------------------------------
  // Admin: Update any user (includes role, status, email)
  // ----------------------------------------------------------

  async adminUpdateUser(
    userId: string,
    input: AdminUpdateUserInput
  ): Promise<IUser> {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      const profileUpdates: string[] = [];
      const profileParams: any[] = [];
      let paramIdx = 1;

      const userUpdates: string[] = [];
      const userParams: any[] = [];
      let userParamIdx = 1;

      // Handle split name if provided
      let firstName = input.firstName;
      let lastName = input.lastName;
      if (input.name !== undefined && firstName === undefined && lastName === undefined) {
        const nameParts = input.name.trim().split(/\s+/);
        firstName = nameParts[0] || '';
        lastName = nameParts.slice(1).join(' ') || '';
      }

      if (firstName !== undefined) {
        profileUpdates.push(`first_name = $${paramIdx++}`);
        profileParams.push(firstName);
        userUpdates.push(`first_name = $${userParamIdx++}`);
        userParams.push(firstName);
      }
      if (lastName !== undefined) {
        profileUpdates.push(`last_name = $${paramIdx++}`);
        profileParams.push(lastName);
        userUpdates.push(`last_name = $${userParamIdx++}`);
        userParams.push(lastName);
      }
      if (input.bio !== undefined) {
        profileUpdates.push(`bio = $${paramIdx++}`);
        profileParams.push(input.bio);
      }
      if (input.phone !== undefined) {
        profileUpdates.push(`phone = $${paramIdx++}`);
        profileParams.push(input.phone);
      }
      if (input.avatarUrl !== undefined) {
        profileUpdates.push(`avatar_url = $${paramIdx++}`);
        profileParams.push(input.avatarUrl);
      }

      const companyVal = input.companyName !== undefined ? input.companyName : input.company;
      if (companyVal !== undefined) {
        profileUpdates.push(`company_name = $${paramIdx++}`);
        profileParams.push(companyVal);
      }

      if (input.industry !== undefined) {
        profileUpdates.push(`industry = $${paramIdx++}`);
        profileParams.push(input.industry);
      }
      if (input.city !== undefined) {
        profileUpdates.push(`city = $${paramIdx++}`);
        profileParams.push(input.city);
      }
      if (input.state !== undefined) {
        profileUpdates.push(`state = $${paramIdx++}`);
        profileParams.push(input.state);
      }
      if (input.country !== undefined) {
        profileUpdates.push(`country = $${paramIdx++}`);
        profileParams.push(input.country);
      }
      if (input.website !== undefined) {
        profileUpdates.push(`website = $${paramIdx++}`);
        profileParams.push(input.website);
      }
      if (input.linkedinUrl !== undefined) {
        profileUpdates.push(`linkedin_url = $${paramIdx++}`);
        profileParams.push(input.linkedinUrl);
      }
      if (input.experienceYears !== undefined) {
        profileUpdates.push(`experience_years = $${paramIdx++}`);
        profileParams.push(input.experienceYears);
      }

      // Admin-only fields
      if (input.role !== undefined) {
        profileUpdates.push(`role = $${paramIdx++}::user_role`);
        profileParams.push(input.role);
        userUpdates.push(`role = $${userParamIdx++}`);
        userParams.push(input.role);
      }
      if (input.status !== undefined) {
        profileUpdates.push(`status = $${paramIdx++}::user_status`);
        profileParams.push(input.status);
      }
      if (input.email !== undefined) {
        const emailLower = input.email.toLowerCase();
        profileUpdates.push(`email = $${paramIdx++}`);
        profileParams.push(emailLower);
        userUpdates.push(`email = $${userParamIdx++}`);
        userParams.push(emailLower);
      }

      if (profileUpdates.length === 0 && userUpdates.length === 0) {
        throw Object.assign(new Error('No fields to update'), { statusCode: 400 });
      }

      // Update public.users credentials
      if (userUpdates.length > 0) {
        userParams.push(userId);
        const updateUserQuery = `
          UPDATE public.users 
          SET ${userUpdates.join(', ')}, updated_at = NOW() 
          WHERE id = $${userParamIdx}
        `;
        await client.query(updateUserQuery, userParams);
      }

      // Update public.profiles
      if (profileUpdates.length > 0) {
        profileParams.push(userId);
        const updateProfileQuery = `
          UPDATE public.profiles 
          SET ${profileUpdates.join(', ')}, updated_at = NOW() 
          WHERE auth_user_id = $${paramIdx}
        `;
        await client.query(updateProfileQuery, profileParams);
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      
      const error = err as any;
      if (error.code === '23505') {
        throw Object.assign(new Error('This email is already in use'), {
          statusCode: 409,
        });
      }
      throw err;
    } finally {
      client.release();
    }

    const updatedUser = await this.findById(userId);
    if (!updatedUser) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }
    return updatedUser;
  }

  // ----------------------------------------------------------
  // List Users (paginated, filterable, searchable)
  // ----------------------------------------------------------

  async listUsers(query: PaginationQuery): Promise<{
    users: SafeUser[];
    total: number;
  }> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const offset = (page - 1) * limit;
    
    // Sort mappings
    const sortByMap: Record<string, string> = {
      name: 'first_name',
      created_at: 'created_at',
      company: 'company_name',
    };
    const sortBy = sortByMap[query.sortBy || ''] || 'created_at';
    const sortOrder = query.sortOrder === 'asc' ? 'ASC' : 'DESC';

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIdx = 1;

    if (query.role) {
      conditions.push(`p.role::text = $${paramIdx++}`);
      params.push(query.role);
    }
    if (query.status) {
      conditions.push(`p.status::text = $${paramIdx++}`);
      params.push(query.status);
    }
    if (query.industry) {
      conditions.push(`p.industry ILIKE $${paramIdx++}`);
      params.push(`%${query.industry}%`);
    }

    if (query.search) {
      const searchPattern = `%${query.search}%`;
      conditions.push(
        `(p.first_name ILIKE $${paramIdx} OR p.last_name ILIKE $${paramIdx} OR p.email ILIKE $${paramIdx} OR p.company_name ILIKE $${paramIdx})`
      );
      params.push(searchPattern);
      paramIdx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 1. Get total count
    const countQuery = `
      SELECT COUNT(*) FROM public.profiles p
      ${whereClause}
    `;
    const countRes = await db.query(countQuery, params);
    const total = parseInt(countRes.rows[0].count, 10);

    // 2. Get data
    const dataParams = [...params];
    const dataQuery = `
      SELECT 
        u.id,
        u.email,
        p.id AS profile_id,
        p.first_name,
        p.last_name,
        p.role::text AS role,
        p.status::text AS status,
        p.bio,
        p.phone,
        p.avatar_url,
        p.company_name,
        p.industry,
        p.city,
        p.state,
        p.country,
        p.website,
        p.linkedin_url,
        p.experience_years,
        p.created_at,
        p.updated_at
      FROM public.profiles p
      JOIN public.users u ON p.auth_user_id = u.id
      ${whereClause}
      ORDER BY p.${sortBy} ${sortOrder}
      LIMIT $${paramIdx++} OFFSET $${paramIdx++}
    `;
    
    dataParams.push(limit, offset);
    const { rows } = await db.query(dataQuery, dataParams);
    
    const users = rows.map((row) =>
      this.sanitize(mapRowToUser(row as UserRow))
    );

    return {
      users,
      total,
    };
  }

  // ----------------------------------------------------------
  // Delete User
  // ----------------------------------------------------------

  async deleteUser(userId: string): Promise<void> {
    const deleteQuery = `DELETE FROM public.users WHERE id = $1`;
    try {
      await db.query(deleteQuery, [userId]);
    } catch (error) {
      const err = error as Error;
      throw new Error(`Database error: ${err.message}`);
    }
  }

  // ----------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------

  sanitize(user: IUser): SafeUser {
    return sanitize(user);
  }
}

// ============================================================
// Singleton Export
// ============================================================

const Users = new UsersModel();
export default Users;
