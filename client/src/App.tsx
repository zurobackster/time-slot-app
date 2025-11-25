import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/Home';
import { CategoriesPage } from './pages/CategoriesPage';
import { ActivitiesPage } from './pages/ActivitiesPage';

// Placeholder components - we'll implement these next

function PlannerPage() {
  return <div>Planner Page - Coming Soon</div>;
}

function ExplorerPage() {
  return <div>Explorer Page - Coming Soon</div>;
}

function DashboardPage() {
  return <div>Dashboard Page - Coming Soon</div>;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="activities" element={<ActivitiesPage />} />
        <Route path="planner" element={<PlannerPage />} />
        <Route path="explorer" element={<ExplorerPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
