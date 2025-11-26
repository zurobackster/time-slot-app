import type { Activity, Session } from '../../../../shared/dist/index.js';

// Data attached to draggable activities
export type DragData = {
  type: 'activity';
  activity: Activity & {
    category_name: string;
    category_color: string;
  };
};

// Data attached to droppable time slots
export type DropData = {
  type: 'timeSlot';
  slotIndex: number;
  time: string;
  date: string;
  isOccupied: boolean;
};

// Session with enriched activity/category data (from API)
export type SessionWithDetails = Session & {
  // Enriched fields from JOIN
  activity_name: string;
  activity_description?: string;
  category_id: number;
  category_name: string;
  category_color: string;
};

// Form data for session modal
export type SessionFormData = {
  duration_minutes: number;
  notes: string;
};
