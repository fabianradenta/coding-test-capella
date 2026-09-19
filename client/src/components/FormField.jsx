export function inputClassName(hasError, className = '') {
  const border = hasError
    ? 'border-red-500 focus-visible:outline-red-600'
    : 'border-slate-300 focus-visible:outline-blue-800';
  return `h-11 w-full rounded-lg border bg-white px-3 text-base text-slate-900 placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:bg-slate-100 disabled:text-slate-500 ${border} ${className}`;
}

export function FormField({ label, htmlFor, error, hint, children }) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-slate-900"
      >
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p id={`${htmlFor}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-sm text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}
