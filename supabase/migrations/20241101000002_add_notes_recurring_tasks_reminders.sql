-- Notes Table (for task documentation)
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  project_id TEXT, -- for future project support
  title TEXT NOT NULL,
  content TEXT NOT NULL, -- markdown content
  is_pinned BOOLEAN DEFAULT false,
  color TEXT DEFAULT '#FFFFFF',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recurring Tasks Table
CREATE TABLE recurring_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'custom')),
  -- For weekly: array of day numbers (0-6, where 0 is Sunday)
  -- For monthly: day of month (1-31) or 'last_day'
  recurrence_pattern JSONB NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE, -- NULL means no end date
  last_generated_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Reminders Table
CREATE TABLE task_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  reminder_type TEXT DEFAULT 'deadline' CHECK (reminder_type IN ('deadline', 'custom')),
  -- reminder_time is minutes before the due_date
  reminder_time INTEGER DEFAULT 30, 
  scheduled_time TIMESTAMPTZ NOT NULL,
  is_sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Notification Settings
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS browser_notifications_enabled BOOLEAN DEFAULT true;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS reminder_time INTEGER DEFAULT 30; -- minutes before deadline
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS notification_sound_enabled BOOLEAN DEFAULT true;

-- Indexes for performance
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_task_id ON notes(task_id);
CREATE INDEX idx_notes_created_at ON notes(created_at);
CREATE INDEX idx_recurring_tasks_user_id ON recurring_tasks(user_id);
CREATE INDEX idx_recurring_tasks_parent_task_id ON recurring_tasks(parent_task_id);
CREATE INDEX idx_recurring_tasks_active ON recurring_tasks(is_active);
CREATE INDEX idx_task_reminders_user_id ON task_reminders(user_id);
CREATE INDEX idx_task_reminders_task_id ON task_reminders(task_id);
CREATE INDEX idx_task_reminders_scheduled_time ON task_reminders(scheduled_time);
CREATE INDEX idx_task_reminders_is_sent ON task_reminders(is_sent);

-- Row Level Security (RLS)
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_reminders ENABLE ROW LEVEL SECURITY;

-- Notes policies
CREATE POLICY "Users can view their own notes"
  ON notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notes"
  ON notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
  ON notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
  ON notes FOR DELETE
  USING (auth.uid() = user_id);

-- Recurring Tasks policies
CREATE POLICY "Users can view their own recurring tasks"
  ON recurring_tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recurring tasks"
  ON recurring_tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurring tasks"
  ON recurring_tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recurring tasks"
  ON recurring_tasks FOR DELETE
  USING (auth.uid() = user_id);

-- Task Reminders policies
CREATE POLICY "Users can view their own reminders"
  ON task_reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reminders"
  ON task_reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders"
  ON task_reminders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders"
  ON task_reminders FOR DELETE
  USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_tasks_updated_at BEFORE UPDATE ON recurring_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_reminders_updated_at BEFORE UPDATE ON task_reminders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
