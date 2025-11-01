'use client';

import React, { useEffect, useState } from 'react';
import { useAnalytics } from '@/lib/hooks/use-analytics';

interface AnalyticsChartProps {
  dateRange?: 'day' | 'week' | 'month';
  onDateRangeChange?: (range: 'day' | 'week' | 'month') => void;
}

export function ProductivityChart({ dateRange = 'week', onDateRangeChange }: AnalyticsChartProps) {
  const { getStatsRange } = useAnalytics();
  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const today = new Date();
        let daysBack = 7;
        let label = 'Weekly';

        if (dateRange === 'day') {
          daysBack = 1;
          label = 'Daily';
        } else if (dateRange === 'month') {
          daysBack = 30;
          label = 'Monthly';
        }

        const startDate = new Date(today.getTime() - daysBack * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0];
        const endDate = today.toISOString().split('T')[0];

        const stats = await getStatsRange(startDate, endDate);
        
        // Ensure stats is an array
        const statsArray = Array.isArray(stats) ? stats : [];
        setChartData(statsArray as any[]);
      } catch (err) {
        console.warn('Failed to fetch chart data:', err);
        setChartData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dateRange, getStatsRange]);

  if (isLoading) {
    return <div className="text-center py-8 text-gray-300">Loading chart data...</div>;
  }

  return (
    <div className="w-full p-4 rounded-lg border-2 border-white bg-black-900 mt-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">📈 Productivity Trend</h3>
        <div className="flex gap-2">
          {(['day', 'week', 'month'] as const).map((range) => (
            <button
              key={range}
              onClick={() => onDateRangeChange?.(range)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                dateRange === range ? 'bg-white text-black' : 'bg-black-800 text-gray-300 hover:bg-black-700'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {chartData && chartData.length > 0 ? (
          chartData.map((stat, idx) => {
            const tasksCompleted = (stat as any).tasks_completed || 0;
            const focusTime = (stat as any).total_focus_time || 0;
            const pomodorosCompleted = (stat as any).pomodoros_completed || 0;
            const statsDate = (stat as any).stats_date || new Date(idx * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            
            // Calculate percentage for bar width (based on max possible)
            const maxTasks = 20;
            const barWidth = Math.min((tasksCompleted / maxTasks) * 100, 100);

            return (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-24 text-sm font-medium text-white shrink-0">
                  {new Date(statsDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="flex-1 bg-black-800 rounded-full h-8 relative overflow-hidden">
                  <div
                    className="bg-linear-to-r from-white to-gray-300 h-full rounded-full flex items-center justify-end pr-2 transition-all"
                    style={{
                      width: `${barWidth}%`,
                    }}
                  >
                    {tasksCompleted > 0 && (
                      <span className="text-black text-xs font-bold">{tasksCompleted}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-4 text-right text-sm text-gray-300 shrink-0 w-32">
                  <div>
                    <p className="text-xs text-gray-500">Focus Time</p>
                    <p className="text-white font-medium">{Math.round(focusTime / 60)}h</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Pomodoros</p>
                    <p className="text-white font-medium">{pomodorosCompleted}</p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-400">No data for this period</div>
        )}
      </div>
    </div>
  );
}
