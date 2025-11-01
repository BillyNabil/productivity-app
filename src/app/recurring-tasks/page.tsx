'use client';

import { useAuth } from '@/lib/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { RotateCw, Plus, ArrowLeft } from 'lucide-react';
import { RecurringTasksList } from '@/components/recurring-tasks/recurring-tasks-list';
import { useRecurringTasks } from '@/lib/hooks/use-recurring-tasks';
import { useTasks } from '@/lib/hooks/use-tasks';
import { Task } from '@/types/task';
import { RecurrencePattern } from '@/types/recurring-task';

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function RecurringTasksPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { createRecurringTask } = useRecurringTasks();
  const { tasks } = useTasks();

  const [selectedTask, setSelectedTask] = useState<string>('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [dayOfMonth, setDayOfMonth] = useState<number>(1);
  const [interval, setInterval] = useState<number>(1);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  const toggleDay = (dayNum: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayNum) ? prev.filter((d) => d !== dayNum) : [...prev, dayNum].sort()
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTask) {
      setMessage({ type: 'error', text: 'Please select a task' });
      return;
    }

    if (frequency === 'weekly' && selectedDays.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one day of the week' });
      return;
    }

    if (endDate && new Date(endDate) < new Date(startDate)) {
      setMessage({ type: 'error', text: 'End date must be after start date' });
      return;
    }

    setIsSubmitting(true);
    try {
      let recurrencePattern: RecurrencePattern = {
        interval: interval,
      };

      if (frequency === 'weekly') {
        recurrencePattern.days = selectedDays.length > 0 ? selectedDays : [new Date().getDay()];
      } else if (frequency === 'monthly') {
        recurrencePattern.day_of_month = dayOfMonth;
      }

      await createRecurringTask({
        parent_task_id: selectedTask,
        frequency,
        recurrence_pattern: recurrencePattern,
        start_date: startDate,
        end_date: endDate || undefined,
      });

      setMessage({ type: 'success', text: 'Recurring task created successfully!' });
      
      // Reset form
      setSelectedTask('');
      setFrequency('daily');
      setSelectedDays([]);
      setDayOfMonth(1);
      setInterval(1);
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate('');

      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to create recurring task' });
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
              <RotateCw className="w-8 h-8" />
              Recurring Tasks
            </h1>
            <p className="text-gray-400">Create and manage recurring tasks</p>
          </div>
        </div>

        {/* Create Recurring Task Form */}
        <Card className="p-6 bg-black-900 border-2 border-white mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Plus className="w-6 h-6" />
            Make a Task Recurring
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
                Select Task
              </label>
              {tasks.length === 0 ? (
                <div className="p-4 bg-yellow-500/20 border-2 border-yellow-500 rounded-lg text-yellow-300">
                  <p>No tasks found. Please create a task first.</p>
                </div>
              ) : (
                <select
                  value={selectedTask}
                  onChange={(e) => setSelectedTask(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border-2 border-white/30 rounded-lg text-white placeholder:text-white/50"
                >
                  <option value="">Choose a task...</option>
                  {tasks.map((task: Task) => (
                    <option key={task.id} value={task.id} className="bg-black">
                      {task.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Frequency Selection */}
            <div>
              <label className="block text-sm font-semibold text-white mb-3">
                How often should this task repeat?
              </label>
              <div className="flex gap-3">
                {FREQUENCY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setFrequency(opt.value as 'daily' | 'weekly' | 'monthly');
                      setSelectedDays([]);
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      frequency === opt.value
                        ? 'bg-white text-black'
                        : 'bg-white/10 border border-white/30 text-white hover:bg-white/20'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Daily Frequency Options */}
            {frequency === 'daily' && (
              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  Repeat Every
                </label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min="1"
                    max="365"
                    value={interval}
                    onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
                    className="bg-white/10 border-2 border-white/30 text-white w-24"
                  />
                  <span className="text-white font-medium">
                    {interval === 1 ? 'day' : 'days'}
                  </span>
                </div>
              </div>
            )}

            {/* Weekly Frequency Options */}
            {frequency === 'weekly' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-white mb-3">
                    Days of Week
                  </label>
                  <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                    {DAY_NAMES.map((day, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleDay(idx)}
                        className={`px-3 py-2 rounded-lg font-medium transition-all ${
                          selectedDays.includes(idx)
                            ? 'bg-white text-black'
                            : 'bg-white/10 border border-white/30 text-white hover:bg-white/20'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-3">
                    Repeat Every
                  </label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      min="1"
                      max="52"
                      value={interval}
                      onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
                      className="bg-white/10 border-2 border-white/30 text-white w-24"
                    />
                    <span className="text-white font-medium">
                      {interval === 1 ? 'week' : 'weeks'}
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Monthly Frequency Options */}
            {frequency === 'monthly' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-white mb-3">
                    Day of Month
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    value={dayOfMonth}
                    onChange={(e) => setDayOfMonth(parseInt(e.target.value) || 1)}
                    className="bg-white/10 border-2 border-white/30 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-3">
                    Repeat Every
                  </label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      min="1"
                      max="12"
                      value={interval}
                      onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
                      className="bg-white/10 border-2 border-white/30 text-white w-24"
                    />
                    <span className="text-white font-medium">
                      {interval === 1 ? 'month' : 'months'}
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-white/10 border-2 border-white/30 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  End Date (Optional)
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-white/10 border-2 border-white/30 text-white"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || tasks.length === 0}
                className="flex-1 bg-white text-black hover:bg-blue-100 font-semibold py-3"
              >
                <RotateCw className="w-5 h-5 mr-2" />
                {isSubmitting ? 'Creating...' : 'Make Recurring'}
              </Button>
              <Link href="/dashboard" className="flex-1">
                <Button variant="outline" className="w-full border-2 border-white text-white hover:bg-white/10">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </Card>

        {/* All Recurring Tasks List */}
        <Card className="p-6 bg-black-900 border-2 border-white">
          <RecurringTasksList />
        </Card>
      </main>
    </div>
  );
}
