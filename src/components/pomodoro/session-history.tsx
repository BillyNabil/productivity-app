"use client";

import { useEffect } from "react";
import { usePomodoro } from "@/lib/hooks/use-pomodoro";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";

export function SessionHistory() {
  const { sessions, refetchSessions } = usePomodoro();

  useEffect(() => {
    refetchSessions();
  }, [refetchSessions]);

  if (sessions.length === 0) {
    return (
      <Card className="p-4 bg-white dark:bg-black border border-black dark:border-white">
        <h3 className="text-lg font-semibold mb-3 text-black dark:text-white">
          Session History
        </h3>
        <div className="text-center py-6">
          <div className="text-2xl mb-2 opacity-50">●</div>
          <p className="text-sm text-black dark:text-white">
            No sessions completed yet. Start your first Pomodoro!
          </p>
        </div>
      </Card>
    );
  }

  const getSessionIcon = (type: string) => {
    switch (type) {
      case "work": return "●";
      case "short_break": return "◆";
      case "long_break": return "■";
      default: return "◐";
    }
  };

  const getSessionColor = (type: string) => {
    switch (type) {
      case "work": return "bg-white dark:bg-black border-black dark:border-white";
      case "short_break": return "bg-white dark:bg-black border-black dark:border-white";
      case "long_break": return "bg-white dark:bg-black border-black dark:border-white";
      default: return "bg-white dark:bg-black border-black dark:border-white";
    }
  };

  return (
    <Card className="p-4 bg-white dark:bg-black border border-black dark:border-white">
      <h3 className="text-lg font-semibold mb-3 text-black dark:text-white">
        Session History
      </h3>
      <div className="space-y-2">
        {sessions.slice(0, 8).map((session) => (
          <div
            key={session.id}
            className={`flex items-center justify-between p-2 rounded-xl border ${getSessionColor(session.session_type)}`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{getSessionIcon(session.session_type)}</span>
              <div>
                <div className="text-sm font-medium text-black dark:text-white">
                  {session.session_type === "work"
                    ? "Focus Time"
                    : session.session_type === "short_break"
                    ? "Short Break"
                    : "Long Break"}
                </div>
                <div className="text-xs text-black dark:text-white">
                  {format(new Date(session.start_time), "MMM d, h:mm a")}
                </div>
              </div>
            </div>
            <div className="text-sm font-semibold text-black dark:text-white">
              {session.duration}m
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
