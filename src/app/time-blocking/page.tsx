"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TimeBlockingBoard } from "@/components/time-blocking/time-blocking-board";
import { Calendar, Lightbulb, Target, Plus } from "lucide-react";

const timeBlockTypes = [
  { type: "work", label: "Work", color: "bg-gradient-to-r from-amber-500 to-amber-600" },
  { type: "break", label: "Break", color: "bg-gradient-to-r from-green-500 to-green-600" },
  { type: "meeting", label: "Meeting", color: "bg-gradient-to-r from-blue-500 to-blue-600" },
  { type: "personal", label: "Personal", color: "bg-gradient-to-r from-purple-500 to-purple-600" },
  { type: "exercise", label: "Exercise", color: "bg-gradient-to-r from-red-500 to-red-600" },
  { type: "learning", label: "Learning", color: "bg-gradient-to-r from-cyan-500 to-cyan-600" },
];

export default function TimeBlockingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [boardRefresh, setBoardRefresh] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-border border-t-primary rounded-full animate-spin mx-auto"></div>
          <div className="text-lg font-medium text-foreground">Loading...</div>
          <div className="text-sm text-muted-foreground">Preparing your time blocks</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Calendar className="w-10 h-10" />
            <div>
              <h1 className="text-4xl font-bold text-black dark:text-white">
                Time Blocking
              </h1>
              <p className="text-sm text-black dark:text-white mt-1">
                Schedule your tasks and manage your time effectively
              </p>
            </div>
          </div>
        </div>

        {/* Legend */}
        

        {/* Board */}
        <div key={boardRefresh}>
          <TimeBlockingBoard 
            selectedDate={selectedDate} 
            onDateChange={setSelectedDate}
          />
        </div>

        {/* Quick Tips */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-black rounded-xl p-4 border-2 border-black dark:border-white shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <Lightbulb className="w-6 h-6" />
              <h3 className="font-bold text-black dark:text-white">Quick Tip</h3>
            </div>
            <p className="text-sm text-black dark:text-white">
              Use time blocking to schedule focused work periods throughout your day
            </p>
          </div>
          
          <div className="bg-white dark:bg-black rounded-xl p-4 border-2 border-black dark:border-white shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-6 h-6" />
              <h3 className="font-bold text-black dark:text-white">Stay Focused</h3>
            </div>
            <p className="text-sm text-black dark:text-white">
              Group similar tasks together for better productivity
            </p>
          </div>
          
          <div className="bg-white dark:bg-black rounded-xl p-4 border-2 border-black dark:border-white shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">⚡</span>
              <h3 className="font-bold text-black dark:text-white">Be Realistic</h3>
            </div>
            <p className="text-sm text-black dark:text-white">
              Include breaks between tasks to maintain energy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

