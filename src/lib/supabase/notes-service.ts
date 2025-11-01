import { createClient } from './client';
import { Note, CreateNoteInput, UpdateNoteInput } from '@/types/note';

// Validate Supabase client initialization
function validateClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error(
      'Supabase configuration missing. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
    );
  }
}

export const notesService = {
  // Create a new note
  async createNote(input: CreateNoteInput): Promise<Note> {
    validateClient();
    const supabase = createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated. Cannot create note without user ID.');
    }
    
    const { data, error } = await supabase
      .from('notes')
      .insert([
        {
          user_id: user.id,
          title: input.title,
          content: input.content,
          task_id: input.task_id || null,
          project_id: input.project_id || null,
          color: input.color || '#FFFFFF',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating note:', error);
      throw new Error(`Failed to create note: ${error.message}`);
    }
    return data as Note;
  },

  // Get all notes for user
  async getNotes(): Promise<Note[]> {
    validateClient();
    const supabase = createClient();
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error fetching notes:', error);
      throw new Error(`Failed to fetch notes: ${error.message}`);
    }
    return data as Note[];
  },

  // Get notes for a specific task
  async getNotesByTask(taskId: string): Promise<Note[]> {
    validateClient();
    const supabase = createClient();
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error fetching notes by task:', error);
      throw new Error(`Failed to fetch notes for task: ${error.message}`);
    }
    return data as Note[];
  },

  // Get pinned notes
  async getPinnedNotes(): Promise<Note[]> {
    validateClient();
    const supabase = createClient();
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('is_pinned', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error fetching pinned notes:', error);
      throw new Error(`Failed to fetch pinned notes: ${error.message}`);
    }
    return data as Note[];
  },

  // Update a note
  async updateNote(noteId: string, input: UpdateNoteInput): Promise<Note> {
    validateClient();
    const supabase = createClient();
    const { data, error } = await supabase
      .from('notes')
      .update(input)
      .eq('id', noteId)
      .select()
      .single();

    if (error) {
      console.error('Supabase error updating note:', error);
      throw new Error(`Failed to update note: ${error.message}`);
    }
    return data as Note;
  },

  // Delete a note
  async deleteNote(noteId: string): Promise<void> {
    validateClient();
    const supabase = createClient();
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId);

    if (error) {
      console.error('Supabase error deleting note:', error);
      throw new Error(`Failed to delete note: ${error.message}`);
    }
  },

  // Toggle pin status
  async togglePin(noteId: string, isPinned: boolean): Promise<Note> {
    validateClient();
    const supabase = createClient();
    const { data, error } = await supabase
      .from('notes')
      .update({ is_pinned: isPinned })
      .eq('id', noteId)
      .select()
      .single();

    if (error) {
      console.error('Supabase error toggling pin:', error);
      throw new Error(`Failed to toggle pin: ${error.message}`);
    }
    return data as Note;
  },

  // Search notes
  async searchNotes(query: string): Promise<Note[]> {
    validateClient();
    const supabase = createClient();
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error searching notes:', error);
      throw new Error(`Failed to search notes: ${error.message}`);
    }
    return data as Note[];
  },
};
