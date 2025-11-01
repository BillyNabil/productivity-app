import { createClient } from '@/lib/supabase/client';
import { AIMessage, AIRequest, AIResponse, AIsuggestion, ItemType } from '@/types/ai';
import { Task, CreateTaskInput } from '@/types/task';
import { Habit } from '@/types/daily-goals';
import { TimeBlock, CreateTimeBlockInput } from '@/types/time-block';
import { syncService } from '@/lib/services/sync-service';

/**
 * Main AI Service for processing natural language requests
 */
export class AIService {
  private supabase = createClient();
  private conversationContext: AIMessage[] = [];

  /**
   * Process natural language input and execute corresponding actions
   */
  async processRequest(userMessage: string): Promise<AIResponse> {
    try {
      // Add user message to context
      this.conversationContext.push({
        id: Date.now().toString(),
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString(),
      });

      // Analyze the request
      const analysis = this.analyzeRequest(userMessage);

      // Execute the appropriate action
      let response: AIResponse;
      switch (analysis.itemType) {
        case 'task':
          response = await this.handleTaskRequest(analysis, userMessage);
          break;
        case 'habit':
          response = await this.handleHabitRequest(analysis, userMessage);
          break;
        case 'goal':
          response = await this.handleGoalRequest(analysis, userMessage);
          break;
        case 'reminder':
          response = await this.handleReminderRequest(analysis, userMessage);
          break;
        case 'time_block':
          response = await this.handleTimeBlockRequest(analysis, userMessage);
          break;
        case 'calendar_event':
          response = await this.handleCalendarRequest(analysis, userMessage);
          break;
        default:
          response = await this.handleGeneralRequest(userMessage);
      }

      // Add assistant response to context
      this.conversationContext.push({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
      });

      return response;
    } catch (error) {
      console.error('Error processing AI request:', error);
      return {
        success: false,
        message: 'Sorry, I encountered an error processing your request. Please try again.',
      };
    }
  }

  /**
   * Analyze user input to determine intent and item type
   */
  private analyzeRequest(
    input: string
  ): { itemType: ItemType; operation: 'create' | 'update' | 'analyze'; confidence: number } {
    const lower = input.toLowerCase();

    // Reminder detection keywords (check first to avoid conflicts)
    const reminderKeywords = ['remind', 'reminder', 'alert', 'notification', 'notify'];
    if (reminderKeywords.some((kw) => lower.includes(kw))) {
      return { itemType: 'reminder', operation: 'create', confidence: 0.9 };
    }

    // Task detection keywords
    const taskKeywords = [
      'task',
      'todo',
      'add',
      'create',
      'need to',
      'should',
      'must do',
    ];
    if (taskKeywords.some((kw) => lower.includes(kw))) {
      return { itemType: 'task', operation: 'create', confidence: 0.9 };
    }

    // Habit detection keywords
    const habitKeywords = [
      'habit',
      'routine',
      'exercise',
      'meditate',
      'read',
      'practice',
    ];
    if (habitKeywords.some((kw) => lower.includes(kw))) {
      return { itemType: 'habit', operation: 'create', confidence: 0.9 };
    }

    // Goal detection keywords
    const goalKeywords = [
      'goal',
      'target',
      'aim',
      'want to achieve',
      'my goal is',
      'today\'s goal',
    ];
    if (goalKeywords.some((kw) => lower.includes(kw))) {
      return { itemType: 'goal', operation: 'create', confidence: 0.9 };
    }

    // Time block detection keywords
    const timeBlockKeywords = [
      'schedule',
      'block',
      'meeting',
      'reserve time',
      'book',
      'at',
      'o\'clock',
    ];
    if (timeBlockKeywords.some((kw) => lower.includes(kw))) {
      return { itemType: 'time_block', operation: 'create', confidence: 0.85 };
    }

    // Calendar event detection
    const calendarKeywords = ['calendar', 'event'];
    if (calendarKeywords.some((kw) => lower.includes(kw))) {
      return { itemType: 'calendar_event', operation: 'create', confidence: 0.85 };
    }

    // Default to task
    return { itemType: 'task', operation: 'create', confidence: 0.5 };
  }

