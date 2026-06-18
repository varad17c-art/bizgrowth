import db from '../../config/db';
import {
  IContent,
  ContentRow,
  CreateContentInput,
  UpdateContentInput,
  PaginationQuery,
} from '../../types';

// ============================================================
// Row ↔ Application Mapping
// ============================================================

export function mapRowToContent(row: ContentRow): IContent {
  return {
    id: row.id,
    title: row.title,
    body: row.body || '',
    summary: row.summary || '',
    type: row.type,
    status: row.status,
    authorId: row.author_id,
    tags: row.tags || [],
    industry: row.industry || '',
    thumbnailUrl: row.thumbnail_url || '',
    mediaUrl: row.media_url || '',
    views: row.views || 0,
    readTimeMins: row.read_time_mins ?? null,
    publishedAt: row.published_at ? new Date(row.published_at) : null,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

// ============================================================
// Content Model — Data Access Layer
// ============================================================

class ContentModel {
  async findById(id: string): Promise<IContent | null> {
    try {
      const { rows } = await db.query(
        `SELECT * FROM public.content WHERE id = $1 LIMIT 1`,
        [id]
      );
      if (rows.length === 0) return null;
      return mapRowToContent(rows[0] as ContentRow);
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }

  async findByAuthorId(authorId: string): Promise<IContent[]> {
    try {
      const { rows } = await db.query(
        `SELECT * FROM public.content WHERE author_id = $1 ORDER BY created_at DESC`,
        [authorId]
      );
      return rows.map((row) => mapRowToContent(row as ContentRow));
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }

  async create(authorId: string, input: CreateContentInput): Promise<IContent> {
    const isPublished = input.status === 'published';
    try {
      const { rows } = await db.query(
        `INSERT INTO public.content
          (title, body, summary, type, status, author_id, tags, industry, thumbnail_url, media_url, read_time_mins, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [
          input.title,
          input.body || '',
          input.summary || '',
          input.type,
          input.status || 'draft',
          authorId,
          input.tags || [],
          input.industry || '',
          input.thumbnailUrl || '',
          input.mediaUrl || '',
          input.readTimeMins ?? null,
          isPublished ? new Date().toISOString() : null,
        ]
      );
      return mapRowToContent(rows[0] as ContentRow);
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }

  async update(id: string, input: UpdateContentInput): Promise<IContent> {
    const updates: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (input.title !== undefined) { updates.push(`title = $${idx++}`); params.push(input.title); }
    if (input.body !== undefined) { updates.push(`body = $${idx++}`); params.push(input.body); }
    if (input.summary !== undefined) { updates.push(`summary = $${idx++}`); params.push(input.summary); }
    if (input.type !== undefined) { updates.push(`type = $${idx++}`); params.push(input.type); }
    if (input.tags !== undefined) { updates.push(`tags = $${idx++}`); params.push(input.tags); }
    if (input.industry !== undefined) { updates.push(`industry = $${idx++}`); params.push(input.industry); }
    if (input.thumbnailUrl !== undefined) { updates.push(`thumbnail_url = $${idx++}`); params.push(input.thumbnailUrl); }
    if (input.mediaUrl !== undefined) { updates.push(`media_url = $${idx++}`); params.push(input.mediaUrl); }
    if (input.readTimeMins !== undefined) { updates.push(`read_time_mins = $${idx++}`); params.push(input.readTimeMins); }
    if (input.status !== undefined) {
      updates.push(`status = $${idx++}`);
      params.push(input.status);
      // Set published_at when first published
      if (input.status === 'published') {
        updates.push(`published_at = COALESCE(published_at, NOW())`);
      }
    }

    if (updates.length === 0) {
      throw Object.assign(new Error('No fields to update'), { statusCode: 400 });
    }

    params.push(id);
    try {
      const { rows } = await db.query(
        `UPDATE public.content SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
        params
      );
      if (rows.length === 0) {
        throw Object.assign(new Error('Content not found'), { statusCode: 404 });
      }
      return mapRowToContent(rows[0] as ContentRow);
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await db.query(`DELETE FROM public.content WHERE id = $1`, [id]);
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }

  async incrementViews(id: string): Promise<void> {
    try {
      await db.query(`UPDATE public.content SET views = views + 1 WHERE id = $1`, [id]);
    } catch (_) {}
  }

  async list(query: PaginationQuery & { type?: string; status?: string }): Promise<{
    content: IContent[];
    total: number;
  }> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const offset = (page - 1) * limit;

    const conditions: string[] = [`status = 'published'`];
    const params: any[] = [];
    let idx = 1;

    if (query.search) {
      conditions.push(`(title ILIKE $${idx} OR summary ILIKE $${idx})`);
      params.push(`%${query.search}%`);
      idx++;
    }
    if (query.industry) {
      conditions.push(`industry ILIKE $${idx++}`);
      params.push(`%${query.industry}%`);
    }
    if ((query as any).type) {
      conditions.push(`type = $${idx++}`);
      params.push((query as any).type);
    }
    if ((query as any).status) {
      // Admin can override to see drafts
      conditions[0] = `status = $${idx++}`;
      params.unshift((query as any).status);
      idx++;
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    try {
      const countRes = await db.query(
        `SELECT COUNT(*) FROM public.content ${whereClause}`,
        params
      );
      const total = parseInt(countRes.rows[0].count, 10);

      const dataParams = [...params, limit, offset];
      const { rows } = await db.query(
        `SELECT * FROM public.content ${whereClause} ORDER BY published_at DESC NULLS LAST LIMIT $${idx++} OFFSET $${idx++}`,
        dataParams
      );

      return {
        content: rows.map((row) => mapRowToContent(row as ContentRow)),
        total,
      };
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }
}

const Content = new ContentModel();
export default Content;
