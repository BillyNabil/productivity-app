import { useCallback, useEffect, useState } from 'react';
import { TaskReminder, CreateReminderInput } from '@/types/reminder';
import { remindersService } from '@/lib/supabase/reminders-service';
import { sendTaskReminder, isNotificationEnabled } from '@/lib/utils/notification-utils';

export function useReminders() {
  const [reminders, setReminders] = useState<TaskReminder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dueReminders, setDueReminders] = useState<TaskReminder[]>([]);

  // Fetch reminders
  const fetchReminders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await remindersService.getReminders();
      setReminders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reminders');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check for due reminders
  const checkDueReminders = useCallback(async () => {
    try {
      const due = await remindersService.getDueReminders();
      setDueReminders(due);

      // Send notifications for due reminders
      if (isNotificationEnabled()) {
        for (const reminder of due) {
          // Fetch task details to get title
          // In a real app, you'd want to join this query
          sendTaskReminder(`Task Reminder`, new Date(reminder.scheduled_time), reminder.task_id);
          await remindersService.markAsSent(reminder.id);
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err || 'Failed to check due reminders');
      console.error('Error checking due reminders:', errorMsg, err);
      setError(errorMsg);
    }
  }, []);

  // Create reminder
  const createReminder = useCallback(async (input: CreateReminderInput) => {
    try {
      const newReminder = await remindersService.createReminder(input);
      setReminders((prev) => [...prev, newReminder]);
      return newReminder;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create reminder';
      setError(errorMsg);
      throw err;
    }
  }, []);

  // Delete reminder
  const deleteReminder = useCallback(async (reminderId: string) => {
    try {
      await remindersService.deleteReminder(reminderId);
      setReminders((prev) => prev.filter((r) => r.id !== reminderId));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete reminder';
      setError(errorMsg);
      throw err;
    }
  }, []);

  // Delete all reminders for a task
  const deleteRemindersByTask = useCallback(async (taskId: string) => {
    try {
      await remindersService.deleteRemindersByTask(taskId);
      setReminders((prev) => prev.filter((r) => r.task_id !== taskId));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete reminders';
      setError(errorMsg);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchReminders();

    // Check for due reminders every minute
    const interval = setInterval(() => {
      checkDueReminders();
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchReminders, checkDueReminders]);

  return {
    reminders,
    dueReminders,
    isLoading,
    error,
    createReminder,
    deleteReminder,
    deleteRemindersByTask,
    refetch: fetchReminders,
  };
}