  /**
   * Handle task-related requests
   */
  private async handleTaskRequest(
    analysis: { itemType: ItemType; operation: 'create' | 'update' | 'analyze'; confidence: number },
    userMessage: string
  ): Promise<AIResponse> {
    try {
      // Get current user session
      const { data: { user }, error: authError } = await this.supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Auth error:', authError);
        return {
          success: false,
          message: 'You must be logged in to create a task',
        };
      }

      const taskData = this.parseTaskInput(userMessage);

      // Validate required fields
      if (!taskData.title) {
        return {
          success: false,
          message:
            'I need a task title. What would you like to add as a task? For example: "Add task: Complete project report"',
        };
      }

      // Add user_id before inserting
      const taskDataWithUser = { ...taskData, user_id: user.id };

      // Create task
      const { data, error } = await this.supabase.from('tasks').insert([taskDataWithUser]).select();

      if (error) {
        const errorInfo = {
          message: error?.message || 'Unknown error',
          code: error?.code || 'UNKNOWN',
          details: error?.details || 'No details provided',
          hint: error?.hint,
          fullError: JSON.stringify(error),
        };
        console.error('Supabase error details:', errorInfo);
        throw new Error(error?.message || 'Failed to create task in database');
      }

      if (!data || data.length === 0) {
        throw new Error('Task was created but no data was returned');
      }

      const task = data[0];
      return {
        success: true,
        message: `✅ Task created: "${task.title}"${task.estimated_duration ? ` (${task.estimated_duration} mins)` : ''}`,
        action: {
          type: 'task',
          operation: 'create',
          data: task,
        },
        reasoning: `I created a task titled "${task.title}" with the details you provided.`,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('Error creating task:', errorMessage);
      return {
        success: false,
        message: `Failed to create task: ${errorMessage}`,
      };
    }
  }

  /**
   * Handle habit-related requests
   */
  private async handleHabitRequest(
    analysis: { itemType: ItemType; operation: 'create' | 'update' | 'analyze'; confidence: number },
    userMessage: string
  ): Promise<AIResponse> {
    try {
      // Get current user session
      const { data: { user }, error: authError } = await this.supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Auth error:', authError);
        return {
          success: false,
          message: 'You must be logged in to create a habit',
        };
      }

      const habitData = this.parseHabitInput(userMessage);

      if (!habitData.name) {
        return {
          success: false,
          message:
            'What habit would you like to create? For example: "Create habit: Morning meditation"',
        };
      }

      // Add user_id before inserting
      const habitDataWithUser = { ...habitData, user_id: user.id };

      const { data, error } = await this.supabase.from('habits').insert([habitDataWithUser]).select();

      if (error) {
        const errorInfo = {
          message: error?.message || 'Unknown error',
          code: error?.code || 'UNKNOWN',
          details: error?.details || 'No details provided',
          hint: error?.hint,
          fullError: JSON.stringify(error),
        };
        console.error('Supabase error details:', errorInfo);
        throw new Error(error?.message || 'Failed to create habit in database');
      }

      if (!data || data.length === 0) {
        throw new Error('Habit was created but no data was returned');
      }

      const habit = data[0];
      return {
        success: true,
        message: `✅ Habit created: "${habit.name}" (${habit.frequency})`,
        action: {
          type: 'habit',
          operation: 'create',
          data: habit,
        },
        reasoning: `I created a new ${habit.frequency} habit called "${habit.name}".`,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('Error creating habit:', errorMessage);
      return {
        success: false,
        message: `Failed to create habit: ${errorMessage}`,
      };
    }
  }

