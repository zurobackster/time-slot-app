import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useActivities } from '../activities/useActivities';
import { useCategories } from '../categories/useCategories';
import { DraggableActivityCard } from './DraggableActivityCard';

export function ActivitySidebar() {
  const { data: activities, isLoading: activitiesLoading } = useActivities();
  const { data: categories } = useCategories();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState<number | null>(null);

  const filteredActivities = useMemo(() => {
    return activities?.filter(activity => {
      const matchesSearch = activity.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !filterCategoryId || activity.category_id === filterCategoryId;
      return matchesSearch && matchesCategory;
    }) || [];
  }, [activities, searchTerm, filterCategoryId]);

  if (activitiesLoading) {
    return (
      <div className="w-80 border-r border-border p-4">
        <p className="text-muted-foreground">Loading activities...</p>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="w-80 border-r border-border p-4">
        <div className="text-center py-12 px-4">
          <p className="text-lg font-medium mb-2">No activities yet</p>
          <p className="text-muted-foreground mb-4 text-sm">
            Create activities first to start planning your day
          </p>
          <Link
            to="/activities"
            className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            Go to Activities
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card sticky top-0">
        <h3 className="text-lg font-semibold mb-3">Activities</h3>

        {/* Search */}
        <input
          type="text"
          placeholder="Search activities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm mb-2"
        />

        {/* Category filter */}
        <select
          value={filterCategoryId || ''}
          onChange={(e) => setFilterCategoryId(e.target.value ? Number(e.target.value) : null)}
          className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm"
        >
          <option value="">All Categories</option>
          {categories?.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Activity list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">No activities found</p>
          </div>
        ) : (
          filteredActivities.map(activity => (
            <DraggableActivityCard key={activity.id} activity={activity} />
          ))
        )}
      </div>
    </div>
  );
}
