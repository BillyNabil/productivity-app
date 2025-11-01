'use client';

import React, { useState } from 'react';
import { RecurringTask, RecurrencePattern } from '@/types/recurring-task';
import { Button } from '@/components/ui/button';
import { formatRecurrence } from '@/lib/utils/recurring-task-utils';
import { Calendar } from 'lucide-react';

interface RecurringTaskCardProps {
  recurringTask: RecurringTask;
  taskTitle: string;
  onUpdate: (id: string, updates: any) => void;
  onDeactivate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function RecurringTaskCard({
  recurringTask,
  taskTitle,
  onUpdate,
  onDeactivate,
  onDelete,
}: RecurringTaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [endDate, setEndDate] = useState(recurringTask.end_date || '');

  const handleSaveEndDate = () => {
    if (endDate) {
      onUpdate(recurringTask.id, { end_date: endDate });
      setIsEditing(false);
    }
  };

  return (
    <div className="p-4 rounded-lg border-2 border-blue-300 bg-blue-50">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-bold text-lg">{taskTitle}</h4>
          <p className="text-sm text-gray-700 flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {formatRecurrence(recurringTask.frequency, recurringTask.recurrence_pattern)}
          </p>
        </div>
        <div className="flex gap-1">
          <span
            className={`px-2 py-1 rounded text-xs font-bold ${
              recurringTask.is_active ? 'bg-green-500 text-white' : 'bg-black-400 text-white'
            }`}
          >
            {recurringTask.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="mb-3 text-sm">
        <p>
          <strong>Start:</strong> {new Date(recurringTask.start_date).toLocaleDateString()}
        </p>
        {recurringTask.end_date && (
          <p>
            <strong>End:</strong> {new Date(recurringTask.end_date).toLocaleDateString()}
          </p>
        )}
        {recurringTask.last_generated_date && (
          <p>
            <strong>Last Generated:</strong>{' '}
            {new Date(recurringTask.last_generated_date).toLocaleDateString()}
          </p>
        )}
      </div>

      {isEditing && (
        <div className="mb-3 p-2 bg-white rounded border">
          <label className="block text-sm font-medium mb-1">End Date (Optional)</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-2 py-1 border rounded mb-2"
          />
          <div className="flex gap-2">
            <Button
              onClick={handleSaveEndDate}
              className="text-sm bg-green-500 hover:bg-green-600"
            >
              Save
            </Button>
            <Button
              onClick={() => {
                setIsEditing(false);
                setEndDate(recurringTask.end_date || '');
              }}
              className="text-sm bg-black-500 hover:bg-black-600"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={() => setIsEditing(!isEditing)}
          className="text-sm bg-blue-500 hover:bg-blue-600"
        >
          {isEditing ? 'Done' : 'Edit'}
        </Button>
        {recurringTask.is_active ? (
          <Button
            onClick={() => onDeactivate(recurringTask.id)}
            className="text-sm bg-orange-500 hover:bg-orange-600"
          >
            Deactivate
          </Button>
        ) : (
          <Button
            onClick={() => onDelete(recurringTask.id)}
            className="text-sm bg-red-500 hover:bg-red-600"
          >
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
