import db from '../../config/db';
import {
  IListing,
  ListingRow,
  CreateListingInput,
  UpdateListingInput,
  PaginationQuery,
} from '../../types';

// ============================================================
// Row ↔ Application Mapping
// ============================================================

export function mapRowToListing(row: ListingRow): IListing {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    type: row.type,
    industry: row.industry || '',
    budget: row.budget ? parseFloat(row.budget) : null,
    currency: row.currency || 'INR',
    location: row.location || '',
    tags: row.tags || [],
    status: row.status,
    userId: row.user_id,
    orgId: row.org_id || null,
    views: row.views || 0,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

// ============================================================
// Marketplace Model — Data Access Layer
// ============================================================

class MarketplaceModel {
  /**
   * Find a listing by ID.
   */
  async findById(id: string): Promise<IListing | null> {
    try {
      const { rows } = await db.query(
        `SELECT * FROM public.listings WHERE id = $1 LIMIT 1`,
        [id]
      );
      if (rows.length === 0) return null;
      return mapRowToListing(rows[0] as ListingRow);
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }

  /**
   * Find all listings by a specific user.
   */
  async findByUserId(userId: string): Promise<IListing[]> {
    try {
      const { rows } = await db.query(
        `SELECT * FROM public.listings WHERE user_id = $1 ORDER BY created_at DESC`,
        [userId]
      );
      return rows.map((row) => mapRowToListing(row as ListingRow));
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }

  /**
   * Create a new listing.
   */
  async create(userId: string, input: CreateListingInput): Promise<IListing> {
    try {
      const { rows } = await db.query(
        `INSERT INTO public.listings
          (title, description, type, industry, budget, currency, location, tags, user_id, org_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          input.title,
          input.description || '',
          input.type,
          input.industry || '',
          input.budget ?? null,
          input.currency || 'INR',
          input.location || '',
          input.tags || [],
          userId,
          input.orgId || null,
        ]
      );
      return mapRowToListing(rows[0] as ListingRow);
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }

  /**
   * Update a listing.
   */
  async update(id: string, input: UpdateListingInput): Promise<IListing> {
    const updates: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (input.title !== undefined) { updates.push(`title = $${idx++}`); params.push(input.title); }
    if (input.description !== undefined) { updates.push(`description = $${idx++}`); params.push(input.description); }
    if (input.type !== undefined) { updates.push(`type = $${idx++}`); params.push(input.type); }
    if (input.industry !== undefined) { updates.push(`industry = $${idx++}`); params.push(input.industry); }
    if (input.budget !== undefined) { updates.push(`budget = $${idx++}`); params.push(input.budget); }
    if (input.currency !== undefined) { updates.push(`currency = $${idx++}`); params.push(input.currency); }
    if (input.location !== undefined) { updates.push(`location = $${idx++}`); params.push(input.location); }
    if (input.tags !== undefined) { updates.push(`tags = $${idx++}`); params.push(input.tags); }
    if (input.status !== undefined) { updates.push(`status = $${idx++}`); params.push(input.status); }

    if (updates.length === 0) {
      throw Object.assign(new Error('No fields to update'), { statusCode: 400 });
    }

    params.push(id);
    try {
      const { rows } = await db.query(
        `UPDATE public.listings SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
        params
      );
      if (rows.length === 0) {
        throw Object.assign(new Error('Listing not found'), { statusCode: 404 });
      }
      return mapRowToListing(rows[0] as ListingRow);
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }

  /**
   * Delete a listing.
   */
  async delete(id: string): Promise<void> {
    try {
      await db.query(`DELETE FROM public.listings WHERE id = $1`, [id]);
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }

  /**
   * Increment view count.
   */
  async incrementViews(id: string): Promise<void> {
    try {
      await db.query(`UPDATE public.listings SET views = views + 1 WHERE id = $1`, [id]);
    } catch (error) {
      // non-critical
    }
  }

  /**
   * List listings with pagination, search, and filtering.
   */
  async list(query: PaginationQuery & { type?: string; status?: string }): Promise<{
    listings: IListing[];
    total: number;
  }> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const offset = (page - 1) * limit;

    const conditions: string[] = [`status != 'closed'`];
    const params: any[] = [];
    let idx = 1;

    if (query.industry) {
      conditions.push(`industry ILIKE $${idx++}`);
      params.push(`%${query.industry}%`);
    }
    if (query.search) {
      conditions.push(`(title ILIKE $${idx} OR description ILIKE $${idx})`);
      params.push(`%${query.search}%`);
      idx++;
    }
    if ((query as any).type) {
      conditions.push(`type = $${idx++}`);
      params.push((query as any).type);
    }
    if ((query as any).status) {
      conditions.push(`status = $${idx++}`);
      params.push((query as any).status);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    try {
      const countRes = await db.query(
        `SELECT COUNT(*) FROM public.listings ${whereClause}`,
        params
      );
      const total = parseInt(countRes.rows[0].count, 10);

      const dataParams = [...params, limit, offset];
      const { rows } = await db.query(
        `SELECT * FROM public.listings ${whereClause} ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`,
        dataParams
      );

      return {
        listings: rows.map((row) => mapRowToListing(row as ListingRow)),
        total,
      };
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }
}

const Marketplace = new MarketplaceModel();
export default Marketplace;
