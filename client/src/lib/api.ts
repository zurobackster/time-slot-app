import type {
  Category,
  CreateCategory,
  UpdateCategory,
  Activity,
  CreateActivity,
  UpdateActivity,
  Session,
  CreateSession,
  UpdateSession,
  ActivityHours,
  CategoryHours,
  DailyStats,
} from '../../../shared/dist/index.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiClient {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: 'Request failed',
        message: response.statusText,
      }));
      throw new Error(error.message || error.error || 'Request failed');
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>('/api/categories');
  }

  async getCategory(id: number): Promise<Category> {
    return this.request<Category>(`/api/categories/${id}`);
  }

  async createCategory(data: CreateCategory): Promise<Category> {
    return this.request<Category>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: number, data: UpdateCategory): Promise<Category> {
    return this.request<Category>(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: number): Promise<void> {
    return this.request<void>(`/api/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Activities
  async getActivities(categoryId?: number): Promise<Activity[]> {
    const query = categoryId ? `?category_id=${categoryId}` : '';
    return this.request<Activity[]>(`/api/activities${query}`);
  }

  async getActivity(id: number): Promise<Activity> {
    return this.request<Activity>(`/api/activities/${id}`);
  }

  async createActivity(data: CreateActivity): Promise<Activity> {
    return this.request<Activity>('/api/activities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateActivity(id: number, data: UpdateActivity): Promise<Activity> {
    return this.request<Activity>(`/api/activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteActivity(id: number): Promise<void> {
    return this.request<void>(`/api/activities/${id}`, {
      method: 'DELETE',
    });
  }

  // Sessions
  async getSessions(params?: {
    date?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Session[]> {
    const query = params
      ? '?' +
        Object.entries(params)
          .filter(([, value]) => value !== undefined)
          .map(([key, value]) => `${key}=${value}`)
          .join('&')
      : '';
    return this.request<Session[]>(`/api/sessions${query}`);
  }

  async getSession(id: number): Promise<Session> {
    return this.request<Session>(`/api/sessions/${id}`);
  }

  async createSession(data: CreateSession): Promise<Session> {
    return this.request<Session>('/api/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSession(id: number, data: UpdateSession): Promise<Session> {
    return this.request<Session>(`/api/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSession(id: number): Promise<void> {
    return this.request<void>(`/api/sessions/${id}`, {
      method: 'DELETE',
    });
  }

  // Analytics
  async getActivityHours(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ActivityHours[]> {
    const query = params
      ? '?' +
        Object.entries(params)
          .filter(([, value]) => value !== undefined)
          .map(([key, value]) => `${key}=${value}`)
          .join('&')
      : '';
    return this.request<ActivityHours[]>(
      `/api/analytics/activity-hours${query}`
    );
  }

  async getCategoryHours(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<CategoryHours[]> {
    const query = params
      ? '?' +
        Object.entries(params)
          .filter(([, value]) => value !== undefined)
          .map(([key, value]) => `${key}=${value}`)
          .join('&')
      : '';
    return this.request<CategoryHours[]>(
      `/api/analytics/category-hours${query}`
    );
  }

  async getDailyStats(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<DailyStats[]> {
    const query = params
      ? '?' +
        Object.entries(params)
          .filter(([, value]) => value !== undefined)
          .map(([key, value]) => `${key}=${value}`)
          .join('&')
      : '';
    return this.request<DailyStats[]>(`/api/analytics/daily-stats${query}`);
  }

  async getSummary(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<{
    total_sessions: number;
    total_hours: number;
    total_minutes: number;
    avg_hours_per_session: number;
    avg_hours_per_day: number;
    days_with_sessions: number;
    most_used_activity: { activity_name: string; session_count: number } | null;
    most_used_category: {
      category_name: string;
      category_color: string;
      session_count: number;
    } | null;
  }> {
    const query = params
      ? '?' +
        Object.entries(params)
          .filter(([, value]) => value !== undefined)
          .map(([key, value]) => `${key}=${value}`)
          .join('&')
      : '';
    return this.request(`/api/analytics/summary${query}`);
  }
}

export const api = new ApiClient();
