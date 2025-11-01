import { RecurringTask, RecurrencePattern } from '@/types/recurring-task';
import { Task } from '@/types/task';

/**
 * Generate next occurrence date based on recurrence pattern
 */
export function getNextOccurrence(
  lastDate: Date,
  frequency: 'daily' | 'weekly' | 'monthly',
  pattern: RecurrencePattern
): Date {
  const next = new Date(lastDate);

  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;

    case 'weekly': {
      const days = pattern.days || [lastDate.getDay()];
      const nextDays = days.filter((day) => day > lastDate.getDay());

      if (nextDays.length > 0) {
        // Same week
        next.setDate(next.getDate() + (nextDays[0] - lastDate.getDay()));
      } else {
        // Next week
        next.setDate(next.getDate() + (7 - lastDate.getDay() + days[0]));
      }
      break;
    }

    case 'monthly': {
      const dayOfMonth = pattern.day_of_month;

      if (dayOfMonth === 'last_day') {
        const nextMonth = new Date(lastDate.getFullYear(), lastDate.getMonth() + 2, 0);
        next.setFullYear(nextMonth.getFullYear());
        next.setMonth(nextMonth.getMonth());
        next.setDate(nextMonth.getDate());
      } else if (typeof dayOfMonth === 'number') {
        next.setMonth(next.getMonth() + 1);
        next.setDate(Math.min(dayOfMonth, new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()));
      }
      break;
    }
  }

  return next;
}

/**
 * Check if recurring task should be generated for today
 */
export function shouldGenerateToday(
  recurringTask: RecurringTask,
  today: Date
): boolean {
  const startDate = new Date(recurringTask.start_date);
  const endDate = recurringTask.end_date ? new Date(recurringTask.end_date) : null;
  const lastGenerated = recurringTask.last_generated_date
    ? new Date(recurringTask.last_generated_date)
    : null;

  // Check if within date range
  if (today < startDate) return false;
  if (endDate && today > endDate) return false;

  // Check if never generated or was generated on a different day
  if (!lastGenerated || !isSameDay(lastGenerated, today)) {
    return true;
  }

  return false;
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Format recurring task for display
 */
export function formatRecurrence(
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom',
  pattern: RecurrencePattern
): string {
  switch (frequency) {
    case 'daily':
      return 'Every day';

    case 'weekly': {
      const days = pattern.days || [];
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayStrings = days.map((d) => dayNames[d]);
      return `Every week on ${dayStrings.join(', ')}`;
    }

    case 'monthly': {
      const dayOfMonth = pattern.day_of_month;
      if (dayOfMonth === 'last_day') {
        return 'Last day of every month';
      }
      return `Every month on day ${dayOfMonth}`;
    }

    default:
      return 'Custom';
  }
}
