/* ---------------- Modal Components ---------------- */
import { X, Check, AlertTriangle } from "lucide-react";
import { type ModalProps } from "../types";

export function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-6 shadow-2xl max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "danger",
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: "danger" | "warning" | "success";
}) {
  const icons = {
    danger: <X className="text-red-500" size={24} />,
    warning: <AlertTriangle className="text-yellow-500" size={24} />,
    success: <Check className="text-green-500" size={24} />,
  };

  const colors = {
    danger: "bg-red-500 hover:bg-red-600",
    warning: "bg-yellow-500 hover:bg-yellow-600",
    success: "bg-green-500 hover:bg-green-600",
  };

  const buttonText = {
    danger: "Delete",
    warning: "Keep",
    success: "Confirm",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center ${
              type === "danger"
                ? "bg-red-100"
                : type === "warning"
                ? "bg-yellow-100"
                : "bg-green-100"
            }`}
          >
            {icons[type]}
          </div>
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          {type === "warning" && (
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Delete
            </button>
          )}
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-6 py-2 text-white rounded-lg ${colors[type]}`}
          >
            {buttonText[type]}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function DiscardModal({
  open,
  onClose,
  onDelete, // "Delete" → değişiklikleri geri al + kırmızı sonuç
  onKeep, // "Keep"   → değişiklikleri kaydet + yeşil sonuç
}: {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  onKeep: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-[420px] bg-white rounded-xl shadow-xl p-6">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
            <span className="text-yellow-600 text-xl">⚠️</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">
            Are you sure you want to delete the changes?
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onDelete}
            className="px-6 py-2 rounded-md border text-gray-700"
            style={{ background: "#F4F4F5", borderColor: "#E4E4E7" }}
          >
            Delete
          </button>
          <button
            onClick={onKeep}
            className="px-6 py-2 rounded-md text-white"
            style={{ background: "#976BFE" }}
          >
            Keep
          </button>
        </div>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export function ResultPopup({
  kind, // "deleted" | "saved" | null
  onClose,
}: {
  kind: "deleted" | "saved" | null;
  onClose: () => void;
}) {
  if (!kind) return null;
  const cfg =
    kind === "deleted"
      ? { color: "#DE4444", text: "Changes deleted", icon: "✖" }
      : { color: "#1CBB00", text: "Changes saved!", icon: "✔" };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="relative z-10 bg-white rounded-xl shadow-xl flex flex-col items-center justify-center"
        style={{ width: 420, height: 220 }}
      >
        <div
          className="rounded-full flex items-center justify-center"
          style={{
            width: 100,
            height: 100,
            background: cfg.color + "1A",
            border: `2px solid ${cfg.color}`,
          }}
        >
          <span style={{ color: cfg.color, fontSize: 48, lineHeight: 1 }}>
            {cfg.icon}
          </span>
        </div>

        <div
          className="mt-4 font-semibold"
          style={{ color: cfg.color, fontSize: 20 }}
        >
          {cfg.text}
        </div>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
}
