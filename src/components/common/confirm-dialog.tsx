"use client";

import { ReactNode } from "react";
import { AlertCircle, AlertTriangle, HelpCircle, X } from "lucide-react";

export type ConfirmType = "danger" | "warning" | "info";

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message: string | ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  type?: ConfirmType;
  className?: string;
}

const confirmConfig = {
  danger: {
    bg: "bg-red-50 dark:bg-red-950",
    border: "border-red-200 dark:border-red-800",
    icon: "text-red-600 dark:text-red-400",
    title: "text-red-900 dark:text-red-200",
    message: "text-red-800 dark:text-red-300",
    button: "bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white",
    iconComponent: AlertCircle,
  },
  warning: {
    bg: "bg-yellow-50 dark:bg-yellow-950",
    border: "border-yellow-200 dark:border-yellow-800",
    icon: "text-yellow-600 dark:text-yellow-400",
    title: "text-yellow-900 dark:text-yellow-200",
    message: "text-yellow-800 dark:text-yellow-300",
    button: "bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-600 dark:hover:bg-yellow-700 text-white",
    iconComponent: AlertTriangle,
  },
  info: {
    bg: "bg-blue-50 dark:bg-blue-950",
    border: "border-blue-200 dark:border-blue-800",
    icon: "text-blue-600 dark:text-blue-400",
    title: "text-blue-900 dark:text-blue-200",
    message: "text-blue-800 dark:text-blue-300",
    button: "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white",
    iconComponent: HelpCircle,
  },
};

const defaultTitles = {
  danger: "Confirm Delete",
  warning: "Confirm Action",
  info: "Confirm",
};

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  type = "danger",
  className = "",
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const config = confirmConfig[type];
  const IconComponent = config.iconComponent;
  const displayTitle = title || defaultTitles[type];

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-40 transition-opacity"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`relative bg-white dark:bg-black border-2 rounded-2xl shadow-2xl max-w-sm w-full ${config.border} ${className}`}
        >
          {/* Header */}
          <div className={`${config.bg} ${config.border} border-b-2 px-6 py-4 flex items-start justify-between rounded-t-xl`}>
            <div className="flex items-start gap-3 flex-1">
              <div className="shrink-0 pt-1">
                <IconComponent className={`w-6 h-6 ${config.icon}`} />
              </div>
              <h2 className={`text-lg font-bold ${config.title}`}>
                {displayTitle}
              </h2>
            </div>
            <button
              onClick={onCancel}
              className={`shrink-0 p-1 rounded transition-colors ${config.icon} hover:opacity-70`}
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            <p className={`text-sm ${config.message}`}>
              {message}
            </p>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t-2 border-black/10 dark:border-white/10 flex gap-3 justify-end bg-white dark:bg-black rounded-b-xl">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg font-semibold border-2 border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              onClick={handleConfirm}
              className={`px-4 py-2 rounded-lg font-semibold border-2 border-transparent ${config.button} transition-colors`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
