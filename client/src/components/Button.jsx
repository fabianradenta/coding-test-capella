const VARIANTS = {
  primary:
    'bg-blue-800 text-white hover:bg-blue-900 focus-visible:outline-blue-800',
  secondary:
    'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-visible:outline-slate-500',
  approve:
    'border border-green-700 bg-white text-green-700 hover:bg-green-50 focus-visible:outline-green-700',
  reject:
    'border border-red-600 bg-white text-red-600 hover:bg-red-50 focus-visible:outline-red-600',
  approveSolid:
    'bg-green-700 text-white hover:bg-green-800 focus-visible:outline-green-700',
  rejectSolid:
    'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600',
};

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        className="opacity-25"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Button({
  variant = 'secondary',
  loading = false,
  disabled = false,
  className = '',
  children,
  ...props
}) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}
