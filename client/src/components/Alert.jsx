const TONES = {
  error: 'border-red-200 bg-red-50 text-red-700',
  info: 'border-blue-200 bg-blue-50 text-blue-900',
};

export function Alert({ tone = 'error', title, children }) {
  return (
    <div
      role="alert"
      className={`flex gap-3 rounded-lg border p-4 text-sm ${TONES[tone]}`}
    >
      <svg
        className="mt-0.5 h-5 w-5 shrink-0"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.5a.75.75 0 0 0-1.5 0v4a.75.75 0 0 0 1.5 0v-4ZM10 14a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
          clipRule="evenodd"
        />
      </svg>
      <div>
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className="text-inherit">{children}</div> : null}
      </div>
    </div>
  );
}
