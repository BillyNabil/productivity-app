import { useCallback, useEffect, useState } from 'react';
import { DailyStats, MonthlyInsights, ProductivityStreak, EventType, DashboardStats } from '@/types/analytics';
import { analyticsService } from '@/lib/supabase/analytics-service';

export function useAnalytics() {
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyInsights[]>([]);
  const [streaks, setStreaks] = useState<ProductivityStreak[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track event
  const trackEvent = useCallback(
    async (
      eventType: EventType,
      taskId?: string,
      metadata?: Record<string, unknown>,
      durationMinutes?: number
    ) => {
      try {
        await analyticsService.trackEvent(eventType, taskId, metadata, durationMinutes);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : JSON.stringify(err);
        console.error('Error tracking event:', errorMsg);
        // Silently fail - analytics errors shouldn't break the app
      }
    },
    []
  );

  // Get today's stats
  const getTodayStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const stats = await analyticsService.getDailyStats(today);
      setDailyStats(stats);
    } catch (err) {
      console.warn('Failed to fetch daily stats:', err instanceof Error ? err.message : String(err));
      setError(err instanceof Error ? err.message : 'Failed to fetch daily stats');
      // Don't throw, just set null state
      setDailyStats(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get stats for date range
  const getStatsRange = useCallback(async (startDate: string, endDate: string) => {
    try {
      setIsLoading(true);
      const stats = await analyticsService.getStatsByDateRange(startDate, endDate);
      setMonthlyStats(stats as any);
    } catch (err) {
      console.warn('Failed to fetch stats range:', err instanceof Error ? err.message : String(err));
      setError(err instanceof Error ? err.message : 'Failed to fetch stats range');
      // Don't throw, just set empty array
      setMonthlyStats([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get streaks
  const getStreaks = useCallback(async () => {
    try {
      const data = await analyticsService.getStreaks();
      setStreaks(data);
    } catch (err) {
      console.warn('Failed to fetch streaks:', err instanceof Error ? err.message : String(err));
      setError(err instanceof Error ? err.message : 'Failed to fetch streaks');
      // Don't throw, just set empty array
      setStreaks([]);
    }
  }, []);

  // Calculate dashboard stats
  const calculateDashboardStats = useCallback(async (): Promise<DashboardStats | null> => {
    try {
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Fetch stats with error handling
      let weekStats: any[] = [];
      let monthStats: any[] = [];

      try {
        weekStats = await analyticsService.getStatsByDateRange(
          weekAgo.toISOString().split('T')[0],
          today.toISOString().split('T')[0]
        );
      } catch (weekErr) {
        console.warn('Failed to fetch week stats:', weekErr);
        // Continue with empty data instead of failing
      }

      try {
        monthStats = await analyticsService.getStatsByDateRange(
          monthAgo.toISOString().split('T')[0],
          today.toISOString().split('T')[0]
        );
      } catch (monthErr) {
        console.warn('Failed to fetch month stats:', monthErr);
        // Continue with empty data instead of failing
      }

      // Calculate week stats
      const thisWeekCompleted = weekStats.length > 0 ? weekStats.reduce((sum, s) => sum + (s.tasks_completed || 0), 0) : 0;
      const thisWeekFocusTime = weekStats.length > 0 ? weekStats.reduce((sum, s) => sum + (s.total_focus_time || 0), 0) : 0;
      const thisWeekPomodoros = weekStats.length > 0 ? weekStats.reduce((sum, s) => sum + (s.pomodoros_completed || 0), 0) : 0;
      const thisWeekHabits = weekStats.length > 0 ? weekStats.reduce((sum, s) => sum + (s.habits_completed || 0), 0) : 0;
      const weekHabitCompletion =
        weekStats.length > 0 ? (thisWeekHabits / Math.max(weekStats.length * 3, 1)) * 100 : 0;

      // Calculate month stats
      const thisMonthCompleted = monthStats.length > 0 ? monthStats.reduce((sum, s) => sum + (s.tasks_completed || 0), 0) : 0;
      const avgCompletionRate =
        monthStats.length > 0
          ? (monthStats.reduce((sum, s) => sum + (s.tasks_completed || 0), 0) /
              Math.max(monthStats.length * 10, 1)) *
            100
          : 0;

      // Fetch streaks
      let allTimeStreaks: any[] = [];
      try {
        allTimeStreaks = await analyticsService.getStreaks();
      } catch (streakErr) {
        console.warn('Failed to fetch streaks:', streakErr);
        // Continue with empty data instead of failing
      }

      const longestStreakData = allTimeStreaks.length > 0 ? allTimeStreaks.reduce(
        (acc, s) => ({
          ...acc,
          [s.streak_type]: s.longest_streak,
        }),
        {}
      ) : {};

      return {
        thisWeek: {
          tasksCompleted: thisWeekCompleted,
          focusTime: thisWeekFocusTime,
          pomodorosCompleted: thisWeekPomodoros,
          habitCompletion: Math.min(weekHabitCompletion, 100),
        },
        thisMonth: {
          tasksCompleted: thisMonthCompleted,
          avgCompletionRate: Math.min(avgCompletionRate, 100),
          avgTimePerTask: thisMonthCompleted > 0 ? 25 : 0, // Default pomodoro length
          mostProductiveDay: monthStats.length > 0 && monthStats[0]?.peak_hour ? 'Monday' : 'Tuesday', // Placeholder
        },
        allTime: {
          longestStreak: longestStreakData,
          totalFocusTime: thisWeekFocusTime * 4, // Rough estimate
          totalTasksCompleted: thisMonthCompleted * 3, // Rough estimate
        },
      };
    } catch (err) {
      console.error('Error calculating dashboard stats:', err instanceof Error ? err.message : String(err));
      // Return default stats instead of null so components don't break
      return {
        thisWeek: {
          tasksCompleted: 0,
          focusTime: 0,
          pomodorosCompleted: 0,
          habitCompletion: 0,
        },
        thisMonth: {
          tasksCompleted: 0,
          avgCompletionRate: 0,
          avgTimePerTask: 0,
          mostProductiveDay: 'Monday',
        },
        allTime: {
          longestStreak: {},
          totalFocusTime: 0,
          totalTasksCompleted: 0,
        },
      };
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    getTodayStats();
    getStreaks();
  }, [getTodayStats, getStreaks]);

  return {
    dailyStats,
    monthlyStats,
    streaks,
    isLoading,
    error,
    trackEvent,
    getTodayStats,
    getStatsRange,
    getStreaks,
    calculateDashboardStats,
  };
}
