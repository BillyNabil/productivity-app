/**
 * Chat Templates for AI Assistant
 * Memudahkan pembuatan template chat otomatis untuk berbagai tipe permintaan
 */

export type ChatTemplateType =
  | 'task'
  | 'habit'
  | 'goal'
  | 'time_block'
  | 'reminder'
  | 'general'
  | 'question'
  | 'suggestion';

export interface ChatTemplate {
  id: string;
  name: string;
  type: ChatTemplateType;
  category?: string;
  promptTemplate: string;
  systemMessage: string;
  responseFormat?: string;
  examples?: string[];
  variables?: string[];
  tags?: string[];
  enabled?: boolean;
  description?: string;
}

export interface ChatTemplateVariable {
  name: string;
  placeholder: string;
  required: boolean;
  type: 'string' | 'number' | 'date' | 'select';
  options?: string[];
}

export interface QuickTemplate {
  label: string;
  template: string;
  shortcut: string;
  icon: string; // lucide-react icon name
}

export interface TemplateExecutionContext {
  variables: Record<string, any>;
  userId?: string;
  conversationHistory?: any[];
  metadata?: Record<string, any>;
}

/**
 * Koleksi template chat default untuk AI Assistant
 */
export const DEFAULT_CHAT_TEMPLATES: Record<string, ChatTemplate> = {
  // ==================== TASK TEMPLATES ====================
  'task-simple': {
    id: 'task-simple',
    name: 'Simple Task Creation',
    type: 'task',
    category: 'task',
    promptTemplate: 'Create a new task: {{title}}',
    systemMessage: `You are a task creation assistant. When a user wants to create a simple task, 
respond with structured JSON:
{
  "action": "task",
  "title": "user's task title",
  "details": {
    "description": "",
    "isUrgent": false,
    "isImportant": false,
    "estimatedDuration": null,
    "dueDate": null,
    "tags": [],
    "color": "#3b82f6"
  }
}`,
    examples: [
      'Create a task: Buy groceries',
      'Add task: Finish project report',
      'I need to remember to call the dentist',
    ],
    variables: ['title'],
    tags: ['basic', 'task'],
    description: 'Template untuk membuat task sederhana',
  },

  'task-detailed': {
    id: 'task-detailed',
    name: 'Detailed Task with Priority',
    type: 'task',
    category: 'task',
    promptTemplate:
      'Create task "{{title}}" with priority {{priority}}, due {{dueDate}}, estimated {{duration}} minutes',
    systemMessage: `You are an advanced task creation assistant. Handle detailed task requests with:
- Priority levels (urgent/important)
- Due dates
- Estimated duration
- Tags and categories
Respond with structured JSON for task creation.`,
    examples: [
      'Create urgent task: Fix critical bug, due tomorrow, takes 2 hours',
      'Add important task: Prepare presentation, due Friday, 30 minutes',
      'Make a task for project review, not urgent, 1 hour',
    ],
    variables: ['title', 'priority', 'dueDate', 'duration'],
    tags: ['advanced', 'task', 'priority'],
    description: 'Template untuk membuat task dengan detail lengkap',
  },

  'task-with-subtasks': {
    id: 'task-with-subtasks',
    name: 'Task with Subtasks',
    type: 'task',
    category: 'task',
    promptTemplate:
      'Create task "{{title}}" with subtasks: {{subtasks}}',
    systemMessage: `Create a main task with breakdown into subtasks:
{
  "action": "task",
  "title": "main task",
  "details": {
    "description": "subtasks list",
    "subtasks": ["subtask1", "subtask2", "subtask3"]
  }
}`,
    examples: [
      'Create project task with subtasks: design, develop, test, deploy',
      'Break down task into: research, outline, write, edit, review',
    ],
    variables: ['title', 'subtasks'],
    tags: ['advanced', 'task', 'breakdown'],
    description: 'Template untuk membuat task dengan sub-task',
  },

  // ==================== HABIT TEMPLATES ====================
  'habit-daily': {
    id: 'habit-daily',
    name: 'Daily Habit Creation',
    type: 'habit',
    category: 'habit',
    promptTemplate: 'Create daily habit: {{habitName}} in category {{category}}',
    systemMessage: `Create a daily habit with:
{
  "action": "habit",
  "title": "habit name",
  "details": {
    "category": "health|fitness|learning|meditation|reading|general",
    "frequency": "daily",
    "description": "habit description"
  }
}`,
    examples: [
      'Create daily habit: Drink 8 glasses of water',
      'Add meditation habit, daily, 10 minutes',
      'Create reading habit, read 30 minutes daily',
    ],
    variables: ['habitName', 'category'],
    tags: ['habit', 'daily', 'routine'],
    description: 'Template untuk membuat habit harian',
  },

  'habit-weekly': {
    id: 'habit-weekly',
    name: 'Weekly Habit Creation',
    type: 'habit',
    category: 'habit',
    promptTemplate: 'Create weekly habit: {{habitName}} - {{frequency}} times per week',
    systemMessage: `Create a weekly habit:
{
  "action": "habit",
  "title": "habit name",
  "details": {
    "frequency": "weekly",
    "occurrences": number,
    "category": "habit category"
  }
}`,
    examples: [
      'Create weekly habit: Gym workout, 3 times per week',
      'Add weekly habit: Team meeting, twice weekly',
    ],
    variables: ['habitName', 'frequency'],
    tags: ['habit', 'weekly', 'routine'],
    description: 'Template untuk membuat habit mingguan',
  },

  'habit-tracking': {
    id: 'habit-tracking',
    name: 'Track Habit Progress',
    type: 'habit',
    category: 'habit',
    promptTemplate: 'Track {{habitName}}: completed {{status}} - {{notes}}',
    systemMessage: `Track habit completion status and provide feedback`,
    examples: [
      'I did my meditation today',
      'Completed workout session',
      'Finished reading chapter',
    ],
    variables: ['habitName', 'status', 'notes'],
    tags: ['habit', 'tracking', 'progress'],
    description: 'Template untuk tracking progress habit',
  },

  // ==================== GOAL TEMPLATES ====================
  'goal-daily': {
    id: 'goal-daily',
    name: 'Daily Goal Setting',
    type: 'goal',
    category: 'goal',
    promptTemplate: 'Set daily goals: {{goal1}}, {{goal2}}, {{goal3}}',
    systemMessage: `Set up to 3 daily goals:
{
  "action": "goal",
  "details": {
    "goal_1": "first goal",
    "goal_2": "second goal or empty",
    "goal_3": "third goal or empty"
  }
}`,
    examples: [
      'My goals today are: finish report, team meeting, code review',
      'Set 2 goals: exercise, meal prep',
      'Daily goals: write 1000 words',
    ],
    variables: ['goal1', 'goal2', 'goal3'],
    tags: ['goal', 'daily', 'planning'],
    description: 'Template untuk menetapkan goal harian',
  },

  'goal-weekly': {
    id: 'goal-weekly',
    name: 'Weekly Goal Planning',
    type: 'goal',
    category: 'goal',
    promptTemplate: 'Create weekly goals: {{goals}}',
    systemMessage: `Plan weekly goals with priorities and timelines`,
    examples: [
      'Weekly goals: complete project, learn new skill, exercise 4 times',
      'Set week goals: finish presentation, client meeting, team building',
    ],
    variables: ['goals'],
    tags: ['goal', 'weekly', 'planning'],
    description: 'Template untuk perencanaan goal mingguan',
  },

  // ==================== TIME BLOCK TEMPLATES ====================
  'timeblock-focus': {
    id: 'timeblock-focus',
    name: 'Focus Time Block',
    type: 'time_block',
    category: 'time_block',
    promptTemplate: 'Create focus time block: {{duration}} minutes for {{task}}',
    systemMessage: `Create a focused work time block:
{
  "action": "time_block",
  "title": "Focus Session: {{task}}",
  "details": {
    "startTime": "now",
    "duration": "{{duration}} minutes",
    "type": "focus",
    "notes": "no interruptions"
  }
}`,
    examples: [
      'Block 90 minutes for coding',
      'Schedule 2 hour focus session for writing',
      'Create 60 minute deep work block',
    ],
    variables: ['duration', 'task'],
    tags: ['timeblock', 'productivity', 'focus'],
    description: 'Template untuk membuat focus time block',
  },

  'timeblock-meeting': {
    id: 'timeblock-meeting',
    name: 'Meeting Time Block',
    type: 'time_block',
    category: 'time_block',
    promptTemplate: 'Schedule meeting: {{title}} at {{time}} for {{duration}} minutes',
    systemMessage: `Schedule a meeting time block`,
    examples: [
      'Schedule team meeting at 2 PM for 1 hour',
      'Add client call at 10:30 AM, 30 minutes',
      'Book 1-on-1 at 3 PM, 45 minutes',
    ],
    variables: ['title', 'time', 'duration'],
    tags: ['timeblock', 'meeting', 'calendar'],
    description: 'Template untuk scheduling meeting',
  },

  'timeblock-break': {
    id: 'timeblock-break',
    name: 'Break Time Block',
    type: 'time_block',
    category: 'time_block',
    promptTemplate: 'Schedule {{breakType}} break: {{duration}} minutes',
    systemMessage: `Schedule a break time block for rest and recovery`,
    examples: [
      'Schedule 15 minute coffee break',
      'Add 30 minute lunch break',
      'Book 10 minute stretching break',
    ],
    variables: ['breakType', 'duration'],
    tags: ['timeblock', 'break', 'wellbeing'],
    description: 'Template untuk scheduling break time',
  },

  // ==================== REMINDER TEMPLATES ====================
  'reminder-simple': {
    id: 'reminder-simple',
    name: 'Simple Reminder',
    type: 'reminder',
    category: 'reminder',
    promptTemplate: 'Remind me: {{message}} at {{time}}',
    systemMessage: `Create a simple reminder notification`,
    examples: [
      'Remind me to drink water in 1 hour',
      'Set reminder: call mom at 5 PM',
      'Remind me about meeting in 15 minutes',
    ],
    variables: ['message', 'time'],
    tags: ['reminder', 'notification', 'alert'],
    description: 'Template untuk membuat reminder sederhana',
  },

  'reminder-recurring': {
    id: 'reminder-recurring',
    name: 'Recurring Reminder',
    type: 'reminder',
    category: 'reminder',
    promptTemplate: 'Create recurring reminder: {{message}}, {{frequency}}',
    systemMessage: `Create recurring reminders with frequency`,
    examples: [
      'Remind me daily at 8 AM: take vitamins',
      'Weekly reminder every Monday: team standup',
      'Remind me every 2 hours: break time',
    ],
    variables: ['message', 'frequency'],
    tags: ['reminder', 'recurring', 'routine'],
    description: 'Template untuk membuat reminder berulang',
  },

  // ==================== GENERAL TEMPLATES ====================
  'question-productivity': {
    id: 'question-productivity',
    name: 'Productivity Question',
    type: 'question',
    category: 'general',
    promptTemplate: 'Help with: {{question}}',
    systemMessage: `Answer productivity and time management questions with practical advice`,
    examples: [
      'How do I manage my time better?',
      'What are time blocking techniques?',
      'How to prioritize tasks effectively?',
    ],
    variables: ['question'],
    tags: ['question', 'advice', 'help'],
    description: 'Template untuk menjawab pertanyaan produktivitas',
  },

  'suggestion-optimization': {
    id: 'suggestion-optimization',
    name: 'Optimization Suggestion',
    type: 'suggestion',
    category: 'general',
    promptTemplate: 'Suggest improvements for: {{context}}',
    systemMessage: `Provide actionable suggestions for productivity optimization`,
    examples: [
      'Suggest how to optimize my morning routine',
      'Help optimize my work schedule',
      'Recommendations for better focus',
    ],
    variables: ['context'],
    tags: ['suggestion', 'optimization', 'improvement'],
    description: 'Template untuk memberikan suggestion optimasi',
  },

  'analysis-habits': {
    id: 'analysis-habits',
    name: 'Habit Analysis',
    type: 'general',
    category: 'general',
    promptTemplate: 'Analyze my {{habitType}} habits and suggest improvements',
    systemMessage: `Analyze user habits and provide improvement recommendations`,
    examples: [
      'Analyze my reading habits',
      'Review my exercise pattern',
      'Evaluate my sleep routine',
    ],
    variables: ['habitType'],
    tags: ['analysis', 'habits', 'insights'],
    description: 'Template untuk analisis habits',
  },
};

