import { Router, Request, Response } from 'express';
import { getDatabase } from '../db/database.js';
import { createCategorySchema, updateCategorySchema, Category } from '../../../shared/dist/index.js';
import { ZodError } from 'zod';

const router = Router();

// GET /api/categories - List all categories
router.get('/', async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const userId = 1; // MVP: default user

    const categories = await db.all<Category[]>(
      'SELECT * FROM categories WHERE user_id = ? OR user_id IS NULL ORDER BY name',
      userId
    );

    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      error: 'Failed to fetch categories',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/categories/:id - Get single category
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;

    const category = await db.get<Category>(
      'SELECT * FROM categories WHERE id = ?',
      id
    );

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      error: 'Failed to fetch category',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/categories - Create category
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = createCategorySchema.parse(req.body);
    const db = await getDatabase();
    const userId = 1; // MVP: default user

    const result = await db.run(
      'INSERT INTO categories (name, color, user_id) VALUES (?, ?, ?)',
      data.name,
      data.color,
      userId
    );

    const newCategory = await db.get<Category>(
      'SELECT * FROM categories WHERE id = ?',
      result.lastID
    );

    res.status(201).json(newCategory);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }

    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes('UNIQUE')) {
      return res.status(409).json({
        error: 'Category name already exists'
      });
    }

    console.error('Error creating category:', error);
    res.status(500).json({
      error: 'Failed to create category',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/categories/:id - Update category
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = updateCategorySchema.parse(req.body);
    const db = await getDatabase();

    // Check if category exists
    const existing = await db.get('SELECT id FROM categories WHERE id = ?', id);
    if (!existing) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.color !== undefined) {
      updates.push('color = ?');
      values.push(data.color);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    await db.run(
      `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`,
      ...values
    );

    const updated = await db.get<Category>(
      'SELECT * FROM categories WHERE id = ?',
      id
    );

    res.json(updated);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }

    if (error instanceof Error && error.message.includes('UNIQUE')) {
      return res.status(409).json({
        error: 'Category name already exists'
      });
    }

    console.error('Error updating category:', error);
    res.status(500).json({
      error: 'Failed to update category',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE /api/categories/:id - Delete category
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    // Check if category exists
    const existing = await db.get('SELECT id FROM categories WHERE id = ?', id);
    if (!existing) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check if category has activities
    const activities = await db.get(
      'SELECT COUNT(*) as count FROM activities WHERE category_id = ?',
      id
    );

    if (activities.count > 0) {
      return res.status(409).json({
        error: 'Cannot delete category with existing activities',
        details: `This category has ${activities.count} activity(ies)`
      });
    }

    await db.run('DELETE FROM categories WHERE id = ?', id);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      error: 'Failed to delete category',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
