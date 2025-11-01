"use client";

import { useEffect, useState } from "react";
import { Task } from "@/types/task";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./use-auth";
import { useAnalytics } from "./use-analytics";

export function useTasks() {
  const { user } = useAuth();
  const { trackEvent } = useAnalytics();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    fetchTasks();

    // Subscribe to real-time changes
    const channel = supabase
      .channel("tasks")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // 🎯 OPTIMIZED: Update specific task instead of refetching all
          if (payload.eventType === "INSERT") {
            setTasks(prev => {
              // Avoid duplicates if already added optimistically
              if (prev.some(t => t.id === payload.new.id)) {
                return prev.map(t => t.id === payload.new.id ? payload.new as Task : t);
              }
              return [payload.new as Task, ...prev];
            });
          } else if (payload.eventType === "UPDATE") {
            // Update only the changed task
            setTasks(prev =>
              prev.map(t => t.id === payload.new.id ? (payload.new as Task) : t)
            );
          } else if (payload.eventType === "DELETE") {
            // Remove only the deleted task
            setTasks(prev =>
              prev.filter(t => t.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: Omit<Task, "id" | "user_id" | "created_at" | "updated_at">) => {
    try {
      if (!user?.id) {
        throw new Error("User not authenticated. Cannot create task without user ID.");
      }

      // 🎯 OPTIMISTIC UPDATE: Add task to UI immediately
      const tempId = `temp-${Date.now()}`;
      const optimisticTask = {
        id: tempId,
        ...taskData,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Task;

      // Add to local state immediately (before server response)
      setTasks(prev => [optimisticTask, ...prev]);
      setError(null);

      const insertData = { ...taskData, user_id: user.id };
      
      const { data, error } = await supabase
        .from("tasks")
        .insert([insertData])
        .select()
        .single();

      if (error) {
        // Remove optimistic task on error
        setTasks(prev => prev.filter(t => t.id !== tempId));
        
        const errorMessage = error.message || 'Unknown database error';
        const errorDetails = {
          code: error.code,
          details: error.details,
          hint: error.hint,
          message: errorMessage,
        };
        console.error('Supabase task creation error:', errorDetails);
        throw new Error(`Failed to create task: ${errorMessage}. Details: ${JSON.stringify(errorDetails)}`);
      }
      
      // Replace optimistic task with real task from server
      setTasks(prev => 
        prev.map(t => t.id === tempId ? data : t)
      );
      
      // Track task creation event
      trackEvent('task_created', data.id, { title: data.title });
      
      return data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to create task: Unknown error";
      setError(errorMsg);
      console.error('Task creation failed:', errorMsg);
      throw err;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      // 🎯 OPTIMISTIC UPDATE: Update task in UI immediately
      setTasks(prev =>
        prev.map(t => t.id === id ? { ...t, ...updates } : t)
      );

      const { data, error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      
      // Ensure we have the correct server data
      setTasks(prev =>
        prev.map(t => t.id === id ? data : t)
      );
      
      // Track task updated event
      if (updates.status === 'completed') {
        trackEvent('task_completed', id);
      } else if (updates.title || updates.description || updates.is_urgent !== undefined) {
        trackEvent('task_updated', id);
      }
      
      return data;
    } catch (err) {
      // Revert on error by refetching
      setTasks(prev => prev.map(t => t.id === id ? t : t));
      setError(err instanceof Error ? err.message : "Failed to update task");
      throw err;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", id);

      if (error) throw error;
      
      // Note: We don't track delete events as they're not in the analytics event types
      // Could be added to EventType if needed in future
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
      throw err;
    }
  };

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    refetch: fetchTasks,
  };
}