/**
 * Template variables untuk common use cases
 */
export const TEMPLATE_VARIABLES: Record<ChatTemplateType, ChatTemplateVariable[]> = {
  task: [
    {
      name: 'title',
      placeholder: 'Task title or description',
      required: true,
      type: 'string',
    },
    {
      name: 'priority',
      placeholder: 'urgent, important, normal',
      required: false,
      type: 'select',
      options: ['urgent', 'important', 'normal'],
    },
    {
      name: 'dueDate',
      placeholder: 'Due date (today, tomorrow, next week)',
      required: false,
      type: 'string',
    },
    {
      name: 'duration',
      placeholder: 'Estimated duration in minutes',
      required: false,
      type: 'number',
    },
  ],
  habit: [
    {
      name: 'habitName',
      placeholder: 'Habit name',
      required: true,
      type: 'string',
    },
    {
      name: 'category',
      placeholder: 'health, fitness, learning, etc',
      required: false,
      type: 'select',
      options: ['health', 'fitness', 'learning', 'meditation', 'reading', 'general'],
    },
    {
      name: 'frequency',
      placeholder: 'daily, weekly, custom',
      required: false,
      type: 'select',
      options: ['daily', 'weekly', 'custom'],
    },
  ],
  goal: [
    {
      name: 'goal1',
      placeholder: 'First goal',
      required: true,
      type: 'string',
    },
    {
      name: 'goal2',
      placeholder: 'Second goal (optional)',
      required: false,
      type: 'string',
    },
    {
      name: 'goal3',
      placeholder: 'Third goal (optional)',
      required: false,
      type: 'string',
    },
  ],
  time_block: [
    {
      name: 'task',
      placeholder: 'What to focus on',
      required: true,
      type: 'string',
    },
    {
      name: 'duration',
      placeholder: 'Duration in minutes',
      required: true,
      type: 'number',
    },
    {
      name: 'time',
      placeholder: 'Start time',
      required: false,
      type: 'string',
    },
  ],
  reminder: [
    {
      name: 'message',
      placeholder: 'What to remind about',
      required: true,
      type: 'string',
    },
    {
      name: 'time',
      placeholder: 'When (e.g., in 1 hour, at 3 PM)',
      required: true,
      type: 'string',
    },
  ],
  question: [
    {
      name: 'question',
      placeholder: 'Your question',
      required: true,
      type: 'string',
    },
  ],
  suggestion: [
    {
      name: 'context',
      placeholder: 'Context for suggestion',
      required: true,
      type: 'string',
    },
  ],
  general: [
    {
      name: 'query',
      placeholder: 'Your query',
      required: true,
      type: 'string',
    },
  ],
};

/**
 * Predefined quick templates untuk quick access
 */
export const QUICK_TEMPLATES: QuickTemplate[] = [
  {
    label: 'Add Task',
    template: 'task-simple',
    shortcut: 'Ctrl+T',
    icon: 'CheckSquare',
  },
  {
    label: 'Create Habit',
    template: 'habit-daily',
    shortcut: 'Ctrl+H',
    icon: 'Repeat2',
  },
  {
    label: 'Set Goal',
    template: 'goal-daily',
    shortcut: 'Ctrl+G',
    icon: 'Target',
  },
  {
    label: 'Focus Block',
    template: 'timeblock-focus',
    shortcut: 'Ctrl+F',
    icon: 'Clock',
  },
  {
    label: 'Add Reminder',
    template: 'reminder-simple',
    shortcut: 'Ctrl+R',
    icon: 'Bell',
  },
];
