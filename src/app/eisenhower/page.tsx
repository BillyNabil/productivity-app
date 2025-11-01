"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { useTasks } from "@/lib/hooks/use-tasks";
import { useMemoTasks } from "@/lib/hooks/use-memo-tasks";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { EisenhowerMatrix } from "@/components/eisenhower/matrix";
import { CreateTaskDialog } from "@/components/eisenhower/create-task-dialog";
import { Zap } from "lucide-react";

export default function EisenhowerPage() {
  const { user, loading: authLoading } = useAuth();
  const { tasks, loading: tasksLoading } = useTasks();
  const { tasksByQuadrant } = useMemoTasks(tasks);
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading || tasksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-black dark:border-white border-t-transparent dark:border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-lg font-medium text-foreground">Loading tasks...</p>
          <p className="text-sm text-muted-foreground">Organizing your priorities</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Zap className="w-10 h-10" />
              <div>
                <h1 className="text-4xl font-bold text-black dark:text-white">
                  Eisenhower Matrix
                </h1>
                <p className="text-sm text-black dark:text-white mt-1">
                  Prioritize tasks by urgency and importance
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCreateDialogOpen(true)}
              className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:bg-black dark:hover:bg-white transition-colors border-2 border-black dark:border-white font-bold"
            >
              + New Task
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
          <div className="bg-white dark:bg-black rounded-2xl p-4 border-2 border-black dark:border-white">
            <div className="text-sm font-bold text-black dark:text-white mb-1">Do First</div>
            <div className="text-3xl font-bold text-black dark:text-white">
              {tasksByQuadrant['urgent-important'].length}
            </div>
            <p className="text-xs text-black dark:text-white mt-1">Urgent & Important</p>
          </div>
          
          <div className="bg-white dark:bg-black rounded-2xl p-4 border-2 border-black dark:border-white">
            <div className="text-sm font-bold text-black dark:text-white mb-1">Schedule</div>
            <div className="text-3xl font-bold text-black dark:text-white">
              {tasksByQuadrant['not-urgent-important'].length}
            </div>
            <p className="text-xs text-black dark:text-white mt-1">Not Urgent & Important</p>
          </div>
          
          <div className="bg-white dark:bg-black rounded-2xl p-4 border-2 border-black dark:border-white">
            <div className="text-sm font-bold text-black dark:text-white mb-1">Delegate</div>
            <div className="text-3xl font-bold text-black dark:text-white">
              {tasksByQuadrant['urgent-not-important'].length}
            </div>
            <p className="text-xs text-black dark:text-white mt-1">Urgent & Not Important</p>
          </div>
          
          <div className="bg-white dark:bg-black rounded-2xl p-4 border-2 border-black dark:border-white">
            <div className="text-sm font-bold text-black dark:text-white mb-1">Eliminate</div>
            <div className="text-3xl font-bold text-black dark:text-white">
              {tasksByQuadrant['neither'].length}
            </div>
            <p className="text-xs text-black dark:text-white mt-1">Not Urgent & Not Important</p>
          </div>
        </div>

        {/* Matrix */}
        <EisenhowerMatrix tasks={tasks} />

        {/* Create Task Dialog */}
        <CreateTaskDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
        />
      </div>
    </div>
  );
}

