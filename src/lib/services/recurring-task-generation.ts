import { createClient } from '@/lib/supabase/client';
import { recurringTasksService } from '@/lib/supabase/recurring-tasks-service';
import {
  getNextOccurrence,
  shouldGenerateToday,
} from '@/lib/utils/recurring-task-utils';
import { RecurringTask } from '@/types/recurring-task';
import { Task } from '@/types/task';

/**
 * Generate tasks for all active recurring tasks that need generation today
 * Should be called daily, typically in a server-side cron job
 */
export async function generateRecurringTasks(): Promise<{
  success: boolean;
  generatedCount: number;
  errors: Array<{ recurringTaskId: string; error: string }>;
}> {
  const errors: Array<{ recurringTaskId: string; error: string }> = [];
  let generatedCount = 0;

  try {
    // Get all recurring tasks that need generation
    const recurringTasks = await recurringTasksService.getRecurringTasksNeedingGeneration();

    for (const recurringTask of recurringTasks) {
      try {
        // Get the parent task template
        const parentTask = await getParentTask(recurringTask.parent_task_id);
        if (!parentTask) {
          throw new Error('Parent task not found');
        }

        // Check if should generate today
        const today = new Date();
        if (!shouldGenerateToday(recurringTask, today)) {
          continue;
        }

        // Create new task instance
        const newTask = {
          user_id: parentTask.user_id,
          title: parentTask.title,
          description: parentTask.description,
          is_urgent: parentTask.is_urgent,
          is_important: parentTask.is_important,
          estimated_duration: parentTask.estimated_duration,
          status: 'pending' as const,
          tags: parentTask.tags,
          color: parentTask.color,
          due_date: getNextDueDate(recurringTask, today).toISOString(),
        };

        // Insert the new task
        const supabase = createClient();
        const { error: insertError } = await supabase
          .from('tasks')
          .insert([newTask]);

        if (insertError) {
          throw new Error(`Failed to insert task: ${insertError.message}`);
        }
        generatedCount++;

        // Update last_generated_date
        const todayStr = today.toISOString().split('T')[0];
        await recurringTasksService.updateLastGeneratedDate(recurringTask.id, todayStr);
      } catch (error) {
        errors.push({
          recurringTaskId: recurringTask.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      success: errors.length === 0,
      generatedCount,
      errors,
    };
  } catch (error) {
    console.error('Error generating recurring tasks:', error);
    return {
      success: false,
      generatedCount: 0,
      errors: [
        {
          recurringTaskId: 'general',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      ],
    };
  }
}

/**
 * Get parent task details
 */
async function getParentTask(taskId: string): Promise<Task | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single();

  if (error) {
    console.error('Error fetching parent task:', error);
    return null;
  }

  return data as Task;
}

/**
 * Calculate next due date for recurring task
 */
function getNextDueDate(recurringTask: RecurringTask, today: Date): Date {
  // If last_generated_date exists, calculate from that
  const baseDate = recurringTask.last_generated_date
    ? new Date(recurringTask.last_generated_date)
    : new Date(recurringTask.start_date);

  const nextDate = getNextOccurrence(
    baseDate,
    recurringTask.frequency as 'daily' | 'weekly' | 'monthly',
    recurringTask.recurrence_pattern
  );

  // Preserve time from original due_date if exists
  // For now, set to start of day
  nextDate.setHours(0, 0, 0, 0);

  return nextDate;
}

/**
 * API endpoint untuk trigger recurring task generation
 * Gunakan ini di server-side job atau API route
 */
export async function generateRecurringTasksAPI() {
  return generateRecurringTasks();
}

/**
 * Clean up old completed recurring task instances (optional maintenance)
 */
export async function cleanupCompletedRecurringTasks(olderThanDays: number = 30): Promise<void> {
  const supabase = createClient();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('status', 'completed')
    .lt('updated_at', cutoffDate.toISOString())
    .not('id', 'in', `(SELECT parent_task_id FROM recurring_tasks)`);

  if (error) {
    console.error('Error cleaning up completed tasks:', error);
  }
}
