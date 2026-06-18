import bcrypt from 'bcrypt';
import db from '../../config/db';
import { IUser, SafeUser, UserRow, UserRole } from '../../types';

// ============================================================
// Row ↔ Application Mapping
// ============================================================

/**
 * Maps a PostgreSQL snake_case row/join to a camelCase application object.
 */
export function mapRowToUser(row: UserRow): IUser {
  const firstName = row.first_name || '';
  const lastName = row.last_name || '';
  return {
    id: row.id,
    profileId: row.profile_id,
    email: row.email,
    password: row.password || '',
    firstName,
    lastName,
    name: `${firstName} ${lastName}`.trim(),
    role: row.role,
    status: row.status,
    bio: row.bio || '',
    phone: row.phone || '',
    avatarUrl: row.avatar_url || '',
    companyName: row.company_name || '',
    company: row.company_name || '',
    industry: row.industry || '',
    city: row.city || '',
    state: row.state || '',
    country: row.country || '',
    website: row.website || '',
    linkedinUrl: row.linkedin_url || '',
    experienceYears: row.experience_years || 0,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

/**
 * Strips the password from a user object for API responses.
 */
export function sanitize(user: IUser): SafeUser {
  const { password, ...safe } = user;
  return safe;
}

// ============================================================
// User Model — Data Access Layer for PostgreSQL
// ============================================================

class UserModel {
  /**
   * Find a user by email. Returns null if not found.
   * Includes the password field for authentication checks.
   */
  async findByEmail(email: string): Promise<IUser | null> {
    const queryText = `
      SELECT 
        u.id,
        u.email,
        u.password_hash AS password,
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
      WHERE LOWER(u.email) = $1
      LIMIT 1
    `;
    
    try {
      const { rows } = await db.query(queryText, [email.toLowerCase()]);
      if (rows.length === 0) return null;
      return mapRowToUser(rows[0] as UserRow);
    } catch (error) {
      const err = error as Error;
      throw new Error(`Database error: ${err.message}`);
    }
  }

  /**
   * Find a user by ID. Returns null if not found.
   * Does NOT include the password field.
   */
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

  /**
   * Create a new user. Password is hashed before insertion.
   * Inserts into public.users and public.profiles using a transaction.
   * Returns the created user without the password.
   */
  async create(input: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
  }): Promise<IUser> {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Hash password with bcrypt (salt rounds = 10)
      const hashedPassword = await bcrypt.hash(input.password, 10);
      
      // Split name into first and last names
      const nameParts = input.name.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      const role = input.role || 'client';

      // 2. Insert credentials into public.users
      const insertUserQuery = `
        INSERT INTO public.users (email, password_hash, first_name, last_name, role)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, email, created_at, updated_at
      `;
      
      const userRes = await client.query(insertUserQuery, [
        input.email.toLowerCase(),
        hashedPassword,
        firstName,
        lastName,
        role
      ]);
      const createdUser = userRes.rows[0];

      // 3. Insert profile details into public.profiles
      const insertProfileQuery = `
        INSERT INTO public.profiles (auth_user_id, email, first_name, last_name, role, status)
        VALUES ($1, $2, $3, $4, $5::user_role, 'active'::user_status)
        RETURNING id, created_at, updated_at
      `;
      
      const profileRes = await client.query(insertProfileQuery, [
        createdUser.id,
        createdUser.email,
        firstName,
        lastName,
        role
      ]);
      const createdProfile = profileRes.rows[0];

      await client.query('COMMIT');

      return mapRowToUser({
        id: createdUser.id,
        profile_id: createdProfile.id,
        email: createdUser.email,
        password: hashedPassword,
        first_name: firstName,
        last_name: lastName,
        role: role,
        status: 'active',
        bio: '',
        phone: '',
        avatar_url: '',
        company_name: '',
        industry: '',
        city: '',
        state: '',
        country: '',
        website: '',
        linkedin_url: '',
        experience_years: 0,
        created_at: createdProfile.created_at,
        updated_at: createdProfile.updated_at,
      } as UserRow);

    } catch (err) {
      await client.query('ROLLBACK');
      
      const error = err as any;
      if (error.code === '23505') {
        throw Object.assign(new Error('An account with this email already exists'), {
          statusCode: 409,
        });
      }
      throw new Error(`Database error: ${error.message}`);
    } finally {
      client.release();
    }
  }

  /**
   * Compare a candidate password against a bcrypt hash.
   */
  async comparePassword(
    candidatePassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(candidatePassword, hashedPassword);
  }

  /**
   * Return a user object without the password.
   */
  sanitize(user: IUser): SafeUser {
    return sanitize(user);
  }
}

// ============================================================
// Singleton Export
// ============================================================

const User = new UserModel();
export default User;
