// Analytics Types

export type EventType =
  | 'task_created'
  | 'task_completed'
  | 'task_started'
  | 'task_updated'
  | 'pomodoro_started'
  | 'pomodoro_completed'
  | 'focus_mode_started'
  | 'focus_mode_ended'
  | 'note_created'
  | 'note_updated'
  | 'habit_completed'
  | 'daily_goals_completed';

export interface AnalyticsEvent {
  id: string;
  user_id: string;
  event_type: EventType;
  task_id: string | null;
  metadata: Record<string, unknown> | null;
  duration_minutes: number | null;
  created_at: string;
}

export interface DailyStats {
  id: string;
  user_id: string;
  stats_date: string; // DATE format YYYY-MM-DD
  tasks_completed: number;
  tasks_created: number;
  total_focus_time: number; // minutes
  pomodoros_completed: number;
  habits_completed: number;
  daily_goals_completed: boolean;
  peak_hour: number | null; // 0-23
  quadrant_distribution: Record<string, number> | null;
  created_at: string;
  updated_at: string;
}

export interface MonthlyInsights {
  id: string;
  user_id: string;
  month_year: string; // First day of month YYYY-MM-DD
  total_tasks_completed: number;
  avg_completion_rate: number; // percentage
  avg_time_per_task: number; // minutes
  total_focus_time: number;
  estimated_vs_actual: {
    estimated: number;
    actual: number;
  } | null;
  most_productive_day: string;
  most_productive_hour: number;
  habit_completion_rate: number;
  created_at: string;
  updated_at: string;
}

export interface ProductivityStreak {
  id: string;
  user_id: string;
  streak_type: 'habit' | 'daily_goals' | 'focus_time';
  current_streak: number;
  longest_streak: number;
  last_completed_date: string | null;
  created_at: string;
  updated_at: string;
}

// Dashboard Statistics
export interface DashboardStats {
  thisWeek: {
    tasksCompleted: number;
    focusTime: number; // minutes
    pomodorosCompleted: number;
    habitCompletion: number; // percentage
  };
  thisMonth: {
    tasksCompleted: number;
    avgCompletionRate: number; // percentage
    avgTimePerTask: number; // minutes
    mostProductiveDay: string;
  };
  allTime: {
    longestStreak: Record<string, number>;
    totalFocusTime: number;
    totalTasksCompleted: number;
  };
}

export interface ProductivityInsight {
  title: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
  percentage?: number;
  icon?: string;
}
