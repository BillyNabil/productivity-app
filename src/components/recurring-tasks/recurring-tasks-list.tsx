'use client';

import React, { useEffect, useState } from 'react';
import { useRecurringTasks } from '@/lib/hooks/use-recurring-tasks';
import { RecurringTaskCard } from './recurring-task-card';
import { RotateCw, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface RecurringTasksListProps {
  parentTaskId?: string;
}

export function RecurringTasksList({ parentTaskId }: RecurringTasksListProps) {
  const { recurringTasks, isLoading, error, updateRecurringTask, deactivateRecurringTask, deleteRecurringTask } =
    useRecurringTasks();
  const [filteredTasks, setFilteredTasks] = useState(recurringTasks);

  useEffect(() => {
    if (parentTaskId) {
      setFilteredTasks(
        recurringTasks.filter((t) => t.parent_task_id === parentTaskId)
      );
    } else {
      setFilteredTasks(recurringTasks);
    }
  }, [recurringTasks, parentTaskId]);

  if (isLoading) return <div className="text-center py-4">Loading recurring tasks...</div>;

  if (error) {
    return (
      <div className="w-full">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <RotateCw className="w-6 h-6" />
          Recurring Tasks
        </h2>
        <div className="p-4 bg-red-100 border-2 border-red-500 rounded text-red-700">
          <p className="font-semibold mb-1">Failed to load recurring tasks</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <RotateCw className="w-6 h-6 text-white" />
          <span className="text-white">Recurring Tasks</span>
        </h2>
        <Link href="/recurring-tasks">
          <Button 
            size="sm"
            className="bg-white text-black hover:bg-blue-100 gap-1"
          >
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </Link>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No recurring tasks yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map((task) => (
            <RecurringTaskCard
              key={task.id}
              recurringTask={task}
              taskTitle={`Task ${task.parent_task_id.substring(0, 8)}`}
              onUpdate={updateRecurringTask}
              onDeactivate={deactivateRecurringTask}
              onDelete={deleteRecurringTask}
            />
          ))}
        </div>
      )}
    </div>
  );
}
