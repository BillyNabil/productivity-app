"use client";

import { useState, useCallback, useMemo } from "react";
import { Task } from "@/types/task";

/**
 * 📄 Pagination Hook - Handle large datasets efficiently
 * 
 * Features:
 * - Configurable page size
 * - Memoized pagination calculations
 * - First/last page shortcuts
 * - Total count tracking
 */

interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
}

export function usePagination(items: Task[], pageSize: number = 20) {
  const [currentPage, setCurrentPage] = useState(1);

  const pagination = useMemo(() => {
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    const paginatedItems = items.slice(startIndex, endIndex);

    return {
      currentPage,
      pageSize,
      totalItems,
      totalPages,
      paginatedItems,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
      startIndex: totalItems > 0 ? startIndex + 1 : 0,
      endIndex: Math.min(endIndex, totalItems),
    };
  }, [items, currentPage, pageSize]);

  const goToPage = useCallback((page: number) => {
    const maxPage = Math.ceil(items.length / pageSize);
    setCurrentPage(Math.max(1, Math.min(page, maxPage)));
  }, [items.length, pageSize]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const firstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const lastPage = useCallback(() => {
    const maxPage = Math.ceil(items.length / pageSize);
    setCurrentPage(maxPage);
  }, [items.length, pageSize]);

  return {
    ...pagination,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
  };
}
