import { useState } from 'react';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../features/categories/useCategories';
import type { Category } from '../../../shared/dist/index.js';

const vibrantColors = [
  { name: 'Purple', value: '#9333ea' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Lime', value: '#84cc16' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Sky', value: '#0ea5e9' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Fuchsia', value: '#d946ef' },
];

type CategoryFormData = {
  name: string;
  color: string;
};

export function CategoriesPage() {
  const { data: categories, isLoading, error } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    color: vibrantColors[0].value,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({
          id: editingCategory.id!,
          data: formData,
        });
      } else {
        await createCategory.mutateAsync(formData);
      }

      setIsFormOpen(false);
      setEditingCategory(null);
      setFormData({ name: '', color: vibrantColors[0].value });
    } catch (err) {
      console.error('Failed to save category:', err);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, color: category.color });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      await deleteCategory.mutateAsync(id);
    } catch (err: any) {
      alert(err.message || 'Failed to delete category');
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', color: vibrantColors[0].value });
  };

  if (isLoading) {
    return <div>Loading categories...</div>;
  }

  if (error) {
    return <div className="text-destructive">Error loading categories: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Categories</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Add Category
        </button>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editingCategory ? 'Edit Category' : 'New Category'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  required
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <div className="grid grid-cols-7 gap-2">
                  {vibrantColors.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={`h-10 w-10 rounded-md border-2 transition-all ${
                        formData.color === color.value
                          ? 'border-foreground scale-110'
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
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
                  disabled={createCategory.isPending || updateCategory.isPending}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                >
                  {createCategory.isPending || updateCategory.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories?.map((category) => (
          <div
            key={category.id}
            className="p-4 border border-border rounded-lg bg-card hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className="h-12 w-12 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: category.color }}
                />
                <div>
                  <h3 className="font-semibold text-lg">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.color}</p>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="p-2 hover:bg-accent rounded-md transition-colors"
                  title="Edit"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(category.id!)}
                  disabled={deleteCategory.isPending}
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

      {categories?.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No categories yet. Create your first category to get started!</p>
        </div>
      )}
    </div>
  );
}
