"use client";

import { useEffect } from "react";
import { TimeBlockingBoard } from "./time-blocking-board";
import { useAITimeBlockStore } from "@/lib/hooks/use-ai-time-blocks";

interface TimeBlockingBoardWithAIProps {
  selectedDate: Date;
  onDateChange?: (date: Date) => void;
}

export function TimeBlockingBoardWithAI({
  selectedDate,
  onDateChange,
}: TimeBlockingBoardWithAIProps) {
  const { pendingTimeBlock, setPendingTimeBlock, addToAddedTimeBlocks } =
    useAITimeBlockStore();

  useEffect(() => {
    // Watch for new time blocks from AI
    if (pendingTimeBlock) {
      // The board will handle adding it
    }
  }, [pendingTimeBlock]);

  const handleTimeBlockAdded = (block: any) => {
    // Add to the list of blocks added from AI
    addToAddedTimeBlocks(block);
    // Clear the pending block
    setPendingTimeBlock(null);
  };

  return (
    <TimeBlockingBoard
      selectedDate={selectedDate}
      onDateChange={onDateChange}
      newTimeBlock={pendingTimeBlock || undefined}
      onTimeBlockAdded={handleTimeBlockAdded}
    />
  );
}
