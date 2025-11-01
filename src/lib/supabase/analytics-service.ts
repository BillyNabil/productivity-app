import { createClient } from './client';
import {
  AnalyticsEvent,
  DailyStats,
  MonthlyInsights,
  ProductivityStreak,
  EventType,
} from '@/types/analytics';

// Helper to get authenticated user
async function getAuthenticatedUserId(): Promise<string> {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error('User not authenticated');
  }
  return user.id;
}

export const analyticsService = {
  // Track event
  async trackEvent(
    eventType: EventType,
    taskId?: string,
    metadata?: Record<string, unknown>,
    durationMinutes?: number
  ): Promise<AnalyticsEvent> {
    try {
      const supabase = createClient();
      
      // Get current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('analytics_events')
        .insert([
          {
            user_id: user.id,
            event_type: eventType,
            task_id: taskId,
            metadata,
            duration_minutes: durationMinutes,
          },
        ])
        .select()
        .single();

      if (error) {
        const errorMsg = error.message || JSON.stringify(error);
        console.error('Analytics event error:', errorMsg, {
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        throw new Error(`Failed to track event "${eventType}": ${errorMsg}`);
      }
      return data as AnalyticsEvent;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : JSON.stringify(err);
      console.error('Error in trackEvent:', errorMsg);
      throw err;
    }
  },

  // Get analytics events for user (with date range)
  async getEvents(
    startDate?: string,
    endDate?: string,
    limit: number = 100
  ): Promise<AnalyticsEvent[]> {
    const supabase = createClient();
    let query = supabase.from('analytics_events').select('*');

    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as AnalyticsEvent[];
  },

  // Get daily stats
  async getDailyStats(date: string): Promise<DailyStats | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('daily_stats')
      .select('*')
      .eq('user_id', user.id)
      .eq('stats_date', date)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching daily stats:', error);
      throw error;
    }
    return (data as DailyStats) || null;
  },

  // Get stats for date range
  async getStatsByDateRange(startDate: string, endDate: string): Promise<DailyStats[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('daily_stats')
      .select('*')
      .eq('user_id', user.id)
      .gte('stats_date', startDate)
      .lte('stats_date', endDate)
      .order('stats_date', { ascending: true });

    if (error) throw error;
    return data as DailyStats[];
  },

  // Update or create daily stats
  async upsertDailyStats(
    date: string,
    updates: Partial<DailyStats>
  ): Promise<DailyStats> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId();

    const { data, error } = await supabase
      .from('daily_stats')
      .upsert(
        {
          user_id: userId,
          stats_date: date,
          ...updates,
        },
        { onConflict: 'user_id,stats_date' }
      )
      .select()
      .single();

    if (error) throw error;
    return data as DailyStats;
  },

  // Get monthly insights
  async getMonthlyInsights(monthYear: string): Promise<MonthlyInsights | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('monthly_insights')
      .select('*')
      .eq('user_id', user.id)
      .eq('month_year', monthYear)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching monthly insights:', error);
      throw error;
    }
    return (data as MonthlyInsights) || null;
  },

  // Get monthly insights for date range
  async getMonthlyInsightsByRange(
    startMonth: string,
    endMonth: string
  ): Promise<MonthlyInsights[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('monthly_insights')
      .select('*')
      .gte('month_year', startMonth)
      .lte('month_year', endMonth)
      .order('month_year', { ascending: true });

    if (error) throw error;
    return data as MonthlyInsights[];
  },

  // Update monthly insights
  async updateMonthlyInsights(
    monthYear: string,
    updates: Partial<MonthlyInsights>
  ): Promise<MonthlyInsights> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId();

    const { data, error } = await supabase
      .from('monthly_insights')
      .upsert(
        {
          user_id: userId,
          month_year: monthYear,
          ...updates,
        },
        { onConflict: 'user_id,month_year' }
      )
      .select()
      .single();

    if (error) throw error;
    return data as MonthlyInsights;
  },

  // Get productivity streaks
  async getStreaks(): Promise<ProductivityStreak[]> {
    const supabase = createClient();
    const { data, error } = await supabase.from('productivity_streaks').select('*');

    if (error) throw error;
    return data as ProductivityStreak[];
  },

  // Get specific streak
  async getStreak(streakType: 'habit' | 'daily_goals' | 'focus_time'): Promise<ProductivityStreak | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('productivity_streaks')
      .select('*')
      .eq('user_id', user.id)
      .eq('streak_type', streakType)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching streak:', error);
      throw error;
    }
    return (data as ProductivityStreak) || null;
  },

  // Update streak
  async updateStreak(
    streakType: 'habit' | 'daily_goals' | 'focus_time',
    currentStreak: number,
    longestStreak: number
  ): Promise<ProductivityStreak> {
    const supabase = createClient();
    const userId = await getAuthenticatedUserId();
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('productivity_streaks')
      .upsert(
        {
          user_id: userId,
          streak_type: streakType,
          current_streak: currentStreak,
          longest_streak: Math.max(currentStreak, longestStreak),
          last_completed_date: today,
        },
        { onConflict: 'user_id,streak_type' }
      )
      .select()
      .single();

    if (error) throw error;
    return data as ProductivityStreak;
  },

  // Calculate stats from events (for aggregation)
  async calculateDailyStats(date: string): Promise<DailyStats> {
    const supabase = createClient();

    // Get all events for the day
    const startOfDay = `${date}T00:00:00Z`;
    const endOfDay = `${date}T23:59:59Z`;

    const { data: events, error: eventsError } = await supabase
      .from('analytics_events')
      .select('*')
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay);

    if (eventsError) throw eventsError;

    // Aggregate data
    const stats = {
      tasks_completed: events.filter((e) => e.event_type === 'task_completed').length,
      tasks_created: events.filter((e) => e.event_type === 'task_created').length,
      total_focus_time: events
        .filter((e) => e.event_type === 'focus_mode_ended')
        .reduce((sum, e) => sum + (e.duration_minutes || 0), 0),
      pomodoros_completed: events.filter((e) => e.event_type === 'pomodoro_completed').length,
      habits_completed: events.filter((e) => e.event_type === 'habit_completed').length,
      daily_goals_completed: events.some((e) => e.event_type === 'daily_goals_completed'),
    };

    // Save to database
    return this.upsertDailyStats(date, stats);
  },
};
