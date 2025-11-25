# Deployment Guide

This guide covers deploying the Daily Activity Planner to Vercel.

## Current Setup (MVP - Localhost)

The MVP uses:
- **Frontend**: React + Vite (runs on localhost:5173)
- **Backend**: Express + Node.js (runs on localhost:3000)
- **Database**: SQLite (file-based database.db)

## Vercel Deployment Strategy

### Challenge
Vercel is optimized for serverless functions and doesn't support file-based SQLite databases in production.

### Recommended Solutions

#### Option 1: Vercel Postgres (Recommended for Production)
Best for multi-user production deployment.

**Steps:**
1. Create a Vercel Postgres database in your Vercel dashboard
2. Update server code to use `@vercel/postgres` instead of sqlite3
3. Migrate schema from SQLite to PostgreSQL:
   - Convert `INTEGER PRIMARY KEY AUTOINCREMENT` → `SERIAL PRIMARY KEY`
   - Convert `TEXT` → `VARCHAR` or `TEXT`
   - Convert datetime functions
4. Update connection code in `server/src/db/database.ts`
5. Deploy with environment variables:
   ```
   POSTGRES_URL=...
   POSTGRES_PRISMA_URL=...
   POSTGRES_URL_NON_POOLING=...
   ```

**Migration Script:**
```sql
-- PostgreSQL version of schema.sql
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  color VARCHAR(7) NOT NULL,
  user_id INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- ... rest of tables
```

#### Option 2: Turso (SQLite-Compatible Edge Database)
Best if you want to keep SQLite syntax and minimal code changes.

**Steps:**
1. Create a Turso database: https://turso.tech
2. Install: `npm install @libsql/client`
3. Update `server/src/db/database.ts` to use Turso client
4. Set environment variables:
   ```
   TURSO_DATABASE_URL=libsql://your-db.turso.io
   TURSO_AUTH_TOKEN=your-token
   ```

**Code changes:**
```typescript
import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
```

#### Option 3: Separate Backend Hosting
Deploy frontend and backend separately.

- **Frontend**: Vercel (static site)
- **Backend**: Railway, Render, or Fly.io (supports SQLite)
- Update `client/.env` with backend URL
- Configure CORS in server

### Deployment Steps (Vercel + Turso)

1. **Prepare the project:**
   ```bash
   # Install Turso CLI
   curl -sSfL https://get.turso.tech/install.sh | bash

   # Create database
   turso db create daily-planner

   # Get credentials
   turso db show daily-planner
   turso db tokens create daily-planner
   ```

2. **Update database connection:**
   - Switch from `sqlite` package to `@libsql/client`
   - Update `server/src/db/database.ts`

3. **Configure Vercel:**
   ```json
   // vercel.json
   {
     "version": 2,
     "builds": [
       {
         "src": "client/package.json",
         "use": "@vercel/static-build",
         "config": {
           "distDir": "dist"
         }
       },
       {
         "src": "server/src/index.ts",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "server/src/index.ts"
       },
       {
         "src": "/(.*)",
         "dest": "client/dist/$1"
       }
     ]
   }
   ```

4. **Set environment variables in Vercel:**
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `NODE_ENV=production`

5. **Deploy:**
   ```bash
   vercel
   ```

## Local Development

Development remains the same:
```bash
npm run dev
```

Both client and server run locally with SQLite.

## Migration Checklist

- [ ] Choose database solution (Vercel Postgres or Turso)
- [ ] Create production database
- [ ] Update database connection code
- [ ] Test locally with production database
- [ ] Migrate schema
- [ ] Seed production database
- [ ] Configure Vercel project
- [ ] Set environment variables
- [ ] Test deployment
- [ ] Update CORS settings for production domain
- [ ] Add authentication for multi-user support

## Notes

- Keep `database.db` in `.gitignore`
- Never commit credentials
- Test migration thoroughly before switching
- Consider backup strategy for production data
- Monitor database size limits on free tiers
