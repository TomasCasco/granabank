"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  open: boolean;
  title: string;
  children?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Modal confirmation built on <dialog>, which gives focus trapping, Esc to close and a backdrop for free. */
export function ConfirmDialog({ open, title, children, confirmLabel, cancelLabel = "Cancelar", busy, onConfirm, onCancel }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="confirm-dialog-title"
      // Esc fires "cancel"; keep React state in charge of closing.
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onCancel();
      }}
      // A click on the backdrop lands on the <dialog> itself.
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onCancel();
      }}
      className="m-auto w-[calc(100%-48px)] max-w-[366px] rounded-[24px] bg-white p-6 text-center shadow-soft backdrop:bg-ink/40 backdrop:backdrop-blur-[2px] open:animate-[dialog-in_150ms_ease-out]"
    >
      <h2 id="confirm-dialog-title" className="text-xl leading-[26px] font-medium text-ink">
        {title}
      </h2>
      {children && <div className="mt-2 text-sm text-slate">{children}</div>}
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          autoFocus
          className="h-12 flex-1 rounded-[16px] bg-base text-sm font-semibold text-ink transition hover:bg-[#eceef3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-granate disabled:opacity-50"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className="h-12 flex-1 rounded-[16px] bg-granate text-sm font-semibold text-white shadow-soft transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-granate disabled:cursor-wait disabled:opacity-70"
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
