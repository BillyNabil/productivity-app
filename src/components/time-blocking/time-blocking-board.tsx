"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/use-auth";
import { useConfirm } from "@/lib/hooks/use-confirm";
import { TimeBlock } from "@/types/time-block";
import { Calendar, Briefcase, Coffee, Users, Target, Zap, Book, Check, X, Plus } from "lucide-react";
import { TimeBlockModal } from "./time-block-modal";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { ErrorAlert, SuccessAlert } from "@/components/common/alert";
import { useAITimeBlockStore } from "@/lib/hooks/use-ai-time-blocks";

interface TimeBlockEvent {
  id: string;
  title: string;
  type: string;
  startTime: string;
  endTime: string;
  notes?: string;
  taskId?: string;
  isCompleted?: boolean;
}

interface BoardProps {
  selectedDate: Date;
  onDateChange?: (date: Date) => void;
  newTimeBlock?: { title: string; type: string; startTime: Date; endTime: Date };
  onTimeBlockAdded?: (block: any) => void;
}

const typeColors: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
  work: { bg: "bg-white dark:bg-black", text: "text-black dark:text-white", border: "border-black dark:border-white", icon: <Briefcase className="w-5 h-5" /> },
  break: { bg: "bg-white dark:bg-black", text: "text-black dark:text-white", border: "border-black dark:border-white", icon: <Coffee className="w-5 h-5" /> },
  meeting: { bg: "bg-white dark:bg-black", text: "text-black dark:text-white", border: "border-black dark:border-white", icon: <Users className="w-5 h-5" /> },
  personal: { bg: "bg-white dark:bg-black", text: "text-black dark:text-white", border: "border-black dark:border-white", icon: <Target className="w-5 h-5" /> },
  exercise: { bg: "bg-white dark:bg-black", text: "text-black dark:text-white", border: "border-black dark:border-white", icon: <Zap className="w-5 h-5" /> },
  learning: { bg: "bg-white dark:bg-black", text: "text-black dark:text-white", border: "border-black dark:border-white", icon: <Book className="w-5 h-5" /> },
};

