import { useEffect, useRef } from 'react';

export function Modal({ open, onClose, labelledBy, className = '', children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={labelledBy}
      onClose={onClose}
      className={`m-auto w-[calc(100%-2rem)] rounded-xl bg-white p-0 text-slate-900 shadow-xl backdrop:bg-slate-900/50 ${className}`}
    >
      {open ? children : null}
    </dialog>
  );
}
