import { format, addDays, subDays, isToday } from 'date-fns';

type Props = {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
};

export function DateNavigator({ selectedDate, onDateChange }: Props) {
  const handlePrevDay = () => {
    onDateChange(subDays(selectedDate, 1));
  };

  const handleNextDay = () => {
    onDateChange(addDays(selectedDate, 1));
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      onDateChange(newDate);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4">
      {/* Navigation buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={handlePrevDay}
          className="p-2 hover:bg-accent rounded-md transition-colors"
          aria-label="Previous day"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <button
          onClick={handleNextDay}
          className="p-2 hover:bg-accent rounded-md transition-colors"
          aria-label="Next day"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Date display */}
      <div className="flex-1 text-center">
        <h2 className="text-xl font-semibold">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</h2>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {!isToday(selectedDate) && (
          <button
            onClick={handleToday}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            Today
          </button>
        )}

        <input
          type="date"
          value={format(selectedDate, 'yyyy-MM-dd')}
          onChange={handleDateInput}
          className="px-3 py-2 border border-border rounded-md bg-background text-sm"
          aria-label="Select date"
        />
      </div>
    </div>
  );
}
