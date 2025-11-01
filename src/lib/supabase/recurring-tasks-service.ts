import { createClient } from './client';
import {
  RecurringTask,
  CreateRecurringTaskInput,
  UpdateRecurringTaskInput,
} from '@/types/recurring-task';

// Validate Supabase client initialization
function validateClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error(
      'Supabase configuration missing. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
    );
  }
}

export const recurringTasksService = {
  // Create a recurring task
  async createRecurringTask(input: CreateRecurringTaskInput): Promise<RecurringTask> {
    validateClient();
    const supabase = createClient();
    const { data, error } = await supabase
      .from('recurring_tasks')
      .insert([
        {
          parent_task_id: input.parent_task_id,
          frequency: input.frequency,
          recurrence_pattern: input.recurrence_pattern,
          start_date: input.start_date,
          end_date: input.end_date || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating recurring task:', error);
      throw new Error(`Failed to create recurring task: ${error.message}`);
    }
    return data as RecurringTask;
  },

  // Get all recurring tasks for user
  async getRecurringTasks(): Promise<RecurringTask[]> {
    validateClient();
    const supabase = createClient();
    const { data, error } = await supabase
      .from('recurring_tasks')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error fetching recurring tasks:', error);
      throw new Error(`Failed to fetch recurring tasks: ${error.message}`);
    }
    return data as RecurringTask[];
  },

  // Get a specific recurring task
  async getRecurringTask(id: string): Promise<RecurringTask> {
    validateClient();
    const supabase = createClient();
    const { data, error } = await supabase
      .from('recurring_tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase error fetching recurring task:', error);
      throw new Error(`Failed to fetch recurring task: ${error.message}`);
    }
    return data as RecurringTask;
  },

  // Update a recurring task
  async updateRecurringTask(
    id: string,
    input: UpdateRecurringTaskInput
  ): Promise<RecurringTask> {
    validateClient();
    const supabase = createClient();
    const { data, error } = await supabase
      .from('recurring_tasks')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error updating recurring task:', error);
      throw new Error(`Failed to update recurring task: ${error.message}`);
    }
    return data as RecurringTask;
  },

  // Deactivate a recurring task
  async deactivateRecurringTask(id: string): Promise<RecurringTask> {
    validateClient();
    const supabase = createClient();
    const { data, error } = await supabase
      .from('recurring_tasks')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error deactivating recurring task:', error);
      throw new Error(`Failed to deactivate recurring task: ${error.message}`);
    }
    return data as RecurringTask;
  },

  // Delete a recurring task
  async deleteRecurringTask(id: string): Promise<void> {
    validateClient();
    const supabase = createClient();
    const { error } = await supabase.from('recurring_tasks').delete().eq('id', id);

    if (error) {
      console.error('Supabase error deleting recurring task:', error);
      throw new Error(`Failed to delete recurring task: ${error.message}`);
    }
  },

  // Update last generated date
  async updateLastGeneratedDate(id: string, date: string): Promise<void> {
    validateClient();
    const supabase = createClient();
    const { error } = await supabase
      .from('recurring_tasks')
      .update({ last_generated_date: date })
      .eq('id', id);

    if (error) {
      console.error('Supabase error updating last generated date:', error);
      throw new Error(`Failed to update last generated date: ${error.message}`);
    }
  },

  // Get recurring tasks that need generation today
  async getRecurringTasksNeedingGeneration(): Promise<RecurringTask[]> {
    validateClient();
    const supabase = createClient();
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('recurring_tasks')
      .select('*')
      .eq('is_active', true)
      .or(`last_generated_date.is.null,last_generated_date.lt.${today}`)
      .lte('start_date', today)
      .or(`end_date.is.null,end_date.gte.${today}`);

    if (error) {
      console.error('Supabase error fetching recurring tasks needing generation:', error);
      throw new Error(`Failed to fetch recurring tasks needing generation: ${error.message}`);
    }
    return data as RecurringTask[];
  },
};
