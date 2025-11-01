'use client';

import React, { useState } from 'react';
import { CreateNoteInput } from '@/types/note';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CreateNoteFormProps {
  onSubmit: (note: CreateNoteInput) => Promise<void>;
  taskId?: string;
  isLoading?: boolean;
}



export function CreateNoteForm({ onSubmit, taskId, isLoading = false }: CreateNoteFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        task_id: taskId,
        color: selectedColor,
      });
      setTitle('');
      setContent('');
      setSelectedColor('#FFFFFF');
      setIsExpanded(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div
        className="p-4 rounded-lg border-2 border-black transition-all bg"
        style={{ backgroundColor: selectedColor }}
      >
        <div className="mb-3">
          <Input
            type="text"
            placeholder="Note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full font-md text-lg"
          />
        </div>

        {isExpanded && (
          <>
            <textarea
              placeholder="Write your note in Markdown..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full mb-3 px-3 py-2 border rounded font-mono text-sm h-24 bg-black text-black"
            />

            {/* Color selector */}
      
          </>
        )}

        <div className="flex gap-2">
          {!isExpanded ? (
            <Button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="flex-1 bg-white hover:bg-white text-black"
            >
              Expand to Write
            </Button>
          ) : (
            <>
              <Button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="bg-white hover:bg-white text-black"
              >
                Collapse
              </Button>
              <Button
                type="submit"
                disabled={!title.trim() || !content.trim() || isLoading}
                className="flex-1 bg-white hover:bg-white text-black"
              >
                {isLoading ? 'Creating...' : '✓ Create Note'}
              </Button>
            </>
          )}
        </div>
      </div>
    </form>
  );
}
