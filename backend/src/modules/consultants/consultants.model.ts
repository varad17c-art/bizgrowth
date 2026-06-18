import db from '../../config/db';
import {
  IConsultantProfile,
  IService,
  ConsultantProfileRow,
  ServiceRow,
  CreateConsultantProfileInput,
  UpdateConsultantProfileInput,
  CreateServiceInput,
  UpdateServiceInput,
  PaginationQuery,
} from '../../types';

// ============================================================
// Row ↔ Application Mapping
// ============================================================

export function mapRowToConsultant(row: ConsultantProfileRow): IConsultantProfile {
  return {
    id: row.id,
    userId: row.user_id,
    tagline: row.tagline || '',
    expertise: row.expertise || [],
    certifications: row.certifications || [],
    languages: row.languages || [],
    hourlyRate: row.hourly_rate ? parseFloat(row.hourly_rate) : null,
    currency: row.currency || 'INR',
    availability: row.availability,
    minEngagement: row.min_engagement || '',
    portfolioUrl: row.portfolio_url || '',
    isVerified: row.is_verified,
    totalReviews: row.total_reviews,
    avgRating: row.avg_rating ? parseFloat(row.avg_rating) : null,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export function mapRowToService(row: ServiceRow): IService {
  return {
    id: row.id,
    consultantId: row.consultant_id,
    title: row.title,
    description: row.description || '',
    price: row.price ? parseFloat(row.price) : null,
    currency: row.currency || 'INR',
    durationHours: row.duration_hours ?? null,
    isActive: row.is_active,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

// ============================================================
// Consultants Model — Data Access Layer
// ============================================================

class ConsultantsModel {
  // ---- Consultant Profiles ----

  async findProfileById(id: string): Promise<IConsultantProfile | null> {
    try {
      const { rows } = await db.query(
        `SELECT * FROM public.consultant_profiles WHERE id = $1 LIMIT 1`,
        [id]
      );
      if (rows.length === 0) return null;
      return mapRowToConsultant(rows[0] as ConsultantProfileRow);
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }

  async findProfileByUserId(userId: string): Promise<IConsultantProfile | null> {
    try {
      const { rows } = await db.query(
        `SELECT * FROM public.consultant_profiles WHERE user_id = $1 LIMIT 1`,
        [userId]
      );
      if (rows.length === 0) return null;
      return mapRowToConsultant(rows[0] as ConsultantProfileRow);
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }

  async createProfile(userId: string, input: CreateConsultantProfileInput): Promise<IConsultantProfile> {
    try {
      const { rows } = await db.query(
        `INSERT INTO public.consultant_profiles
          (user_id, tagline, expertise, certifications, languages, hourly_rate, currency, availability, min_engagement, portfolio_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          userId,
          input.tagline || '',
          input.expertise || [],
          input.certifications || [],
          input.languages || [],
          input.hourlyRate ?? null,
          input.currency || 'INR',
          input.availability || 'available',
          input.minEngagement || '',
          input.portfolioUrl || '',
        ]
      );
      return mapRowToConsultant(rows[0] as ConsultantProfileRow);
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }

  async updateProfile(userId: string, input: UpdateConsultantProfileInput): Promise<IConsultantProfile> {
    const updates: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (input.tagline !== undefined) { updates.push(`tagline = $${idx++}`); params.push(input.tagline); }
    if (input.expertise !== undefined) { updates.push(`expertise = $${idx++}`); params.push(input.expertise); }
    if (input.certifications !== undefined) { updates.push(`certifications = $${idx++}`); params.push(input.certifications); }
    if (input.languages !== undefined) { updates.push(`languages = $${idx++}`); params.push(input.languages); }
    if (input.hourlyRate !== undefined) { updates.push(`hourly_rate = $${idx++}`); params.push(input.hourlyRate); }
    if (input.currency !== undefined) { updates.push(`currency = $${idx++}`); params.push(input.currency); }
    if (input.availability !== undefined) { updates.push(`availability = $${idx++}`); params.push(input.availability); }
    if (input.minEngagement !== undefined) { updates.push(`min_engagement = $${idx++}`); params.push(input.minEngagement); }
    if (input.portfolioUrl !== undefined) { updates.push(`portfolio_url = $${idx++}`); params.push(input.portfolioUrl); }

    if (updates.length === 0) {
      throw Object.assign(new Error('No fields to update'), { statusCode: 400 });
    }

    params.push(userId);
    try {
      const { rows } = await db.query(
        `UPDATE public.consultant_profiles SET ${updates.join(', ')}, updated_at = NOW() WHERE user_id = $${idx} RETURNING *`,
        params
      );
      if (rows.length === 0) {
        throw Object.assign(new Error('Consultant profile not found'), { statusCode: 404 });
      }
      return mapRowToConsultant(rows[0] as ConsultantProfileRow);
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }

  async list(query: PaginationQuery & { availability?: string }): Promise<{
    consultants: IConsultantProfile[];
    total: number;
  }> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (query.search) {
      conditions.push(`(tagline ILIKE $${idx} OR array_to_string(expertise, ' ') ILIKE $${idx})`);
      params.push(`%${query.search}%`);
      idx++;
    }
    if ((query as any).availability) {
      conditions.push(`availability = $${idx++}`);
      params.push((query as any).availability);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    try {
      const countRes = await db.query(
        `SELECT COUNT(*) FROM public.consultant_profiles ${whereClause}`,
        params
      );
      const total = parseInt(countRes.rows[0].count, 10);

      const dataParams = [...params, limit, offset];
      const { rows } = await db.query(
        `SELECT * FROM public.consultant_profiles ${whereClause} ORDER BY avg_rating DESC NULLS LAST LIMIT $${idx++} OFFSET $${idx++}`,
        dataParams
      );

      return {
        consultants: rows.map((row) => mapRowToConsultant(row as ConsultantProfileRow)),
        total,
      };
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }

  // ---- Services ----

  async getServices(consultantId: string): Promise<IService[]> {
    try {
      const { rows } = await db.query(
        `SELECT * FROM public.services WHERE consultant_id = $1 AND is_active = true ORDER BY created_at DESC`,
        [consultantId]
      );
      return rows.map((row) => mapRowToService(row as ServiceRow));
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }

  async createService(consultantId: string, input: CreateServiceInput): Promise<IService> {
    try {
      const { rows } = await db.query(
        `INSERT INTO public.services (consultant_id, title, description, price, currency, duration_hours)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [
          consultantId,
          input.title,
          input.description || '',
          input.price ?? null,
          input.currency || 'INR',
          input.durationHours ?? null,
        ]
      );
      return mapRowToService(rows[0] as ServiceRow);
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }

  async updateService(serviceId: string, consultantId: string, input: UpdateServiceInput): Promise<IService> {
    const updates: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (input.title !== undefined) { updates.push(`title = $${idx++}`); params.push(input.title); }
    if (input.description !== undefined) { updates.push(`description = $${idx++}`); params.push(input.description); }
    if (input.price !== undefined) { updates.push(`price = $${idx++}`); params.push(input.price); }
    if (input.currency !== undefined) { updates.push(`currency = $${idx++}`); params.push(input.currency); }
    if (input.durationHours !== undefined) { updates.push(`duration_hours = $${idx++}`); params.push(input.durationHours); }
    if (input.isActive !== undefined) { updates.push(`is_active = $${idx++}`); params.push(input.isActive); }

    if (updates.length === 0) {
      throw Object.assign(new Error('No fields to update'), { statusCode: 400 });
    }

    params.push(serviceId, consultantId);
    try {
      const { rows } = await db.query(
        `UPDATE public.services SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${idx++} AND consultant_id = $${idx++} RETURNING *`,
        params
      );
      if (rows.length === 0) {
        throw Object.assign(new Error('Service not found or not yours'), { statusCode: 404 });
      }
      return mapRowToService(rows[0] as ServiceRow);
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }

  async deleteService(serviceId: string, consultantId: string): Promise<void> {
    try {
      await db.query(
        `DELETE FROM public.services WHERE id = $1 AND consultant_id = $2`,
        [serviceId, consultantId]
      );
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }
}

const Consultants = new ConsultantsModel();
export default Consultants;
