"use client";

import { useState } from 'react';
import { syncService } from '@/lib/services/sync-service';
import { Task } from '@/types/task';
import { TimeBlock } from '@/types/time-block';

interface UseSyncResult {
  message: string;
  isLoading: boolean;
  error: string | null;
}

export function useSync() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const syncTaskToTimeBlock = async (task: Task) => {
    setIsLoading(true);
    setError(null);
    setMessage('');
    try {
      const result = await syncService.syncTaskToTimeBlock(task);
      if (result.success) {
        setMessage(result.message);
        return result;
      } else {
        setError(result.message);
        return result;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const syncTimeBlockToTask = async (timeBlock: TimeBlock) => {
    setIsLoading(true);
    setError(null);
    setMessage('');
    try {
      const result = await syncService.syncTimeBlockToTask(timeBlock);
      if (result.success) {
        setMessage(result.message);
        return result;
      } else {
        setError(result.message);
        return result;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const syncTimeBlockCompletion = async (timeBlock: TimeBlock) => {
    setIsLoading(true);
    setError(null);
    setMessage('');
    try {
      const result = await syncService.syncTimeBlockCompletion(timeBlock);
      if (result.success) {
        setMessage(result.message);
        return result;
      } else {
        setError(result.message);
        return result;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const getTaskTimeBlocks = async (taskId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const blocks = await syncService.getTaskTimeBlocks(taskId);
      return blocks;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const updateTaskDurationFromTimeBlocks = async (taskId: string) => {
    setIsLoading(true);
    setError(null);
    setMessage('');
    try {
      const result = await syncService.updateTaskDurationFromTimeBlocks(taskId);
      if (result.success) {
        setMessage(result.message);
        return result;
      } else {
        setError(result.message);
        return result;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    syncTaskToTimeBlock,
    syncTimeBlockToTask,
    syncTimeBlockCompletion,
    getTaskTimeBlocks,
    updateTaskDurationFromTimeBlocks,
    isLoading,
    error,
    message,
  };
}
