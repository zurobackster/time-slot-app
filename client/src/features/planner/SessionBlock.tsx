import type { SessionWithDetails } from './types';

type Props = {
  session: SessionWithDetails;
  slotSpan: number;  // How many 30-min slots it occupies
  onClick: () => void;
};

export function SessionBlock({ session, slotSpan, onClick }: Props) {
  // Convert RGB hex to RGBA with opacity
  const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // Calculate height based on number of slots (each slot is 4rem = 64px)
  const heightInRem = slotSpan * 4;

  return (
    <div
      onClick={onClick}
      className="absolute inset-x-0 cursor-pointer rounded-md p-3 border border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden"
      style={{
        backgroundColor: hexToRgba(session.category_color, 0.15),
        borderLeftWidth: '4px',
        borderLeftColor: session.category_color,
        height: `${heightInRem}rem`,
      }}
    >
      <div className="flex flex-col h-full">
        <p className="font-medium text-sm truncate">{session.activity_name}</p>
        <p className="text-xs text-muted-foreground">{session.category_name}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {session.duration_minutes} min
        </p>
        {session.notes && (
          <p className="text-xs text-muted-foreground mt-auto truncate">
            {session.notes}
          </p>
        )}
      </div>
    </div>
  );
}
