export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  is_urgent: boolean;
  is_important: boolean;
  estimated_duration: number; // in minutes
  status: TaskStatus;
  due_date?: string;
  tags: string[];
  color: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  is_urgent?: boolean;
  is_important?: boolean;
  estimated_duration?: number;
  due_date?: string;
  tags?: string[];
  color?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  is_urgent?: boolean;
  is_important?: boolean;
  estimated_duration?: number;
  status?: TaskStatus;
  due_date?: string;
  tags?: string[];
  color?: string;
}

// Eisenhower Matrix Quadrants
export type QuadrantType = 'urgent-important' | 'not-urgent-important' | 'urgent-not-important' | 'neither';

export interface TasksByQuadrant {
  'urgent-important': Task[];
  'not-urgent-important': Task[];
  'urgent-not-important': Task[];
  'neither': Task[];
}
