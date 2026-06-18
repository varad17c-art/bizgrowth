export interface IConsultantCategory {
  id?: string;
  consultant_id: string;
  category_id: string;
  created_at?: Date;
}

// SQL table structure (for reference)
export const CONSULTANT_CATEGORIES_TABLE = 'consultant_categories';

export const consultantCategoriesTableSchema = `
  CREATE TABLE IF NOT EXISTS ${CONSULTANT_CATEGORIES_TABLE} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(consultant_id, category_id),
    INDEX idx_consultant_id (consultant_id),
    INDEX idx_category_id (category_id)
  )
`;
