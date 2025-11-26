import { format, parse, addMinutes } from 'date-fns';

export type TimeSlot = {
  time: string;        // HH:mm (24-hour)
  label: string;       // Display format (e.g., "2:30 PM")
  index: number;       // 0-47
};

// Generate all 48 time slots (00:00 - 23:30)
export function generateTimeSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  for (let i = 0; i < 48; i++) {
    const hour = Math.floor(i / 2);
    const minute = (i % 2) * 30;
    const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    const date = parse(time, 'HH:mm', new Date());
    const label = format(date, 'h:mm a');
    slots.push({ time, label, index: i });
  }
  return slots;
}

// Convert HH:mm to slot index (0-47)
export function timeToSlotIndex(time: string): number {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 2 + (minute === 30 ? 1 : 0);
}

// Convert slot index to HH:mm
export function slotIndexToTime(index: number): string {
  const hour = Math.floor(index / 2);
  const minute = (index % 2) * 30;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

// Calculate how many slots a duration spans
export function calculateSlotSpan(durationMinutes: number): number {
  return durationMinutes / 30;
}

// Get current slot index (for current time indicator)
export function getCurrentSlotIndex(): number {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  // Snap to nearest 30-min slot
  const snappedMinute = minute >= 30 ? 30 : 0;
  return hour * 2 + (snappedMinute === 30 ? 1 : 0);
}

// Calculate end time from start time and duration
export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const startDate = parse(startTime, 'HH:mm', new Date());
  const endDate = addMinutes(startDate, durationMinutes);
  return format(endDate, 'HH:mm');
}

// Format date to YYYY-MM-DD for API
export function formatDateForAPI(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

// Get maximum duration based on start time (prevent past midnight)
export function getMaxDuration(startTime: string): number {
  const [hour, minute] = startTime.split(':').map(Number);
  const startMinutes = hour * 60 + minute;
  const midnightMinutes = 24 * 60;
  return midnightMinutes - startMinutes;
}
