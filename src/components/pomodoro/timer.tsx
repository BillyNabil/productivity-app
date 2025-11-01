"use client";

import { SessionType } from "@/types/pomodoro";
import { Zap, Coffee, Moon } from "lucide-react";

interface PomodoroTimerProps {
  time: string;
  progress: number;
  sessionType: SessionType;
}

const sessionColors = {
  work: "stroke-red-500",
  short_break: "stroke-blue-500",
  long_break: "stroke-green-500",
};

const sessionLabels = {
  work: "Focus Time",
  short_break: "Short Break",
  long_break: "Long Break",
};

export function PomodoroTimer({ time, progress, sessionType }: PomodoroTimerProps) {
  const circumference = 2 * Math.PI * 100;
  const offset = circumference - (progress / 100) * circumference;

  const sessionIconComponents = {
    work: Zap,
    short_break: Coffee,
    long_break: Moon,
  };

  const IconComponent = sessionIconComponents[sessionType];

  return (
    <div className="flex flex-col items-center">
      {/* Session Type Label */}
      <div className="mb-3 flex items-center gap-2">
        <IconComponent className="w-5 h-5" />
        <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          {sessionLabels[sessionType]}
        </span>
      </div>

      {/* Circular Timer */}
      <div className="relative">
        <svg className="transform -rotate-90" width="240" height="240">
          {/* Background circle */}
          <circle
            cx="120"
            cy="120"
            r="100"
            stroke="currentColor"
            strokeWidth="10"
            fill="none"
            className="text-muted"
          />
          {/* Progress circle */}
          <circle
            cx="120"
            cy="120"
            r="100"
            stroke="currentColor"
            strokeWidth="10"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`${sessionColors[sessionType]} transition-all duration-1000 drop-shadow-sm`}
          />
        </svg>

        {/* Time Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-5xl font-bold text-foreground">
            {time}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {Math.round(progress)}% complete
          </div>
        </div>
      </div>
    </div>
  );
}
