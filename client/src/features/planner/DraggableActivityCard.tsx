import { useDraggable } from '@dnd-kit/core';
import type { Activity } from '../../../../shared/dist/index.js';
import type { DragData } from './types';

type Props = {
  activity: Activity & {
    category_name: string;
    category_color: string;
  };
};

export function DraggableActivityCard({ activity }: Props) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `activity-${activity.id}`,
    data: {
      type: 'activity',
      activity,
    } as DragData,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`
        p-3 border border-border rounded-lg bg-card
        cursor-grab active:cursor-grabbing
        hover:shadow-md transition-all
        ${isDragging ? 'opacity-50 scale-105' : 'opacity-100'}
      `}
      style={{
        borderLeftWidth: '4px',
        borderLeftColor: activity.category_color,
      }}
    >
      <div className="flex flex-col gap-1">
        <p className="font-medium text-sm">{activity.name}</p>
        <p className="text-xs text-muted-foreground">{activity.category_name}</p>
      </div>
    </div>
  );
}
