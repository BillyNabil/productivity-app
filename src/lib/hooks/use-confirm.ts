import { useState, useCallback } from "react";
import { ConfirmType } from "@/components/common/confirm-dialog";

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: ConfirmType;
}

interface ConfirmState {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  type: ConfirmType;
  onConfirm: (() => void | Promise<void>) | null;
}

export function useConfirm() {
  const [state, setState] = useState<ConfirmState>({
    isOpen: false,
    message: "",
    confirmLabel: "Confirm",
    cancelLabel: "Cancel",
    type: "danger",
    onConfirm: null,
  });

  const confirm = useCallback(
    (options: ConfirmOptions): Promise<boolean> => {
      return new Promise((resolve) => {
        setState({
          isOpen: true,
          title: options.title,
          message: options.message,
          confirmLabel: options.confirmLabel || "Confirm",
          cancelLabel: options.cancelLabel || "Cancel",
          type: options.type || "danger",
          onConfirm: () => {
            setState((prev) => ({ ...prev, isOpen: false }));
            resolve(true);
          },
        });
      });
    },
    []
  );

  const handleConfirm = useCallback(() => {
    if (state.onConfirm) {
      state.onConfirm();
    }
  }, [state.onConfirm]);

  const handleCancel = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return {
    ...state,
    confirm,
    handleConfirm,
    handleCancel,
  };
}
