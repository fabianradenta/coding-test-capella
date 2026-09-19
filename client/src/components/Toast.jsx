import { useEffect } from 'react';

const AUTO_HIDE_MS = 4000;

export function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, AUTO_HIDE_MS);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-50 flex justify-center px-4">
      <div
        role="status"
        className="pointer-events-auto flex max-w-full items-center gap-3 rounded-lg border border-green-300 bg-green-50 py-2 pr-2 pl-4 text-sm text-green-900 shadow-lg"
      >
        <svg
          className="h-5 w-5 shrink-0 text-green-700"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.7-9.8a.75.75 0 1 0-1.15-.96l-3.2 3.84-1.37-1.37a.75.75 0 0 0-1.06 1.06l1.95 1.95a.75.75 0 0 0 1.11-.05l3.72-4.47Z"
            clipRule="evenodd"
          />
        </svg>
        <span>{message}</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup notifikasi"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-green-800 hover:bg-green-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
