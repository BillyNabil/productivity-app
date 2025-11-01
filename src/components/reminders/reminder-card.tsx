'use client';

import React from 'react';
import { TaskReminder } from '@/types/reminder';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface ReminderCardProps {
  reminder: TaskReminder;
  onDelete: (id: string) => void;
}

export function ReminderCard({ reminder, onDelete }: ReminderCardProps) {
  const scheduledDate = new Date(reminder.scheduled_time);
  const now = new Date();
  const isUpcoming = scheduledDate > now;

  return (
    <div
      className={`p-3 rounded-lg border-2 ${
        reminder.is_sent
          ? 'border-gray-400 bg-black-100'
          : isUpcoming
            ? 'border-blue-400 bg-blue-50'
            : 'border-orange-400 bg-orange-50'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-semibold flex items-center gap-2">
            {isUpcoming ? (
              <Clock className="w-5 h-5" />
            ) : reminder.is_sent ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            Task Reminder
          </p>
          <p className="text-sm text-gray-600">
            {reminder.reminder_type === 'deadline' ? 'Before deadline' : 'Custom reminder'}
          </p>
        </div>
        <Button
          onClick={() => onDelete(reminder.id)}
          className="text-sm bg-red-500 hover:bg-red-600 px-2 py-1"
        >
          Delete
        </Button>
      </div>

      <div className="text-sm">
        <p>
          <strong>Scheduled:</strong> {scheduledDate.toLocaleString()}
        </p>
        <p>
          <strong>Time Before Due:</strong> {reminder.reminder_time} minutes
        </p>
        {reminder.sent_at && (
          <p>
            <strong>Sent At:</strong> {new Date(reminder.sent_at).toLocaleString()}
          </p>
        )}
      </div>

      <div className="mt-2">
        <span
          className={`text-xs px-2 py-1 rounded ${
            reminder.is_sent
              ? 'bg-black-500 text-white'
              : isUpcoming
                ? 'bg-blue-500 text-white'
                : 'bg-orange-500 text-white'
          }`}
        >
          {reminder.is_sent ? 'Sent' : isUpcoming ? 'Upcoming' : 'Due'}
        </span>
      </div>
    </div>
  );
}
