import express from 'express';
import cors from 'cors';
import { getDatabase } from './db/database.js';
import categoriesRouter from './routes/categories.js';
import activitiesRouter from './routes/activities.js';
import sessionsRouter from './routes/sessions.js';
import analyticsRouter from './routes/analytics.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Daily Activity Planner API is running' });
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const db = await getDatabase();
    const result = await db.get('SELECT COUNT(*) as count FROM categories');
    res.json({
      status: 'ok',
      message: 'Database connected successfully',
      categoryCount: result.count
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// API Routes
app.use('/api/categories', categoriesRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/analytics', analyticsRouter);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   Database test: http://localhost:${PORT}/api/test-db`);
  console.log('');
  console.log('📋 API Endpoints:');
  console.log('   Categories:  http://localhost:${PORT}/api/categories');
  console.log('   Activities:  http://localhost:${PORT}/api/activities');
  console.log('   Sessions:    http://localhost:${PORT}/api/sessions');
  console.log('   Analytics:   http://localhost:${PORT}/api/analytics/summary');
});
