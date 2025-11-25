# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Daily Activity Planner is a web-based time management application that allows users to plan their day by scheduling activities into 30-minute time slots. Users can manage activities, create daily schedules through drag-and-drop interactions, and view analytics about their time investment.

## Architecture

This is a monorepo with three main packages:

- **client/**: React 18 + Vite + TypeScript SPA
  - Features: Activities/Categories CRUD, Day Planner (drag-drop calendar), Session Explorer, Analytics Dashboard
  - UI: Tailwind CSS + shadcn/ui components
  - State: TanStack Query (React Query v5) for server state
  - Drag-and-drop: @dnd-kit/core for calendar interactions

- **server/**: Node.js + Express + TypeScript API
  - Database: SQLite with better-sqlite3 (synchronous API)
  - RESTful endpoints for categories, activities, sessions, and analytics
  - Validation: Zod schemas shared with frontend

- **shared/**: Shared TypeScript types and Zod validation schemas
  - Ensures type safety between client and server
  - Validation logic for time constraints

## Database Schema

### Core Tables

**categories**: Activity categories with color coding
- Primary fields: id, name, color (hex), user_id
- Unique constraint on name

**activities**: User-defined activities
- Primary fields: id, name, description, category_id, user_id
- Foreign key to categories

**sessions**: Scheduled time slots (instances of activities)
- Primary fields: id, activity_id, date, start_time, end_time, duration_minutes, notes, user_id
- Foreign keys to activities
- **Critical constraints**:
  - No overlapping sessions for same user on same date
  - start_time and end_time must be :00 or :30 (e.g., 14:00, 14:30)
  - duration_minutes must be multiple of 30
  - Indexed on (date, user_id) and activity_id

### Key Constraints

1. **Time Slot Granularity**: 30 minutes only
   - Valid start times: XX:00 or XX:30
   - Valid durations: 30, 60, 90, 120, etc. (multiples of 30)

2. **No Overlapping Sessions**: Backend validates that sessions don't overlap for the same user on the same date

3. **Multi-user Ready**: All tables have user_id column (nullable in MVP, defaults to 1)

## Development Commands

```bash
# Install all dependencies (root + client + server)
npm install

# Development mode (runs both client and server concurrently)
npm run dev

# Client runs on: http://localhost:5173
# Server runs on: http://localhost:3000

# Build for production
npm run build

# Run tests
npm test

# Database operations
npm run db:migrate    # Run database migrations
npm run db:seed       # Seed default categories
npm run db:reset      # Reset database (dev only - drops all data)

# Individual package commands
cd client && npm run dev      # Run only client
cd server && npm run dev      # Run only server
cd server && npm run db:init  # Initialize database
```

## Key Features & Implementation Notes

### 1. Day Planner (Main Feature)

The day planner is a calendar-style interface where users drag activities from a sidebar and drop them onto time slots.

**Implementation**:
- `client/src/features/planner/` contains the main components
- `TimeSlotGrid.tsx`: 24-hour grid with 48 slots (00:00 - 23:30)
- `ActivitySidebar.tsx`: Draggable list of all activities
- Uses @dnd-kit for drag-and-drop (droppable time slots, draggable activities)
- Sessions can span multiple slots (e.g., 2-hour session occupies 4 slots)
- Visual feedback: category colors, current time indicator, hover states

**Validation**:
- Frontend: Validates time format and prevents dropping on occupied slots
- Backend: Double-checks overlap prevention and time constraints
- Utilities in `client/src/lib/timeUtils.ts` and `shared/schemas.ts`

### 2. Analytics Dashboard

Shows time investment metrics with timeline views and charts.

**Key Endpoints**:
- `GET /api/analytics/activity-hours?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
- `GET /api/analytics/category-hours?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

**Visualizations** (using Recharts):
- Timeline: Stacked area chart showing hours per activity over time
- Bar chart: Total hours by activity
- Pie/Donut chart: Total hours by category
- Summary cards: Total sessions, hours, most used activity/category

### 3. Session Management

Sessions are instances of activities scheduled at specific times.

**Creation Flow**:
1. User drags activity from sidebar
2. Drops on time slot (e.g., 14:00)
3. Frontend creates session with default 30min duration
4. POST /api/sessions with validation
5. Backend checks overlap, validates time constraints
6. Session created and appears in grid

**Editing**:
- Click session to edit duration or add notes
- Resize handle for visual duration adjustment (30min increments)
- DELETE for removal

## Important Technical Decisions

### Why SQLite?
- Embedded database, simple setup for MVP
- Good query performance for single-user analytics
- Easy migration path to Postgres/Turso for multi-user production

### Time Handling
- Store dates as ISO strings (YYYY-MM-DD) in local time
- Store times as HH:MM strings (24-hour format)
- duration_minutes as INTEGER for easier calculations
- Use date-fns for date manipulation in frontend

### Color System
- Categories have assigned colors (hex values stored in DB)
- Activities inherit category color
- Sessions display with activity's category color
- Use Tailwind's color palette for consistency
- Vibrant colors for visual appeal

## Multi-user Preparation (v2)

MVP is single-user (user_id = 1), but structured for multi-user:

1. All tables have user_id column (nullable in MVP)
2. All queries filter by user_id
3. To add authentication:
   - Create users table with auth credentials
   - Add authentication middleware
   - Extract user_id from session/JWT
   - Make user_id NOT NULL in schema
   - Add unique constraints with user_id (e.g., categories.name per user)

## Deployment

**MVP**: Runs on localhost (development mode)

**Production** (Vercel):
- Frontend: Deploy client as static site
- Backend: Serverless functions (Express → Vercel functions)
- Database: Migrate from SQLite to:
  - **Option 1**: Vercel Postgres (recommended for multi-user)
  - **Option 2**: Turso (SQLite-compatible edge database)
- See `DEPLOYMENT.md` for migration guide

## Common Patterns

### Adding a New Feature
1. Define types in `shared/schemas.ts` (Zod schema + TS type)
2. Create backend endpoint in `server/src/routes/`
3. Add model/query logic in `server/src/models/`
4. Add API method in `client/src/lib/api.ts`
5. Create React Query hooks in feature folder
6. Build UI components in `client/src/features/`

### Validation Strategy
- Use Zod schemas in `shared/` for consistency
- Validate on both frontend (UX) and backend (security)
- Time-specific validation in `client/src/lib/timeUtils.ts`

### Error Handling
- Backend returns consistent error format: `{ error: string, details?: any }`
- Frontend uses React Query's error states
- Toast notifications for user feedback (shadcn/ui toast component)

## Testing

Run tests with `npm test` from root or individual packages.

- **Client tests**: Vitest + React Testing Library
- **Server tests**: Vitest for API endpoints and database operations
- **Critical paths to test**:
  - Session overlap validation
  - Time constraint validation (30min increments, :00/:30 starts)
  - CRUD operations for all entities
  - Analytics calculations

## Project Structure

```
mini-time-slot-app/
├── client/                      # React frontend
│   ├── src/
│   │   ├── components/          # Shared UI components
│   │   │   └── ui/             # shadcn/ui components
│   │   ├── features/            # Feature modules
│   │   │   ├── activities/     # Activities CRUD
│   │   │   ├── categories/     # Categories CRUD
│   │   │   ├── planner/        # Day planner (main feature)
│   │   │   ├── explorer/       # Session explorer
│   │   │   └── dashboard/      # Analytics dashboard
│   │   ├── lib/                # Utilities
│   │   │   ├── api.ts          # API client
│   │   │   └── timeUtils.ts    # Time validation helpers
│   │   ├── hooks/              # Custom React hooks
│   │   └── types/              # TypeScript types
│   ├── public/
│   └── package.json
├── server/                      # Express backend
│   ├── src/
│   │   ├── db/                 # Database layer
│   │   │   ├── schema.sql      # SQLite schema
│   │   │   ├── init.ts         # DB initialization
│   │   │   └── seed.ts         # Seed data
│   │   ├── routes/             # API routes
│   │   │   ├── categories.ts
│   │   │   ├── activities.ts
│   │   │   ├── sessions.ts
│   │   │   └── analytics.ts
│   │   ├── models/             # Data models/queries
│   │   └── middleware/         # Express middleware
│   ├── database.db             # SQLite database file (gitignored)
│   └── package.json
├── shared/                      # Shared code
│   ├── schemas.ts              # Zod schemas + TypeScript types
│   └── package.json
├── package.json                 # Root package.json (workspaces)
├── CLAUDE.md                    # This file
└── DEPLOYMENT.md                # Deployment guide
```

## Troubleshooting

### Database locked error
- SQLite doesn't handle concurrent writes well
- Solution: Keep better-sqlite3's synchronous API, avoid parallel writes
- Future: Migrate to Postgres for production

### Time validation failing
- Ensure times are in HH:MM format (24-hour)
- Check that minutes are :00 or :30
- Duration must be multiple of 30
- Use `timeUtils.ts` helpers

### Drag-and-drop not working
- Verify @dnd-kit sensors are configured
- Check that droppable IDs are unique
- Ensure activities have proper draggable attributes
- See `client/src/hooks/useDragAndDrop.ts` for implementation

### Analytics queries slow
- Ensure indexes exist on sessions(date, user_id) and sessions(activity_id)
- Run `npm run db:migrate` if schema updates are pending
- Consider date range limits in UI (default: 7 days)
