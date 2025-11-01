// Recurring Tasks types
export interface RecurrencePattern {
  // For weekly: array of day numbers (0-6)
  days?: number[];
  // For monthly: day of month (1-31) or 'last_day'
  day_of_month?: number | 'last_day';
  // Custom interval (e.g., every 2 weeks)
  interval?: number;
}

export interface RecurringTask {
  id: string;
  user_id: string;
  parent_task_id: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  recurrence_pattern: RecurrencePattern;
  start_date: string; // DATE format YYYY-MM-DD
  end_date: string | null;
  last_generated_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateRecurringTaskInput {
  parent_task_id: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  recurrence_pattern: RecurrencePattern;
  start_date: string;
  end_date?: string | null;
}

export interface UpdateRecurringTaskInput {
  frequency?: 'daily' | 'weekly' | 'monthly' | 'custom';
  recurrence_pattern?: RecurrencePattern;
  end_date?: string | null;
  is_active?: boolean;
}
