import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export function CurrentTimeIndicator() {
  const [position, setPosition] = useState(0);

  useEffect(() => {
    function updatePosition() {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();

      // Calculate position: slot height * (hours + minutes/60) * 2 (slots per hour)
      const slotHeight = 64; // 4rem = 64px
      const position = slotHeight * ((hour + minute / 60) * 2);
      setPosition(position);
    }

    updatePosition();
    const interval = setInterval(updatePosition, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="absolute left-0 right-0 z-10 border-t-2 border-red-500"
      style={{ top: `${position}px` }}
    >
      <div className="absolute -top-3 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
        {format(new Date(), 'h:mm a')}
      </div>
    </div>
  );
}
