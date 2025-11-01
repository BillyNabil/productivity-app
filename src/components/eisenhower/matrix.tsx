"use client";

import { Task } from "@/types/task";
import { useState } from "react";
import { Quadrant } from "@/components/eisenhower/quadrant";
import { useTasks } from "@/lib/hooks/use-tasks";

interface EisenhowerMatrixProps {
  tasks: Task[];
}

export function EisenhowerMatrix({ tasks }: EisenhowerMatrixProps) {
  // Categorize tasks
  const urgentImportant = tasks.filter((t) => t.is_urgent && t.is_important);
  const notUrgentImportant = tasks.filter((t) => !t.is_urgent && t.is_important);
  const urgentNotImportant = tasks.filter((t) => t.is_urgent && !t.is_important);
  const notUrgentNotImportant = tasks.filter((t) => !t.is_urgent && !t.is_important);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Quadrant 1: Urgent & Important (DO) */}
      <Quadrant
        id="urgent-important"
        title="Do First"
        description="Urgent & Important"
        color="red"
        tasks={urgentImportant}
      />

      {/* Quadrant 2: Not Urgent & Important (SCHEDULE) */}
      <Quadrant
        id="not-urgent-important"
        title="Schedule"
        description="Not Urgent & Important"
        color="blue"
        tasks={notUrgentImportant}
      />

      {/* Quadrant 3: Urgent & Not Important (DELEGATE) */}
      <Quadrant
        id="urgent-not-important"
        title="Delegate"
        description="Urgent & Not Important"
        color="yellow"
        tasks={urgentNotImportant}
      />

      {/* Quadrant 4: Not Urgent & Not Important (DELETE) */}
      <Quadrant
        id="not-urgent-not-important"
        title="Eliminate"
        description="Not Urgent & Not Important"
        color="gray"
        tasks={notUrgentNotImportant}
      />
    </div>
  );
}
