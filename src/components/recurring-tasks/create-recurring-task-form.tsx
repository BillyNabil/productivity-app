'use client';

import React, { useState } from 'react';
import { RecurrencePattern } from '@/types/recurring-task';
import { Button } from '@/components/ui/button';

interface CreateRecurringTaskFormProps {
  parentTaskId: string;
  onSubmit: (data: {
    frequency: 'daily' | 'weekly' | 'monthly';
    recurrence_pattern: RecurrencePattern;
    start_date: string;
    end_date?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function CreateRecurringTaskForm({
  parentTaskId,
  onSubmit,
  isLoading = false,
}: CreateRecurringTaskFormProps) {
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [dayOfMonth, setDayOfMonth] = useState<number>(1);
  const [interval, setInterval] = useState<number>(1);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const toggleDay = (dayNum: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayNum) ? prev.filter((d) => d !== dayNum) : [...prev, dayNum].sort()
    );
  };

  const validateForm = (): boolean => {
    setErrorMessage('');

    if (frequency === 'weekly' && selectedDays.length === 0) {
      setErrorMessage('Please select at least one day of the week');
      return false;
    }

    if (endDate && new Date(endDate) < new Date(startDate)) {
      setErrorMessage('End date must be after start date');
      return false;
    }

    if (interval < 1) {
      setErrorMessage('Interval must be at least 1');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    let recurrencePattern: RecurrencePattern = {
      interval: interval,
    };

    if (frequency === 'weekly') {
      recurrencePattern.days = selectedDays.length > 0 ? selectedDays : [new Date().getDay()];
    } else if (frequency === 'monthly') {
      recurrencePattern.day_of_month = dayOfMonth;
    }

    try {
      await onSubmit({
        frequency,
        recurrence_pattern: recurrencePattern,
        start_date: startDate,
        end_date: endDate || undefined,
      });
      
      // Reset form
      setInterval(1);
      setSelectedDays([]);
      setDayOfMonth(1);
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate('');
      setIsExpanded(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create recurring task');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="p-4 rounded-lg border-2 border-green-300 bg-green-50">
        <h3 className="font-bold text-lg mb-3">🔄 Make This Task Recurring</h3>

        {errorMessage && (
          <div className="mb-3 p-2 bg-red-100 border border-red-300 text-red-700 rounded text-sm">
            {errorMessage}
          </div>
        )}

        <div className="mb-3">
          <label className="block text-sm font-medium mb-2">Recurrence Frequency</label>
          <div className="flex gap-2">
            {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
              <button
                key={freq}
                type="button"
                onClick={() => setFrequency(freq)}
                className={`px-3 py-1 rounded capitalize font-medium ${
                  frequency === freq
                    ? 'bg-green-600 text-white'
                    : 'bg-white border border-green-400 hover:bg-green-100'
                }`}
              >
                {freq}
              </button>
            ))}
          </div>
        </div>

        {frequency === 'daily' && (
          <div className="mb-3">
            <label className="block text-sm font-medium mb-2">Repeat Every (days)</label>
            <input
              type="number"
              min="1"
              max="365"
              value={interval}
              onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
              className="w-full px-2 py-1 border rounded"
            />
            <small className="text-gray-600">
              {interval === 1 ? 'Every day' : `Every ${interval} days`}
            </small>
          </div>
        )}

        {frequency === 'weekly' && (
          <div className="mb-3">
            <label className="block text-sm font-medium mb-2">Days of Week</label>
            <div className="flex gap-2 flex-wrap mb-2">
              {dayNames.map((day, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleDay(idx)}
                  className={`px-3 py-1 rounded font-medium transition-colors ${
                    selectedDays.includes(idx)
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-green-400 hover:bg-green-100'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-2">Repeat Every (weeks)</label>
              <input
                type="number"
                min="1"
                max="52"
                value={interval}
                onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
                className="w-full px-2 py-1 border rounded"
              />
              <small className="text-gray-600">
                {interval === 1 ? 'Every week' : `Every ${interval} weeks`}
              </small>
            </div>
          </div>
        )}

        {frequency === 'monthly' && (
          <>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-2">Day of Month</label>
              <input
                type="number"
                min="1"
                max="31"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(parseInt(e.target.value))}
                className="w-full px-2 py-1 border rounded"
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-2">Repeat Every (months)</label>
              <input
                type="number"
                min="1"
                max="12"
                value={interval}
                onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
                className="w-full px-2 py-1 border rounded"
              />
              <small className="text-gray-600">
                {interval === 1 ? 'Every month' : `Every ${interval} months`}
              </small>
            </div>
          </>
        )}

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-2 py-1 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date (Optional)</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-2 py-1 border rounded"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            {isLoading ? 'Creating...' : 'Make Recurring'}
          </Button>
          <Button
            type="button"
            onClick={() => {
              setIsExpanded(false);
              setErrorMessage('');
            }}
            className="flex-1 bg-gray-400 hover:bg-gray-500 text-white"
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}
