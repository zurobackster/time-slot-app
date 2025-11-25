# Daily Activity Planner

A modern web-based time management application that allows users to plan their day by scheduling activities into 30-minute time slots using an intuitive drag-and-drop interface.

## Features

### MVP Features
- ✅ **Activity & Category Management**: Full CRUD operations for activities and categories
- 🗓️ **Day Planner**: Drag-and-drop calendar interface for scheduling activities
- 📊 **Analytics Dashboard**: Visualize time investment per activity and category
- 🔍 **Session Explorer**: Browse and manage planned sessions by date
- 🎨 **Vibrant UI**: Modern, mobile-responsive design with colorful categories
- 💾 **SQLite Database**: Local data persistence

### Coming Soon
- 🔐 Multi-user support with authentication
- 🔄 Recurring activities
- 📱 Progressive Web App (PWA)
- ☁️ Cloud deployment (Vercel)

## Tech Stack

### Frontend
- **React 18** with **TypeScript**
- **Vite** for blazing-fast development
- **Tailwind CSS** + **shadcn/ui** for styling
- **TanStack Query** (React Query) for server state management
- **@dnd-kit** for drag-and-drop interactions
- **React Router** for navigation
- **Recharts** for analytics visualizations
- **date-fns** for date manipulation

### Backend
- **Node.js** + **Express**
- **TypeScript** for type safety
- **SQLite** with async wrapper for data persistence
- **Zod** for validation (shared with frontend)

### Architecture
- **Monorepo** structure with workspaces
- **Shared types** package for consistency between client and server
- **RESTful API** design

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd mini-time-slot-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Initialize the database:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. Start the development servers:
   ```bash
   npm run dev
   ```

   This will start:
   - **Client**: http://localhost:5173
   - **Server**: http://localhost:3000

### Available Scripts

```bash
# Development
npm run dev              # Run both client and server concurrently
npm run dev:client       # Run only client
npm run dev:server       # Run only server

# Build
npm run build            # Build all packages
npm run build:client     # Build client only
npm run build:server     # Build server only

# Database
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed default categories
npm run db:reset         # Reset database (⚠️ destroys all data)

# Testing
npm test                 # Run all tests
npm run test:client      # Run client tests
npm run test:server      # Run server tests

# Linting
npm run lint             # Lint all packages
```

## Project Structure

```
mini-time-slot-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── features/      # Feature modules (planner, dashboard, etc.)
│   │   ├── lib/          # Utilities and API client
│   │   ├── hooks/        # Custom React hooks
│   │   └── types/        # TypeScript types
│   └── package.json
├── server/                # Express backend
│   ├── src/
│   │   ├── db/          # Database layer (schema, migrations, seeds)
│   │   ├── routes/      # API route handlers
│   │   ├── models/      # Data models and queries
│   │   └── middleware/  # Express middleware
│   ├── database.db      # SQLite database file (gitignored)
│   └── package.json
├── shared/               # Shared code
│   ├── src/
│   │   └── schemas.ts   # Zod schemas and TypeScript types
│   └── package.json
├── CLAUDE.md            # Documentation for Claude Code
├── DEPLOYMENT.md        # Deployment guide
├── .env.example         # Environment variables template
└── package.json         # Root package.json with workspaces
```

## Key Concepts

### Time Slot Constraints
- **Granularity**: 30 minutes (smallest unit)
- **Start times**: Only at :00 or :30 (e.g., 14:00, 14:30)
- **Duration**: Must be multiples of 30 (e.g., 30min, 1h, 1h30, 2h)
- **No overlaps**: Sessions cannot overlap for the same user

### Data Model
- **Categories**: Organize activities with color coding
- **Activities**: Tasks or events that can be scheduled
- **Sessions**: Instances of activities scheduled at specific times

### User Flow
1. Create categories (e.g., Work, Personal, Health)
2. Add activities to categories (e.g., "Team Meeting" under Work)
3. Open day planner for a specific date
4. Drag activities from sidebar onto time slots
5. View analytics to understand time investment

## API Endpoints

### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Activities
- `GET /api/activities` - List all activities
- `POST /api/activities` - Create activity
- `PUT /api/activities/:id` - Update activity
- `DELETE /api/activities/:id` - Delete activity

### Sessions
- `GET /api/sessions?date=YYYY-MM-DD` - Get sessions for a date
- `POST /api/sessions` - Create session
- `PUT /api/sessions/:id` - Update session
- `DELETE /api/sessions/:id` - Delete session

### Analytics
- `GET /api/analytics/activity-hours?startDate=...&endDate=...`
- `GET /api/analytics/category-hours?startDate=...&endDate=...`

## Development

### Adding a New Feature
1. Define types in `shared/src/schemas.ts`
2. Create backend endpoints in `server/src/routes/`
3. Add API methods in `client/src/lib/api.ts`
4. Create React components in `client/src/features/`
5. Use TanStack Query hooks for data fetching

### Database Changes
1. Update `server/src/db/schema.sql`
2. Run `npm run db:reset` (development only)
3. Update Zod schemas in `shared/src/schemas.ts`

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

**Quick summary:**
- MVP runs on localhost with SQLite
- Production requires migration to Vercel Postgres or Turso
- Frontend deploys to Vercel as static site
- Backend deploys as Vercel serverless functions

## Contributing

This is currently a solo MVP project. Contributions will be welcome once the MVP is complete.

## License

MIT

## Support

For issues or questions, please open an issue in the repository.

---

Built with ❤️ using React, TypeScript, and modern web technologies.
