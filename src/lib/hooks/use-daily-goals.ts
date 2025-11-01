'use client';

import { useEffect } from 'react';
import { useDailyGoalsStore } from '@/lib/stores/daily-goals-store';
import { useAuth } from '@/lib/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';
import { DailyGoal } from '@/types/daily-goals';

export const useDailyGoals = () => {
  const { user } = useAuth();
  const { todayGoals, isLoading, setTodayGoals, setLoading, updateGoalCompletion } = useDailyGoalsStore();
  const supabase = createClient();

  const fetchTodayGoals = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      const { data: goalsArray, error } = await supabase
        .from('daily_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('goal_date', today);

      if (error) {
        const errorInfo = {
          message: error?.message || 'Unknown error',
          code: error?.code || 'UNKNOWN',
          details: error?.details || 'No details provided',
          fullError: JSON.stringify(error),
        };
        console.error('Error fetching daily goals - details:', errorInfo);
      }

      // If no goals exist for today, data will be empty array
      const todayGoal = goalsArray && goalsArray.length > 0 ? goalsArray[0] : null;
      setTodayGoals(todayGoal);
    } catch (error) {
      console.error('Error fetching daily goals:', error instanceof Error ? error.message : JSON.stringify(error));
    } finally {
      setLoading(false);
    }
  };

  const createTodayGoals = async (goal1: string, goal2: string, goal3: string) => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];

      const { data: insertedGoals, error } = await supabase
        .from('daily_goals')
        .insert({
          user_id: user.id,
          goal_date: today,
          goal_1: goal1,
          goal_2: goal2,
          goal_3: goal3,
        })
        .select();

      if (error) {
        const errorInfo = {
          message: error?.message || 'Unknown error',
          code: error?.code || 'UNKNOWN',
          details: error?.details || 'No details provided',
          fullError: JSON.stringify(error),
        };
        console.error('Error creating daily goals - details:', errorInfo);
        throw error;
      }

      // Get first inserted goal
      const newGoal = insertedGoals && insertedGoals.length > 0 ? insertedGoals[0] : null;
      setTodayGoals(newGoal);
      return newGoal;
    } catch (error) {
      console.error('Error creating daily goals:', error instanceof Error ? error.message : JSON.stringify(error));
    }
  };

  const updateGoal = async (goalNumber: 1 | 2 | 3, completed: boolean) => {
    if (!todayGoals) return;

    try {
      const updateData = {
        [`goal_${goalNumber}_completed`]: completed,
      };

      const { data: updatedGoals, error } = await supabase
        .from('daily_goals')
        .update(updateData)
        .eq('id', todayGoals.id)
        .select();

      if (error) {
        const errorInfo = {
          message: error?.message || 'Unknown error',
          code: error?.code || 'UNKNOWN',
          details: error?.details || 'No details provided',
          fullError: JSON.stringify(error),
        };
        console.error('Error updating goal - details:', errorInfo);
        throw error;
      }

      // Get first updated goal
      const updated = updatedGoals && updatedGoals.length > 0 ? updatedGoals[0] : null;
      if (updated) {
        setTodayGoals(updated);
        updateGoalCompletion(goalNumber, completed);
      }
      return updated;
    } catch (error) {
      console.error('Error updating goal:', error instanceof Error ? error.message : JSON.stringify(error));
    }
  };

  const addReflection = async (reflection: string, energyLevel: number) => {
    if (!todayGoals) return;

    try {
      const { data: updatedGoals, error } = await supabase
        .from('daily_goals')
        .update({
          reflection,
          energy_level: energyLevel,
        })
        .eq('id', todayGoals.id)
        .select();

      if (error) {
        const errorInfo = {
          message: error?.message || 'Unknown error',
          code: error?.code || 'UNKNOWN',
          details: error?.details || 'No details provided',
          fullError: JSON.stringify(error),
        };
        console.error('Error adding reflection - details:', errorInfo);
        throw error;
      }

      // Get first updated goal
      const updated = updatedGoals && updatedGoals.length > 0 ? updatedGoals[0] : null;
      if (updated) {
        setTodayGoals(updated);
      }
      return updated;
    } catch (error) {
      console.error('Error adding reflection:', error instanceof Error ? error.message : JSON.stringify(error));
    }
  };

  const deleteGoals = async () => {
    if (!todayGoals) return;

    try {
      const { error } = await supabase
        .from('daily_goals')
        .delete()
        .eq('id', todayGoals.id);

      if (error) {
        const errorInfo = {
          message: error?.message || 'Unknown error',
          code: error?.code || 'UNKNOWN',
          details: error?.details || 'No details provided',
          fullError: JSON.stringify(error),
        };
        console.error('Error deleting goals - details:', errorInfo);
        throw error;
      }

      // Clear the goals from state
      setTodayGoals(null);
      return true;
    } catch (error) {
      console.error('Error deleting goals:', error instanceof Error ? error.message : JSON.stringify(error));
      throw error;
    }
  };

  useEffect(() => {
    fetchTodayGoals();
  }, [user]);

  return {
    todayGoals,
    isLoading,
    createTodayGoals,
    updateGoal,
    addReflection,
    deleteGoals,
    refetch: fetchTodayGoals,
  };
};
