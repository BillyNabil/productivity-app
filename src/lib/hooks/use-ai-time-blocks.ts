"use client";

import { create } from 'zustand';

export interface TimeBlockFromAI {
  title: string;
  type: string;
  startTime: Date;
  endTime: Date;
  description?: string;
}

interface AITimeBlockStore {
  pendingTimeBlock: TimeBlockFromAI | null;
  setPendingTimeBlock: (block: TimeBlockFromAI | null) => void;
  addedTimeBlocks: TimeBlockFromAI[];
  addToAddedTimeBlocks: (block: TimeBlockFromAI) => void;
  clearAddedTimeBlocks: () => void;
}

export const useAITimeBlockStore = create<AITimeBlockStore>((set) => ({
  pendingTimeBlock: null,
  setPendingTimeBlock: (block) => set({ pendingTimeBlock: block }),
  addedTimeBlocks: [],
  addToAddedTimeBlocks: (block) =>
    set((state) => ({ addedTimeBlocks: [...state.addedTimeBlocks, block] })),
  clearAddedTimeBlocks: () => set({ addedTimeBlocks: [] }),
}));
