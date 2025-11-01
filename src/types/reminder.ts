// Task Reminders & Notifications types
export interface TaskReminder {
  id: string;
  user_id: string;
  task_id: string;
  reminder_type: 'deadline' | 'custom';
  reminder_time: number; // minutes before due_date
  scheduled_time: string; // ISO timestamp
  is_sent: boolean;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateReminderInput {
  task_id: string;
  reminder_type?: 'deadline' | 'custom';
  reminder_time?: number; // minutes before due_date (default 30)
}

export interface NotificationPayload {
  title: string;
  body: string;
  tag: string; // unique identifier
  data: {
    task_id: string;
    action_url: string;
  };
  options?: NotificationOptions;
}