export function TimeBlockingBoard({ selectedDate, onDateChange, newTimeBlock, onTimeBlockAdded }: BoardProps) {
  const { user } = useAuth();
  const [events, setEvents] = useState<TimeBlockEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ type: 'error' | 'success', message: string, bgColor?: string } | null>(null);
  const supabase = createClient();
  const { isOpen, title, message, confirmLabel, cancelLabel, type, handleConfirm, handleCancel, confirm } = useConfirm();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  
  // Subscribe to AI time blocks store
  const addedTimeBlocks = useAITimeBlockStore((state) => state.addedTimeBlocks);

  const handleOpenAddModal = useCallback(() => {
    setShowAddModal(true);
  }, []);

  const fetchTimeBlocks = useCallback(async (date: Date = selectedDate) => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Query a wider range to account for timezone differences
      // Get yesterday to tomorrow in UTC to ensure we catch all blocks for this calendar date
      const queryDate = new Date(date);
      const dayBefore = new Date(queryDate);
      dayBefore.setDate(dayBefore.getDate() - 1);
      const dayAfter = new Date(queryDate);
      dayAfter.setDate(dayAfter.getDate() + 1);

      const startOfRange = dayBefore.toISOString();
      const endOfRange = dayAfter.toISOString();

      const { data, error } = await supabase
        .from("time_blocks")
        .select(`*`)
        .eq("user_id", user.id)
        .gte("start_time", startOfRange)
        .lte("start_time", endOfRange)
        .order("start_time", { ascending: true });

      if (error) throw error;

      // Filter client-side to only show blocks for the selected calendar date
      const timeBlockEvents: TimeBlockEvent[] = (data || [])
        .filter((block: any) => {
          const blockDate = new Date(block.start_time);
          // Compare calendar dates (year, month, day) in local timezone
          return (
            blockDate.getFullYear() === queryDate.getFullYear() &&
            blockDate.getMonth() === queryDate.getMonth() &&
            blockDate.getDate() === queryDate.getDate()
          );
        })
        .map((block: any) => ({
          id: block.id,
          title: block.notes || "Time Block",
          type: block.type || "work",
          startTime: new Date(block.start_time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
          endTime: new Date(block.end_time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
          notes: block.notes,
          taskId: block.task_id,
          isCompleted: block.is_completed,
        }));

      setEvents(timeBlockEvents);
    } catch (error) {
      console.error("Failed to fetch time blocks:", error);
    } finally {
      setLoading(false);
    }
  }, [user, supabase, selectedDate]);

  const fetchAISuggestions = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch pending/pending tasks from Eisenhower Matrix
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .in("status", ["pending", "in_progress"])
        .limit(5);

      if (error) throw error;
    } catch (error) {
      console.error("Failed to fetch AI suggestions:", error);
    }
  }, [user, supabase]);

  // Refetch when AI adds a new time block to the store
  useEffect(() => {
    if (addedTimeBlocks.length > 0) {
      // Check if the latest added time block is for today
      const latestBlock = addedTimeBlocks[addedTimeBlocks.length - 1];
      const blockDate = new Date(latestBlock.startTime);
      const isSameDay = 
        blockDate.getFullYear() === selectedDate.getFullYear() &&
        blockDate.getMonth() === selectedDate.getMonth() &&
        blockDate.getDate() === selectedDate.getDate();
      
      if (isSameDay) {
        // Small delay to ensure DB write is complete
        const timer = setTimeout(() => {
          fetchTimeBlocks(selectedDate);
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [addedTimeBlocks, selectedDate, fetchTimeBlocks]);

  useEffect(() => {
    fetchTimeBlocks(selectedDate);

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`time_blocks_${user?.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "time_blocks",
          filter: `user_id=eq.${user?.id}`,
        },
        () => {
          fetchTimeBlocks(selectedDate);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedDate, fetchTimeBlocks, supabase]);

  // Handle new time block from AI Productivity Assistant
  useEffect(() => {
    if (newTimeBlock && user) {
      handleAddNewTimeBlock(newTimeBlock);
    }
  }, [newTimeBlock, user]);

  const handleAddNewTimeBlock = async (block: { title: string; type: string; startTime: Date; endTime: Date }) => {
    try {
      await supabase.from("time_blocks").insert([
        {
          user_id: user?.id,
          start_time: block.startTime.toISOString(),
          end_time: block.endTime.toISOString(),
          type: block.type,
          notes: block.title,
        },
      ]);

      setAlertMessage({ type: 'success', message: `✅ Time block "${block.title}" added successfully` });
      fetchTimeBlocks(selectedDate);
      
      // Notify parent component if callback exists
      if (onTimeBlockAdded) {
        onTimeBlockAdded(block);
      }
    } catch (error) {
      console.error("Failed to add time block:", error);
      setAlertMessage({ type: 'error', message: "Failed to add time block. Please try again." });
    }
  };

  const handleDeleteBlock = async (id: string) => {
    setPendingDeleteId(id);
    const confirmed = await confirm({
      title: "Delete Time Block",
      message: "Are you sure you want to delete this time block? This action cannot be undone.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      type: "danger",
    });
    if (confirmed) {
      try {
        await supabase.from("time_blocks").delete().eq("id", id);
        setAlertMessage({ type: 'success', message: "✅ Time block deleted successfully", bgColor: "bg-black" });
        fetchTimeBlocks(selectedDate);
      } catch (error) {
        console.error("Failed to delete time block:", error);
        setAlertMessage({ type: 'error', message: "Failed to delete time block. Please try again." });
      }
    }
    setPendingDeleteId(null);
  };

  const handleToggleComplete = async (id: string, isCompleted: boolean) => {
    try {
      await supabase
        .from("time_blocks")
        .update({ is_completed: !isCompleted })
        .eq("id", id);
      setAlertMessage({ type: 'success', message: !isCompleted ? "✅ Time block marked as complete" : "✅ Time block marked as incomplete" });
      fetchTimeBlocks(selectedDate);
    } catch (error) {
      console.error("Failed to update time block:", error);
      setAlertMessage({ type: 'error', message: "Failed to update time block. Please try again." });
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Messages */}
      {alertMessage && (
        alertMessage.type === 'error' ? (
          <ErrorAlert
            message={alertMessage.message}
            onClose={() => setAlertMessage(null)}
            dismissible={true}
          />
        ) : (
          <SuccessAlert
            message={alertMessage.message}
            onClose={() => setAlertMessage(null)}
            dismissible={true}
            autoClose={true}
            autoCloseDelay={3000}
            className={alertMessage.bgColor}
          />
        )
      )}

      {/* Today Header */}
      <div className="bg-white dark:bg-black rounded-2xl shadow-lg p-6 border-2 border-black dark:border-white flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-black dark:text-white">
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </h2>
          <p className="text-sm text-black dark:text-white opacity-70 mt-1">
            {format(new Date(), "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd") ? "Today's Schedule" : "Schedule"}
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-3 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:opacity-90 transition-opacity font-semibold text-sm shrink-0"
          title="Add new time block"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add</span>
        </button>
      </div>

      {/* Time Blocks Board */}
      <div className="bg-white dark:bg-black rounded-2xl shadow-lg border-2 border-black dark:border-white p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 border-4 border-black dark:border-white border-t-transparent dark:border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-black dark:text-white font-medium">Loading time blocks...</p>
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-black dark:text-white font-medium">No time blocks yet</p>
            <p className="text-sm text-black dark:text-white mt-1">Use AI Assistance to add your first time block</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => {
              const colors = typeColors[event.type] || typeColors.work;
              return (
                <div
                  key={event.id}
                  className={`p-4 rounded-2xl border-2 ${colors.bg} ${colors.border} ${colors.text} flex justify-between items-start hover:shadow-md transition-shadow ${
                    event.isCompleted ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-black dark:text-white">
                        {colors.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-bold text-lg ${event.isCompleted ? "line-through" : ""}`}>
                          {event.title}
                        </h3>
                        <p className="text-xs opacity-70 capitalize">{event.type}</p>
                      </div>
                    </div>
                    <p className={`text-sm opacity-75 ml-8 ${event.isCompleted ? "line-through" : ""}`}>
                      {event.startTime} - {event.endTime}
                    </p>
                    {event.taskId && (
                      <p className="text-xs opacity-60 ml-8 mt-1">� Linked to Task</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4 shrink-0">
                    <button
                      onClick={() => handleToggleComplete(event.id, event.isCompleted || false)}
                      className={`p-2 rounded-xl transition-colors ${
                        event.isCompleted
                          ? "bg-black dark:bg-black text-white dark:text-white hover:bg-black dark:hover:bg-black"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                      title={event.isCompleted ? "Mark incomplete" : "Mark complete"}
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteBlock(event.id)}
                      className="p-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                      title="Delete time block"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Time Block Modal */}
      <TimeBlockModal
        isOpen={showAddModal}
        selectedDate={selectedDate}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => fetchTimeBlocks()}
      />

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
