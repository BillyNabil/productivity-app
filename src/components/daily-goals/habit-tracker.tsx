'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useHabits } from '@/lib/hooks/use-habits';
import { useConfirm } from '@/lib/hooks/use-confirm';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { CheckCircle2, Circle, Plus, Flame, Trash2, AlertCircle } from 'lucide-react';

type HabitCategory = 'health' | 'fitness' | 'learning' | 'meditation' | 'reading' | 'general';

const CATEGORY_ICONS: Record<HabitCategory, string> = {
  health: '◆',
  fitness: '▲',
  learning: '■',
  meditation: '●',
  reading: '▬',
  general: '◎',
};

export function HabitTracker() {
  const { habits, habitLogs, logHabit, createHabit, deleteHabit } = useHabits();
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newHabit, setNewHabit] = useState({
    name: '',
    category: 'general' as HabitCategory,
    description: '',
  });
  const { isOpen, title, message, confirmLabel, cancelLabel, type, handleConfirm, handleCancel, confirm } = useConfirm();

  const handleCreateHabit = async () => {
    if (!newHabit.name.trim()) {
      setError('Please enter a habit name');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await createHabit(newHabit.name, newHabit.category, newHabit.description);
      if (!result) {
        setError('Failed to create habit. Please try again.');
      } else {
        setNewHabit({ name: '', category: 'general', description: '' });
        setIsCreating(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create habit. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogHabit = async (habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const habit = habits.find((h) => h.id === habitId);
    if (habit) {
      // Find today's log for this habit
      const todayLog = habitLogs.find((l) => l.habit_id === habitId && l.log_date === today);
      const isCurrentlyCompleted = todayLog?.completed || false;
      
      // Toggle the completion status
      await logHabit(habitId, today, !isCurrentlyCompleted, '');
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    const confirmed = await confirm({
      title: "Delete Habit",
      message: "Are you sure you want to delete this habit? This action cannot be undone.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      type: "danger",
    });
    if (confirmed) {
      await deleteHabit(habitId);
    }
  };

  if (habits.length === 0 && !isCreating) {
    return (
      <Card className="bg-black/20 border-white/10 p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-2">Habit Tracking</h3>
          <p className="text-white/60 mb-4">Build consistency with daily habits</p>
          <Button
            onClick={() => setIsCreating(true)}
            className="bg-white hover:bg-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Habit
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Habits Checklist</h3>
          <p className="text-xs text-white/60 mt-1">{habitLogs.filter(l => l.log_date === new Date().toISOString().split('T')[0] && l.completed).length}/{habits.length} completed today</p>
        </div>
        {!isCreating && (
          <Button
            size="sm"
            onClick={() => setIsCreating(true)}
            className="bg-white hover:bg-white"
          >
            <Plus className="w-4 h-4" />
          </Button>
        )}
      </div>

      {isCreating && (
        <Card className="bg-black/20 border-white/10 p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-md flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}
          <div className="space-y-3 mb-4">
            <Input
              placeholder="Habit name (e.g., Morning Meditation)"
              value={newHabit.name}
              onChange={(e) => {
                setNewHabit({ ...newHabit, name: e.target.value });
                setError(null);
              }}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
            <div>
              <label className="text-sm text-white/60 mb-1 block">Category</label>
              <select
                value={newHabit.category}
                onChange={(e) => setNewHabit({ ...newHabit, category: e.target.value as HabitCategory })}
                className="w-full bg-white/5 border border-white/10 text-white rounded-md px-3 py-2"
              >
                {Object.keys(CATEGORY_ICONS).map((cat) => (
                  <option key={cat} value={cat} className="bg-black">
                    {CATEGORY_ICONS[cat as HabitCategory]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <Input
              placeholder="Description (optional)"
              value={newHabit.description}
              onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleCreateHabit}
              disabled={!newHabit.name.trim() || isLoading}
              className="flex-1 bg-green-500 hover:bg-green-600"
            >
              {isLoading ? 'Creating...' : 'Create'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setIsCreating(false);
                setError(null);
              }}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <div className="grid gap-3">
        {habits.map((habit) => {
          const today = new Date().toISOString().split('T')[0];
          const todayLog = habitLogs.find((l) => l.habit_id === habit.id && l.log_date === today);
          const isCompletedToday = todayLog?.completed || false;

          return (
            <Card key={habit.id} className={`border-white/10 p-4 hover:border-white/20 transition-colors ${
              isCompletedToday 
                ? 'bg-black border-black' 
                : 'bg-black/20'
            }`}>
              <div className="flex items-start gap-3">
                <button
                  onClick={() => handleLogHabit(habit.id)}
                  className="mt-1 shrink-0"
                  title={isCompletedToday ? 'Completed today' : 'Mark as completed'}
                >
                  {isCompletedToday ? (
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  ) : (
                    <Circle className="w-6 h-6 text-white/40 hover:text-white/60" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{CATEGORY_ICONS[habit.category]}</span>
                    <h4 className={`font-medium ${isCompletedToday ? 'line-through text-white/60' : 'text-white'}`}>{habit.name}</h4>
                  </div>
                  {habit.description && <p className="text-sm text-white/60">{habit.description}</p>}
                  <div className="flex gap-4 mt-2 text-xs text-white/50">
                    <div className="flex items-center gap-1">
                      <Flame className="w-4 h-4 text-orange-400" />
                      <span>{habit.streak} day streak</span>
                    </div>
                    <span>This week: {habit.completionThisWeek}/7</span>
                    <span className={`font-semibold ${isCompletedToday ? 'text-white' : 'text-white/50'}`}>
                      {isCompletedToday ? '✓ Done' : 'Pending'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteHabit(habit.id)}
                  className="shrink-0 text-white/40 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </Card>
          );
        })}
      </div>

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
