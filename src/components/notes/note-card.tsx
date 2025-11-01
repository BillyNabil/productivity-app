'use client';

import React, { useState } from 'react';
import { Note } from '@/types/note';
import { useNotes } from '@/lib/hooks/use-notes';
import { Button } from '@/components/ui/button';
import { Pin, Edit2, Trash2 } from 'lucide-react';

interface NoteCardProps {
  note: Note;
  onUpdate: (noteId: string, title: string, content: string) => void;
  onDelete: (noteId: string) => void;
  onTogglePin: (noteId: string) => void;
  isEditing: boolean;
  setEditingId: (id: string | null) => void;
}

export function NoteCard({
  note,
  onUpdate,
  onDelete,
  onTogglePin,
  isEditing,
  setEditingId,
}: NoteCardProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  const handleSave = () => {
    onUpdate(note.id, title, content);
    setEditingId(null);
  };

  if (isEditing) {
    return (
      <div
        className="p-4 rounded-lg border-2 border-blue-400"
        style={{ backgroundColor: note.color }}
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mb-2 px-2 py-1 text-lg font-bold border rounded"
          placeholder="Note title"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full mb-3 px-2 py-1 border rounded font-mono text-sm h-32"
          placeholder="Markdown content..."
        />
        <div className="flex gap-2">
          <Button onClick={handleSave} className="bg-green-500 hover:bg-green-600">
            Save
          </Button>
          <Button
            onClick={() => setEditingId(null)}
            className="bg-black-500 hover:bg-black-600"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="p-4 rounded-lg border shadow-md hover:shadow-lg transition-shadow"
      style={{ backgroundColor: note.color }}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg">{note.title}</h3>
        <div className="flex gap-1">
          <button
            onClick={() => onTogglePin(note.id)}
            className="p-1 text-lg hover:opacity-70 transition-opacity"
            title={note.is_pinned ? 'Unpin' : 'Pin'}
          >
            {note.is_pinned ? <Pin className="w-5 h-5 fill-current" /> : <Pin className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setEditingId(note.id)}
            className="p-1 text-lg hover:bg-white/30 rounded transition-colors"
            title="Edit"
          >
            <Edit2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="p-1 text-lg hover:bg-red-400 rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="mt-3 text-sm whitespace-pre-wrap">{note.content}</div>
      <small className="text-gray-600 mt-2 block">
        {new Date(note.created_at).toLocaleDateString()}
      </small>
    </div>
  );
}