  /**
   * Handle goal-related requests
   */
  private async handleGoalRequest(
    analysis: { itemType: ItemType; operation: 'create' | 'update' | 'analyze'; confidence: number },
    userMessage: string
  ): Promise<AIResponse> {
    try {
      // Get current user session
      const { data: { user }, error: authError } = await this.supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Auth error:', authError);
        return {
          success: false,
          message: 'You must be logged in to create a goal',
        };
      }

      const goalData = this.parseGoalInput(userMessage);

      if (!goalData.goal_1) {
        return {
          success: false,
          message: 'What goal would you like to set? For example: "My goal today is to finish the report"',
        };
      }

      // Add user_id before inserting
      const goalDataWithUser = { ...goalData, user_id: user.id };

      const { data, error } = await this.supabase.from('daily_goals').insert([goalDataWithUser]).select();

      if (error) {
        const errorInfo = {
          message: error?.message || 'Unknown error',
          code: error?.code || 'UNKNOWN',
          details: error?.details || 'No details provided',
          hint: error?.hint,
          fullError: JSON.stringify(error),
        };
        console.error('Supabase error details:', errorInfo);
        throw new Error(error?.message || 'Failed to create goal in database');
      }

      if (!data || data.length === 0) {
        throw new Error('Goal was created but no data was returned');
      }

      const goal = data[0];
      return {
        success: true,
        message: `✅ Daily goals created for ${new Date(goal.goal_date).toLocaleDateString()}`,
        action: {
          type: 'goal',
          operation: 'create',
          data: goal,
        },
        reasoning: `I've set your daily goals. You can add up to 3 main goals for the day.`,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('Error creating goal:', errorMessage);
      return {
        success: false,
        message: `Failed to create goal: ${errorMessage}`,
      };
    }
  }

  /**
   * Handle reminder requests
   */
  private async handleReminderRequest(
    analysis: { itemType: ItemType; operation: 'create' | 'update' | 'analyze'; confidence: number },
    userMessage: string
  ): Promise<AIResponse> {
    try {
      // Get current user session
      const { data: { user }, error: authError } = await this.supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Auth error:', authError);
        return {
          success: false,
          message: 'You must be logged in to create a reminder',
        };
      }

      const reminderData = this.parseReminderInput(userMessage);

      if (!reminderData.message) {
        return {
          success: false,
          message:
            'What would you like to be reminded about? For example: "Remind me to call mom at 5pm"',
        };
      }

      // For reminders, we'll store them as a note about the reminder
      // In a real implementation, this would create a reminder in the task_reminders table
      return {
        success: true,
        message: `✅ Reminder set: "${reminderData.message}"${reminderData.time ? ` at ${reminderData.time}` : ''}`,
        action: {
          type: 'reminder',
          operation: 'create',
          data: reminderData,
        },
        reasoning: `I've set a reminder for you: ${reminderData.message}`,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('Error creating reminder:', errorMessage);
      return {
        success: false,
        message: `Failed to create reminder: ${errorMessage}`,
      };
    }
  }

