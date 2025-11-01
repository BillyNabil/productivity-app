'use client';

import React from 'react';
import { useAnalytics } from '@/lib/hooks/use-analytics';
import { CheckCircle2, Target, Flame, TrendingUp, BarChart3, PieChart as PieChartIcon, Clock, Sparkles } from 'lucide-react';

interface StatCardProps {
  icon?: React.ReactNode;
  title: string;
  value: string | number;
  subtext?: string;
  trend?: 'up' | 'down' | 'stable';
  color?: string;
}

function StatCard({ icon, title, value, subtext, trend, color = 'bg-black-900' }: StatCardProps) {
  return (
    <div className={`${color} p-4 rounded-lg border-2 border-white shadow-md`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-2xl">{icon}</div>
        {trend && (
          <span className={`text-sm font-bold ${trend === 'up' ? 'text-white' : trend === 'down' ? 'text-gray-300' : 'text-gray-400'}`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
          </span>
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-400">{title}</h3>
      <p className="text-2xl font-bold text-white">{value}</p>
      {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
    </div>
  );
}

interface AnalyticsSummaryProps {
  dateRange?: 'day' | 'week' | 'month';
  onDateRangeChange?: (range: 'day' | 'week' | 'month') => void;
}

export function AnalyticsSummary({ dateRange = 'week', onDateRangeChange }: AnalyticsSummaryProps) {
  const { dailyStats, isLoading, calculateDashboardStats, getStatsRange } = useAnalytics();
  const [dashboardStats, setDashboardStats] = React.useState<any>(null);
  const [periodStats, setPeriodStats] = React.useState<any>(null);
  const [internalLoading, setInternalLoading] = React.useState(false);

  // Calculate stats based on date range
  const calculatePeriodStats = React.useCallback(async (range: 'day' | 'week' | 'month') => {
    try {
      setInternalLoading(true);
      const today = new Date();
      let startDate: Date;
      let label: string;

      switch (range) {
        case 'day':
          startDate = new Date(today);
          label = 'Today';
          break;
        case 'week':
          startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          label = 'This Week';
          break;
        case 'month':
          startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          label = 'This Month';
          break;
      }

      const stats = await getStatsRange(
        startDate.toISOString().split('T')[0],
        today.toISOString().split('T')[0]
      );

      // Process stats based on range
      let processed: any = {};
      if (Array.isArray(stats) && stats.length > 0) {
        const tasksCompleted = (stats as any[]).reduce((sum, s) => sum + (s.tasks_completed || 0), 0);
        const focusTime = (stats as any[]).reduce((sum, s) => sum + (s.total_focus_time || 0), 0);
        const pomodorosCompleted = (stats as any[]).reduce((sum, s) => sum + (s.pomodoros_completed || 0), 0);
        const habitsCompleted = (stats as any[]).reduce((sum, s) => sum + (s.habits_completed || 0), 0);

        processed = {
          label,
          tasksCompleted,
          focusTime,
          pomodorosCompleted,
          habitCompletion: stats.length > 0 ? Math.min((habitsCompleted / (stats.length * 3)) * 100, 100) : 0,
          dataPoints: stats.length,
        };
      } else {
        processed = {
          label,
          tasksCompleted: 0,
          focusTime: 0,
          pomodorosCompleted: 0,
          habitCompletion: 0,
          dataPoints: 0,
        };
      }

      setPeriodStats(processed);
    } catch (error) {
      console.error('Error calculating period stats:', error);
      setPeriodStats(null);
    } finally {
      setInternalLoading(false);
    }
  }, [getStatsRange]);

  React.useEffect(() => {
    calculateDashboardStats().then(setDashboardStats);
  }, [calculateDashboardStats]);

  React.useEffect(() => {
    calculatePeriodStats(dateRange);
  }, [dateRange, calculatePeriodStats]);

  if (isLoading || internalLoading) {
    return <div className="text-center py-8 text-gray-300">Loading analytics...</div>;
  }

  if (!periodStats) {
    return <div className="text-center py-8 text-gray-400">No data available</div>;
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          Productivity Analytics
        </h2>
        <div className="flex gap-2">
          {(['day', 'week', 'month'] as const).map((range) => (
            <button
              key={range}
              onClick={() => {
                onDateRangeChange?.(range);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                dateRange === range
                  ? 'bg-white text-black'
                  : 'bg-black-800 text-gray-300 hover:bg-black-700'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Period Stats Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-white">{periodStats.label}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<CheckCircle2 className="w-6 h-6" />}
            title="Tasks Completed"
            value={periodStats.tasksCompleted}
            subtext={`${periodStats.dataPoints} ${dateRange}${dateRange !== 'day' ? 's' : ''}`}
            trend={periodStats.tasksCompleted > 0 ? 'up' : 'stable'}
            color="bg-black-900"
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            title="Focus Time"
            value={`${Math.round(periodStats.focusTime / 60)}h`}
            subtext={`${periodStats.focusTime} min`}
            trend={periodStats.focusTime > 0 ? 'up' : 'stable'}
            color="bg-black-900"
          />
          <StatCard
            icon={<Target className="w-6 h-6" />}
            title="Pomodoros"
            value={periodStats.pomodorosCompleted}
            subtext="completed"
            color="bg-black-900"
          />
          <StatCard
            icon={<Sparkles className="w-6 h-6" />}
            title="Habit Completion"
            value={`${Math.round(periodStats.habitCompletion)}%`}
            subtext="completion rate"
            trend={periodStats.habitCompletion > 70 ? 'up' : periodStats.habitCompletion > 40 ? 'stable' : 'down'}
            color="bg-black-900"
          />
        </div>
      </div>

      {/* All Time Section (Always Show) */}
      {dashboardStats && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">All Time</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              icon={<Flame className="w-6 h-6" />}
              title="Longest Streak"
              value={
                dashboardStats.allTime.longestStreak.habit ||
                dashboardStats.allTime.longestStreak.daily_goals ||
                0
              }
              subtext="days"
              color="bg-black-900"
            />
            <StatCard
              icon={<Clock className="w-6 h-6" />}
              title="Total Focus Time"
              value={`${Math.round(dashboardStats.allTime.totalFocusTime / 60)}h`}
              subtext="all time"
              color="bg-black-900"
            />
            <StatCard
              icon={<Sparkles className="w-6 h-6" />}
              title="Tasks Completed"
              value={dashboardStats.allTime.totalTasksCompleted}
              subtext="all time"
              color="bg-black-900"
            />
          </div>
        </div>
      )}
    </div>
  );
}
