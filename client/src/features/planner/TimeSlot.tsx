import { useDroppable } from '@dnd-kit/core';
import { SessionBlock } from './SessionBlock';
import type { SessionWithDetails, DropData } from './types';

type Props = {
  time: string;           // HH:mm
  label: string;          // Display (e.g., "2:30 PM")
  slotIndex: number;      // 0-47
  date: string;           // YYYY-MM-DD
  session?: SessionWithDetails | null;
  isOccupied: boolean;
  slotSpan?: number;      // For first slot of multi-slot session
  onSessionClick?: (session: SessionWithDetails) => void;
};

export function TimeSlot({
  time,
  label,
  slotIndex,
  date,
  session,
  isOccupied,
  slotSpan,
  onSessionClick,
}: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${slotIndex}`,
    data: {
      type: 'timeSlot',
      slotIndex,
      time,
      date,
      isOccupied,
    } as DropData,
    disabled: isOccupied,  // Prevent drops on occupied slots
  });

  // If middle of multi-slot session, render empty slot height
  if (isOccupied && !session) {
    return <div ref={setNodeRef} className="h-16 border-b border-border/30" />;
  }

  // If session starts here, render SessionBlock
  if (session && slotSpan) {
    return (
      <div ref={setNodeRef} className="h-16 border-b border-border/30 relative">
        <SessionBlock
          session={session}
          slotSpan={slotSpan}
          onClick={() => onSessionClick?.(session)}
        />
      </div>
    );
  }

  // Otherwise, render empty droppable slot
  return (
    <div
      ref={setNodeRef}
      className={`
        h-16 border-b border-border flex items-center px-4
        ${isOver ? 'bg-primary/10' : 'hover:bg-accent/50'}
        ${isOccupied ? 'cursor-not-allowed' : ''}
        transition-colors
      `}
    >
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}
