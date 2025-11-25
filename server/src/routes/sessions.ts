import { Router, Request, Response } from 'express';
import { getDatabase } from '../db/database.js';
import { createSessionSchema, updateSessionSchema, Session } from '../../../shared/dist/index.js';
import { ZodError } from 'zod';

const router = Router();

// Helper function to check for overlapping sessions
async function checkOverlap(
  db: any,
  date: string,
  start_time: string,
  end_time: string,
  user_id: number,
  excludeSessionId?: number
): Promise<boolean> {
  const query = `
    SELECT id FROM sessions
    WHERE user_id = ?
      AND date = ?
      AND id != ?
      AND (
        (start_time < ? AND end_time > ?)
        OR (start_time < ? AND end_time > ?)
        OR (start_time >= ? AND end_time <= ?)
      )
  `;

  const overlap = await db.get(
    query,
    user_id,
    date,
    excludeSessionId || 0,
    end_time, start_time,  // Check if existing session starts before new ends and ends after new starts
    end_time, end_time,     // Check if existing session starts during new session
    start_time, start_time, // Check if existing session is completely within new session
  );

  return !!overlap;
}

// GET /api/sessions - List sessions (with optional date filter)
router.get('/', async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const userId = 1; // MVP: default user
    const { date, startDate, endDate } = req.query;

    let query = `
      SELECT s.*,
             a.name as activity_name,
             a.description as activity_description,
             c.id as category_id,
             c.name as category_name,
             c.color as category_color
      FROM sessions s
      JOIN activities a ON s.activity_id = a.id
      JOIN categories c ON a.category_id = c.id
      WHERE s.user_id = ?
    `;
    const params: any[] = [userId];

    if (date) {
      query += ' AND s.date = ?';
      params.push(date);
    } else if (startDate && endDate) {
      query += ' AND s.date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    query += ' ORDER BY s.date, s.start_time';

    const sessions = await db.all(query, ...params);

    res.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({
      error: 'Failed to fetch sessions',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/sessions/:id - Get single session
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;

    const session = await db.get(
      `SELECT s.*,
              a.name as activity_name,
              a.description as activity_description,
              c.id as category_id,
              c.name as category_name,
              c.color as category_color
       FROM sessions s
       JOIN activities a ON s.activity_id = a.id
       JOIN categories c ON a.category_id = c.id
       WHERE s.id = ?`,
      id
    );

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({
      error: 'Failed to fetch session',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/sessions - Create session
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = createSessionSchema.parse(req.body);
    const db = await getDatabase();
    const userId = 1; // MVP: default user

    // Verify activity exists
    const activity = await db.get(
      'SELECT id FROM activities WHERE id = ?',
      data.activity_id
    );

    if (!activity) {
      return res.status(400).json({
        error: 'Invalid activity_id',
        details: 'Activity does not exist'
      });
    }

    // Check for overlapping sessions
    const hasOverlap = await checkOverlap(
      db,
      data.date,
      data.start_time,
      data.end_time,
      userId
    );

    if (hasOverlap) {
      return res.status(409).json({
        error: 'Session overlap detected',
        details: 'A session already exists in this time slot'
      });
    }

    const result = await db.run(
      `INSERT INTO sessions
       (activity_id, date, start_time, end_time, duration_minutes, notes, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      data.activity_id,
      data.date,
      data.start_time,
      data.end_time,
      data.duration_minutes,
      data.notes || null,
      userId
    );

    const newSession = await db.get(
      `SELECT s.*,
              a.name as activity_name,
              a.description as activity_description,
              c.id as category_id,
              c.name as category_name,
              c.color as category_color
       FROM sessions s
       JOIN activities a ON s.activity_id = a.id
       JOIN categories c ON a.category_id = c.id
       WHERE s.id = ?`,
      result.lastID
    );

    res.status(201).json(newSession);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }

    console.error('Error creating session:', error);
    res.status(500).json({
      error: 'Failed to create session',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/sessions/:id - Update session
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = updateSessionSchema.parse(req.body);
    const db = await getDatabase();
    const userId = 1; // MVP: default user

    // Check if session exists
    const existing = await db.get<Session>(
      'SELECT * FROM sessions WHERE id = ?',
      id
    );

    if (!existing) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // If updating activity_id, verify it exists
    if (data.activity_id !== undefined) {
      const activity = await db.get(
        'SELECT id FROM activities WHERE id = ?',
        data.activity_id
      );
      if (!activity) {
        return res.status(400).json({
          error: 'Invalid activity_id',
          details: 'Activity does not exist'
        });
      }
    }

    // Check for overlapping sessions if time/date changed
    const newDate = data.date || existing.date;
    const newStartTime = data.start_time || existing.start_time;
    const newEndTime = data.end_time || existing.end_time;

    const hasOverlap = await checkOverlap(
      db,
      newDate,
      newStartTime,
      newEndTime,
      userId,
      parseInt(id)
    );

    if (hasOverlap) {
      return res.status(409).json({
        error: 'Session overlap detected',
        details: 'A session already exists in this time slot'
      });
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (data.activity_id !== undefined) {
      updates.push('activity_id = ?');
      values.push(data.activity_id);
    }
    if (data.date !== undefined) {
      updates.push('date = ?');
      values.push(data.date);
    }
    if (data.start_time !== undefined) {
      updates.push('start_time = ?');
      values.push(data.start_time);
    }
    if (data.end_time !== undefined) {
      updates.push('end_time = ?');
      values.push(data.end_time);
    }
    if (data.duration_minutes !== undefined) {
      updates.push('duration_minutes = ?');
      values.push(data.duration_minutes);
    }
    if (data.notes !== undefined) {
      updates.push('notes = ?');
      values.push(data.notes);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    await db.run(
      `UPDATE sessions SET ${updates.join(', ')} WHERE id = ?`,
      ...values
    );

    const updated = await db.get(
      `SELECT s.*,
              a.name as activity_name,
              a.description as activity_description,
              c.id as category_id,
              c.name as category_name,
              c.color as category_color
       FROM sessions s
       JOIN activities a ON s.activity_id = a.id
       JOIN categories c ON a.category_id = c.id
       WHERE s.id = ?`,
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

    console.error('Error updating session:', error);
    res.status(500).json({
      error: 'Failed to update session',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE /api/sessions/:id - Delete session
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    // Check if session exists
    const existing = await db.get('SELECT id FROM sessions WHERE id = ?', id);
    if (!existing) {
      return res.status(404).json({ error: 'Session not found' });
    }

    await db.run('DELETE FROM sessions WHERE id = ?', id);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({
      error: 'Failed to delete session',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
