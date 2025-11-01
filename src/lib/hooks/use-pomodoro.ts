"use client";

import { useEffect } from "react";
import { useTimerStore } from "@/lib/stores/timer-store";

export function usePomodoro() {
  const {
    sessionType,
    currentTime,
    totalTime,
    isRunning,
    isPaused,
    currentTaskId,
    settings,
    sessions,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    updateSettings,
    fetchSessions,
  } = useTimerStore();

  useEffect(() => {
    fetchSessions();
  }, []);

  // Calculate total duration based on session type
  const totalDuration =
    sessionType === "work"
      ? settings.work_duration
      : sessionType === "short_break"
      ? settings.short_break_duration
      : settings.long_break_duration;

  const progress = ((totalDuration * 60 - currentTime) / (totalDuration * 60)) * 100;

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return {
    // State
    sessionType,
    timeLeft: currentTime,
    totalTime,
    isRunning,
    isPaused,
    currentTaskId,
    settings,
    sessions,
    progress,
    formattedTime: formatTime(currentTime),

    // Actions
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    updateSettings,
    refetchSessions: fetchSessions,
  };
}
