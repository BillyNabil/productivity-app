import { useCallback, useEffect, useState } from 'react';
import { RecurringTask, CreateRecurringTaskInput, UpdateRecurringTaskInput } from '@/types/recurring-task';
import { recurringTasksService } from '@/lib/supabase/recurring-tasks-service';

export function useRecurringTasks() {
  const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch recurring tasks
  const fetchRecurringTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await recurringTasksService.getRecurringTasks();
      setRecurringTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recurring tasks');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create recurring task
  const createRecurringTask = useCallback(async (input: CreateRecurringTaskInput) => {
    try {
      const newTask = await recurringTasksService.createRecurringTask(input);
      setRecurringTasks((prev) => [...prev, newTask]);
      return newTask;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create recurring task';
      setError(errorMsg);
      throw err;
    }
  }, []);

  // Update recurring task
  const updateRecurringTask = useCallback(
    async (id: string, input: UpdateRecurringTaskInput) => {
      try {
        const updated = await recurringTasksService.updateRecurringTask(id, input);
        setRecurringTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
        return updated;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to update recurring task';
        setError(errorMsg);
        throw err;
      }
    },
    []
  );

  // Deactivate recurring task
  const deactivateRecurringTask = useCallback(async (id: string) => {
    try {
      const updated = await recurringTasksService.deactivateRecurringTask(id);
      setRecurringTasks((prev) => prev.filter((t) => t.id !== id));
      return updated;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to deactivate recurring task';
      setError(errorMsg);
      throw err;
    }
  }, []);

  // Delete recurring task
  const deleteRecurringTask = useCallback(async (id: string) => {
    try {
      await recurringTasksService.deleteRecurringTask(id);
      setRecurringTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete recurring task';
      setError(errorMsg);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchRecurringTasks();
  }, [fetchRecurringTasks]);

  return {
    recurringTasks,
    isLoading,
    error,
    createRecurringTask,
    updateRecurringTask,
    deactivateRecurringTask,
    deleteRecurringTask,
    refetch: fetchRecurringTasks,
  };
}
