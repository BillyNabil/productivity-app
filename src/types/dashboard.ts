// Dashboard Widget types
export interface DashboardWidget {
  id: string;
  type: 'today_goals' | 'upcoming_tasks' | 'weather' | 'calendar' | 'productivity_stats' | 'focus_time';
  position: number;
  size: 'small' | 'medium' | 'large'; // grid size
  is_visible: boolean;
  settings?: Record<string, unknown>;
}

export interface DashboardLayout {
  user_id: string;
  widgets: DashboardWidget[];
  grid_columns: number; // responsive grid
  updated_at: string;
}

export interface TodayStats {
  total_goals: number;
  completed_goals: number;
  upcoming_tasks: number;
  overdue_tasks: number;
  focus_time_today: number; // minutes
}

export interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
  humidity: number;
}
