"use client";

import { useMemo } from "react";
import { Task } from "@/types/task";

/**
 * 🎯 Optimized hook for memoizing filtered task lists
 * Prevents unnecessary recalculations of task filtering
 */
export function useMemoTasks(tasks: Task[]) {
  const tasksByQuadrant = useMemo(() => {
    return {
      'urgent-important': tasks.filter((t) => t.is_urgent && t.is_important && t.status !== 'completed'),
      'not-urgent-important': tasks.filter((t) => !t.is_urgent && t.is_important && t.status !== 'completed'),
      'urgent-not-important': tasks.filter((t) => t.is_urgent && !t.is_important && t.status !== 'completed'),
      'neither': tasks.filter((t) => !t.is_urgent && !t.is_important && t.status !== 'completed'),
    };
  }, [tasks]);

  const completedTasks = useMemo(() => {
    return tasks.filter((t) => t.status === 'completed');
  }, [tasks]);

  const activeTasks = useMemo(() => {
    return tasks.filter((t) => t.status !== 'completed');
  }, [tasks]);

  const urgentTasks = useMemo(() => {
    return tasks.filter((t) => t.is_urgent && t.status !== 'completed');
  }, [tasks]);

  const importantTasks = useMemo(() => {
    return tasks.filter((t) => t.is_important && t.status !== 'completed');
  }, [tasks]);

  return {
    tasksByQuadrant,
    completedTasks,
    activeTasks,
    urgentTasks,
    importantTasks,
  };
}
