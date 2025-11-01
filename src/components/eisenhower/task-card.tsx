"use client";

import { Task } from "@/types/task";
import { useState } from "react";
import { useTasks } from "@/lib/hooks/use-tasks";
import { useConfirm } from "@/lib/hooks/use-confirm";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Calendar, CheckCircle2, Trash2, Clock } from "lucide-react";

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  quadrantColor?: "red" | "blue" | "yellow" | "gray";
}

const quadrantColors = {
  red: "border-l-4 border-red-400 hover:border-red-600",
  blue: "border-l-4 border-blue-400 hover:border-blue-600",
  yellow: "border-l-4 border-yellow-400 hover:border-yellow-600",
  gray: "border-l-4 border-black hover:border-black",
};

export function TaskCard({ task, isDragging = false, quadrantColor = "gray" }: TaskCardProps) {
  const { updateTask, deleteTask } = useTasks();
  const [isExpanded, setIsExpanded] = useState(false);
  const { isOpen, title, message, confirmLabel, cancelLabel, type, handleConfirm, handleCancel, confirm } = useConfirm();

  const handleStatusToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = task.status === "completed" ? "pending" : "completed";
    await updateTask(task.id, { status: newStatus });
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = await confirm({
      title: "Delete Task",
      message: "Are you sure you want to delete this task? This action cannot be undone.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      type: "danger",
    });
    if (confirmed) {
      await deleteTask(task.id);
    }
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed";
  const dueToday = task.due_date && new Date(task.due_date).toDateString() === new Date().toDateString();

  return (
    <div
      className={`group relative p-3 transition-all duration-200 rounded-xl border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white ${
        quadrantColors[quadrantColor]
      } ${
        task.status === "completed" ? "opacity-60" : "hover:shadow-md hover:-translate-y-0.5"
      }`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-start gap-2">
        {/* Checkbox */}
        <button
          onClick={handleStatusToggle}
          className={`shrink-0 w-5 h-5 mt-0.5 rounded border-2 transition-all duration-200 font-bold flex items-center justify-center ${
            task.status === "completed"
              ? "bg-black dark:bg-white border-black dark:border-white text-white dark:text-black"
              : "border-black dark:border-white text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black"
          }`}
        >
          {task.status === "completed" && <CheckCircle2 className="w-4 h-4" />}
        </button>

        <div className="flex-1 min-w-0">
          {/* Task Title */}
          <h4
            className={`font-bold text-sm mb-1 ${
              task.status === "completed" ? "line-through opacity-60" : ""
            }`}
          >
            {task.title}
          </h4>

          {/* Description */}
          {task.description && (
            <p className={`text-xs mb-2 opacity-80 text-black dark:text-white ${
              isExpanded ? "" : "line-clamp-1"
            }`}>
              {task.description}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {task.estimated_duration && (
              <span className="flex items-center gap-1 px-2 py-1 bg-black dark:bg-white text-white dark:text-black rounded-xl font-semibold border border-black dark:border-white">
                <Clock className="w-3 h-3" /> {task.estimated_duration}m
              </span>
            )}
            {task.due_date && (
              <span className={`flex items-center gap-1 px-2 py-1 rounded-xl font-semibold border border-black dark:border-white ${
                isOverdue
                  ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                  : dueToday
                  ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                  : "bg-white dark:bg-black text-black dark:text-white border-black dark:border-white"
              }`}>
                <Calendar className="w-3 h-3" /> {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {task.tags.slice(0, isExpanded ? undefined : 2).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-black dark:bg-white text-white dark:text-black rounded-xl text-xs font-semibold border border-black dark:border-white"
                >
                  #{tag}
                </span>
              ))}
              {!isExpanded && task.tags.length > 2 && (
                <span className="px-2 py-0.5 text-xs opacity-60 text-black dark:text-white">
                  +{task.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Delete Button */}
        <button
          onClick={handleDelete}
          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-xl border border-black dark:border-white"
          title="Delete task"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Overdue Badge */}
      {isOverdue && (
        <div className="absolute -top-2 -right-2 bg-black text-white dark:bg-white dark:text-black text-xs font-bold px-2 py-1 rounded-full shadow-md border border-black dark:border-white">
          ⚠️
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={isOpen}
        title={title}
        message={message}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        type={type as any}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
}
