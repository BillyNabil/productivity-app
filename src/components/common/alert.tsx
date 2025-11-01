"use client";

import { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from "lucide-react";

export type AlertType = "error" | "success" | "warning" | "info";

interface AlertProps {
  type: AlertType;
  title?: string;
  message: string | ReactNode;
  onClose?: () => void;
  dismissible?: boolean;
  className?: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const alertConfig = {
  error: {
    bg: "bg-black dark:bg-black",
    border: "border-red-200 dark:border-red-800",
    icon: "text-red-600 dark:text-red-400",
    title: "text-red-900 dark:text-red-200",
    message: "text-red-800 dark:text-red-300",
    button: "text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900",
    iconComponent: AlertCircle,
  },
  success: {
    bg: "bg-black dark:bg-black",
    border: "border-green-200 dark:border-green-800",
    icon: "text-green-600 dark:text-green-400",
    title: "text-green-900 dark:text-green-200",
    message: "text-green-800 dark:text-green-300",
    button: "text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900",
    iconComponent: CheckCircle2,
  },
  warning: {
    bg: "bg-black dark:bg-black",
    border: "border-white dark:border-white",
    icon: "text-yellow-600 dark:text-yellow-400",
    title: "text-yellow-900 dark:text-yellow-200",
    message: "text-white dark:text-white",
    button: "text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900",
    iconComponent: AlertTriangle,
  },
  info: {
    bg: "bg-blue-50 dark:bg-blue-950",
    border: "border-blue-200 dark:border-blue-800",
    icon: "text-blue-600 dark:text-blue-400",
    title: "text-blue-900 dark:text-blue-200",
    message: "text-blue-800 dark:text-blue-300",
    button: "text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900",
    iconComponent: Info,
  },
};

const defaultTitles = {
  error: "Error",
  success: "Success",
  warning: "Warning",
  info: "Information",
};

export function Alert({
  type,
  title,
  message,
  onClose,
  dismissible = true,
  className = "",
  autoClose = false,
  autoCloseDelay = 5000,
}: AlertProps) {
  const config = alertConfig[type];
  const IconComponent = config.iconComponent;
  const displayTitle = title || defaultTitles[type];

  // Auto close effect
  if (autoClose && onClose) {
    setTimeout(onClose, autoCloseDelay);
  }

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border-2 ${config.bg} ${config.border} ${className}`}
      role="alert"
    >
      {/* Icon */}
      <div className="shrink-0 pt-0.5">
        <IconComponent className={`w-5 h-5 ${config.icon}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {displayTitle && (
          <h3 className={`font-bold text-sm mb-1 ${config.title}`}>
            {displayTitle}
          </h3>
        )}
        <p className={`text-sm ${config.message}`}>
          {message}
        </p>
      </div>

      {/* Close Button */}
      {dismissible && onClose && (
        <button
          onClick={onClose}
          className={`shrink-0 p-1 rounded transition-colors ${config.button}`}
          aria-label="Close alert"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

/**
 * Error Alert Component
 */
export function ErrorAlert({
  message,
  title = "Error",
  onClose,
  dismissible = true,
  className = "",
}: Omit<AlertProps, "type">) {
  return (
    <Alert
      type="error"
      title={title}
      message={message}
      onClose={onClose}
      dismissible={dismissible}
      className={className}
    />
  );
}

/**
 * Success Alert Component
 */
export function SuccessAlert({
  message,
  title = "Success",
  onClose,
  dismissible = true,
  className = "",
  autoClose = false,
  autoCloseDelay = 5000,
}: Omit<AlertProps, "type">) {
  return (
    <Alert
      type="success"
      title={title}
      message={message}
      onClose={onClose}
      dismissible={dismissible}
      className={className}
      autoClose={autoClose}
      autoCloseDelay={autoCloseDelay}
    />
  );
}

/**
 * Warning Alert Component
 */
export function WarningAlert({
  message,
  title = "Warning",
  onClose,
  dismissible = true,
  className = "",
}: Omit<AlertProps, "type">) {
  return (
    <Alert
      type="warning"
      title={title}
      message={message}
      onClose={onClose}
      dismissible={dismissible}
      className={className}
    />
  );
}

/**
 * Info Alert Component
 */
export function InfoAlert({
  message,
  title = "Information",
  onClose,
  dismissible = true,
  className = "",
}: Omit<AlertProps, "type">) {
  return (
    <Alert
      type="info"
      title={title}
      message={message}
      onClose={onClose}
      dismissible={dismissible}
      className={className}
    />
  );
}
