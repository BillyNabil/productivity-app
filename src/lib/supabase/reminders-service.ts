import { createClient } from './client';
import { TaskReminder, CreateReminderInput } from '@/types/reminder';

// Validate Supabase client initialization
function validateClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error(
      'Supabase configuration missing. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
    );
  }
}

export const remindersService = {
  // Create a reminder for a task
  async createReminder(input: CreateReminderInput): Promise<TaskReminder> {
    validateClient();
    const supabase = createClient();
    // Get the task to know its due_date
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('due_date')
      .eq('id', input.task_id)
      .single();

    if (taskError) {
      console.error('Supabase error fetching task:', taskError);
      throw new Error(`Failed to fetch task: ${taskError.message}`);
    }
    if (!task?.due_date) {
      throw new Error('Task not found or has no due date');
    }

    const reminderTime = input.reminder_time || 30; // default 30 minutes
    const dueDate = new Date(task.due_date);
    const scheduledTime = new Date(dueDate.getTime() - reminderTime * 60000);

    const { data, error } = await supabase
      .from('task_reminders')
      .insert([
        {
          task_id: input.task_id,
          reminder_type: input.reminder_type || 'deadline',
          reminder_time: reminderTime,
          scheduled_time: scheduledTime.toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating reminder:', error);
      throw new Error(`Failed to create reminder: ${error.message}`);
    }
    return data as TaskReminder;
  },

  // Get all reminders for user
  async getReminders(): Promise<TaskReminder[]> {
    validateClient();
    const supabase = createClient();
    const { data, error } = await supabase
      .from('task_reminders')
      .select('*')
      .eq('is_sent', false)
      .order('scheduled_time', { ascending: true });

    if (error) {
      console.error('Supabase error fetching reminders:', error);
      throw new Error(`Failed to fetch reminders: ${error.message}`);
    }
    return data as TaskReminder[];
  },

  // Get reminders for a specific task
  async getRemindersByTask(taskId: string): Promise<TaskReminder[]> {
    validateClient();
    const supabase = createClient();
    const { data, error } = await supabase
      .from('task_reminders')
      .select('*')
      .eq('task_id', taskId)
      .order('scheduled_time', { ascending: true });

    if (error) {
      console.error('Supabase error fetching reminders by task:', error);
      throw new Error(`Failed to fetch reminders for task: ${error.message}`);
    }
    return data as TaskReminder[];
  },

  // Get reminders that are due to be sent (scheduled_time <= now)
  async getDueReminders(): Promise<TaskReminder[]> {
    validateClient();
    const supabase = createClient();
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('task_reminders')
      .select('*')
      .eq('is_sent', false)
      .lte('scheduled_time', now)
      .order('scheduled_time', { ascending: true });

    if (error) {
      console.error('Supabase error fetching due reminders:', error);
      throw new Error(`Failed to fetch due reminders: ${error.message}`);
    }
    return data as TaskReminder[];
  },

  // Mark reminder as sent
  async markAsSent(reminderId: string): Promise<TaskReminder> {
    validateClient();
    const supabase = createClient();
    const { data, error } = await supabase
      .from('task_reminders')
      .update({
        is_sent: true,
        sent_at: new Date().toISOString(),
      })
      .eq('id', reminderId)
      .select()
      .single();

    if (error) {
      console.error('Supabase error marking reminder as sent:', error);
      throw new Error(`Failed to mark reminder as sent: ${error.message}`);
    }
    return data as TaskReminder;
  },

  // Delete a reminder
  async deleteReminder(reminderId: string): Promise<void> {
    validateClient();
    const supabase = createClient();
    const { error } = await supabase
      .from('task_reminders')
      .delete()
      .eq('id', reminderId);

    if (error) {
      console.error('Supabase error deleting reminder:', error);
      throw new Error(`Failed to delete reminder: ${error.message}`);
    }
  },

  // Delete all reminders for a task
  async deleteRemindersByTask(taskId: string): Promise<void> {
    validateClient();
    const supabase = createClient();
    const { error } = await supabase
      .from('task_reminders')
      .delete()
      .eq('task_id', taskId);

    if (error) {
      console.error('Supabase error deleting reminders by task:', error);
      throw new Error(`Failed to delete reminders for task: ${error.message}`);
    }
  },
};
