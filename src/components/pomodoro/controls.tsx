"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { usePomodoro } from "@/lib/hooks/use-pomodoro";
import { useTimerStore } from "@/lib/stores/timer-store";

export function TimerControls() {
  const { isRunning, isPaused, startTimer, pauseTimer, resumeTimer, stopTimer } = usePomodoro();
  const { tick } = useTimerStore();

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        tick();
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isRunning, tick]);

  return (
    <div className="flex items-center justify-center gap-3 mt-6">
      {!isRunning && !isPaused && (
        <Button
          onClick={() => startTimer()}
          size="lg"
          className="px-6 py-3 text-base font-semibold bg-black hover:bg-black dark:bg-white dark:hover:bg-white text-white dark:text-black shadow-md hover:shadow-lg transition-all duration-200"
        >
          <span className="mr-2">▶</span> Start
        </Button>
      )}

      {isRunning && (
        <Button
          onClick={pauseTimer}
          size="lg"
          className="px-6 py-3 text-base font-semibold bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
        >
          <span className="mr-2">⏸</span> Pause
        </Button>
      )}

      {isPaused && (
        <>
          <Button
            onClick={resumeTimer}
            size="lg"
            className="px-6 py-3 text-base font-semibold bg-black hover:bg-black dark:bg-white dark:hover:bg-white text-white dark:text-black shadow-md hover:shadow-lg transition-all duration-200"
          >
            <span className="mr-2">▶</span> Resume
          </Button>
          <Button
            onClick={stopTimer}
            size="lg"
            className="px-6 py-3 text-base font-semibold bg-black hover:bg-black dark:bg-white dark:hover:bg-white text-white dark:text-black shadow-md hover:shadow-lg transition-all duration-200"
          >
            <span className="mr-2">⏹</span> Reset
          </Button>
        </>
      )}

      {(isRunning || isPaused) && (
        <Button
          onClick={stopTimer}
          size="lg"
          variant="outline"
          className="px-4 py-3 text-base border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-200"
        >
          <span className="mr-1">⏹</span> Stop
        </Button>
      )}
    </div>
  );
}
