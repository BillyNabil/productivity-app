'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp, Zap, Clock, RefreshCw } from 'lucide-react';
import { useAnalytics } from '@/lib/hooks/use-analytics';
import { AnalyticsSummary } from '@/components/analytics/analytics-summary';
import { ProductivityChart } from '@/components/analytics/productivity-chart';
import { ProductivityStreaks } from '@/components/analytics/productivity-streaks';

interface TaskStats {
  total: number;
  completed: number;
  urgent_important: number;
  not_urgent_important: number;
  urgent_not_important: number;
  not_urgent_not_important: number;
}

interface PomodoroStats {
  total_sessions: number;
  total_duration: number;
  completed_sessions: number;
  average_interruptions: number;
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { dailyStats, monthlyStats, streaks, calculateDashboardStats } = useAnalytics();
  const [taskStats, setTaskStats] = useState<TaskStats | null>(null);
  const [pomodoroStats, setPomodoroStats] = useState<PomodoroStats | null>(null);
  const [taskChartData, setTaskChartData] = useState<any[]>([]);
  const [pomodoroChartData, setPomodoroChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [dateRange, setDateRange] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const supabase = createClient();

      // Fetch task stats
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id);

      if (tasks) {
        const completed = tasks.filter((t) => t.status === 'completed').length;
        const urgent_important = tasks.filter((t) => t.is_urgent && t.is_important).length;
        const not_urgent_important = tasks.filter((t) => !t.is_urgent && t.is_important).length;
        const urgent_not_important = tasks.filter((t) => t.is_urgent && !t.is_important).length;
        const not_urgent_not_important = tasks.filter((t) => !t.is_urgent && !t.is_important).length;

        setTaskStats({
          total: tasks.length,
          completed,
          urgent_important,
          not_urgent_important,
          urgent_not_important,
          not_urgent_not_important,
        });

        // Prepare chart data
        const chartData = [
          { name: 'Do First', value: urgent_important, fill: '#EF4444' },
          { name: 'Schedule', value: not_urgent_important, fill: '#3B82F6' },
          { name: 'Delegate', value: urgent_not_important, fill: '#FBBF24' },
          { name: 'Eliminate', value: not_urgent_not_important, fill: '#9CA3AF' },
        ];
        setTaskChartData(chartData);
      }

      // Fetch pomodoro stats
      const { data: pomodoros } = await supabase
        .from('pomodoro_sessions')
        .select('*')
        .eq('user_id', user.id);

      if (pomodoros) {
        const completed = pomodoros.filter((p) => p.completed).length;
        const totalDuration = pomodoros.reduce((sum, p) => sum + (p.duration || 0), 0);
        const avgInterruptions = pomodoros.length > 0 ? Math.round(pomodoros.reduce((sum, p) => sum + (p.interruptions || 0), 0) / pomodoros.length) : 0;

        setPomodoroStats({
          total_sessions: pomodoros.length,
          completed_sessions: completed,
          total_duration: totalDuration,
          average_interruptions: avgInterruptions,
        });

        // Group by date for chart
        const dateMap = new Map<string, number>();
        pomodoros.forEach((p) => {
          const date = new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          dateMap.set(date, (dateMap.get(date) || 0) + (p.completed ? 1 : 0));
        });

        const chartData = Array.from(dateMap.entries()).map(([date, count]) => ({ date, sessions: count }));
        setPomodoroChartData(chartData);
      }

      // Calculate dashboard stats from analytics
      if (dailyStats) {
        const stats = calculateDashboardStats();
        setDashboardStats(stats);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <p className="text-white/60">Loading analytics...</p>
      </div>
    );
  }

  const completionRate = taskStats ? Math.round((taskStats.completed / taskStats.total) * 100) || 0 : 0;
  const pomodoroEfficiency = pomodoroStats ? Math.round((pomodoroStats.completed_sessions / pomodoroStats.total_sessions) * 100) || 0 : 0;

  return (
    <div className="container mx-auto px-4 py-8 bg-black">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Productivity Analytics</h1>
        
      </div>

      {/* Analytics Summary Section */}
      <AnalyticsSummary dateRange={dateRange} onDateRangeChange={setDateRange} />

      {/* Productivity Charts Section */}
      <div className="mb-8">
        <ProductivityChart dateRange={dateRange} onDateRangeChange={setDateRange} />
      </div>

      {/* Productivity Streaks Section */}
      <div className="mb-8">
        <ProductivityStreaks compact={false} />
      </div>

      {/* Legacy Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Task Distribution */}
        <Card className="bg-black-900 border-2 border-white p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Task Distribution (Eisenhower Matrix)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={taskChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#ffffff"
                dataKey="value"
              >
                {taskChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Pomodoro Sessions Over Time */}
        <Card className="bg-black-900 border-2 border-white p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Pomodoro Sessions (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pomodoroChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#111827', border: '2px solid #ffffff' }} />
              <Bar dataKey="sessions" fill="#ffffff" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Key Metrics - Legacy Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-black-900 border-2 border-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Task Completion</p>
              <p className="text-2xl font-bold text-white">{completionRate}%</p>
              <p className="text-xs text-gray-500 mt-1">{taskStats?.completed}/{taskStats?.total} tasks</p>
            </div>
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
        </Card>

        <Card className="bg-black-900 border-2 border-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pomodoro Sessions</p>
              <p className="text-2xl font-bold text-white">{pomodoroStats?.total_sessions}</p>
              <p className="text-xs text-gray-500 mt-1">Total sessions</p>
            </div>
            <Zap className="w-8 h-8 text-white" />
          </div>
        </Card>

        <Card className="bg-black-900 border-2 border-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Focus Time</p>
              <p className="text-2xl font-bold text-white">{pomodoroStats ? Math.round(pomodoroStats.total_duration / 60) : 0}h</p>
              <p className="text-xs text-gray-500 mt-1">{pomodoroStats?.total_duration} min</p>
            </div>
            <Clock className="w-8 h-8 text-white" />
          </div>
        </Card>

        <Card className="bg-black-900 border-2 border-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pomodoro Efficiency</p>
              <p className="text-2xl font-bold text-white">{pomodoroEfficiency}%</p>
              <p className="text-xs text-gray-500 mt-1">Completed rate</p>
            </div>
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
        </Card>
      </div>

      {/* Task Breakdown */}
      <Card className="bg-black-900 border-2 border-white p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Task Breakdown by Priority</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-black-800 border-2 border-black rounded-lg">
            <p className="text-white text-sm font-medium">Do First (Urgent & Important)</p>
            <p className="text-2xl font-bold text-white mt-2">{taskStats?.urgent_important}</p>
          </div>
          <div className="p-4 bg-black-800 border-2 border-black rounded-lg">
            <p className="text-white text-sm font-medium">Schedule (Important)</p>
            <p className="text-2xl font-bold text-white mt-2">{taskStats?.not_urgent_important}</p>
          </div>
          <div className="p-4 bg-black-800 border-2 border-black rounded-lg">
            <p className="text-white text-sm font-medium">Delegate (Urgent)</p>
            <p className="text-2xl font-bold text-white mt-2">{taskStats?.urgent_not_important}</p>
          </div>
          <div className="p-4 bg-black-800 border-2 border-black rounded-lg">
            <p className="text-white text-sm font-medium">Eliminate</p>
            <p className="text-2xl font-bold text-white mt-2">{taskStats?.not_urgent_not_important}</p>
          </div>
        </div>
      </Card>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button onClick={fetchAnalytics} className="bg-white text-black hover:bg-black-200">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Analytics
        </Button>
      </div>
    </div>
  );
}
