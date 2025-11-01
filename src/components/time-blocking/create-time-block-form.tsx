"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/use-auth";
import { Task } from "@/types/task";
import { ErrorAlert } from "@/components/common/alert";

interface CreateTimeBlockFormProps {
  selectedDate: Date;
  onSuccess?: () => void;
  onCancel?: () => void;
  isModal?: boolean;
}

const timeBlockTypes = [
  { value: "work", label: "Work" },
  { value: "break", label: "Break" },
  { value: "meeting", label: "Meeting" },
  { value: "personal", label: "Personal" },
  { value: "exercise", label: "Exercise" },
  { value: "learning", label: "Learning" },
];

export function CreateTimeBlockForm({ selectedDate, onSuccess, onCancel, isModal = false }: CreateTimeBlockFormProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [type, setType] = useState("work");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [selectedTaskId, setSelectedTaskId] = useState("none");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(isModal); // Start with form shown if modal
  const supabase = createClient();

  // Fetch available tasks
  useEffect(() => {
    if (!user || !showForm) return;

    const fetchTasks = async () => {
      try {
        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "pending")
          .order("is_important", { ascending: false })
          .order("is_urgent", { ascending: false });

        if (error) throw error;
        setTasks(data || []);
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
      }
    };

    fetchTasks();
  }, [user, showForm, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Determine if using task or custom title
    const isUsingTask = selectedTaskId && selectedTaskId !== "none";
    const finalTitle = isUsingTask ? "" : title.trim();
    
    // Validation: either task or title is required
    if (!isUsingTask && !finalTitle) {
      setError("Please select a task or enter a title");
      return;
    }

    // Time validation
    if (startTime >= endTime) {
      setError("End time must be after start time");
      return;
    }

    try {
      setLoading(true);

      // Parse time and create full datetime
      const [startHour, startMin] = startTime.split(":").map(Number);
      const [endHour, endMin] = endTime.split(":").map(Number);

      const startDate = new Date(selectedDate);
      startDate.setHours(startHour, startMin, 0, 0);

      const endDate = new Date(selectedDate);
      endDate.setHours(endHour, endMin, 0, 0);

      const task_id = isUsingTask ? selectedTaskId : null;

      const { error: insertError } = await supabase.from("time_blocks").insert([
        {
          user_id: user?.id,
          task_id: task_id,
          start_time: startDate.toISOString(),
          end_time: endDate.toISOString(),
          type: type,
          notes: finalTitle,
          is_completed: false,
        },
      ]);

      if (insertError) throw insertError;

      // Reset form
      setTitle("");
      setType("work");
      setStartTime("09:00");
      setEndTime("10:00");
      setSelectedTaskId("none");
      setShowForm(false);
      setError("");
      
      onSuccess?.();
    } catch (err) {
      console.error("Failed to create time block:", err);
      setError("Failed to create time block. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Blur Overlay */}
      {showForm && !isModal && (
        <div 
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setShowForm(false)}
          style={{ backdropFilter: 'blur(4px)' }}
        />
      )}

      {/* Main Container */}
      {!showForm && !isModal ? (
        // Button to open form
        <div className="bg-white dark:bg-black rounded-2xl shadow-lg border-2 border-black dark:border-white p-6">
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:bg-black dark:hover:bg-white transition-colors border-2 border-black dark:border-white font-bold text-lg"
          >
            + Add Time Block
          </button>
        </div>
      ) : showForm && !isModal ? (
        // Form in card view
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-black rounded-2xl shadow-lg border-2 border-black dark:border-white p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Task Selection */}
              <div>
                <label className="block text-sm font-bold text-black dark:text-white mb-2">
                  Link to Task (Optional)
                </label>
                <select
                  value={selectedTaskId}
                  onChange={(e) => {
                    setSelectedTaskId(e.target.value);
                    if (e.target.value && e.target.value !== "none") {
                      setType("work");
                    }
                  }}
                  className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-xl bg-white dark:bg-black text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                >
                  <option value="none">-- Select a task (optional) --</option>
                  {tasks.map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.is_urgent && task.is_important ? "🔴 " : ""}
                      {task.is_important && !task.is_urgent ? "🔵 " : ""}
                      {task.is_urgent && !task.is_important ? "🟡 " : ""}
                      {!task.is_urgent && !task.is_important ? "⚪ " : ""}
                      {task.title}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-black dark:text-white opacity-60 mt-1">
                  Tasks from Eisenhower Matrix (🔴 Urgent & Important, 🔵 Important, 🟡 Urgent)
                </p>
              </div>

              {/* Title (only show if no task selected) */}
              {!selectedTaskId || selectedTaskId === "none" ? (
                <div>
                  <label className="block text-sm font-bold text-black dark:text-white mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter task title"
                    className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-xl bg-white dark:bg-black text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  />
                </div>
              ) : null}

              {/* Type */}
              <div>
                <label className="block text-sm font-bold text-black dark:text-white mb-2">
                  Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-xl bg-white dark:bg-black text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                >
                  {timeBlockTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-black dark:text-white mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-xl bg-white dark:bg-black text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black dark:text-white mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-xl bg-white dark:bg-black text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <ErrorAlert
                  message={error}
                  onClose={() => setError("")}
                  dismissible={true}
                />
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:bg-black dark:hover:bg-white disabled:opacity-50 transition-colors border-2 border-black dark:border-white font-bold"
                >
                  {loading ? "Creating..." : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    onCancel?.();
                  }}
                  className="flex-1 py-2 bg-white dark:bg-black text-black dark:text-white rounded-xl hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors border-2 border-black dark:border-white font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        // Modal mode (no blur needed as parent handles it)
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Selection */}
          <div>
            <label className="block text-sm font-bold text-black dark:text-white mb-2">
              Link to Task (Optional)
            </label>
            <select
              value={selectedTaskId}
              onChange={(e) => {
                setSelectedTaskId(e.target.value);
                if (e.target.value && e.target.value !== "none") {
                  setType("work");
                }
              }}
              className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-xl bg-white dark:bg-black text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
            >
              <option value="none">-- Select a task (optional) --</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.is_urgent && task.is_important ? "🔴 " : ""}
                  {task.is_important && !task.is_urgent ? "🔵 " : ""}
                  {task.is_urgent && !task.is_important ? "🟡 " : ""}
                  {!task.is_urgent && !task.is_important ? "⚪ " : ""}
                  {task.title}
                </option>
              ))}
            </select>
            <p className="text-xs text-black dark:text-white opacity-60 mt-1">
              Tasks from Eisenhower Matrix (🔴 Urgent & Important, 🔵 Important, 🟡 Urgent)
            </p>
          </div>

          {/* Title (only show if no task selected) */}
          {!selectedTaskId || selectedTaskId === "none" ? (
            <div>
              <label className="block text-sm font-bold text-black dark:text-white mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title"
                className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-xl bg-white dark:bg-black text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
              />
            </div>
          ) : null}

          {/* Type */}
          <div>
            <label className="block text-sm font-bold text-black dark:text-white mb-2">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-xl bg-white dark:bg-black text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
            >
              {timeBlockTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-black dark:text-white mb-2">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-xl bg-white dark:bg-black text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black dark:text-white mb-2">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-xl bg-white dark:bg-black text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <ErrorAlert
              message={error}
              onClose={() => setError("")}
              dismissible={true}
            />
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:bg-black dark:hover:bg-white disabled:opacity-50 transition-colors border-2 border-black dark:border-white font-bold"
            >
              {loading ? "Creating..." : "Create"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                onCancel?.();
              }}
              className="flex-1 py-2 bg-white dark:bg-black text-black dark:text-white rounded-xl hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors border-2 border-black dark:border-white font-bold"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </>
  );
}