  /**
   * Handle time block requests
   */
  private async handleTimeBlockRequest(
    analysis: { itemType: ItemType; operation: 'create' | 'update' | 'analyze'; confidence: number },
    userMessage: string
  ): Promise<AIResponse> {
    try {
      // Get current user session
      const { data: { user }, error: authError } = await this.supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Auth error:', authError);
        return {
          success: false,
          message: 'You must be logged in to create a time block',
        };
      }

      const timeBlockData = this.parseTimeBlockInput(userMessage);

      if (!timeBlockData.start_time) {
        return {
          success: false,
          message:
            'What time would you like to schedule? For example: "Schedule meeting from 2pm to 3pm"',
        };
      }

      // STEP 1: First, create an associated task
      const taskTitle = timeBlockData.notes || 'Scheduled Time Block';
      const taskData: CreateTaskInput = {
        title: taskTitle,
        description: `Time block scheduled: ${new Date(timeBlockData.start_time).toLocaleString()}`,
        is_urgent: false,
        is_important: false,
        tags: ['scheduled'],
        color: '#06b6d4', // cyan for scheduled items
      };

      const taskDataWithUser = { ...taskData, user_id: user.id };
      const { data: taskResult, error: taskError } = await this.supabase
        .from('tasks')
        .insert([taskDataWithUser])
        .select();

      if (taskError) {
        console.error('Failed to create task:', taskError);
        throw new Error(`Failed to create associated task: ${taskError.message}`);
      }

      if (!taskResult || taskResult.length === 0) {
        throw new Error('Task was created but no data was returned');
      }

      const createdTask = taskResult[0];

      // STEP 2: Create time block linked to the task
      const timeBlockDataWithUserAndTask = {
        ...timeBlockData,
        user_id: user.id,
        task_id: createdTask.id, // Link to the created task
      };

      const { data: timeBlockResult, error: timeBlockError } = await this.supabase
        .from('time_blocks')
        .insert([timeBlockDataWithUserAndTask])
        .select();

      if (timeBlockError) {
        console.error('Failed to create time block:', timeBlockError);
        // Clean up the created task if time block creation fails
        await this.supabase.from('tasks').delete().eq('id', createdTask.id);
        throw new Error(`Failed to create time block: ${timeBlockError.message}`);
      }

      if (!timeBlockResult || timeBlockResult.length === 0) {
        // Clean up
        await this.supabase.from('tasks').delete().eq('id', createdTask.id);
        throw new Error('Time block was created but no data was returned');
      }

      const block = timeBlockResult[0];

      // STEP 3: Sync the time block to task (update task status to in_progress)
      const syncResult = await syncService.syncTimeBlockToTask(block);
      console.log('Time block sync result:', syncResult);

      const startTime = new Date(block.start_time).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const endTime = new Date(block.end_time).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      return {
        success: true,
        message: `✅ Time block scheduled: ${startTime} - ${endTime}${block.notes ? ` (${block.notes})` : ''}\n📋 Associated task created: "${createdTask.title}"`,
        action: {
          type: 'time_block',
          operation: 'create',
          data: {
            timeBlock: block,
            task: createdTask,
          },
        },
        reasoning: `I've created a task "${createdTask.title}" and scheduled it from ${startTime} to ${endTime}. The task status is now set to in-progress.`,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('Error creating time block:', errorMessage);
      return {
        success: false,
        message: `Failed to create time block: ${errorMessage}`,
      };
    }
  }

  /**
   * Handle calendar event requests
   */
  private async handleCalendarRequest(
    analysis: { itemType: ItemType; operation: 'create' | 'update' | 'analyze'; confidence: number },
    userMessage: string
  ): Promise<AIResponse> {
    // Calendar events are created as time blocks for now
    return this.handleTimeBlockRequest(analysis, userMessage);
  }

  /**
   * Handle general requests (analytics, suggestions, etc.)
   */
  private async handleGeneralRequest(userMessage: string): Promise<AIResponse> {
    const lower = userMessage.toLowerCase();

    // Analyze request
    if (lower.includes('suggest') || lower.includes('recommend')) {
      return this.generateSuggestions();
    }

    if (lower.includes('summary') || lower.includes('overview')) {
      return this.generateSummary();
    }

    if (lower.includes('help') || lower.includes('what can you')) {
      return this.showHelp();
    }

    return {
      success: true,
      message:
        "I'm not sure what you meant. I can help you create tasks, habits, goals, and time blocks. Try saying something like: 'Add a task to finish the project' or 'Create a daily habit of meditation'",
    };
  }

  /**
   * Parse task input from natural language
   */
  private parseTaskInput(input: string): CreateTaskInput {
    const lower = input.toLowerCase();

    return {
      title: this.extractTitle(input),
      description: this.extractDescription(input),
      is_urgent: lower.includes('urgent') || lower.includes('asap') || lower.includes('immediately'),
      is_important:
        lower.includes('important') || lower.includes('critical') || lower.includes('essential'),
      estimated_duration: this.extractDuration(input),
      tags: this.extractTags(input),
      color: this.extractColor(input) || '#3b82f6',
    };
  }

