"use client";

import { useEffect, useState } from "react";
import { TimeBlock } from "@/types/time-block";
import { Task } from "@/types/task";
import { useSync } from "@/lib/hooks/use-sync";
import { CheckCircle2, AlertCircle, Loader2, Link2 } from "lucide-react";

interface TaskTimeBlockInfoProps {
  taskId: string;
  task?: Task;
}

export function TaskTimeBlockInfo({ taskId, task }: TaskTimeBlockInfoProps) {
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedCount, setCompletedCount] = useState(0);
  const { getTaskTimeBlocks } = useSync();

  useEffect(() => {
    const fetchTimeBlocks = async () => {
      setLoading(true);
      const blocks = await getTaskTimeBlocks(taskId);
      setTimeBlocks(blocks);
      setCompletedCount(blocks.filter((b) => b.is_completed).length);
    };

    fetchTimeBlocks();
  }, [taskId, getTaskTimeBlocks]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading time blocks...
      </div>
    );
  }

  if (timeBlocks.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <AlertCircle className="w-4 h-4" />
        No time blocks linked
      </div>
    );
  }

  const totalDuration = timeBlocks.reduce((sum, block) => {
    const start = new Date(block.start_time);
    const end = new Date(block.end_time);
    return sum + (end.getTime() - start.getTime()) / (1000 * 60);
  }, 0);

  const allCompleted = completedCount === timeBlocks.length;

  return (
    <div className="space-y-2 text-sm">
      <div className="flex items-center gap-2 font-semibold">
        <Link2 className="w-4 h-4" />
        <span>Time Blocks ({completedCount}/{timeBlocks.length})</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {timeBlocks.map((block) => (
          <div
            key={block.id}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
              block.is_completed
                ? "bg-green-100 text-green-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {block.is_completed ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : (
              <AlertCircle className="w-3 h-3" />
            )}
            <span>
              {new Date(block.start_time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              - {block.type}
            </span>
          </div>
        ))}
      </div>

      <div className="text-xs text-gray-600 space-y-1">
        <div>Total Duration: {Math.round(totalDuration)} minutes</div>
        {allCompleted && (
          <div className="flex items-center gap-1 text-green-600 font-semibold">
            <CheckCircle2 className="w-3 h-3" />
            All sessions completed!
          </div>
        )}
      </div>
    </div>
  );
}
