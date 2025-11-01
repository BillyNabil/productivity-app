"use client";

import { useEffect, useState } from "react";
import { TimeBlock } from "@/types/time-block";
import { Task } from "@/types/task";
import { useSync } from "@/lib/hooks/use-sync";
import { AlertCircle, Loader2, CheckCircle2 } from "lucide-react";

interface TimeBlockTaskInfoProps {
  timeBlock: TimeBlock;
}

export function TimeBlockTaskInfo({ timeBlock }: TimeBlockTaskInfoProps) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const { getTaskTimeBlocks } = useSync();

  useEffect(() => {
    const fetchTask = async () => {
      if (!timeBlock.task_id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/tasks/${timeBlock.task_id}`);
        if (response.ok) {
          const data = await response.json();
          setTask(data);
        }
      } catch (error) {
        console.error("Failed to fetch task:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [timeBlock.task_id]);

  if (!timeBlock.task_id) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading task...
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <AlertCircle className="w-4 h-4" />
        Task not found
      </div>
    );
  }

  const urgencyIcon = task.is_urgent && task.is_important ? "🔴" : 
                      task.is_important ? "🔵" : 
                      task.is_urgent ? "🟡" : "⚪";

  const statusColor = {
    pending: "bg-gray-100 text-gray-800",
    in_progress: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-2 text-sm border-t pt-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h4 className="font-semibold flex items-center gap-1">
            <span>{urgencyIcon}</span>
            <span>{task.title}</span>
          </h4>
          {task.description && (
            <p className="text-xs text-gray-600 mt-1">{task.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={`px-2 py-1 rounded text-xs font-semibold capitalize ${
            statusColor[task.status]
          }`}
        >
          {task.status}
        </span>
        {task.tags && task.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {task.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {task.due_date && (
        <div className="text-xs text-gray-600">
          📅 Due:{" "}
          {new Date(task.due_date).toLocaleDateString([], {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      )}

      {task.estimated_duration && (
        <div className="text-xs text-gray-600">
          ⏱️ Estimated: {task.estimated_duration} minutes
        </div>
      )}
    </div>
  );
}
