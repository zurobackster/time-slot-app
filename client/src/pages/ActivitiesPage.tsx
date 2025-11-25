import { useState } from 'react';
import { useCategories } from '../features/categories/useCategories';
import { useActivities, useCreateActivity, useUpdateActivity, useDeleteActivity } from '../features/activities/useActivities';
import type { Activity } from '../../../shared/dist/index.js';

type ActivityFormData = {
  name: string;
  description: string;
  category_id: number;
};

export function ActivitiesPage() {
  const { data: categories } = useCategories();
  const { data: activities, isLoading, error } = useActivities();
  const createActivity = useCreateActivity();
  const updateActivity = useUpdateActivity();
  const deleteActivity = useDeleteActivity();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [formData, setFormData] = useState<ActivityFormData>({
    name: '',
    description: '',
    category_id: 0,
  });
  const [filterCategory, setFilterCategory] = useState<number | undefined>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingActivity) {
        await updateActivity.mutateAsync({
          id: editingActivity.id,
          data: formData,
        });
      } else {
        await createActivity.mutateAsync(formData);
      }

      setIsFormOpen(false);
      setEditingActivity(null);
      setFormData({ name: '', description: '', category_id: 0 });
    } catch (err) {
      console.error('Failed to save activity:', err);
    }
  };

  const handleEdit = (activity: any) => {
    setEditingActivity(activity);
    setFormData({
      name: activity.name,
      description: activity.description || '',
      category_id: activity.category_id,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;

    try {
      await deleteActivity.mutateAsync(id);
    } catch (err: any) {
      alert(err.message || 'Failed to delete activity');
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingActivity(null);
    setFormData({ name: '', description: '', category_id: 0 });
  };

  const handleOpenForm = () => {
    if (categories && categories.length > 0) {
      setFormData({ ...formData, category_id: categories[0].id! });
    }
    setIsFormOpen(true);
  };

  if (isLoading) {
    return <div>Loading activities...</div>;
  }

  if (error) {
    return <div className="text-destructive">Error loading activities: {error.message}</div>;
  }

  // Group activities by category
  const groupedActivities = activities?.reduce((acc, activity: any) => {
    const categoryName = activity.category_name || 'Uncategorized';
    if (!acc[categoryName]) {
      acc[categoryName] = {
        color: activity.category_color,
        activities: [],
      };
    }
    acc[categoryName].activities.push(activity);
    return acc;
  }, {} as Record<string, { color: string; activities: any[] }>);

  const filteredActivities = filterCategory
    ? activities?.filter((a: any) => a.category_id === filterCategory)
    : activities;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Activities</h1>
        <div className="flex items-center gap-3">
          {/* Category Filter */}
          <select
            value={filterCategory || ''}
            onChange={(e) => setFilterCategory(e.target.value ? Number(e.target.value) : undefined)}
            className="px-3 py-2 border border-border rounded-md bg-background"
          >
            <option value="">All Categories</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleOpenForm}
            disabled={!categories || categories.length === 0}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={!categories || categories.length === 0 ? 'Create categories first' : ''}
          >
            Add Activity
          </button>
        </div>
      </div>

      {!categories || categories.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Please create categories first before adding activities.</p>
        </div>
      ) : null}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editingActivity ? 'Edit Activity' : 'New Activity'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  required
                  maxLength={200}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  rows={3}
                  maxLength={1000}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category *</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  required
                >
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-border rounded-md hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createActivity.isPending || updateActivity.isPending}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                >
                  {createActivity.isPending || updateActivity.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activities List - Grouped by Category */}
      {!filterCategory && groupedActivities ? (
        <div className="space-y-8">
          {Object.entries(groupedActivities).map(([categoryName, { color, activities }]) => (
            <div key={categoryName}>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-4 w-4 rounded" style={{ backgroundColor: color }} />
                <h2 className="text-xl font-semibold">{categoryName}</h2>
                <span className="text-sm text-muted-foreground">({activities.length})</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activities.map((activity: any) => (
                  <div
                    key={activity.id}
                    className="p-4 border border-border rounded-lg bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{activity.name}</h3>
                        {activity.description && (
                          <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                        )}
                      </div>

                      <div className="flex space-x-2 ml-2">
                        <button
                          onClick={() => handleEdit(activity)}
                          className="p-2 hover:bg-accent rounded-md transition-colors"
                          title="Edit"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(activity.id)}
                          disabled={deleteActivity.isPending}
                          className="p-2 hover:bg-destructive/10 text-destructive rounded-md transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Filtered List */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredActivities?.map((activity: any) => (
            <div
              key={activity.id}
              className="p-4 border border-border rounded-lg bg-card hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-3 w-3 rounded" style={{ backgroundColor: activity.category_color }} />
                    <span className="text-xs text-muted-foreground">{activity.category_name}</span>
                  </div>
                  <h3 className="font-semibold text-lg">{activity.name}</h3>
                  {activity.description && (
                    <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                  )}
                </div>

                <div className="flex space-x-2 ml-2">
                  <button
                    onClick={() => handleEdit(activity)}
                    className="p-2 hover:bg-accent rounded-md transition-colors"
                    title="Edit"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(activity.id)}
                    disabled={deleteActivity.isPending}
                    className="p-2 hover:bg-destructive/10 text-destructive rounded-md transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredActivities?.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No activities yet. Create your first activity to get started!</p>
        </div>
      )}
    </div>
  );
}
