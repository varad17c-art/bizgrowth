import { Request, Response } from 'express';
import { CategoriesService } from './categories.service';

const categoriesService = new CategoriesService();

// Helper to safely get a string param
const qs = (v: string | string[] | undefined): string => (Array.isArray(v) ? v[0] : v ?? '');

export class CategoriesController {
  /**
   * POST /api/categories
   * Create a new category
   */
  async createCategory(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, icon, color } = req.body;

      if (!name) {
        res.status(400).json({ error: 'Category name is required' });
        return;
      }

      const category = await categoriesService.createCategory({
        name,
        description,
        icon,
        color,
      });

      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ error: `Failed to create category: ${error}` });
    }
  }

  /**
   * GET /api/categories
   * Get all categories
   */
  async getAllCategories(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = parseInt(req.query.skip as string) || 0;

      const { categories, total } = await categoriesService.getAllCategories(limit, skip);

      res.json({
        categories,
        pagination: { limit, skip, total },
      });
    } catch (error) {
      res.status(500).json({ error: `Failed to fetch categories: ${error}` });
    }
  }

  /**
   * GET /api/categories/trending
   * Get trending categories
   */
  async getTrendingCategories(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const categories = await categoriesService.getTrendingCategories(limit);

      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: `Failed to fetch trending categories: ${error}` });
    }
  }

  /**
   * GET /api/categories/search
   * Search categories
   */
  async searchCategories(req: Request, res: Response): Promise<void> {
    try {
      const { q } = req.query;

      if (!q) {
        res.status(400).json({ error: 'Search term is required' });
        return;
      }

      const categories = await categoriesService.searchCategories(q as string);

      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: `Failed to search categories: ${error}` });
    }
  }

  /**
   * GET /api/categories/:categoryId
   * Get category by ID
   */
  async getCategory(req: Request, res: Response): Promise<void> {
    try {
      const categoryId = qs(req.params['categoryId']);
      const category = await categoriesService.getCategoryById(categoryId);

      if (!category) {
        res.status(404).json({ error: 'Category not found' });
        return;
      }

      res.json(category);
    } catch (error) {
      res.status(500).json({ error: `Failed to fetch category: ${error}` });
    }
  }

  /**
   * PATCH /api/categories/:categoryId
   * Update category
   */
  async updateCategory(req: Request, res: Response): Promise<void> {
    try {
      const categoryId = qs(req.params['categoryId']);
      const updateData = req.body;

      const category = await categoriesService.updateCategory(categoryId, updateData);

      if (!category) {
        res.status(404).json({ error: 'Category not found' });
        return;
      }

      res.json(category);
    } catch (error) {
      res.status(500).json({ error: `Failed to update category: ${error}` });
    }
  }

  /**
   * DELETE /api/categories/:categoryId
   * Delete category
   */
  async deleteCategory(req: Request, res: Response): Promise<void> {
    try {
      const categoryId = qs(req.params['categoryId']);
      const deleted = await categoriesService.deleteCategory(categoryId);

      if (!deleted) {
        res.status(404).json({ error: 'Category not found' });
        return;
      }

      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: `Failed to delete category: ${error}` });
    }
  }

  /**
   * POST /api/categories/:categoryId/consultants/:consultantId
   * Add consultant to category
   */
  async addConsultantToCategory(req: Request, res: Response): Promise<void> {
    try {
      const categoryId = qs(req.params['categoryId']);
      const consultantId = qs(req.params['consultantId']);

      const mapping = await categoriesService.addConsultantToCategory(
        consultantId,
        categoryId
      );

      res.status(201).json(mapping);
    } catch (error) {
      res.status(500).json({ error: `Failed to add consultant to category: ${error}` });
    }
  }

  /**
   * DELETE /api/categories/:categoryId/consultants/:consultantId
   * Remove consultant from category
   */
  async removeConsultantFromCategory(req: Request, res: Response): Promise<void> {
    try {
      const categoryId = qs(req.params['categoryId']);
      const consultantId = qs(req.params['consultantId']);

      const removed = await categoriesService.removeConsultantFromCategory(
        consultantId,
        categoryId
      );

      if (!removed) {
        res.status(404).json({ error: 'Consultant not found in this category' });
        return;
      }

      res.json({ message: 'Consultant removed from category successfully' });
    } catch (error) {
      res.status(500).json({ error: `Failed to remove consultant from category: ${error}` });
    }
  }

  /**
   * GET /api/categories/consultants/:consultantId
   * Get all categories for a consultant
   */
  async getConsultantCategories(req: Request, res: Response): Promise<void> {
    try {
      const consultantId = qs(req.params['consultantId']);

      const categories = await categoriesService.getConsultantCategories(consultantId);

      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: `Failed to fetch consultant categories: ${error}` });
    }
  }

  /**
   * GET /api/categories/:categoryId/consultants
   * Get all consultants in a category
   */
  async getConsultantsInCategory(req: Request, res: Response): Promise<void> {
    try {
      const categoryId = qs(req.params['categoryId']);
      const limit = parseInt(qs(req.query['limit'] as string | string[])) || 50;
      const skip = parseInt(qs(req.query['skip'] as string | string[])) || 0;

      const { consultants, total } = await categoriesService.getConsultantsInCategory(
        categoryId,
        limit,
        skip
      );

      res.json({
        consultants,
        pagination: { limit, skip, total },
      });
    } catch (error) {
      res.status(500).json({ error: `Failed to fetch consultants: ${error}` });
    }
  }

  /**
   * POST /api/categories/consultants/:consultantId/bulk-assign
   * Assign consultant to multiple categories
   */
  async bulkAssignCategories(req: Request, res: Response): Promise<void> {
    try {
      const consultantId = qs(req.params['consultantId']);
      const { categoryIds } = req.body;

      if (!categoryIds || !Array.isArray(categoryIds)) {
        res.status(400).json({ error: 'categoryIds array is required' });
        return;
      }

      const results = await categoriesService.assignConsultantToCategories(
        consultantId,
        categoryIds
      );

      res.status(201).json(results);
    } catch (error) {
      res.status(500).json({ error: `Failed to assign categories: ${error}` });
    }
  }
}