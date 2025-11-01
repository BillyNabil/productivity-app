'use client';

import React from 'react';
import { useAnalytics } from '@/lib/hooks/use-analytics';
import { Sparkles, Target, Flame } from 'lucide-react';

interface StreakDisplayProps {
  compact?: boolean;
}

export function ProductivityStreaks({ compact = false }: StreakDisplayProps) {
  const { streaks } = useAnalytics();

  const getStreakIcon = (type: string) => {
    switch (type) {
      case 'habit':
        return <Sparkles className="w-6 h-6" />;
      case 'daily_goals':
        return <Target className="w-6 h-6" />;
      case 'focus_time':
        return <Flame className="w-6 h-6" />;
      default:
        return <Sparkles className="w-6 h-6" />;
    }
  };

  const getStreakLabel = (type: string) => {
    switch (type) {
      case 'habit':
        return 'Habit Streak';
      case 'daily_goals':
        return 'Daily Goals Streak';
      case 'focus_time':
        return 'Focus Time Streak';
      default:
        return 'Streak';
    }
  };

  if (compact) {
    return (
      <div className="flex gap-4">
        {streaks.map((streak) => (
          <div key={streak.id} className="flex items-center gap-2 p-2 bg-black-900 border-2 border-white rounded">
            <div className="text-2xl">{getStreakIcon(streak.streak_type)}</div>
            <div>
              <p className="text-xs text-white font-medium">{getStreakLabel(streak.streak_type)}</p>
              <p className="text-lg font-bold text-white">{streak.current_streak}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
        <Flame className="w-5 h-5" />
        Your Streaks
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {streaks.map((streak) => (
          <div
            key={streak.id}
            className="p-4 rounded-lg border-2 border-white bg-black-900"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-white">{getStreakLabel(streak.streak_type)}</h4>
              <div className="text-3xl">{getStreakIcon(streak.streak_type)}</div>
            </div>

            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-400 font-medium">Current Streak</p>
                <p className="text-3xl font-bold text-white">{streak.current_streak}</p>
                <p className="text-xs text-gray-400">days</p>
              </div>

              <div className="border-t-2 border-white pt-2">
                <p className="text-xs text-gray-400 font-medium">Longest Streak</p>
                <p className="text-xl font-bold text-white">{streak.longest_streak} days</p>
              </div>

              {streak.last_completed_date && (
                <div className="text-xs text-gray-500">
                  Last completed: {new Date(streak.last_completed_date).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
