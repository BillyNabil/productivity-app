'use client';

import React, { useState } from 'react';
import { CreateNoteInput } from '@/types/note';
import { useNotes } from '@/lib/hooks/use-notes';
import { CreateNoteForm } from './create-note-form';
import { NoteCard } from './note-card';
import { Input } from '@/components/ui/input';
import { FileText, Pin } from 'lucide-react';

interface NotesListProps {
  taskId?: string;
}

export function NotesList({ taskId }: NotesListProps) {
  const { notes, isLoading, error, createNote, updateNote, deleteNote, togglePin, searchNotes } =
    useNotes(taskId);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateNote = async (input: CreateNoteInput) => {
    await createNote(input);
  };

  const handleUpdateNote = async (noteId: string, title: string, content: string) => {
    await updateNote(noteId, { title, content });
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      await searchNotes(query);
    }
  };

  const pinnedNotes = notes.filter((n) => n.is_pinned);
  const unpinnedNotes = notes.filter((n) => !n.is_pinned);

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Notes
        </h2>

        <Input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="mb-4"
        />

        {error && (
          <div className="p-4 mb-4 bg-red-100 border-2 border-red-500 rounded text-red-700">
            <p className="font-semibold mb-1">Failed to load notes</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <CreateNoteForm onSubmit={handleCreateNote} taskId={taskId} isLoading={isLoading} />
      </div>

      {pinnedNotes.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Pin className="w-5 h-5" />
            Pinned Notes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pinnedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onUpdate={handleUpdateNote}
                onDelete={deleteNote}
                onTogglePin={togglePin}
                isEditing={editingId === note.id}
                setEditingId={setEditingId}
              />
            ))}
          </div>
        </div>
      )}

      {unpinnedNotes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">All Notes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unpinnedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onUpdate={handleUpdateNote}
                onDelete={deleteNote}
                onTogglePin={togglePin}
                isEditing={editingId === note.id}
                setEditingId={setEditingId}
              />
            ))}
          </div>
        </div>
      )}

      {notes.length === 0 && !isLoading && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg">No notes yet. Create one to get started!</p>
        </div>
      )}
    </div>
  );
}
