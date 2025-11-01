'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface CreateReminderFormProps {
  taskId: string;
  taskTitle: string;
  dueDate?: string;
  onSubmit: (data: { task_id: string; reminder_type: string; reminder_time: number; notification_method?: string }) => Promise<void>;
  isLoading?: boolean;
}

const REMINDER_PRESETS = [
  { label: '5 minutes before', value: 5 },
  { label: '15 minutes before', value: 15 },
  { label: '30 minutes before', value: 30 },
  { label: '1 hour before', value: 60 },
  { label: '1 day before', value: 1440 },
  { label: '2 days before', value: 2880 },
];

const NOTIFICATION_METHODS = [
  { value: 'browser', label: '🔔 Browser Notification' },
  { value: 'email', label: '📧 Email' },
  { value: 'all', label: '📢 All Methods' },
];

export function CreateReminderForm({
  taskId,
  taskTitle,
  dueDate,
  onSubmit,
  isLoading = false,
}: CreateReminderFormProps) {
  const [reminderTime, setReminderTime] = useState(30);
  const [notificationMethod, setNotificationMethod] = useState('browser');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (dueDate) {
      await onSubmit({
        task_id: taskId,
        reminder_type: 'deadline',
        reminder_time: reminderTime,
        notification_method: notificationMethod,
      });
      setReminderTime(30);
      setNotificationMethod('browser');
      setIsExpanded(false);
    }
  };

  if (!dueDate) {
    return (
      <div className="p-3 rounded-lg bg-black-100 border border-gray-400 text-gray-600">
        <p>⚠️ Task must have a due date to set a reminder</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="p-4 rounded-lg border-2 border-yellow-300 bg-yellow-50">
        <h4 className="font-bold mb-2">🔔 Set Reminder</h4>

        {!isExpanded ? (
          <Button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            Add Reminder
          </Button>
        ) : (
          <>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-2">
                Minutes Before Due Date
              </label>
              
              {/* Quick presets */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                {REMINDER_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setReminderTime(preset.value)}
                    className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                      reminderTime === preset.value
                        ? 'bg-yellow-600 text-white'
                        : 'bg-white border border-yellow-300 hover:bg-yellow-100'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Custom input */}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="10080"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(parseInt(e.target.value) || 30)}
                  className="flex-1 px-2 py-1 border rounded"
                  placeholder="Custom minutes"
                />
                <span className="text-sm text-gray-600">minutes</span>
              </div>
              <small className="text-gray-600 mt-1 block">
                {reminderTime === 60
                  ? '1 hour before'
                  : reminderTime === 1440
                    ? '1 day before'
                    : reminderTime === 2880
                      ? '2 days before'
                      : `${reminderTime} minutes before`}
              </small>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-2">
                Notification Method
              </label>
              <div className="space-y-2">
                {NOTIFICATION_METHODS.map((method) => (
                  <label key={method.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="notification_method"
                      value={method.value}
                      checked={notificationMethod === method.value}
                      onChange={(e) => setNotificationMethod(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{method.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                {isLoading ? 'Setting...' : 'Set Reminder'}
              </Button>
              <Button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="bg-black-500 hover:bg-black-600 text-white"
              >
                Cancel
              </Button>
            </div>
          </>
        )}
      </div>
    </form>
  );
}
