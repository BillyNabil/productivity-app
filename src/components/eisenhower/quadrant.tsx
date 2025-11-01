"use client";

import { Task } from "@/types/task";
import { TaskCard } from "@/components/eisenhower/task-card";

interface QuadrantProps {
  id: string;
  title: string;
  description: string;
  color: "red" | "blue" | "yellow" | "gray";
  tasks: Task[];
}

const colorClasses = {
  red: {
    bg: "bg-white dark:bg-black",
    border: "border-black dark:border-white",
    header: "bg-black",
    headerTitle: "text-white",
    headerText: "text-white",
    headerCount: "text-white",
    text: "text-black dark:text-white",
    title: "text-black dark:text-white",
    count: "text-black dark:text-white",
  },
  blue: {
    bg: "bg-white dark:bg-black",
    border: "border-black dark:border-white",
    header: "bg-black",
    headerTitle: "text-white",
    headerText: "text-white",
    headerCount: "text-white",
    text: "text-black dark:text-white",
    title: "text-black dark:text-white",
    count: "text-black dark:text-white",
  },
  yellow: {
    bg: "bg-white dark:bg-black",
    border: "border-black dark:border-white",
    header: "bg-black",
    headerTitle: "text-white",
    headerText: "text-white",
    headerCount: "text-white",
    text: "text-black dark:text-white",
    title: "text-black dark:text-white",
    count: "text-black dark:text-white",
  },
  gray: {
    bg: "bg-white dark:bg-black",
    border: "border-black dark:border-white",
    header: "bg-black",
    headerTitle: "text-white",
    headerText: "text-white",
    headerCount: "text-white",
    text: "text-black dark:text-white",
    title: "text-black dark:text-white",
    count: "text-black dark:text-white",
  },
};

export function Quadrant({ id, title, description, color, tasks }: QuadrantProps) {
  const colors = colorClasses[color];
  const activeTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div
      className={`rounded-xl border-2 overflow-hidden transition-all duration-300 ${colors.bg} ${colors.border} shadow-md hover:shadow-lg`}
    >
      {/* Header */}
      <div className={`${colors.header} p-3 sm:p-4 border-b-2 ${colors.border}`}>
        {/* Stack on very small screens, row on sm+ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <div>
              <h3 className={`font-bold text-base sm:text-lg ${colors.headerTitle}`}>{title}</h3>
              <p className={`text-xs sm:text-sm opacity-75 ${colors.headerText}`}>{description}</p>
            </div>
          </div>

          <div className={`text-xl sm:text-2xl font-bold ${colors.headerCount}`}>
            {activeTasks.length} active
          </div>
        </div>
      </div>

      {/* Tasks Container */}
      <div className="p-3 sm:p-4 space-y-2 min-h-[150px] sm:min-h-[200px]">
        {activeTasks.length === 0 && completedTasks.length === 0 ? (
          <div className="text-center py-6">
            <div className={`text-sm sm:text-base font-medium ${colors.title}`}>No tasks in this quadrant</div>
            <div className={`text-xs sm:text-sm mt-1 opacity-60 ${colors.text}`}>Create tasks to organize</div>
          </div>
        ) : (
          <>
            {activeTasks.map((task) => (
              <TaskCard key={task.id} task={task} quadrantColor={color} />
            ))}
            
            {/* Completed Tasks Section */}
            {completedTasks.length > 0 && (
              <div className={`pt-3 mt-3 border-t-2 ${colors.border}`}>
                <div className={`text-xs font-bold mb-2 uppercase tracking-wider opacity-70 ${colors.title}`}>
                  Completed ({completedTasks.length})
                </div>
                <div className="space-y-2">
                  {completedTasks.map((task) => (
                    <TaskCard key={task.id} task={task} quadrantColor={color} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
