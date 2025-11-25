import { Router, Request, Response } from 'express';
import { getDatabase } from '../db/database.js';
import { createActivitySchema, updateActivitySchema, Activity } from '../../../shared/dist/index.js';
import { ZodError } from 'zod';

const router = Router();

// GET /api/activities - List all activities (with optional category filter)
router.get('/', async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const userId = 1; // MVP: default user
    const { category_id } = req.query;

    let query = `
      SELECT a.*, c.name as category_name, c.color as category_color
      FROM activities a
      JOIN categories c ON a.category_id = c.id
      WHERE (a.user_id = ? OR a.user_id IS NULL)
    `;
    const params: any[] = [userId];

    if (category_id) {
      query += ' AND a.category_id = ?';
      params.push(category_id);
    }

    query += ' ORDER BY c.name, a.name';

    const activities = await db.all(query, ...params);

    res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({
      error: 'Failed to fetch activities',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/activities/:id - Get single activity
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;

    const activity = await db.get(
      `SELECT a.*, c.name as category_name, c.color as category_color
       FROM activities a
       JOIN categories c ON a.category_id = c.id
       WHERE a.id = ?`,
      id
    );

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    res.json(activity);
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({
      error: 'Failed to fetch activity',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/activities - Create activity
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = createActivitySchema.parse(req.body);
    const db = await getDatabase();
    const userId = 1; // MVP: default user

    // Verify category exists
    const category = await db.get(
      'SELECT id FROM categories WHERE id = ?',
      data.category_id
    );

    if (!category) {
      return res.status(400).json({
        error: 'Invalid category_id',
        details: 'Category does not exist'
      });
    }

    const result = await db.run(
      'INSERT INTO activities (name, description, category_id, user_id) VALUES (?, ?, ?, ?)',
      data.name,
      data.description || null,
      data.category_id,
      userId
    );

    const newActivity = await db.get(
      `SELECT a.*, c.name as category_name, c.color as category_color
       FROM activities a
       JOIN categories c ON a.category_id = c.id
       WHERE a.id = ?`,
      result.lastID
    );

    res.status(201).json(newActivity);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }

    console.error('Error creating activity:', error);
    res.status(500).json({
      error: 'Failed to create activity',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/activities/:id - Update activity
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = updateActivitySchema.parse(req.body);
    const db = await getDatabase();

    // Check if activity exists
    const existing = await db.get('SELECT id FROM activities WHERE id = ?', id);
    if (!existing) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    // If updating category_id, verify it exists
    if (data.category_id !== undefined) {
      const category = await db.get(
        'SELECT id FROM categories WHERE id = ?',
        data.category_id
      );
      if (!category) {
        return res.status(400).json({
          error: 'Invalid category_id',
          details: 'Category does not exist'
        });
      }
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }
    if (data.category_id !== undefined) {
      updates.push('category_id = ?');
      values.push(data.category_id);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    await db.run(
      `UPDATE activities SET ${updates.join(', ')} WHERE id = ?`,
      ...values
    );

    const updated = await db.get(
      `SELECT a.*, c.name as category_name, c.color as category_color
       FROM activities a
       JOIN categories c ON a.category_id = c.id
       WHERE a.id = ?`,
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

    console.error('Error updating activity:', error);
    res.status(500).json({
      error: 'Failed to update activity',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE /api/activities/:id - Delete activity
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    // Check if activity exists
    const existing = await db.get('SELECT id FROM activities WHERE id = ?', id);
    if (!existing) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    // Check if activity has sessions
    const sessions = await db.get(
      'SELECT COUNT(*) as count FROM sessions WHERE activity_id = ?',
      id
    );

    if (sessions.count > 0) {
      return res.status(409).json({
        error: 'Cannot delete activity with existing sessions',
        details: `This activity has ${sessions.count} session(s)`
      });
    }

    await db.run('DELETE FROM activities WHERE id = ?', id);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({
      error: 'Failed to delete activity',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
