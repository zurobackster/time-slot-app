import { useState, useEffect } from 'react';
import { useCreateSession, useUpdateSession, useDeleteSession } from '../sessions/useSessions';
import { calculateEndTime, getMaxDuration } from '../../utils/timeSlots';
import type { SessionWithDetails } from './types';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  session?: SessionWithDetails;  // For edit mode
  initialData?: {                // For create mode
    activity_id: number;
    activity_name: string;
    category_color: string;
    date: string;
    start_time: string;
  };
};

export function SessionModal({ isOpen, onClose, mode, session, initialData }: Props) {
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState('');

  const createSession = useCreateSession();
  const updateSession = useUpdateSession();
  const deleteSession = useDeleteSession();

  // Initialize form data
  useEffect(() => {
    if (mode === 'edit' && session) {
      setDuration(session.duration_minutes);
      setNotes(session.notes || '');
    } else if (mode === 'create') {
      setDuration(30);
      setNotes('');
    }
    setError('');
  }, [mode, session]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (mode === 'create' && initialData) {
        const endTime = calculateEndTime(initialData.start_time, duration);
        await createSession.mutateAsync({
          activity_id: initialData.activity_id,
          date: initialData.date,
          start_time: initialData.start_time,
          end_time: endTime,
          duration_minutes: duration,
          notes: notes || undefined,
        });
      } else if (mode === 'edit' && session) {
        const endTime = calculateEndTime(session.start_time, duration);
        await updateSession.mutateAsync({
          id: session.id!,
          data: {
            duration_minutes: duration,
            end_time: endTime,
            notes: notes || undefined,
          },
        });
      }
      onClose();
    } catch (err: any) {
      if (err.message.includes('overlap')) {
        setError('This time slot overlaps with an existing session. Please choose a different duration.');
      } else {
        setError('Failed to save session. Please try again.');
      }
    }
  };

  const handleDelete = async () => {
    if (!session) return;
    try {
      await deleteSession.mutateAsync({ id: session.id!, date: session.date });
      onClose();
    } catch (err: any) {
      setError('Failed to delete session. Please try again.');
    }
  };

  const activityName = mode === 'create' ? initialData?.activity_name : session?.activity_name;
  const categoryColor = mode === 'create' ? initialData?.category_color : session?.category_color;
  const startTime = mode === 'create' ? initialData?.start_time : session?.start_time;

  // Calculate max duration (prevent past midnight)
  const maxDuration = startTime ? getMaxDuration(startTime) : 360;
  const durationOptions = [30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360]
    .filter(d => d <= maxDuration);

  // Calculate end time preview
  const endTimePreview = startTime ? calculateEndTime(startTime, duration) : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-card rounded-lg shadow-2xl w-full max-w-md mx-4 animate-in zoom-in-95 duration-200">
        {/* Gradient Header */}
        <div
          className="p-6 rounded-t-lg"
          style={{
            background: `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary)) 80%)`,
          }}
        >
          <h2 className="text-2xl font-bold text-primary-foreground flex items-center gap-2">
            {mode === 'create' ? '✨ Schedule Activity' : '📝 Edit Session'}
          </h2>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Activity Banner */}
          <div
            className="mb-6 p-4 rounded-lg border-l-4"
            style={{
              backgroundColor: `${categoryColor}15`,
              borderLeftColor: categoryColor,
            }}
          >
            <p className="font-semibold text-lg">{activityName}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {startTime} → {endTimePreview}
            </p>
          </div>

          {/* Duration Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Duration ⏱️
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-4 py-3 border border-border rounded-lg bg-background text-base focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              required
            >
              {durationOptions.map(d => (
                <option key={d} value={d}>
                  {d} minutes {d >= 60 ? `(${d / 60}h)` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Notes 📝 (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this session..."
              maxLength={1000}
              rows={3}
              className="w-full px-4 py-3 border border-border rounded-lg bg-background resize-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {notes.length}/1000 characters
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {mode === 'edit' && !showDeleteConfirm && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-all hover:scale-105 font-medium"
                disabled={deleteSession.isPending}
              >
                🗑️ Delete
              </button>
            )}

            {showDeleteConfirm && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-all animate-pulse font-medium"
                disabled={deleteSession.isPending}
              >
                Confirm Delete?
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-all font-medium"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={createSession.isPending || updateSession.isPending}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:hover:scale-100 font-medium"
            >
              {createSession.isPending || updateSession.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span> Saving...
                </span>
              ) : (
                mode === 'create' ? '✨ Create Session' : '💾 Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
