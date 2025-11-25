import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">
          Welcome to Daily Activity Planner
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Plan your day efficiently with 30-minute time slots. Track activities,
          manage categories, and visualize your time investment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <Link
          to="/categories"
          className="p-6 border border-border rounded-lg hover:border-vibrant-violet hover:shadow-lg transition-all bg-card"
        >
          <div className="space-y-2">
            <div className="h-12 w-12 rounded-lg bg-vibrant-violet flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold">Categories</h3>
            <p className="text-sm text-muted-foreground">
              Organize your activities into colorful categories
            </p>
          </div>
        </Link>

        <Link
          to="/activities"
          className="p-6 border border-border rounded-lg hover:border-vibrant-blue hover:shadow-lg transition-all bg-card"
        >
          <div className="space-y-2">
            <div className="h-12 w-12 rounded-lg bg-vibrant-blue flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold">Activities</h3>
            <p className="text-sm text-muted-foreground">
              Create and manage your daily activities
            </p>
          </div>
        </Link>

        <Link
          to="/planner"
          className="p-6 border border-border rounded-lg hover:border-vibrant-emerald hover:shadow-lg transition-all bg-card"
        >
          <div className="space-y-2">
            <div className="h-12 w-12 rounded-lg bg-vibrant-emerald flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold">Day Planner</h3>
            <p className="text-sm text-muted-foreground">
              Drag and drop activities into your daily schedule
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
