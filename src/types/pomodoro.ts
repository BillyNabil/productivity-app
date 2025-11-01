export type SessionType = 'work' | 'short_break' | 'long_break';

export interface PomodoroSession {
  id: string;
  task_id?: string;
  user_id: string;
  start_time: string;
  end_time?: string;
  duration: number; // in minutes
  session_type: SessionType;
  completed: boolean;
  interruptions: number;
  created_at: string;
}

export interface CreatePomodoroSessionInput {
  task_id?: string;
  duration: number;
  session_type: SessionType;
}

export interface PomodoroSettings {
  work_duration: number;
  short_break_duration: number;
  long_break_duration: number;
  sessions_until_long_break: number;
}

export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  currentTime: number; // seconds remaining
  totalTime: number; // total seconds
  sessionType: SessionType;
  sessionCount: number;
  currentTaskId?: string;
}
