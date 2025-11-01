'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Habit, HabitLog } from '@/types/daily-goals';

interface HabitsState {
  habits: Habit[];
  habitLogs: HabitLog[];
  isLoading: boolean;
  setHabits: (habits: Habit[]) => void;
  setHabitLogs: (logs: HabitLog[]) => void;
  addHabit: (habit: Habit) => void;
  removeHabit: (habitId: string) => void;
  updateHabit: (habit: Habit) => void;
  setLoading: (loading: boolean) => void;
}

export const useHabitsStore = create<HabitsState>()(
  persist(
    (set) => ({
      habits: [],
      habitLogs: [],
      isLoading: false,
      setHabits: (habits) => set({ habits }),
      setHabitLogs: (logs) => set({ habitLogs: logs }),
      addHabit: (habit) => set((state) => ({ habits: [...state.habits, habit] })),
      removeHabit: (habitId) =>
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== habitId),
        })),
      updateHabit: (habit) =>
        set((state) => ({
          habits: state.habits.map((h) => (h.id === habit.id ? habit : h)),
        })),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'habits-store',
    }
  )
);
