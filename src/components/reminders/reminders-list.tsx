'use client';

import React, { useEffect, useState } from 'react';
import { useReminders } from '@/lib/hooks/use-reminders';
import { ReminderCard } from './reminder-card';
import { Clock, AlertCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface RemindersListProps {
  taskId?: string;
}

export function RemindersList({ taskId }: RemindersListProps) {
  const { reminders, dueReminders, isLoading, error, deleteReminder } = useReminders();
  const [filteredReminders, setFilteredReminders] = useState(reminders);

  useEffect(() => {
    if (taskId) {
      setFilteredReminders(reminders.filter((r) => r.task_id === taskId));
    } else {
      setFilteredReminders(reminders);
    }
  }, [reminders, taskId]);

  if (isLoading) {
    return <div className="text-center py-4">Loading reminders...</div>;
  }

  if (error) {
    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Reminders
        </h3>
        <div className="p-4 bg-red-100 border-2 border-red-500 rounded text-red-700">
          <p className="font-semibold mb-1">Failed to load reminders</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const dueCount = dueReminders.length;

  return (
    <div className="w-full">
      {dueCount > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-orange-100 border-2 border-orange-500 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-900 shrink-0" />
          <p className="font-bold text-orange-900">
            {dueCount} reminder{dueCount !== 1 ? 's' : ''} due now!
          </p>
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5 text-white" />
          <span className="text-white">Reminders</span>
        </h3>
        <Link href="/reminders">
          <Button 
            size="sm"
            className="bg-white text-black hover:bg-blue-100 gap-1"
          >
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </Link>
      </div>

      {filteredReminders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No reminders set yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredReminders.map((reminder) => (
            <ReminderCard
              key={reminder.id}
              reminder={reminder}
              onDelete={deleteReminder}
            />
          ))}
        </div>
      )}
    </div>
  );
}