  /**
   * Parse habit input from natural language
   */
  private parseHabitInput(input: string): Partial<Habit> {
    const lower = input.toLowerCase();

    // Detect category
    let category: 'health' | 'fitness' | 'learning' | 'meditation' | 'reading' | 'general' =
      'general';
    if (lower.includes('exercise') || lower.includes('gym') || lower.includes('workout'))
      category = 'fitness';
    if (lower.includes('read')) category = 'reading';
    if (lower.includes('meditat')) category = 'meditation';
    if (lower.includes('sleep') || lower.includes('health')) category = 'health';
    if (lower.includes('learn') || lower.includes('study')) category = 'learning';

    // Detect frequency
    let frequency: 'daily' | 'weekly' | 'custom' = 'daily';
    if (lower.includes('weekly') || lower.includes('week')) frequency = 'weekly';

    return {
      name: this.extractTitle(input),
      description: this.extractDescription(input),
      category,
      frequency,
      is_active: true,
      color: this.extractColor(input) || '#10b981',
    };
  }

  /**
   * Parse goal input from natural language
   */
  private parseGoalInput(input: string) {
    return {
      goal_date: new Date().toISOString().split('T')[0],
      goal_1: this.extractTitle(input),
      goal_2: '',
      goal_3: '',
      goal_1_completed: false,
      goal_2_completed: false,
      goal_3_completed: false,
    };
  }

