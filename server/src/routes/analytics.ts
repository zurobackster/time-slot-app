import { Router, Request, Response } from 'express';
import { getDatabase } from '../db/database.js';
import { ActivityHours, CategoryHours, DailyStats } from '../../../shared/dist/index.js';

const router = Router();

// GET /api/analytics/activity-hours - Get hours invested per activity
router.get('/activity-hours', async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const userId = 1; // MVP: default user
    const { startDate, endDate } = req.query;

    let query = `
      SELECT
        a.id as activity_id,
        a.name as activity_name,
        c.name as category_name,
        c.color as category_color,
        SUM(s.duration_minutes) as total_minutes,
        ROUND(SUM(s.duration_minutes) / 60.0, 2) as total_hours,
        COUNT(s.id) as session_count
      FROM sessions s
      JOIN activities a ON s.activity_id = a.id
      JOIN categories c ON a.category_id = c.id
      WHERE s.user_id = ?
    `;
    const params: any[] = [userId];

    if (startDate && endDate) {
      query += ' AND s.date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    query += `
      GROUP BY a.id, a.name, c.name, c.color
      ORDER BY total_minutes DESC
    `;

    const results = await db.all<ActivityHours[]>(query, ...params);

    res.json(results);
  } catch (error) {
    console.error('Error fetching activity hours:', error);
    res.status(500).json({
      error: 'Failed to fetch activity hours',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/analytics/category-hours - Get hours invested per category
router.get('/category-hours', async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const userId = 1; // MVP: default user
    const { startDate, endDate } = req.query;

    let query = `
      SELECT
        c.id as category_id,
        c.name as category_name,
        c.color as category_color,
        SUM(s.duration_minutes) as total_minutes,
        ROUND(SUM(s.duration_minutes) / 60.0, 2) as total_hours,
        COUNT(s.id) as session_count
      FROM sessions s
      JOIN activities a ON s.activity_id = a.id
      JOIN categories c ON a.category_id = c.id
      WHERE s.user_id = ?
    `;
    const params: any[] = [userId];

    if (startDate && endDate) {
      query += ' AND s.date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    query += `
      GROUP BY c.id, c.name, c.color
      ORDER BY total_minutes DESC
    `;

    const results = await db.all<CategoryHours[]>(query, ...params);

    res.json(results);
  } catch (error) {
    console.error('Error fetching category hours:', error);
    res.status(500).json({
      error: 'Failed to fetch category hours',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/analytics/daily-stats - Get daily statistics
router.get('/daily-stats', async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const userId = 1; // MVP: default user
    const { startDate, endDate } = req.query;

    let query = `
      SELECT
        s.date,
        SUM(s.duration_minutes) as total_minutes,
        ROUND(SUM(s.duration_minutes) / 60.0, 2) as total_hours,
        COUNT(s.id) as session_count
      FROM sessions s
      WHERE s.user_id = ?
    `;
    const params: any[] = [userId];

    if (startDate && endDate) {
      query += ' AND s.date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    query += `
      GROUP BY s.date
      ORDER BY s.date
    `;

    const results = await db.all<DailyStats[]>(query, ...params);

    res.json(results);
  } catch (error) {
    console.error('Error fetching daily stats:', error);
    res.status(500).json({
      error: 'Failed to fetch daily stats',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/analytics/summary - Get overall summary statistics
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const userId = 1; // MVP: default user
    const { startDate, endDate } = req.query;

    // Base query params
    let dateFilter = '';
    const params: any[] = [userId];

    if (startDate && endDate) {
      dateFilter = ' AND date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    // Total sessions and hours
    const totals = await db.get(
      `SELECT
         COUNT(id) as total_sessions,
         SUM(duration_minutes) as total_minutes,
         ROUND(SUM(duration_minutes) / 60.0, 2) as total_hours,
         ROUND(AVG(duration_minutes) / 60.0, 2) as avg_hours_per_session
       FROM sessions
       WHERE user_id = ?${dateFilter}`,
      ...params
    );

    // Most used activity
    const mostUsedActivity = await db.get(
      `SELECT
         a.name as activity_name,
         COUNT(s.id) as session_count
       FROM sessions s
       JOIN activities a ON s.activity_id = a.id
       WHERE s.user_id = ?${dateFilter}
       GROUP BY a.id, a.name
       ORDER BY session_count DESC
       LIMIT 1`,
      ...params
    );

    // Most used category
    const mostUsedCategory = await db.get(
      `SELECT
         c.name as category_name,
         c.color as category_color,
         COUNT(s.id) as session_count
       FROM sessions s
       JOIN activities a ON s.activity_id = a.id
       JOIN categories c ON a.category_id = c.id
       WHERE s.user_id = ?${dateFilter}
       GROUP BY c.id, c.name, c.color
       ORDER BY session_count DESC
       LIMIT 1`,
      ...params
    );

    // Count unique days with sessions
    const uniqueDays = await db.get(
      `SELECT COUNT(DISTINCT date) as day_count
       FROM sessions
       WHERE user_id = ?${dateFilter}`,
      ...params
    );

    const avgHoursPerDay = uniqueDays.day_count > 0
      ? parseFloat((totals.total_hours / uniqueDays.day_count).toFixed(2))
      : 0;

    res.json({
      total_sessions: totals.total_sessions || 0,
      total_hours: totals.total_hours || 0,
      total_minutes: totals.total_minutes || 0,
      avg_hours_per_session: totals.avg_hours_per_session || 0,
      avg_hours_per_day: avgHoursPerDay,
      days_with_sessions: uniqueDays.day_count || 0,
      most_used_activity: mostUsedActivity || null,
      most_used_category: mostUsedCategory || null,
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({
      error: 'Failed to fetch summary',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
