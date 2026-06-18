import db from '../../config/db';
import { PlatformStats } from '../../types';

// ============================================================
// Admin Model — Platform Statistics & Management
// ============================================================

class AdminModel {
  /**
   * Get aggregated platform statistics.
   */
  async getPlatformStats(): Promise<PlatformStats> {
    try {
      const [
        usersRes,
        orgsRes,
        listingsRes,
        eventsRes,
        contentRes,
        consultantsRes,
        activeListingsRes,
        upcomingEventsRes,
        publishedContentRes,
        newUsersRes,
      ] = await Promise.all([
        db.query(`SELECT COUNT(*) FROM public.users`),
        db.query(`SELECT COUNT(*) FROM public.organizations`),
        db.query(`SELECT COUNT(*) FROM public.listings`),
        db.query(`SELECT COUNT(*) FROM public.events`),
        db.query(`SELECT COUNT(*) FROM public.content`),
        db.query(`SELECT COUNT(*) FROM public.consultant_profiles`),
        db.query(`SELECT COUNT(*) FROM public.listings WHERE status = 'active'`),
        db.query(`SELECT COUNT(*) FROM public.events WHERE status = 'upcoming'`),
        db.query(`SELECT COUNT(*) FROM public.content WHERE status = 'published'`),
        db.query(`SELECT COUNT(*) FROM public.users WHERE created_at >= NOW() - INTERVAL '30 days'`),
      ]);

      return {
        totalUsers: parseInt(usersRes.rows[0].count, 10),
        totalOrganizations: parseInt(orgsRes.rows[0].count, 10),
        totalListings: parseInt(listingsRes.rows[0].count, 10),
        totalEvents: parseInt(eventsRes.rows[0].count, 10),
        totalContent: parseInt(contentRes.rows[0].count, 10),
        totalConsultants: parseInt(consultantsRes.rows[0].count, 10),
        activeListings: parseInt(activeListingsRes.rows[0].count, 10),
        upcomingEvents: parseInt(upcomingEventsRes.rows[0].count, 10),
        publishedContent: parseInt(publishedContentRes.rows[0].count, 10),
        newUsersThisMonth: parseInt(newUsersRes.rows[0].count, 10),
      };
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }

  /**
   * Get recent users for admin review.
   */
  async getRecentUsers(limit: number = 10): Promise<any[]> {
    try {
      const { rows } = await db.query(
        `SELECT id, name, email, role, status, created_at FROM public.users ORDER BY created_at DESC LIMIT $1`,
        [limit]
      );
      return rows;
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }

  /**
   * Update user status (suspend/activate).
   */
  async updateUserStatus(userId: string, status: string): Promise<void> {
    try {
      await db.query(
        `UPDATE public.users SET status = $1, updated_at = NOW() WHERE id = $2`,
        [status, userId]
      );
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }

  /**
   * Update user role.
   */
  async updateUserRole(userId: string, role: string): Promise<void> {
    try {
      await db.query(
        `UPDATE public.users SET role = $1, updated_at = NOW() WHERE id = $2`,
        [role, userId]
      );
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }

  /**
   * Verify a consultant profile.
   */
  async verifyConsultant(consultantId: string): Promise<void> {
    try {
      await db.query(
        `UPDATE public.consultant_profiles SET is_verified = true, updated_at = NOW() WHERE id = $1`,
        [consultantId]
      );
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }

  /**
   * Get recent activity summary.
   */
  async getRecentActivity(): Promise<any> {
    try {
      const [listings, events, content] = await Promise.all([
        db.query(
          `SELECT id, title, status, created_at FROM public.listings ORDER BY created_at DESC LIMIT 5`
        ),
        db.query(
          `SELECT id, title, status, event_date FROM public.events ORDER BY created_at DESC LIMIT 5`
        ),
        db.query(
          `SELECT id, title, type, status, created_at FROM public.content ORDER BY created_at DESC LIMIT 5`
        ),
      ]);

      return {
        recentListings: listings.rows,
        recentEvents: events.rows,
        recentContent: content.rows,
      };
    } catch (error) {
      throw new Error(`Database error: ${(error as Error).message}`);
    }
  }
}

const Admin = new AdminModel();
export default Admin;
