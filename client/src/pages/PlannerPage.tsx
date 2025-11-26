import { useState } from 'react';
import { startOfToday } from 'date-fns';
import { DateNavigator } from '../features/planner/DateNavigator';
import { ActivitySidebar } from '../features/planner/ActivitySidebar';
import { TimeSlotGrid } from '../features/planner/TimeSlotGrid';
import { formatDateForAPI } from '../utils/timeSlots';

export default function PlannerPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const dateString = formatDateForAPI(selectedDate);

  return (
    <div className="flex flex-col -mx-4 -my-8 sm:-mx-6 lg:-mx-8" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Date Navigator Header */}
      <div className="border-b border-border bg-card p-4">
        <DateNavigator selectedDate={selectedDate} onDateChange={setSelectedDate} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Activity Sidebar */}
        <ActivitySidebar />

        {/* Time Slot Grid */}
        <div className="flex-1 overflow-hidden">
          <TimeSlotGrid date={dateString} />
        </div>
      </div>

      {/* Help text */}
      <div className="border-t border-border bg-muted/30 px-4 py-2 text-sm text-muted-foreground">
        💡 Tip: Drag activities from the sidebar and drop them on time slots to schedule your day
      </div>
    </div>
  );
}
