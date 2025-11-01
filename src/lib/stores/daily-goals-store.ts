'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DailyGoal } from '@/types/daily-goals';

interface DailyGoalsState {
  todayGoals: DailyGoal | null;
  isLoading: boolean;
  setTodayGoals: (goals: DailyGoal | null) => void;
  setLoading: (loading: boolean) => void;
  updateGoalCompletion: (goalNumber: 1 | 2 | 3, completed: boolean) => void;
}

export const useDailyGoalsStore = create<DailyGoalsState>()(
  persist(
    (set) => ({
      todayGoals: null,
      isLoading: false,
      setTodayGoals: (goals) => set({ todayGoals: goals }),
      setLoading: (loading) => set({ isLoading: loading }),
      updateGoalCompletion: (goalNumber, completed) =>
        set((state) => {
          if (!state.todayGoals) return state;
          return {
            todayGoals: {
              ...state.todayGoals,
              [`goal_${goalNumber}_completed`]: completed,
            } as DailyGoal,
          };
        }),
    }),
    {
      name: 'daily-goals-store',
    }
  )
);
