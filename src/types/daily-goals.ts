export type DailyGoal = {
  id: string;
  user_id: string;
  goal_date: string; // ISO date format
  goal_1: string;
  goal_2: string;
  goal_3: string;
  goal_1_completed: boolean;
  goal_2_completed: boolean;
  goal_3_completed: boolean;
  reflection?: string;
  energy_level?: number; // 1-10
  created_at: string;
  updated_at: string;
};

export type Habit = {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  category: 'health' | 'fitness' | 'learning' | 'meditation' | 'reading' | 'general';
  color: string;
  frequency: 'daily' | 'weekly' | 'custom';
  icon?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type HabitLog = {
  id: string;
  habit_id: string;
  user_id: string;
  log_date: string; // ISO date format
  completed: boolean;
  notes?: string;
  created_at: string;
};

export type HabitWithStreak = Habit & {
  streak: number;
  lastLogged?: string;
  completionThisWeek: number;
  completionThisMonth: number;
};
