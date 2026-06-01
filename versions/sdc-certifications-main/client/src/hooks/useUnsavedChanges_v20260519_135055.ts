import { useEffect, useCallback, useRef } from "react";

/**
 * useUnsavedChanges
 *
 * Registers a `beforeunload` handler so the browser warns the user when they
 * try to close the tab or navigate away via the address bar while there are
 * unsaved changes.
 *
 * For in-app navigation (clicking links / buttons that call wouter's navigate),
 * this hook exposes a `guardedNavigate` helper that shows a custom confirmation
 * dialog before proceeding.
 *
 * Usage:
 *   const { guardedNavigate, markClean } = useUnsavedChanges(isDirty, {
 *     onConfirm: () => navigate(dest),
 *   });
 *
 *   // Replace navigate("/foo") with:
 *   guardedNavigate("/foo");
 *
 *   // After a successful save:
 *   markClean();
 */

export interface UseUnsavedChangesOptions {
  /** Called when the user confirms they want to leave despite unsaved changes. */
  onConfirm: (dest: string) => void;
  /** Called when the user cancels the navigation. Optional. */
  onCancel?: () => void;
  /** Custom message shown in the confirmation dialog. */
  message?: string;
}

export function useUnsavedChanges(
  isDirty: boolean,
  options: UseUnsavedChangesOptions
) {
  const isDirtyRef = useRef(isDirty);
  isDirtyRef.current = isDirty;

  // Browser tab close / address-bar navigation
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirtyRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  /**
   * Use this instead of calling wouter's navigate() directly.
   * If the form is dirty it will call options.onConfirm with the destination
   * so the parent can show a dialog and decide whether to proceed.
   * If the form is clean it navigates immediately.
   */
  const guardedNavigate = useCallback(
    (dest: string, forceNavigate?: (d: string) => void) => {
      if (!isDirtyRef.current) {
        // Clean — navigate immediately
        if (forceNavigate) forceNavigate(dest);
        else options.onConfirm(dest);
        return;
      }
      // Dirty — let the caller show a dialog
      options.onConfirm(dest);
    },
    [options]
  );

  return { guardedNavigate };
}
