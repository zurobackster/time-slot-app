import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { CreateSession, UpdateSession } from '../../../../shared/dist/index.js';

export function useSessions(date: string) {
  return useQuery({
    queryKey: ['sessions', date],
    queryFn: () => api.getSessions({ date }),
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSession) => api.createSession(data),
    onSuccess: (newSession) => {
      // Invalidate the specific date's sessions
      queryClient.invalidateQueries({ queryKey: ['sessions', newSession.date] });
    },
  });
}

export function useUpdateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSession }) =>
      api.updateSession(id, data),
    onSuccess: (updatedSession) => {
      // Invalidate the specific date's sessions
      queryClient.invalidateQueries({ queryKey: ['sessions', updatedSession.date] });
    },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, date }: { id: number; date: string }) => api.deleteSession(id),
    onSuccess: (_, variables) => {
      // Invalidate the specific date's sessions using the date from variables
      queryClient.invalidateQueries({ queryKey: ['sessions', variables.date] });
    },
  });
}
