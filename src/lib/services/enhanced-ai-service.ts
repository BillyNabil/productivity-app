import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/client';
import {
  getNextOccurrence,
  shouldGenerateToday,
} from '@/lib/utils/recurring-task-utils';
import { RecurringTask } from '@/types/recurring-task';
import { Task, CreateTaskInput } from '@/types/task';
import { Habit } from '@/types/daily-goals';
import { TimeBlock, CreateTimeBlockInput } from '@/types/time-block';
import { AIResponse } from '@/types/ai';

// Import store (will be lazy-loaded due to client-side nature)
let useAITimeBlockStore: any = null;

/**
 * Enhanced AI Service using Google Gemini 2.5 Flash model
 * Falls back to local NLP if API key is not available
 */
export class EnhancedAIService {
  private supabase = createClient();
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private conversationHistory: Array<{ role: string; parts: Array<{ text: string }> }> = [];
  private useGemini = false;

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (apiKey && apiKey !== 'your-gemini-api-key-here') {
      try {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        this.useGemini = true;
        console.log('✅ Gemini AI initialized successfully');
      } catch (error) {
        console.warn('⚠️ Gemini AI initialization failed, using local NLP:', error);
        this.useGemini = false;
      }
    } else {
      console.log('ℹ️ Gemini API key not configured, using local NLP');
    }
  }

  /**
   * Process natural language input using Gemini AI or local NLP
   */
  async processRequest(userMessage: string): Promise<AIResponse> {
    try {
      let response: AIResponse;

      if (this.useGemini) {
        response = await this.processWithGemini(userMessage);
      } else {
        response = await this.processWithLocalNLP(userMessage);
      }

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
   * Process request using Google Gemini API
   */
  private async processWithGemini(userMessage: string): Promise<AIResponse> {
    if (!this.model) {
      return await this.processWithLocalNLP(userMessage);
    }

    try {
      // Build system prompt for structured responses
      const currentDate = new Date();
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const systemPrompt = `You are an intelligent productivity assistant. When a user asks to create a task, habit, goal, or calendar event, respond with a structured JSON object in this format:

{
  "action": "task" | "habit" | "goal" | "time_block",
  "title": "string",
  "details": {
    "description": "optional string",
    "isUrgent": boolean,
    "isImportant": boolean,
    "estimatedDuration": number (in minutes),
    "dueDate": "ISO date string (YYYY-MM-DD) or null",
    "tags": ["tag1", "tag2"],
    "color": "#hexcode or null",
    "category": "for habits: health|fitness|learning|meditation|reading|general",
    "frequency": "for habits: daily|weekly|custom",
    "startTime": "ISO 8601 datetime string in UTC (e.g., '2025-11-02T14:00:00Z'), not 'YYYY-MM-DD' format",
    "endTime": "ISO 8601 datetime string in UTC (e.g., '2025-11-02T15:00:00Z'), must be after startTime",
    "notes": "optional string"
  },
  "reasoning": "brief explanation"
}

Current context:
- Today's date: ${currentDate.toISOString()}
- User's timezone: ${userTimezone}

CRITICAL RULES FOR TIME BLOCK TIMESTAMPS:
1. ALWAYS interpret times in the user's LOCAL timezone (${userTimezone})
2. ALWAYS convert times to UTC (Z suffix) in the JSON response
3. For "2pm" or "14:00" in user input → Create ISO datetime with 2pm in THEIR timezone, then convert to UTC
4. Example: If user says "2pm" and timezone is UTC-5 (EST):
   - User means: 2025-11-02 14:00:00 EST → 2025-11-02 19:00:00 UTC → Use "2025-11-02T19:00:00Z"
5. If no specific date mentioned, use today (${currentDate.toISOString().split('T')[0]})
6. Ensure endTime is always after startTime
7. For time blocks, infer duration (default 1 hour if not specified)
8. NEVER use placeholder formats like "YYYY-MM-DDT14:00:00"

If the user is asking for general help, suggestions, or something else, respond naturally but still include an "action" field with "help" or "general".

ALWAYS respond with valid JSON. Even for general questions, wrap your response in JSON.`;

      // Filter out empty parts from history before sending
      const validHistory = this.conversationHistory.filter((entry) => {
        return entry.parts && entry.parts.length > 0 && entry.parts.some((part) => part.text && part.text.trim());
      });

      // Create chat session with filtered history
      const chat = this.model.startChat({
        history: validHistory.length > 0 ? validHistory : undefined,
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.7,
        },
      });

      // Send message with system prompt
      const result = await chat.sendMessage(
        `${systemPrompt}\n\nUser request: ${userMessage}`
      );

      const responseText = result.response.text();

      // Only add to history if we have valid content
      if (userMessage.trim()) {
        this.conversationHistory.push({
          role: 'user',
          parts: [{ text: userMessage }],
        });
      }

      if (responseText.trim()) {
        this.conversationHistory.push({
          role: 'model',
          parts: [{ text: responseText }],
        });
      }

      // Keep history limited
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }

      // Parse the response
      const response = await this.parseGeminiResponse(responseText, userMessage);
      return response;
    } catch (error) {
      console.error('Gemini API error:', error);
      // Fallback to local NLP
      return await this.processWithLocalNLP(userMessage);
    }
  }

  /**
   * Parse Gemini's structured response
   */
  private async parseGeminiResponse(responseText: string, userMessage: string): Promise<AIResponse> {
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return await this.processWithLocalNLP(userMessage);
      }

      const parsed = JSON.parse(jsonMatch[0]);
      console.log('🤖 Gemini parsed response:', {
        action: parsed.action,
        title: parsed.title,
        startTime: parsed.details?.startTime,
        endTime: parsed.details?.endTime,
        fullResponse: parsed,
      });

      // Route to appropriate handler
      switch (parsed.action) {
        case 'task':
          return await this.createTaskFromGemini(parsed);
        case 'habit':
          return await this.createHabitFromGemini(parsed);
        case 'goal':
          return await this.createGoalFromGemini(parsed);
        case 'time_block':
          return await this.createTimeBlockFromGemini(parsed, userMessage);
        default:
          return {
            success: true,
            message: parsed.reasoning || 'Request processed',
          };
      }
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      return await this.processWithLocalNLP(userMessage);
    }
  }

  /**
   * Create task from Gemini response
   */
  private async createTaskFromGemini(parsed: any): Promise<AIResponse> {
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

      const taskData = {
        user_id: user.id,
        title: parsed.title,
        description: parsed.details?.description,
        is_urgent: parsed.details?.isUrgent || false,
        is_important: parsed.details?.isImportant || false,
        estimated_duration: parsed.details?.estimatedDuration,
        due_date: parsed.details?.dueDate,
        tags: parsed.details?.tags || [],
        color: parsed.details?.color || '#3b82f6',
      };

      const { data, error } = await this.supabase.from('tasks').insert([taskData]).select();

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
        reasoning: parsed.reasoning,
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
   * Create habit from Gemini response
   */
  private async createHabitFromGemini(parsed: any): Promise<AIResponse> {
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

      const habitData: Partial<Habit> = {
        user_id: user.id,
        name: parsed.title,
        description: parsed.details?.description,
        category: parsed.details?.category || 'general',
        frequency: parsed.details?.frequency || 'daily',
        is_active: true,
        color: parsed.details?.color || '#10b981',
      };

      const { data, error } = await this.supabase.from('habits').insert([habitData]).select();

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
        reasoning: parsed.reasoning,
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
   * Create goal from Gemini response
   */
  private async createGoalFromGemini(parsed: any): Promise<AIResponse> {
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

      const goalDate = new Date().toISOString().split('T')[0];

      // Check if goals already exist for today
      const { data: existingGoals, error: checkError } = await this.supabase
        .from('daily_goals')
        .select('id, goal_1_completed, goal_2_completed, goal_3_completed')
        .eq('user_id', user.id)
        .eq('goal_date', goalDate)
        .single();

      const goalData = {
        user_id: user.id,
        goal_date: goalDate,
        goal_1: parsed.title,
        goal_2: parsed.details?.goal_2 || '',
        goal_3: parsed.details?.goal_3 || '',
        goal_1_completed: false,
        goal_2_completed: false,
        goal_3_completed: false,
      };

      let data, error;

      if (existingGoals) {
        // Update existing goals, preserving completion status
        const { data: updateData, error: updateError } = await this.supabase
          .from('daily_goals')
          .update({
            goal_1: parsed.title,
            goal_2: parsed.details?.goal_2 || '',
            goal_3: parsed.details?.goal_3 || '',
          })
          .eq('id', existingGoals.id)
          .select();

        data = updateData;
        error = updateError;
      } else {
        // Insert new goals
        const { data: insertData, error: insertError } = await this.supabase
          .from('daily_goals')
          .insert([goalData])
          .select();

        data = insertData;
        error = insertError;
      }

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
      const action = existingGoals ? 'updated' : 'created';
      return {
        success: true,
        message: `✅ Daily goals ${action} for ${new Date(goal.goal_date).toLocaleDateString()}`,
        action: {
          type: 'goal',
          operation: existingGoals ? 'update' : 'create',
          data: goal,
        },
        reasoning: parsed.reasoning,
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
   * Create time block from Gemini response
   * Now uses client-side parsing of user message to get accurate times
   */
  private async createTimeBlockFromGemini(parsed: any, userMessage: string): Promise<AIResponse> {
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

      // FIRST: Try to extract times from the original user message (most accurate)
      const extractedTimes = this.extractTimeRange(userMessage);
      
      let startTime: Date;
      let endTime: Date;

      if (extractedTimes) {
        // Use extracted times from user message
        startTime = extractedTimes.startTime;
        endTime = extractedTimes.endTime;
        console.log('✅ Using extracted times from user message:', {
          startTime: startTime.toLocaleString(),
          endTime: endTime.toLocaleString(),
        });
      } else {
        // Fall back to Gemini's parsed times
        const validatedTimes = this.validateTimeBlockTimestamps(
          parsed.details?.startTime,
          parsed.details?.endTime
        );
        startTime = validatedTimes.start;
        endTime = validatedTimes.end;
        console.log('⚠️ Using Gemini-parsed times (no time range found in message):', {
          startTime: startTime.toLocaleString(),
          endTime: endTime.toLocaleString(),
        });
      }

      const timeBlockData = {
        user_id: user.id,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        type: 'work',
        notes: parsed.details?.notes || parsed.title,
      };

      console.log('📝 Creating time block with times:', {
        title: timeBlockData.notes,
        startTime: timeBlockData.start_time,
        endTime: timeBlockData.end_time,
        startTimeLocal: new Date(timeBlockData.start_time).toLocaleString(),
        endTimeLocal: new Date(timeBlockData.end_time).toLocaleString(),
      });

      const { data, error } = await this.supabase
        .from('time_blocks')
        .insert([timeBlockData])
        .select();

      if (error) {
        const errorInfo = {
          message: error?.message || 'Unknown error',
          code: error?.code || 'UNKNOWN',
          details: error?.details || 'No details provided',
          hint: error?.hint,
          fullError: JSON.stringify(error),
        };
        console.error('Supabase error details:', errorInfo);
        throw new Error(error?.message || 'Failed to create time block in database');
      }

      if (!data || data.length === 0) {
        throw new Error('Time block was created but no data was returned');
      }

      const block = data[0];
      const displayStartTime = new Date(block.start_time).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const displayEndTime = new Date(block.end_time).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      // Dispatch to zustand store for real-time UI updates
      try {
        if (!useAITimeBlockStore) {
          const module = await import('@/lib/hooks/use-ai-time-blocks');
          useAITimeBlockStore = module.useAITimeBlockStore;
        }
        
        if (useAITimeBlockStore) {
          const store = useAITimeBlockStore.getState?.() || useAITimeBlockStore();
          if (store.addToAddedTimeBlocks) {
            store.addToAddedTimeBlocks({
              title: block.notes || 'Time Block',
              type: block.type || 'work',
              startTime: new Date(block.start_time),
              endTime: new Date(block.end_time),
              description: parsed.details?.description,
            });
          }
        }
      } catch (storeError) {
        console.warn('Could not update store:', storeError);
      }

      return {
        success: true,
        message: `✅ Time block scheduled: ${displayStartTime} - ${displayEndTime}${block.notes ? ` (${block.notes})` : ''}`,
        action: {
          type: 'time_block',
          operation: 'create',
          data: block,
        },
        reasoning: parsed.reasoning,
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
   * Process request using local NLP (fallback)
   */
  private async processWithLocalNLP(userMessage: string): Promise<AIResponse> {
    // Import local AI service
    const { aiService } = await import('@/lib/services/ai-service');
    return aiService.processRequest(userMessage);
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Check if Gemini is available
   */
  isGeminiAvailable(): boolean {
    return this.useGemini;
  }

  /**
   * Get AI status
   */
  getStatus(): string {
    return this.useGemini ? 'Gemini 2.5 Flash' : 'Local NLP (Fallback)';
  }

  /**
   * Parse natural language time string to a Date object in local timezone
   * Examples: "2pm", "14:00", "2 PM", "14:30"
   */
  private parseNaturalLanguageTime(timeStr: string, baseDate: Date = new Date()): Date | null {
    if (!timeStr || typeof timeStr !== 'string') return null;

    // Clean up the string
    const cleaned = timeStr.trim().toLowerCase().replace(/\s+/g, ' ');
    
    // Match patterns like "2pm", "2:30pm", "14:00", "14:30"
    const timeMatch = cleaned.match(/(\d{1,2}):?(\d{0,2})\s*(am|pm)?/);
    
    if (!timeMatch) return null;

    let hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2] || '0');
    const period = timeMatch[3];

    // Convert to 24-hour format
    if (period) {
      if (period === 'pm' && hours !== 12) hours += 12;
      if (period === 'am' && hours === 12) hours = 0;
    }

    // Create a new date with the specified time
    const result = new Date(baseDate);
    result.setHours(hours, minutes, 0, 0);
    
    return result;
  }

  /**
   * Extract start and end times from user message (client-side parsing)
   * Examples: "schedule a meeting from 2pm to 3pm", "2 to 3pm", "14:00 to 15:00"
   */
  private extractTimeRange(userMessage: string): { startTime: Date; endTime: Date } | null {
    const timeRangePattern = /(?:from\s+)?(\d{1,2}):?(\d{0,2})\s*(am|pm)?\s*(?:to|-)\s*(\d{1,2}):?(\d{0,2})\s*(am|pm)?/i;
    const match = userMessage.match(timeRangePattern);

    if (!match) return null;

    const today = new Date();
    
    // Parse start time
    let startHours = parseInt(match[1]);
    const startMinutes = parseInt(match[2] || '0');
    let startPeriod = match[3]?.toLowerCase();

    // Parse end time
    let endHours = parseInt(match[4]);
    const endMinutes = parseInt(match[5] || '0');
    let endPeriod = match[6]?.toLowerCase();

    // If only one period is specified, apply it to both
    if (!startPeriod && endPeriod) startPeriod = endPeriod;
    if (startPeriod && !endPeriod) endPeriod = startPeriod;

    // Convert to 24-hour format
    if (startPeriod) {
      if (startPeriod === 'pm' && startHours !== 12) startHours += 12;
      if (startPeriod === 'am' && startHours === 12) startHours = 0;
    }

    if (endPeriod) {
      if (endPeriod === 'pm' && endHours !== 12) endHours += 12;
      if (endPeriod === 'am' && endHours === 12) endHours = 0;
    }

    const startTime = new Date(today);
    startTime.setHours(startHours, startMinutes, 0, 0);

    const endTime = new Date(today);
    endTime.setHours(endHours, endMinutes, 0, 0);

    return { startTime, endTime };
  }

  /**
   * Parse and validate timestamp from Gemini response
   * Handles placeholder formats like "YYYY-MM-DDT22:00:00" and converts them to valid ISO strings
   */
  private parseTimeBlockDateTime(timeStr: any): Date | null {
    if (!timeStr) return null;

    // If it's already a Date object, return it
    if (timeStr instanceof Date) {
      return timeStr;
    }

    const str = String(timeStr).trim();
    
    // Check if it's a placeholder format (e.g., "YYYY-MM-DDT22:00:00")
    if (str.match(/^YYYY-MM-DD/)) {
      console.warn(`Detected placeholder timestamp format: ${str}. Using current time instead.`);
      return null;
    }

    // Try to parse as ISO string
    try {
      const date = new Date(str);
      if (!isNaN(date.getTime())) {
        return date;
      }
    } catch (e) {
      console.warn(`Failed to parse timestamp: ${str}`, e);
    }

    return null;
  }

  /**
   * Validate and fix timestamps before inserting into database
   */
  private validateTimeBlockTimestamps(startStr: any, endStr: any): { start: Date; end: Date } {
    let startDate = this.parseTimeBlockDateTime(startStr);
    let endDate = this.parseTimeBlockDateTime(endStr);

    // If start time couldn't be parsed, use current time
    if (!startDate) {
      startDate = new Date();
    }

    // If end time couldn't be parsed, default to 1 hour after start
    if (!endDate) {
      endDate = new Date(startDate.getTime() + 3600000);
    }

    // Ensure end is after start
    if (endDate <= startDate) {
      endDate = new Date(startDate.getTime() + 3600000);
    }

    return { start: startDate, end: endDate };
  }
}

export const enhancedAIService = new EnhancedAIService();
