'use client';

import { useAuth } from '@/lib/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Clock, Plus, ArrowLeft } from 'lucide-react';
import { RemindersList } from '@/components/reminders/reminders-list';
import { useReminders } from '@/lib/hooks/use-reminders';
import { useTasks } from '@/lib/hooks/use-tasks';
import { Task } from '@/types/task';

const REMINDER_PRESETS = [
  { label: '5 minutes before', value: 5 },
  { label: '15 minutes before', value: 15 },
  { label: '30 minutes before', value: 30 },
  { label: '1 hour before', value: 60 },
  { label: '1 day before', value: 1440 },
  { label: '2 days before', value: 2880 },
];

export default function RemindersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { createReminder } = useReminders();
  const { tasks } = useTasks();
  
  const [selectedTask, setSelectedTask] = useState<string>('');
  const [reminderTime, setReminderTime] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const tasksWithDueDates = tasks.filter((t: Task) => t.due_date);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg font-medium text-white">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTask) {
      setMessage({ type: 'error', text: 'Please select a task' });
      return;
    }

    setIsSubmitting(true);
    try {
      await createReminder({
        task_id: selectedTask,
        reminder_type: 'deadline',
        reminder_time: reminderTime,
      });
      
      setMessage({ type: 'success', text: 'Reminder created successfully!' });
      setSelectedTask('');
      setReminderTime(30);
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to create reminder' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-2">
              <Clock className="w-8 h-8" />
              Reminders
            </h1>
            <p className="text-gray-400">Create and manage reminders for your tasks</p>
          </div>
        </div>

        {/* Create Reminder Form */}
        <Card className="p-6 bg-black-900 border-2 border-white mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Plus className="w-6 h-6" />
            Add New Reminder
          </h2>

          {message && (
            <div className={`mb-4 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-500/20 border-2 border-green-500 text-green-300' 
                : 'bg-red-500/20 border-2 border-red-500 text-red-300'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Task Selection */}
            <div>
              <label className="block text-sm font-semibold text-white mb-3">
                Select Task with Due Date
              </label>
              {tasksWithDueDates.length === 0 ? (
                <div className="p-4 bg-yellow-500/20 border-2 border-yellow-500 rounded-lg text-yellow-300">
                  <p>No tasks with due dates found. Please create a task with a due date first.</p>
                </div>
              ) : (
                <select
                  value={selectedTask}
                  onChange={(e) => setSelectedTask(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border-2 border-white/30 rounded-lg text-white placeholder:text-white/50"
                >
                  <option value="">Choose a task...</option>
                  {tasksWithDueDates.map(task => (
                    <option key={task.id} value={task.id} className="bg-black">
                      {task.title} - {new Date(task.due_date!).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Reminder Time */}
            <div>
              <label className="block text-sm font-semibold text-white mb-3">
                When should we remind you?
              </label>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                {REMINDER_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setReminderTime(preset.value)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      reminderTime === preset.value
                        ? 'bg-white text-black'
                        : 'bg-white/10 border border-white/30 text-white hover:bg-white/20'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min="1"
                  max="10080"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(parseInt(e.target.value) || 30)}
                  className="bg-white/10 border-2 border-white/30 text-white flex-1"
                  placeholder="Custom minutes"
                />
                <span className="text-white font-medium">minutes</span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || tasksWithDueDates.length === 0}
                className="flex-1 bg-white text-black hover:bg-blue-100 font-semibold py-3"
              >
                <Plus className="w-5 h-5 mr-2" />
                {isSubmitting ? 'Creating...' : 'Create Reminder'}
              </Button>
              <Link href="/dashboard" className="flex-1">
                <Button variant="outline" className="w-full border-2 border-white text-white hover:bg-white/10">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </Card>

        {/* All Reminders List */}
        <Card className="p-6 bg-black-900 border-2 border-white">
          <h2 className="text-2xl font-bold text-white mb-6">All Reminders</h2>
          <RemindersList />
        </Card>
      </main>
    </div>
  );
}
