import { z } from 'zod';

// Time validation helpers
const timeRegex = /^([01]\d|2[0-3]):[03]0$/; // HH:00 or HH:30 format
const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD format

// Category schemas
export const categorySchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/), // Hex color
  user_id: z.number().int().positive().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const createCategorySchema = categorySchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const updateCategorySchema = categorySchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Activity schemas
export const activitySchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).nullable().optional(),
  category_id: z.number().int().positive(),
  user_id: z.number().int().positive().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const createActivitySchema = activitySchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const updateActivitySchema = activitySchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Session schemas
const sessionBaseSchema = z.object({
  id: z.number().int().positive().optional(),
  activity_id: z.number().int().positive(),
  date: z.string().regex(dateRegex, 'Date must be in YYYY-MM-DD format'),
  start_time: z.string().regex(timeRegex, 'Start time must be HH:00 or HH:30'),
  end_time: z.string().regex(timeRegex, 'End time must be HH:00 or HH:30'),
  duration_minutes: z.number().int().positive().multipleOf(30, 'Duration must be multiple of 30'),
  notes: z.string().max(1000).nullable().optional(),
  user_id: z.number().int().positive().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const sessionSchema = sessionBaseSchema.refine(
  (data) => data.start_time < data.end_time,
  { message: 'Start time must be before end time' }
);

export const createSessionSchema = sessionBaseSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).refine(
  (data) => data.start_time < data.end_time,
  { message: 'Start time must be before end time' }
);

export const updateSessionSchema = sessionBaseSchema.partial().omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Type exports
export type Category = z.infer<typeof categorySchema>;
export type CreateCategory = z.infer<typeof createCategorySchema>;
export type UpdateCategory = z.infer<typeof updateCategorySchema>;

export type Activity = z.infer<typeof activitySchema>;
export type CreateActivity = z.infer<typeof createActivitySchema>;
export type UpdateActivity = z.infer<typeof updateActivitySchema>;

export type Session = z.infer<typeof sessionSchema>;
export type CreateSession = z.infer<typeof createSessionSchema>;
export type UpdateSession = z.infer<typeof updateSessionSchema>;

// Analytics types
export type ActivityHours = {
  activity_id: number;
  activity_name: string;
  category_name: string;
  category_color: string;
  total_minutes: number;
  total_hours: number;
  session_count: number;
};

export type CategoryHours = {
  category_id: number;
  category_name: string;
  category_color: string;
  total_minutes: number;
  total_hours: number;
  session_count: number;
};

export type DailyStats = {
  date: string;
  total_minutes: number;
  total_hours: number;
  session_count: number;
};
