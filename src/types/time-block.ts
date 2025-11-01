export type TimeBlockType = 'work' | 'break' | 'buffer' | 'meeting';

export interface TimeBlock {
  id: string;
  task_id?: string;
  user_id: string;
  start_time: string;
  end_time: string;
  type: TimeBlockType;
  notes?: string;
  is_completed?: boolean;
  created_at: string;
}

export interface CreateTimeBlockInput {
  task_id?: string;
  start_time: string;
  end_time: string;
  type?: TimeBlockType;
  notes?: string;
}

export interface UpdateTimeBlockInput {
  start_time?: string;
  end_time?: string;
  type?: TimeBlockType;
  notes?: string;
  is_completed?: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: TimeBlock;
}
