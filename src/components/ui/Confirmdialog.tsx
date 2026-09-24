'use client';

import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

// acción destructiva: eliminar mascota, usuario, cita, etc.
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <button onClick={onCancel} className="rounded-lg p-1 text-[#2A2F63]/60 hover:bg-[#E3F6F5]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <h2 className="mt-4 text-lg font-bold text-[#2A2F63]">{title}</h2>
        <p className="mt-1 text-sm text-[#2A2F63]/70">{description}</p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-[#2A2F63] hover:bg-[#E3F6F5]"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-red-600"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}