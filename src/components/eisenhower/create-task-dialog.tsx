"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useTasks } from "@/lib/hooks/use-tasks";
import { AlertCircle, Star, Clock, Calendar } from "lucide-react";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  is_urgent: z.boolean(),
  is_important: z.boolean(),
  estimated_duration: z.number().min(1),
  due_date: z.string().optional(),
  tags: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

export function CreateTaskDialog({ open, onOpenChange }: CreateTaskDialogProps) {
  const { createTask } = useTasks();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      is_urgent: false,
      is_important: false,
      estimated_duration: 25,
    },
  });

  const onSubmit = async (data: TaskFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const taskData = {
        title: data.title,
        description: data.description,
        is_urgent: data.is_urgent,
        is_important: data.is_important,
        estimated_duration: data.estimated_duration,
        status: "pending" as const,
        color: "#3B82F6",
        tags: data.tags ? data.tags.split(",").map((t) => t.trim()) : [],
        due_date: data.due_date ? new Date(data.due_date).toISOString() : undefined,
      };
      await createTask(taskData);
      reset();
      onOpenChange(false);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Failed to create task:", error);
      setSubmitError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-black rounded-2xl shadow-2xl p-4 w-full max-w-lg mx-4 animate-in slide-in-from-bottom-4 duration-300 border-2 border-black dark:border-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-black dark:text-white">
            Create New Task
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black rounded transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          {submitError && (
            <div className="p-3 bg-red-100 border-2 border-red-500 rounded-lg text-red-800 text-sm font-semibold">
              ⚠️ {submitError}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold mb-1 text-black dark:text-white">
              Title *
            </label>
            <Input 
              {...register("title")} 
              placeholder="What needs to be done?" 
              className="h-9 border-2 focus:border-black dark:focus:border-white text-sm"
            />
            {errors.title && (
              <p className="text-xs mt-0.5 text-black dark:text-white font-semibold">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-black dark:text-white">
              Description
            </label>
            <textarea
              {...register("description")}
              placeholder="Add more details..."
              className="w-full px-2 py-1.5 border-2 rounded-2xl bg-white dark:bg-black focus:outline-none focus:border-black dark:focus:border-white transition-colors text-sm"
              rows={2}
            />
          </div>

          <div className="bg-black dark:bg-black p-2 rounded-2xl border-2 border-black dark:border-white">
            <div className="text-xs font-semibold mb-2 text-black dark:text-white">
              📊 Classification
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 p-2 bg-white dark:bg-black rounded-2xl border border-transparent hover:border-black dark:hover:border-white cursor-pointer transition-all">
                <input
                  type="checkbox"
                  {...register("is_urgent")}
                  className="w-4 h-4 rounded accent-black dark:accent-white"
                />
                <div>
                  <div className="font-semibold text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Urgent</div>
                  <div className="text-xs text-black dark:text-white">Immediate</div>
                </div>
              </label>
              <label className="flex items-center gap-2 p-2 bg-white dark:bg-black rounded-2xl border border-transparent hover:border-black dark:hover:border-white cursor-pointer transition-all">
                <input
                  type="checkbox"
                  {...register("is_important")}
                  className="w-4 h-4 rounded accent-black dark:accent-white"
                />
                <div>
                  <div className="font-semibold text-xs flex items-center gap-1"><Star className="w-3 h-3" /> Important</div>
                  <div className="text-xs text-black dark:text-white">Strategic</div>
                </div>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold mb-1 text-black dark:text-white flex items-center gap-1">
                <Clock className="w-3 h-3" /> Duration (min)
              </label>
              <Input
                type="number"
                {...register("estimated_duration", { valueAsNumber: true })}
                min="1"
                className="h-9 border-2 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold mb-1 text-black dark:text-white flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Due Date
              </label>
              <Input 
                type="date" 
                {...register("due_date")} 
                className="h-9 border-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-black dark:text-white">
              🏷️ Tags
            </label>
            <Input 
              {...register("tags")} 
              placeholder="work, important, urgent" 
              className="h-9 border-2 text-sm"
            />
            <p className="text-xs text-black dark:text-white mt-0.5">Separate tags with commas</p>
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-9 bg-white hover:bg-black dark:bg-black dark:hover:bg-white text-black dark:text-white border border-black dark:border-white font-semibold text-sm"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 h-9 bg-black hover:bg-white dark:bg-white dark:hover:bg-black text-white dark:text-black font-semibold shadow-lg hover:shadow-xl transition-all text-sm" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin"></span>
                  Creating...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <span className="text-base">+</span>
                  Create Task
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


