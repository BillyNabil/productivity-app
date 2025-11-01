"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2, Clock, Calendar, TrendingUp, Target, Zap, BarChart3, Bell } from "lucide-react";
import { DailyGoals } from "@/components/daily-goals/daily-goals-card";
import { HabitTracker } from "@/components/daily-goals/habit-tracker";
import { NotesList } from "@/components/notes/notes-list";
import { RecurringTasksList } from "@/components/recurring-tasks/recurring-tasks-list";
import { RemindersList } from "@/components/reminders/reminders-list";
import { useNotificationPermission } from "@/lib/hooks/use-notification-permission";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { notificationEnabled, isRequesting, requestPermission } = useNotificationPermission();
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
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

  const handleEnableNotifications = async () => {
    await requestPermission();
    setShowNotificationPrompt(false);
  };

  return (
    <div className="min-h-screen bg-black">
      <main className="container mx-auto px-4 py-8">
        {/* Notification Permission Prompt */}
        {showNotificationPrompt && !notificationEnabled && (
          <div className="mb-6 p-4 bg-linear-to-r from-black to-black rounded-lg border-2 border-blue-300 flex items-start gap-4">
            <Bell className="w-6 h-6 text-white shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-white font-bold mb-1">Enable Notifications</h3>
              <p className="text-blue-100 text-sm mb-3">
                Get instant reminders for your tasks and important events. We'll notify you right when you need it!
              </p>
              <div className="flex gap-2">
                <Button 
                  onClick={handleEnableNotifications} 
                  disabled={isRequesting}
                  className="bg-white text-black hover:bg-blue-50 font-semibold"
                >
                  {isRequesting ? 'Enabling...' : 'Enable Notifications'}
                </Button>
                <Button 
                  onClick={() => setShowNotificationPrompt(false)}
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-blue-700"
                >
                  Later
                </Button>
              </div>
            </div>
          </div>
        )}

        {notificationEnabled && (
          <div className="mb-6 p-3 bg-black border-2 border-white rounded-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-white" />
            <span className="text-white font-semibold text-sm">Notifications enabled - You'll get alerts for reminders</span>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-white">
            Welcome Back!
          </h1>
          <p className="text-lg text-gray-300">
            Ready to make today productive, {user.email?.split('@')[0]}?
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-black-900 border-2 border-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-black-800 border border-white flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div className="text-3xl font-bold text-white">0</div>
            </div>
            <div className="text-sm font-medium text-white">Tasks Done</div>
          </Card>

          <Card className="p-6 bg-black-900 border-2 border-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-black-800 border border-white flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="text-3xl font-bold text-white">0</div>
            </div>
            <div className="text-sm font-medium text-white">Pomodoros</div>
          </Card>

          <Card className="p-6 bg-black-900 border-2 border-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-black-800 border border-white flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div className="text-3xl font-bold text-white">0h</div>
            </div>
            <div className="text-sm font-medium text-white">Focus Time</div>
          </Card>

          <Card className="p-6 bg-black-900 border-2 border-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-black-800 border border-white flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="text-3xl font-bold text-white">0%</div>
            </div>
            <div className="text-sm font-medium text-white">Productivity</div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 hover:shadow-xl transition-all duration-300 bg-black-900 border-2 border-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-lg">
                <BarChart3 className="w-7 h-7 text-black" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Analytics</h2>
                <p className="text-sm text-gray-300">View insights</p>
              </div>
            </div>
            <p className="mb-4 text-sm text-gray-300">
              Track your productivity metrics and performance trends
            </p>
            <Link href="/analytics">
              <Button className="w-full group bg-white text-black hover:bg-black-200">
                View Analytics
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Button>
            </Link>
          </Card>
        </div>

        {/* Daily Goals and Habits Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-4 text-white">Today's Goals</h2>
            <DailyGoals />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4 text-white">My Habits</h2>
            <HabitTracker />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 hover:shadow-xl transition-all duration-300 bg-black-900 border-2 border-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-lg">
                <Target className="w-7 h-7 text-black" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Task Matrix</h2>
                <p className="text-sm text-gray-300">Prioritize your work</p>
              </div>
            </div>
            <p className="mb-4 text-sm text-gray-300">
              Organize tasks using the Eisenhower Matrix for maximum productivity
            </p>
            <Link href="/eisenhower">
              <Button className="w-full group bg-white text-black hover:bg-black-200">
                Open Tasks
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Button>
            </Link>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-all duration-300 bg-black-900 border-2 border-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-lg">
                <Clock className="w-7 h-7 text-black" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Pomodoro</h2>
                <p className="text-sm text-gray-300">Focus sessions</p>
              </div>
            </div>
            <p className="mb-4 text-sm text-gray-300">
              Work in focused 25-minute intervals with strategic breaks
            </p>
            <Link href="/pomodoro">
              <Button className="w-full group bg-white text-black hover:bg-black-200">
                Start Timer
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Button>
            </Link>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-all duration-300 bg-black-900 border-2 border-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-lg">
                <Calendar className="w-7 h-7 text-black" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Calendar</h2>
                <p className="text-sm text-gray-300">Plan your time</p>
              </div>
            </div>
            <p className="mb-4 text-sm text-gray-300">
              Schedule time blocks and visualize your daily agenda
            </p>
            <Link href="/time-blocking">
              <Button className="w-full group bg-white text-black hover:bg-black-200">
                View Calendar
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Button>
            </Link>
          </Card>
        </div>

        {/* Reminders, Recurring Tasks, and Notes Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Reminders - Priority Panel */}
          <Card className="p-6 bg-black-900 border-2 border-white lg:col-span-1">
            <RemindersList />
          </Card>

          {/* Recurring Tasks - Middle Panel */}
          <Card className="p-6 bg-black-900 border-2 border-white lg:col-span-1">
            <RecurringTasksList />
          </Card>

          {/* Notes - Right Panel */}
          <Card className="p-6 bg-black-900 border-2 border-white lg:col-span-1">
            <NotesList />
          </Card>
        </div>

        {/* Today's Focus */}
        <Card className="p-6 bg-black-900 border-2 border-white">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-white">
            <Target className="w-6 h-6" />
            Today's Focus
          </h2>
          <p className="mb-4 text-gray-300">
            You haven't set your focus for today yet. Start by adding tasks to your Eisenhower Matrix.
          </p>
          <Link href="/eisenhower">
            <Button variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-black">
              Set Today's Goals
            </Button>
          </Link>
        </Card>
      </main>
    </div>
  );
}
