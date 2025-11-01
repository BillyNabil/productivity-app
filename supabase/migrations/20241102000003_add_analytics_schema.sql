-- Analytics Events Table (Track all user activities)
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'task_created', 'task_completed', 'task_started', 'task_updated',
    'pomodoro_started', 'pomodoro_completed', 'focus_mode_started', 'focus_mode_ended',
    'note_created', 'note_updated',
    'habit_completed',
    'daily_goals_completed'
  )),
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  metadata JSONB, -- Store additional data (e.g., duration, quadrant, etc.)
  duration_minutes INTEGER, -- For timed events
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aggregated Daily Stats (For faster queries)
CREATE TABLE daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stats_date DATE NOT NULL,
  tasks_completed INTEGER DEFAULT 0,
  tasks_created INTEGER DEFAULT 0,
  total_focus_time INTEGER DEFAULT 0, -- in minutes
  pomodoros_completed INTEGER DEFAULT 0,
  habits_completed INTEGER DEFAULT 0,
  daily_goals_completed BOOLEAN DEFAULT false,
  peak_hour INTEGER, -- Hour (0-23) with most activity
  quadrant_distribution JSONB, -- {urgent-important: 5, not-urgent-important: 3, ...}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, stats_date)
);

-- Monthly Insights (For trend analysis)
CREATE TABLE monthly_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month_year DATE NOT NULL, -- First day of month
  total_tasks_completed INTEGER DEFAULT 0,
  avg_completion_rate NUMERIC(5,2) DEFAULT 0, -- percentage
  avg_time_per_task INTEGER DEFAULT 0, -- in minutes
  total_focus_time INTEGER DEFAULT 0,
  estimated_vs_actual JSONB, -- {estimated: X, actual: Y}
  most_productive_day TEXT, -- 'Monday', 'Tuesday', etc.
  most_productive_hour INTEGER,
  habit_completion_rate NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month_year)
);

-- Productivity Streaks
CREATE TABLE productivity_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  streak_type TEXT CHECK (streak_type IN ('habit', 'daily_goals', 'focus_time')),
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_completed_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, streak_type)
);

-- Indexes for performance
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_user_date ON analytics_events(user_id, created_at);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_daily_stats_user_id ON daily_stats(user_id);
CREATE INDEX idx_daily_stats_date ON daily_stats(stats_date);
CREATE INDEX idx_monthly_insights_user_id ON monthly_insights(user_id);
CREATE INDEX idx_monthly_insights_month ON monthly_insights(month_year);
CREATE INDEX idx_productivity_streaks_user_id ON productivity_streaks(user_id);

-- Row Level Security (RLS)
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE productivity_streaks ENABLE ROW LEVEL SECURITY;

-- Analytics Events policies
CREATE POLICY "Users can view their own analytics events"
  ON analytics_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analytics events"
  ON analytics_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Daily Stats policies
CREATE POLICY "Users can view their own daily stats"
  ON daily_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own daily stats"
  ON daily_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily stats"
  ON daily_stats FOR UPDATE
  USING (auth.uid() = user_id);

-- Monthly Insights policies
CREATE POLICY "Users can view their own monthly insights"
  ON monthly_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own monthly insights"
  ON monthly_insights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own monthly insights"
  ON monthly_insights FOR UPDATE
  USING (auth.uid() = user_id);

-- Productivity Streaks policies
CREATE POLICY "Users can view their own streaks"
  ON productivity_streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own streaks"
  ON productivity_streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks"
  ON productivity_streaks FOR UPDATE
  USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_daily_stats_updated_at BEFORE UPDATE ON daily_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monthly_insights_updated_at BEFORE UPDATE ON monthly_insights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_productivity_streaks_updated_at BEFORE UPDATE ON productivity_streaks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
