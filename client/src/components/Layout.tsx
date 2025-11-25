import { Link, Outlet, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

const navigation = [
  { name: 'Categories', href: '/categories' },
  { name: 'Activities', href: '/activities' },
  { name: 'Planner', href: '/planner' },
  { name: 'Explorer', href: '/explorer' },
  { name: 'Dashboard', href: '/dashboard' },
];

export function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">D</span>
                </div>
                <span className="text-xl font-bold text-foreground">
                  Daily Activity Planner
                </span>
              </Link>
            </div>

            <nav className="hidden md:flex md:space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    location.pathname === item.href
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Mobile menu button - we'll implement this later */}
            <div className="md:hidden">
              <button className="p-2 rounded-md text-muted-foreground hover:bg-accent">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
