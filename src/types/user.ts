import { User } from '@supabase/supabase-js';

export type Theme = 'light' | 'dark' | 'system';

export interface UserSettings {
  id: string;
  user_id: string;
  pomodoro_work_duration: number;
  pomodoro_short_break_duration: number;
  pomodoro_long_break_duration: number;
  pomodoro_sessions_until_long_break: number;
  timezone: string;
  calendar_start_hour: number;
  calendar_end_hour: number;
  theme: Theme;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateUserSettingsInput {
  pomodoro_work_duration?: number;
  pomodoro_short_break_duration?: number;
  pomodoro_long_break_duration?: number;
  pomodoro_sessions_until_long_break?: number;
  timezone?: string;
  calendar_start_hour?: number;
  calendar_end_hour?: number;
  theme?: Theme;
  notifications_enabled?: boolean;
}

export interface AuthUser extends User {
  settings?: UserSettings;
}
