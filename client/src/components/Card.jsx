export function Card({
  title,
  action,
  padded = true,
  className = '',
  children,
}) {
  return (
    <section
      className={`rounded-xl border border-slate-200 bg-white ${className}`}
    >
      {title ? (
        <header className="flex flex-wrap items-center justify-between gap-2 px-5 pt-5 pb-4">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          {action}
        </header>
      ) : null}
      <div className={padded ? 'px-5 pb-5' : ''}>{children}</div>
    </section>
  );
}
