export interface ICategory {
  id?: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  consultant_count?: number;
  created_at?: Date;
  updated_at?: Date;
}

// SQL table structure (for reference)
export const CATEGORIES_TABLE = 'categories';

export const categoriesTableSchema = `
  CREATE TABLE IF NOT EXISTS ${CATEGORIES_TABLE} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),
    icon VARCHAR(255),
    color VARCHAR(7) DEFAULT '#3B82F6',
    consultant_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name)
  )
`;
