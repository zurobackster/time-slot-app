import { useState, useMemo, useRef, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay } from '@dnd-kit/core';
import { isToday, parseISO } from 'date-fns';
import { useSessions } from '../sessions/useSessions';
import { TimeSlot } from './TimeSlot';
import { SessionModal } from './SessionModal';
import { CurrentTimeIndicator } from './CurrentTimeIndicator';
import {
  generateTimeSlots,
  timeToSlotIndex,
  calculateSlotSpan,
  getCurrentSlotIndex,
} from '../../utils/timeSlots';
import type { DragData, DropData, SessionWithDetails } from './types';

type Props = {
  date: string;  // YYYY-MM-DD
};

export function TimeSlotGrid({ date }: Props) {
  const { data: sessions, isLoading } = useSessions(date);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedSession, setSelectedSession] = useState<SessionWithDetails | null>(null);
  const [newSessionData, setNewSessionData] = useState<any>(null);
  const [activeDragItem, setActiveDragItem] = useState<any>(null);

  const gridRef = useRef<HTMLDivElement>(null);

  // Generate all 48 time slots
  const timeSlots = useMemo(() => generateTimeSlots(), []);

  // Build slot occupation map
  const slotMap = useMemo(() => {
    const map: (SessionWithDetails | null | undefined)[] = new Array(48).fill(undefined);

    sessions?.forEach(session => {
      const startIndex = timeToSlotIndex(session.start_time);
      const span = calculateSlotSpan(session.duration_minutes);

      // First slot gets the session object
      map[startIndex] = session as SessionWithDetails;

      // Subsequent slots marked as null (occupied but don't render)
      for (let i = 1; i < span; i++) {
        if (startIndex + i < 48) {
          map[startIndex + i] = null;
        }
      }
    });

    return map;
  }, [sessions]);

  // Auto-scroll to relevant time on mount/date change
  useEffect(() => {
    if (!gridRef.current || !timeSlots) return;

    let targetSlotIndex = 12; // Default to 6:00 AM

    // If viewing today, scroll to current time - 1 hour
    if (isToday(parseISO(date))) {
      const currentIndex = getCurrentSlotIndex();
      targetSlotIndex = Math.max(0, currentIndex - 2);
    }
    // If sessions exist, scroll to 2 hours before first session
    else if (sessions && sessions.length > 0) {
      const firstSessionTime = sessions[0].start_time;
      const firstIndex = timeToSlotIndex(firstSessionTime);
      targetSlotIndex = Math.max(0, firstIndex - 4);
    }

    // Scroll to target slot (each slot is 4rem = 64px)
    const scrollPosition = targetSlotIndex * 64;
    setTimeout(() => {
      if (gridRef.current) {
        gridRef.current.scrollTop = scrollPosition;
      }
    }, 100);
  }, [date, sessions, timeSlots]);

  // Handle drag-and-drop
  function handleDragStart(event: any) {
    const dragData = event.active.data.current as DragData;
    setActiveDragItem(dragData.activity);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDragItem(null);

    const { active, over } = event;
    if (!over) return;

    const dragData = active.data.current as DragData;
    const dropData = over.data.current as DropData;

    if (dropData.type !== 'timeSlot' || dropData.isOccupied) return;

    // Open modal to create session
    setNewSessionData({
      activity_id: dragData.activity.id,
      activity_name: dragData.activity.name,
      category_color: dragData.activity.category_color,
      date: dropData.date,
      start_time: dropData.time,
    });
    setModalMode('create');
    setIsModalOpen(true);
  }

  // Handle session click
  function handleSessionClick(session: SessionWithDetails) {
    setSelectedSession(session);
    setModalMode('edit');
    setIsModalOpen(true);
  }

  // Scroll helpers
  const scrollToNow = () => {
    if (!gridRef.current) return;
    const currentIndex = getCurrentSlotIndex();
    const scrollPosition = Math.max(0, currentIndex - 2) * 64;
    gridRef.current.scrollTo({ top: scrollPosition, behavior: 'smooth' });
  };

  const scrollToFirstSession = () => {
    if (!gridRef.current || !sessions || sessions.length === 0) return;
    const firstIndex = timeToSlotIndex(sessions[0].start_time);
    const scrollPosition = Math.max(0, firstIndex - 4) * 64;
    gridRef.current.scrollTo({ top: scrollPosition, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading sessions...</p>
      </div>
    );
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="relative h-full">
        <div ref={gridRef} className="h-full overflow-y-auto relative">
          {/* Current time indicator */}
          {isToday(parseISO(date)) && <CurrentTimeIndicator />}

          {/* Empty day message */}
          {sessions && sessions.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-lg font-medium text-muted-foreground">
                  No sessions scheduled
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Drag activities from the sidebar to get started
                </p>
              </div>
            </div>
          )}

          {/* Time slots */}
          <div className="space-y-0">
            {timeSlots.map((slot) => {
              const session = slotMap[slot.index];
              const isOccupied = session !== undefined;
              const slotSpan = session ? calculateSlotSpan(session.duration_minutes) : undefined;

              return (
                <TimeSlot
                  key={slot.time}
                  {...slot}
                  date={date}
                  session={session || undefined}
                  isOccupied={isOccupied}
                  slotSpan={slotSpan}
                  onSessionClick={handleSessionClick}
                />
              );
            })}
          </div>
        </div>

        {/* Jump buttons */}
        <div className="fixed bottom-8 right-8 flex flex-col gap-2 z-10">
          {isToday(parseISO(date)) && (
            <button
              onClick={scrollToNow}
              className="px-4 py-2 bg-card border border-border rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all text-sm font-medium"
            >
              📍 Jump to Now
            </button>
          )}
          {sessions && sessions.length > 0 && (
            <button
              onClick={scrollToFirstSession}
              className="px-4 py-2 bg-card border border-border rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all text-sm font-medium"
            >
              ⬆️ First Session
            </button>
          )}
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeDragItem && (
            <div className="p-3 border-2 border-primary rounded-lg bg-card shadow-xl opacity-90">
              <p className="font-medium text-sm">Dragging {activeDragItem.name}</p>
            </div>
          )}
        </DragOverlay>

        {/* Session modal */}
        <SessionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          mode={modalMode}
          session={selectedSession || undefined}
          initialData={newSessionData}
        />
      </div>
    </DndContext>
  );
}
