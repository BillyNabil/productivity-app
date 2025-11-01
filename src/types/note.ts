// Notes types
export interface Note {
  id: string;
  user_id: string;
  task_id: string | null;
  project_id: string | null;
  title: string;
  content: string; // markdown content
  is_pinned: boolean;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface CreateNoteInput {
  title: string;
  content: string;
  task_id?: string | null;
  project_id?: string | null;
  color?: string;
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  is_pinned?: boolean;
  color?: string;
}
