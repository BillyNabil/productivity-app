import { create } from 'zustand';
import { TimerState, SessionType, PomodoroSession, CreatePomodoroSessionInput } from '@/types/pomodoro';
import { createClient } from '@/lib/supabase/client';
import { analyticsService } from '@/lib/supabase/analytics-service';

interface TimerStore extends TimerState {
  sessions: PomodoroSession[];
  settings: {
    work_duration: number;
    short_break_duration: number;
    long_break_duration: number;
    sessions_until_long_break: number;
  };
  
  // Actions
  startTimer: (taskId?: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  tick: () => void;
  completeSession: () => Promise<void>;
  fetchSessions: () => Promise<void>;
  updateSettings: (settings: Partial<TimerStore['settings']>) => void;
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  isRunning: false,
  isPaused: false,
  currentTime: 25 * 60, // 25 minutes in seconds
  totalTime: 25 * 60,
  sessionType: 'work',
  sessionCount: 0,
  currentTaskId: undefined,
  sessions: [],
  settings: {
    work_duration: 25,
    short_break_duration: 5,
    long_break_duration: 15,
    sessions_until_long_break: 4,
  },

  startTimer: (taskId?: string) => {
    const { settings, sessionType } = get();
    const duration = 
      sessionType === 'work' 
        ? settings.work_duration 
        : sessionType === 'short_break'
        ? settings.short_break_duration
        : settings.long_break_duration;

    set({
      isRunning: true,
      isPaused: false,
      currentTime: duration * 60,
      totalTime: duration * 60,
      currentTaskId: taskId,
    });

    // Track pomodoro started event
    if (sessionType === 'work') {
      analyticsService.trackEvent('pomodoro_started', taskId);
    }
  },

  pauseTimer: () => {
    set({ isPaused: true, isRunning: false });
  },

  resumeTimer: () => {
    set({ isPaused: false, isRunning: true });
  },

  stopTimer: () => {
    const { settings } = get();
    set({
      isRunning: false,
      isPaused: false,
      currentTime: settings.work_duration * 60,
      totalTime: settings.work_duration * 60,
      currentTaskId: undefined,
    });
  },

  tick: () => {
    const { currentTime, isRunning } = get();
    if (isRunning && currentTime > 0) {
      set({ currentTime: currentTime - 1 });
      
      if (currentTime - 1 === 0) {
        get().completeSession();
      }
    }
  },

  completeSession: async () => {
    const { sessionType, sessionCount, settings, currentTaskId } = get();
    
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const duration = 
          sessionType === 'work' 
            ? settings.work_duration 
            : sessionType === 'short_break'
            ? settings.short_break_duration
            : settings.long_break_duration;

        await supabase.from('pomodoro_sessions').insert([{
          user_id: user.id,
          task_id: currentTaskId,
          start_time: new Date(Date.now() - duration * 60 * 1000).toISOString(),
          end_time: new Date().toISOString(),
          duration,
          session_type: sessionType,
          completed: true,
          interruptions: 0,
        }]);

        // Track pomodoro completed event
        if (sessionType === 'work') {
          await analyticsService.trackEvent('pomodoro_completed', currentTaskId, {}, duration);
        }
      }
    } catch (error) {
      console.error('Failed to save session:', error);
    }

    // Determine next session type
    let nextSessionType: SessionType;
    let nextSessionCount = sessionCount;

    if (sessionType === 'work') {
      nextSessionCount += 1;
      if (nextSessionCount >= settings.sessions_until_long_break) {
        nextSessionType = 'long_break';
        nextSessionCount = 0;
      } else {
        nextSessionType = 'short_break';
      }
    } else {
      nextSessionType = 'work';
    }

    const nextDuration = 
      nextSessionType === 'work' 
        ? settings.work_duration 
        : nextSessionType === 'short_break'
        ? settings.short_break_duration
        : settings.long_break_duration;

    set({
      isRunning: false,
      isPaused: false,
      sessionType: nextSessionType,
      sessionCount: nextSessionCount,
      currentTime: nextDuration * 60,
      totalTime: nextDuration * 60,
      currentTaskId: undefined,
    });

    // Fetch updated sessions
    get().fetchSessions();
  },

  fetchSessions: async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('pomodoro_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      set({ sessions: data || [] });
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  },

  updateSettings: (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
      currentTime: newSettings.work_duration 
        ? newSettings.work_duration * 60 
        : state.currentTime,
      totalTime: newSettings.work_duration 
        ? newSettings.work_duration * 60 
        : state.totalTime,
    }));
  },
}));
