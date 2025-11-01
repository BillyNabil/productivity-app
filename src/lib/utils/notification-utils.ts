import { NotificationPayload } from '@/types/reminder';

/**
 * Request permission for browser notifications
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Check if browser notifications are supported and enabled
 */
export function isNotificationEnabled(): boolean {
  return 'Notification' in window && Notification.permission === 'granted';
}

/**
 * Send a browser notification
 */
export function sendNotification(payload: NotificationPayload): Notification | null {
  if (!isNotificationEnabled()) {
    console.log('Notifications not enabled');
    return null;
  }

  try {
    return new Notification(payload.title, {
      body: payload.body,
      tag: payload.tag,
      badge: '/icon-notification.png',
      ...payload.options,
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    return null;
  }
}

/**
 * Send task reminder notification
 */
export function sendTaskReminder(
  taskTitle: string,
  dueDate: Date,
  taskId: string
): Notification | null {
  const timeUntilDue = formatTimeUntilDue(dueDate);

  return sendNotification({
    title: '⏰ Task Reminder',
    body: `${taskTitle} is due ${timeUntilDue}`,
    tag: `task-reminder-${taskId}`,
    data: {
      task_id: taskId,
      action_url: `/dashboard?task=${taskId}`,
    },
  });
}

/**
 * Format time until due date
 */
export function formatTimeUntilDue(dueDate: Date): string {
  const now = new Date();
  const diff = dueDate.getTime() - now.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `in ${days} day${days > 1 ? 's' : ''}`;
  }

  if (hours > 0) {
    return `in ${hours} hour${hours > 1 ? 's' : ''}`;
  }

  if (minutes > 0) {
    return `in ${minutes} minute${minutes > 1 ? 's' : ''}`;
  }

  return 'now';
}

/**
 * Setup service worker for background notifications
 */
export async function setupNotificationServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Workers not supported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered:', registration);
  } catch (error) {
    console.error('Service Worker registration failed:', error);
  }
}

/**
 * Schedule a notification for a specific time
 */
export function scheduleNotification(
  title: string,
  body: string,
  scheduledTime: Date,
  taskId: string
): NodeJS.Timeout | null {
  const now = new Date();
  const delay = scheduledTime.getTime() - now.getTime();

  if (delay <= 0) {
    // Notification time has passed, send immediately
    sendTaskReminder(title, scheduledTime, taskId);
    return null;
  }

  return setTimeout(() => {
    sendTaskReminder(title, scheduledTime, taskId);
  }, delay);
}
