'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useDailyGoals } from '@/lib/hooks/use-daily-goals';
import { useConfirm } from '@/lib/hooks/use-confirm';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';

export function DailyGoals() {
  const { todayGoals, createTodayGoals, updateGoal, deleteGoals } = useDailyGoals();
  const [isCreating, setIsCreating] = useState(false);
  const [goals, setGoals] = useState(['', '', '']);
  const [currentGoalStep, setCurrentGoalStep] = useState(0); // 0, 1, or 2
  const [isDeleting, setIsDeleting] = useState(false);
  const { isOpen, title, message, confirmLabel, cancelLabel, type, handleConfirm, handleCancel, confirm } = useConfirm();

  const handleCreateGoals = async () => {
    if (goals[0] && goals[1] && goals[2]) {
      await createTodayGoals(goals[0], goals[1], goals[2]);
      setIsCreating(false);
      setGoals(['', '', '']);
      setCurrentGoalStep(0);
    }
  };

  const handleNextStep = () => {
    if (currentGoalStep < 2) {
      setCurrentGoalStep(currentGoalStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentGoalStep > 0) {
      setCurrentGoalStep(currentGoalStep - 1);
    }
  };

  const handleCancelCreating = () => {
    setIsCreating(false);
    setGoals(['', '', '']);
    setCurrentGoalStep(0);
  };

  const handleDeleteGoals = async () => {
    const confirmed = await confirm({
      title: "Delete Daily Goals",
      message: "Are you sure you want to delete today's goals? This action cannot be undone.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      type: "danger",
    });
    if (confirmed) {
      setIsDeleting(true);
      try {
        await deleteGoals();
      } catch (error) {
        console.error('Failed to delete goals:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const toggleGoal = async (goalNumber: 1 | 2 | 3) => {
    if (todayGoals) {
      const key = `goal_${goalNumber}_completed` as const;
      const currentValue = todayGoals[key];
      await updateGoal(goalNumber, !currentValue);
    }
  };

  if (!todayGoals && !isCreating) {
    return (
      <Card className="bg-linear-to-br from-black to-black border-black p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-2">Daily Goals (Big 3)</h3>
          <p className="text-white/60 mb-4">Set your 3 main goals for today</p>
          <Button
            onClick={() => setIsCreating(true)}
            className="bg-white text-black hover:bg-blue-100"
          >
            <Plus className="w-4 h-4 mr-2" />
            Set Today's Goals
          </Button>
        </div>
      </Card>
    );
  }

  if (isCreating || !todayGoals) {
    return (
      <Card className="bg-black/20 border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Set Your Big 3 Goals</h3>
          <div className="text-sm text-white/60">
            Goal {currentGoalStep + 1}/3
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex gap-2 mb-6">
          {[0, 1, 2].map((step) => (
            <div
              key={step}
              className={`flex-1 h-2 rounded-full transition-colors ${
                step <= currentGoalStep ? 'bg-white' : 'bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Current goal input */}
        <div className="mb-6">
          <label className="text-sm text-white/60 mb-3 block">
            Goal {currentGoalStep + 1}: What do you want to accomplish today?
          </label>
          <Input
            placeholder={`Enter your goal ${currentGoalStep + 1}`}
            value={goals[currentGoalStep]}
            onChange={(e) => {
              const newGoals = [...goals];
              newGoals[currentGoalStep] = e.target.value;
              setGoals(newGoals);
            }}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/40 text-lg"
            autoFocus
          />
          {goals[currentGoalStep] && (
            <p className="text-xs text-white/60 mt-2">✓ Goal entered</p>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={handlePreviousStep}
            disabled={currentGoalStep === 0}
            className="flex-1"
          >
            Previous
          </Button>

          {currentGoalStep < 2 ? (
            <Button
              onClick={handleNextStep}
              disabled={!goals[currentGoalStep]}
              className="flex-1 bg-white hover:bg-white"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleCreateGoals}
              disabled={!goals[0] || !goals[1] || !goals[2]}
              className="flex-1 bg-white hover:bg-white"
            >
              Create All Goals
            </Button>
          )}

          <Button
            variant="ghost"
            onClick={handleCancelCreating}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </Card>
    );
  }

  const completedCount = [
    todayGoals.goal_1_completed,
    todayGoals.goal_2_completed,
    todayGoals.goal_3_completed,
  ].filter(Boolean).length;

  const goals_data = [
    { num: 1 as const, text: todayGoals.goal_1, completed: todayGoals.goal_1_completed },
    { num: 2 as const, text: todayGoals.goal_2, completed: todayGoals.goal_2_completed },
    { num: 3 as const, text: todayGoals.goal_3, completed: todayGoals.goal_3_completed },
  ];

  return (
    <Card className="bg-linear-to-br from-black to-black border-black p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">Big 3 Goals</h3>
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div
              className="bg-linear-to-r from-white to-white h-full transition-all duration-300"
              style={{ width: `${(completedCount / 3) * 100}%` }}
            />
          </div>
          <p className="text-xs text-white/60 mt-2">{completedCount}/3 goals completed</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDeleteGoals}
          disabled={isDeleting}
          title="Delete today's goals"
          className="ml-2 text-red-400 hover:text-red-300 hover:bg-red-400/10"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-2">
        {goals_data.map((goal) => (
          <button
            key={goal.num}
            onClick={() => toggleGoal(goal.num)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
              goal.completed
                ? 'bg-green-500/20 border border-green-500/30'
                : 'bg-white/5 border border-white/10 hover:bg-white/10'
            }`}
          >
            {goal.completed ? (
              <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-white/40 shrink-0" />
            )}
            <span className={`text-left flex-1 ${goal.completed ? 'line-through text-white/60' : 'text-white'}`}>
              {goal.text}
            </span>
          </button>
        ))}
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
    </Card>
  );
}
