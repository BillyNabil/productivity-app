"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PomodoroTimer } from "@/components/pomodoro/timer";
import { TimerControls } from "@/components/pomodoro/controls";
import { SessionHistory } from "@/components/pomodoro/session-history";
import { usePomodoro } from "@/lib/hooks/use-pomodoro";
import { Clock } from "lucide-react";

export default function PomodoroPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { sessionType, formattedTime, progress } = usePomodoro();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg font-medium">Loading timer...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl flex items-center justify-center shadow-md" style={{ backgroundColor: 'var(--pomodoro-red)' }}>
            <Clock className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-1 text-foreground">
            Pomodoro Timer
          </h1>
          <p className="text-sm text-muted-foreground">
            Stay focused with the Pomodoro Technique
          </p>
        </div>

        {/* Main Timer Section */}
        <div className="max-w-xl mx-auto">
          <div className="bg-card backdrop-blur rounded-2xl shadow-lg border border-border p-6 mb-6">
            <PomodoroTimer
              time={formattedTime}
              progress={progress}
              sessionType={sessionType}
            />
            <TimerControls />
          </div>

          {/* Session History */}
          <SessionHistory />
        </div>
      </div>
    </div>
  );
}
