'use client';

import { useEffect } from 'react';
import { useHabitsStore } from '@/lib/stores/habits-store';
import { useAuth } from '@/lib/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';
import { Habit, HabitLog, HabitWithStreak } from '@/types/daily-goals';
import { useAnalytics } from './use-analytics';

export const useHabits = () => {
  const { user } = useAuth();
  const { trackEvent } = useAnalytics();
  const { habits, habitLogs, isLoading, setHabits, setHabitLogs, addHabit, removeHabit, updateHabit, setLoading } = useHabitsStore();
  const supabase = createClient();

  const fetchHabits = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        const errorInfo = {
          message: error?.message || 'Unknown error',
          code: error?.code || 'UNKNOWN',
          details: error?.details || 'No details provided',
          fullError: JSON.stringify(error),
        };
        console.error('Error fetching habits - details:', errorInfo);
        throw error;
      }

      setHabits(data || []);
    } catch (error) {
      console.error('Error fetching habits:', error instanceof Error ? error.message : JSON.stringify(error));
    } finally {
      setLoading(false);
    }
  };

  const fetchHabitLogs = async (startDate?: string, endDate?: string) => {
    if (!user) return;

    try {
      let query = supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', user.id);

      if (startDate && endDate) {
        query = query
          .gte('log_date', startDate)
          .lte('log_date', endDate);
      }

      const { data, error } = await query.order('log_date', { ascending: false });

      if (error) {
        const errorInfo = {
          message: error?.message || 'Unknown error',
          code: error?.code || 'UNKNOWN',
          details: error?.details || 'No details provided',
          fullError: JSON.stringify(error),
        };
        console.error('Error fetching habit logs - details:', errorInfo);
        throw error;
      }

      setHabitLogs(data || []);
    } catch (error) {
      console.error('Error fetching habit logs:', error instanceof Error ? error.message : JSON.stringify(error));
    }
  };

  const createHabit = async (name: string, category: Habit['category'], description?: string, icon?: string) => {
    if (!user) {
      throw new Error('You must be logged in to create a habit');
    }

    if (!name.trim()) {
      throw new Error('Habit name is required');
    }

    try {
      const { data: insertedHabits, error } = await supabase
        .from('habits')
        .insert({
          user_id: user.id,
          name: name.trim(),
          category,
          description: description?.trim() || null,
          icon,
          color: generateRandomColor(),
        })
        .select();

      if (error) {
        console.error('Supabase error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        throw new Error(error.message || 'Failed to create habit in database');
      }

      if (!insertedHabits || insertedHabits.length === 0) {
        throw new Error('Habit was created but no data was returned');
      }

      const newHabit = insertedHabits[0];
      addHabit(newHabit);
      return newHabit;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('Error creating habit:', errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteHabit = async (habitId: string) => {
    try {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', habitId);

      if (error) {
        const errorInfo = {
          message: error?.message || 'Unknown error',
          code: error?.code || 'UNKNOWN',
          details: error?.details || 'No details provided',
          fullError: JSON.stringify(error),
        };
        console.error('Error deleting habit - details:', errorInfo);
        throw error;
      }

      removeHabit(habitId);
    } catch (error) {
      console.error('Error deleting habit:', error instanceof Error ? error.message : JSON.stringify(error));
    }
  };

  const logHabit = async (habitId: string, logDate: string, completed: boolean, notes?: string) => {
    if (!user) return;

    try {
      // Try to find existing log
      const { data: existingLogs, error: fetchError } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('habit_id', habitId)
        .eq('log_date', logDate);

      if (fetchError) {
        const errorInfo = {
          message: fetchError?.message || 'Unknown error',
          code: fetchError?.code || 'UNKNOWN',
          details: fetchError?.details || 'No details provided',
          fullError: JSON.stringify(fetchError),
        };
        console.error('Error fetching existing log - details:', errorInfo);
        throw fetchError;
      }

      const existingLog = existingLogs && existingLogs.length > 0 ? existingLogs[0] : null;

      let result;
      if (existingLog) {
        // Update existing - use array query instead of .single()
        const { data: updatedLogs, error: updateError } = await supabase
          .from('habit_logs')
          .update({ completed, notes })
          .eq('id', existingLog.id)
          .select();

        result = { data: updatedLogs && updatedLogs.length > 0 ? updatedLogs[0] : null, error: updateError };
      } else {
        // Insert new - use array query instead of .single()
        const { data: insertedLogs, error: insertError } = await supabase
          .from('habit_logs')
          .insert({
            habit_id: habitId,
            user_id: user.id,
            log_date: logDate,
            completed,
            notes,
          })
          .select();

        result = { data: insertedLogs && insertedLogs.length > 0 ? insertedLogs[0] : null, error: insertError };
      }

      if (result.error) {
        const errorInfo = {
          message: result.error?.message || 'Unknown error',
          code: result.error?.code || 'UNKNOWN',
          details: result.error?.details || 'No details provided',
          fullError: JSON.stringify(result.error),
        };
        console.error('Error logging habit - details:', errorInfo);
        throw result.error;
      }

      // Track habit completed event if marked as completed
      if (completed && !existingLog) {
        trackEvent('habit_completed', habitId);
      }

      // Refresh logs
      await fetchHabitLogs();
      return result.data;
    } catch (error) {
      console.error('Error logging habit:', error instanceof Error ? error.message : JSON.stringify(error));
    }
  };

  const getHabitStreak = (habitId: string): number => {
    const logs = habitLogs.filter((l) => l.habit_id === habitId).sort((a, b) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime());

    if (logs.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const log of logs) {
      if (!log.completed) break;

      const logDate = new Date(log.log_date);
      logDate.setHours(0, 0, 0, 0);

      const dayDiff = Math.floor((today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));

      if (dayDiff === streak) {
        streak++;
        today.setDate(today.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  const getHabitsWithStreaks = (): HabitWithStreak[] => {
    return habits.map((habit) => {
      const streak = getHabitStreak(habit.id);
      const habitLogs_ = habitLogs.filter((l) => l.habit_id === habit.id);
      const thisWeekStart = new Date();
      thisWeekStart.setDate(thisWeekStart.getDate() - 7);
      const thisMonthStart = new Date();
      thisMonthStart.setMonth(thisMonthStart.getMonth() - 1);

      return {
        ...habit,
        streak,
        completionThisWeek: habitLogs_.filter((l) => new Date(l.log_date) >= thisWeekStart && l.completed).length,
        completionThisMonth: habitLogs_.filter((l) => new Date(l.log_date) >= thisMonthStart && l.completed).length,
      };
    });
  };

  useEffect(() => {
    if (user) {
      fetchHabits();
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const today = new Date();
      fetchHabitLogs(monthAgo.toISOString().split('T')[0], today.toISOString().split('T')[0]);
    }
  }, [user]);

  return {
    habits: getHabitsWithStreaks(),
    habitLogs,
    isLoading,
    createHabit,
    deleteHabit,
    logHabit,
    getHabitStreak,
    refetchHabits: fetchHabits,
    refetchLogs: fetchHabitLogs,
  };
};

function generateRandomColor(): string {
  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];
  return colors[Math.floor(Math.random() * colors.length)];
}
