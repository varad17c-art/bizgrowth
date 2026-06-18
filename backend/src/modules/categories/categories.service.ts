import { supabase } from '../../config/supabase';
import { ICategory } from './categories.model';
import { IConsultantCategory } from './consultant-categories.model';

const CATEGORIES_TABLE = 'categories';
const CONSULTANT_CATEGORIES_TABLE = 'consultant_categories';

export class CategoriesService {
  /**
   * Create a new category
   */
  async createCategory(categoryData: Partial<ICategory>): Promise<ICategory> {
    try {
      const { data, error } = await supabase
        .from(CATEGORIES_TABLE)
        .insert([categoryData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to create category: ${error}`);
    }
  }

  /**
   * Get category by ID
   */
  async getCategoryById(categoryId: string): Promise<ICategory | null> {
    try {
      const { data, error } = await supabase
        .from(CATEGORIES_TABLE)
        .select('*')
        .eq('id', categoryId)
        .single();

      if (error) return null;
      return data;
    } catch (error) {
      console.error(`Failed to fetch category: ${error}`);
      return null;
    }
  }

  /**
   * Get category by name
   */
  async getCategoryByName(name: string): Promise<ICategory | null> {
    try {
      const { data, error } = await supabase
        .from(CATEGORIES_TABLE)
        .select('*')
        .eq('name', name)
        .single();

      if (error) return null;
      return data;
    } catch (error) {
      console.error(`Failed to fetch category: ${error}`);
      return null;
    }
  }

  /**
   * Get all categories
   */
  async getAllCategories(
    limit: number = 50,
    skip: number = 0
  ): Promise<{ categories: ICategory[]; total: number }> {
    try {
      // Get total count
      const { count: total } = await supabase
        .from(CATEGORIES_TABLE)
        .select('*', { count: 'exact', head: true });

      // Get paginated data
      const { data, error } = await supabase
        .from(CATEGORIES_TABLE)
        .select('*')
        .order('consultant_count', { ascending: false })
        .range(skip, skip + limit - 1);

      if (error) throw error;
      return { categories: data || [], total: total || 0 };
    } catch (error) {
      console.error(`Failed to fetch categories: ${error}`);
      return { categories: [], total: 0 };
    }
  }

  /**
   * Update category
   */
  async updateCategory(
    categoryId: string,
    updateData: Partial<ICategory>
  ): Promise<ICategory | null> {
    try {
      const { data, error } = await supabase
        .from(CATEGORIES_TABLE)
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', categoryId)
        .select()
        .single();

      if (error) return null;
      return data;
    } catch (error) {
      console.error(`Failed to update category: ${error}`);
      return null;
    }
  }

  /**
   * Delete category
   */
  async deleteCategory(categoryId: string): Promise<boolean> {
    try {
      // Remove all consultant-category mappings
      await supabase
        .from(CONSULTANT_CATEGORIES_TABLE)
        .delete()
        .eq('category_id', categoryId);

      // Delete the category
      const { error } = await supabase
        .from(CATEGORIES_TABLE)
        .delete()
        .eq('id', categoryId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Failed to delete category: ${error}`);
      return false;
    }
  }

  /**
   * Add consultant to category
   */
  async addConsultantToCategory(
    consultantId: string,
    categoryId: string
  ): Promise<IConsultantCategory> {
    try {
      // Check if consultant-category pair already exists
      const { data: existing } = await supabase
        .from(CONSULTANT_CATEGORIES_TABLE)
        .select('*')
        .eq('consultant_id', consultantId)
        .eq('category_id', categoryId)
        .single();

      if (existing) {
        return existing;
      }

      // Insert new mapping
      const { data, error } = await supabase
        .from(CONSULTANT_CATEGORIES_TABLE)
        .insert([{ consultant_id: consultantId, category_id: categoryId }])
        .select()
        .single();

      if (error) throw error;

      // Increment consultant count in category
      await supabase.rpc('increment_consultant_count', { category_id: categoryId });

      return data;
    } catch (error) {
      throw new Error(`Failed to add consultant to category: ${error}`);
    }
  }

  /**
   * Remove consultant from category
   */
  async removeConsultantFromCategory(
    consultantId: string,
    categoryId: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(CONSULTANT_CATEGORIES_TABLE)
        .delete()
        .eq('consultant_id', consultantId)
        .eq('category_id', categoryId);

      if (error) throw error;

      // Decrement consultant count in category
      await supabase.rpc('decrement_consultant_count', { category_id: categoryId });

      return true;
    } catch (error) {
      console.error(`Failed to remove consultant from category: ${error}`);
      return false;
    }
  }

  /**
   * Get all categories for a consultant
   */
  async getConsultantCategories(consultantId: string): Promise<ICategory[]> {
    try {
      const { data: mappings, error: mappingError } = await supabase
        .from(CONSULTANT_CATEGORIES_TABLE)
        .select('category_id')
        .eq('consultant_id', consultantId);

      if (mappingError) throw mappingError;

      const categoryIds = mappings?.map((m) => m.category_id) || [];

      if (categoryIds.length === 0) return [];

      const { data, error } = await supabase
        .from(CATEGORIES_TABLE)
        .select('*')
        .in('id', categoryIds);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Failed to fetch consultant categories: ${error}`);
      return [];
    }
  }

  /**
   * Get all consultants in a category
   */
  async getConsultantsInCategory(
    categoryId: string,
    limit: number = 50,
    skip: number = 0
  ): Promise<{ consultants: string[]; total: number }> {
    try {
      // Get total count
      const { count: total } = await supabase
        .from(CONSULTANT_CATEGORIES_TABLE)
        .select('*', { count: 'exact', head: true })
        .eq('category_id', categoryId);

      // Get paginated data
      const { data, error } = await supabase
        .from(CONSULTANT_CATEGORIES_TABLE)
        .select('consultant_id')
        .eq('category_id', categoryId)
        .range(skip, skip + limit - 1);

      if (error) throw error;

      const consultants = data?.map((m) => m.consultant_id) || [];
      return { consultants, total: total || 0 };
    } catch (error) {
      console.error(`Failed to fetch consultants in category: ${error}`);
      return { consultants: [], total: 0 };
    }
  }

  /**
   * Search categories by name
   */
  async searchCategories(searchTerm: string): Promise<ICategory[]> {
    try {
      const { data, error } = await supabase
        .from(CATEGORIES_TABLE)
        .select('*')
        .ilike('name', `%${searchTerm}%`)
        .order('consultant_count', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Failed to search categories: ${error}`);
      return [];
    }
  }

  /**
   * Bulk assign consultant to multiple categories
   */
  async assignConsultantToCategories(
    consultantId: string,
    categoryIds: string[]
  ): Promise<IConsultantCategory[]> {
    try {
      const results: IConsultantCategory[] = [];

      for (const categoryId of categoryIds) {
        const result = await this.addConsultantToCategory(consultantId, categoryId);
        results.push(result);
      }

      return results;
    } catch (error) {
      throw new Error(`Failed to assign consultant to categories: ${error}`);
    }
  }

  /**
   * Get trending categories
   */
  async getTrendingCategories(limit: number = 10): Promise<ICategory[]> {
    try {
      const { data, error } = await supabase
        .from(CATEGORIES_TABLE)
        .select('*')
        .order('consultant_count', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Failed to fetch trending categories: ${error}`);
      return [];
    }
  }
}
