import { useCallback, useEffect, useState } from 'react';
import { Note, CreateNoteInput, UpdateNoteInput } from '@/types/note';
import { notesService } from '@/lib/supabase/notes-service';

export function useNotes(taskId?: string) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch notes
  const fetchNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = taskId ? await notesService.getNotesByTask(taskId) : await notesService.getNotes();
      setNotes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notes');
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  // Create note
  const createNote = useCallback(
    async (input: CreateNoteInput) => {
      try {
        const newNote = await notesService.createNote(input);
        setNotes((prev) => [newNote, ...prev]);
        return newNote;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to create note';
        setError(errorMsg);
        throw err;
      }
    },
    []
  );

  // Update note
  const updateNote = useCallback(async (noteId: string, input: UpdateNoteInput) => {
    try {
      const updated = await notesService.updateNote(noteId, input);
      setNotes((prev) => prev.map((n) => (n.id === noteId ? updated : n)));
      return updated;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update note';
      setError(errorMsg);
      throw err;
    }
  }, []);

  // Delete note
  const deleteNote = useCallback(async (noteId: string) => {
    try {
      await notesService.deleteNote(noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete note';
      setError(errorMsg);
      throw err;
    }
  }, []);

  // Toggle pin
  const togglePin = useCallback(async (noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;

    try {
      const updated = await notesService.togglePin(noteId, !note.is_pinned);
      setNotes((prev) => prev.map((n) => (n.id === noteId ? updated : n)));
      return updated;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to toggle pin';
      setError(errorMsg);
      throw err;
    }
  }, [notes]);

  // Search notes
  const searchNotes = useCallback(async (query: string) => {
    try {
      setIsLoading(true);
      const data = await notesService.searchNotes(query);
      setNotes(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to search notes';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return {
    notes,
    isLoading,
    error,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    searchNotes,
    refetch: fetchNotes,
  };
}