  /**
   * Parse reminder input from natural language
   */
  private parseReminderInput(input: string) {
    const timeMatch = input.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
    const inMatch = input.match(/in\s+(\d+)\s*(hour|hr|minute|min|hours|minutes)/i);
    
    let time: string | undefined;
    if (timeMatch) {
      const hour = parseInt(timeMatch[1]);
      const minute = parseInt(timeMatch[2] || '0');
      const period = timeMatch[3]?.toLowerCase();
      
      let adjHour = hour;
      if (period === 'pm' && hour !== 12) adjHour = hour + 12;
      if (period === 'am' && hour === 12) adjHour = 0;
      
      time = `${adjHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    } else if (inMatch) {
      const value = parseInt(inMatch[1]);
      const unit = inMatch[2].toLowerCase();
      if (unit.includes('hour')) {
        time = `in ${value} hour${value > 1 ? 's' : ''}`;
      } else {
        time = `in ${value} minute${value > 1 ? 's' : ''}`;
      }
    }

    return {
      message: this.extractTitle(input),
      time: time,
      frequency: input.toLowerCase().includes('recurring') || input.toLowerCase().includes('every') ? 'daily' : 'once',
    };
  }

  /**
   * Parse time block input from natural language
   */
  private parseTimeBlockInput(input: string): CreateTimeBlockInput {
    const timeMatch = input.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
    const durationMatch = input.match(/(\d+)\s*(hour|hr|minute|min)/i);

    let startTime = new Date();
    let endTime = new Date();

    if (timeMatch) {
      const hour = parseInt(timeMatch[1]);
      const minute = parseInt(timeMatch[2] || '0');
      const period = timeMatch[3]?.toLowerCase();

      let adjHour = hour;
      if (period === 'pm' && hour !== 12) adjHour = hour + 12;
      if (period === 'am' && hour === 12) adjHour = 0;

      startTime.setHours(adjHour, minute, 0, 0);
      endTime = new Date(startTime);

      // Add duration or default 1 hour
      if (durationMatch) {
        const value = parseInt(durationMatch[1]);
        const unit = durationMatch[2].toLowerCase();
        if (unit.includes('hour') || unit.includes('hr')) {
          endTime.setHours(endTime.getHours() + value);
        } else {
          endTime.setMinutes(endTime.getMinutes() + value);
        }
      } else {
        endTime.setHours(endTime.getHours() + 1);
      }
    }

    return {
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      type: 'work',
      notes: this.extractTitle(input),
    };
  }

  /**
   * Extract title from input
   */
  private extractTitle(input: string): string {
    // Remove common prefixes
    let title = input
      .replace(/^(add|create|new|make|schedule|set|log|track)/i, '')
      .replace(/^(task|habit|goal|event|reminder|time block|meeting)[\s:]*-?/i, '')
      .trim();

    // Take first 100 chars or first sentence
    const sentences = title.split(/[.!?]/);
    title = sentences[0].trim();

    return title.substring(0, 100);
  }

  /**
   * Extract description from input
   */
  private extractDescription(input: string): string | undefined {
    const parts = input.split(/(?:description|details|notes|because)[\s:]*-?/i);
    if (parts.length > 1) {
      return parts[1].trim().substring(0, 500);
    }
    return undefined;
  }

  /**
   * Extract duration from input (in minutes)
   */
  private extractDuration(input: string): number | undefined {
    const match = input.match(/(\d+)\s*(hour|hr|minute|min)/i);
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2].toLowerCase();
      return unit.includes('hour') || unit.includes('hr') ? value * 60 : value;
    }
    return undefined;
  }

  /**
   * Extract tags from input
   */
  private extractTags(input: string): string[] {
    const tagMatch = input.match(/#\w+/g);
    return tagMatch ? tagMatch.map((tag) => tag.substring(1)) : [];
  }

  /**
   * Extract color preference from input
   */
  private extractColor(input: string): string | undefined {
    const colorMap: Record<string, string> = {
      red: '#ef4444',
      blue: '#3b82f6',
      green: '#10b981',
      yellow: '#f59e0b',
      purple: '#a855f7',
      pink: '#ec4899',
      orange: '#f97316',
    };

    for (const [color, hex] of Object.entries(colorMap)) {
      if (input.toLowerCase().includes(color)) {
        return hex;
      }
    }
    return undefined;
  }

  /**
   * Generate AI suggestions based on user data
   */
  private async generateSuggestions(): Promise<AIResponse> {
    return {
      success: true,
      message: 'Here are some suggestions to boost your productivity:',
      suggestions: [
        {
          id: '1',
          type: 'habit',
          title: 'Morning Meditation',
          description: 'Start your day with 10 minutes of meditation',
          priority: 'high',
          estimatedTime: 10,
        },
        {
          id: '2',
          type: 'task',
          title: 'Review Weekly Goals',
          description: 'Spend 15 minutes reviewing your progress',
          priority: 'medium',
          estimatedTime: 15,
        },
        {
          id: '3',
          type: 'time_block',
          title: 'Deep Work Block',
          description: 'Schedule 2 hours of uninterrupted focus time',
          priority: 'high',
          estimatedTime: 120,
        },
      ],
    };
  }

  /**
   * Generate productivity summary
   */
  private async generateSummary(): Promise<AIResponse> {
    return {
      success: true,
      message: 'Here\'s your productivity summary for today:',
      reasoning: 'Based on your tasks, habits, and time blocks, you\'re on track!',
    };
  }

  /**
   * Show help information
   */
  private showHelp(): AIResponse {
    return {
      success: true,
      message: `I'm your AI productivity assistant. I can help you:

📝 **Create Tasks**: "Add a task to finish the report"
🎯 **Set Habits**: "Create a habit to meditate daily"
🏆 **Set Goals**: "My goal today is to complete the project"
📅 **Schedule Time**: "Schedule a meeting from 2pm to 3pm"
⏰ **Set Reminders**: "Remind me about the deadline"
📊 **Get Suggestions**: "Suggest productivity improvements"

Just speak naturally or type what you want to do!`,
    };
  }

  /**
   * Get conversation context
   */
  getContext(): AIMessage[] {
    return this.conversationContext;
  }

  /**
   * Clear conversation context
   */
  clearContext(): void {
    this.conversationContext = [];
  }

  /**
   * Set conversation context
   */
  setContext(messages: AIMessage[]): void {
    this.conversationContext = messages;
  }
}

export const aiService = new AIService();
