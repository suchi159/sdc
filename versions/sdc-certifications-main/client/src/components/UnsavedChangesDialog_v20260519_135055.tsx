import { AlertTriangle } from "lucide-react";

interface UnsavedChangesDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message?: string;
}

/**
 * A styled in-app confirmation dialog that appears when the user tries to
 * navigate away from a form with unsaved changes.
 */
export default function UnsavedChangesDialog({
  open,
  onConfirm,
  onCancel,
  message = "You have unsaved changes. If you leave now, your changes will be lost.",
}: UnsavedChangesDialogProps) {
  if (!open) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onCancel}
    >
      {/* Dialog card */}
      <div
        className="relative w-full max-w-md mx-4 rounded-2xl p-6 shadow-2xl"
        style={{
          background: "var(--sdc-card-bg)",
          border: "1px solid var(--sdc-card-border)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Icon + title */}
        <div className="flex items-start gap-4 mb-4">
          <div
            className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(234,179,8,0.15)" }}
          >
            <AlertTriangle className="w-5 h-5" style={{ color: "#eab308" }} />
          </div>
          <div>
            <h2
              className="font-bold text-base mb-1"
              style={{ color: "var(--sdc-heading)" }}
            >
              Unsaved Changes
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--sdc-text-muted)" }}>
              {message}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold"
            style={{
              background: "var(--sdc-card-border)",
              color: "var(--sdc-text)",
              border: "1px solid var(--sdc-card-border)",
            }}
          >
            Keep Editing
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl text-sm font-bold"
            style={{
              background: "linear-gradient(135deg, #ef4444, #dc2626)",
              color: "#fff",
            }}
          >
            Discard Changes
          </button>
        </div>
      </div>
    </div>
  );
}
