'use client';

import { useState } from "react";
import { AlertTriangle, Info, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

type ConfirmVariant = "danger" | "warning" | "info";

const VARIANTS = {
  danger: { icon: AlertTriangle, iconWrap: "bg-danger-soft text-danger", button: "danger" },
  warning: { icon: AlertTriangle, iconWrap: "bg-warning/10 text-warning", button: "primary" },
  info: { icon: Info, iconWrap: "bg-mint text-accent", button: "primary" },
} as const;

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: React.ReactNode;
  variant?: ConfirmVariant;
  icon?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

//Confirmation dialog component modal
export default function ConfirmDialog({
  open,
  title,
  description,
  variant = "danger",
  icon,
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [pending, setPending] = useState(false);
  const busy = loading || pending;
  const styles = VARIANTS[variant];
  const Icon = styles.icon;

  const handleConfirm = async () => {
    setPending(true);
    try {
      await onConfirm();
    } finally {
      setPending(false);
    }
  };

  return (
    <Modal open={open} onClose={onCancel} size="sm" ariaLabel={title} dismissible={!busy}>
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${styles.iconWrap}`}>
          {icon ?? <Icon className="h-5 w-5" />}
        </div>
        <button type="button" onClick={onCancel} disabled={busy} aria-label="Cerrar" className="cursor-pointer rounded-lg p-1 text-text/60 transition-colors hover:bg-mint disabled:opacity-50">
          <X className="h-5 w-5" />
        </button>
      </div>

      <h2 className="mt-4 text-lg font-bold text-text">{title}</h2>
      <div className="mt-1 text-sm text-text/70">{description}</div>

      <div className="mt-6 flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={busy} autoFocus>{cancelLabel}</Button>
        <Button type="button" variant={styles.button} onClick={handleConfirm} loading={busy} loadingLabel="Procesando...">{confirmLabel}</Button>
      </div>
    </Modal>
  );
}