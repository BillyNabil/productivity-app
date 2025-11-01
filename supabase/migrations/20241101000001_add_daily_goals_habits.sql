-- Daily Goals Table (Big 3 - daily standup)
CREATE TABLE daily_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal_date DATE NOT NULL,
  goal_1 TEXT NOT NULL,
  goal_2 TEXT NOT NULL,
  goal_3 TEXT NOT NULL,
  goal_1_completed BOOLEAN DEFAULT false,
  goal_2_completed BOOLEAN DEFAULT false,
  goal_3_completed BOOLEAN DEFAULT false,
  reflection TEXT, -- end of day reflection
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10), -- 1-10
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, goal_date)
);

-- Habits Table
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general' CHECK (category IN ('health', 'fitness', 'learning', 'meditation', 'reading', 'general')),
  color TEXT DEFAULT '#3B82F6',
  frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'custom')),
  icon TEXT, -- emoji or icon name
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habit Logs Table (daily tracking)
CREATE TABLE habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  log_date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(habit_id, log_date)
);

-- Indexes for performance
CREATE INDEX idx_daily_goals_user_id ON daily_goals(user_id);
CREATE INDEX idx_daily_goals_date ON daily_goals(goal_date);
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX idx_habit_logs_user_id ON habit_logs(user_id);
CREATE INDEX idx_habit_logs_date ON habit_logs(log_date);

-- Row Level Security (RLS)

-- Enable RLS
ALTER TABLE daily_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

-- Daily Goals policies
CREATE POLICY "Users can view their own daily goals"
  ON daily_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own daily goals"
  ON daily_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily goals"
  ON daily_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily goals"
  ON daily_goals FOR DELETE
  USING (auth.uid() = user_id);

-- Habits policies
CREATE POLICY "Users can view their own habits"
  ON habits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own habits"
  ON habits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits"
  ON habits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits"
  ON habits FOR DELETE
  USING (auth.uid() = user_id);

-- Habit Logs policies
CREATE POLICY "Users can view their own habit logs"
  ON habit_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own habit logs"
  ON habit_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habit logs"
  ON habit_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habit logs"
  ON habit_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_daily_goals_updated_at BEFORE UPDATE ON daily_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON habits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
