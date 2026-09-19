export function CustomerQuotaNotice({ customer }) {
  const { quota, rejectedCount } = customer;

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <svg
          className="h-4 w-4 text-blue-800"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M10 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm0 1.5c-3 0-6 1.5-6 3.5v1.5h12V15c0-2-3-3.5-6-3.5Z" />
        </svg>
        Nasabah terdaftar, nama diambil dari data nasabah
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-slate-600">
          <p>
            Kuota terpakai{' '}
            <strong className="font-semibold text-slate-900">
              {quota.used} dari {quota.limit}
            </strong>
            , sisa {quota.remaining} pengajuan
          </p>
          {rejectedCount > 0 ? (
            <p className="text-slate-500">
              {rejectedCount} pengajuan ditolak tidak dihitung.
            </p>
          ) : null}
        </div>

        <div className="flex gap-1" aria-hidden="true">
          {Array.from({ length: quota.limit }, (_, index) => (
            <span
              key={index}
              className={`h-1.5 w-8 rounded-full ${
                index < quota.used ? 'bg-blue-800' : 'bg-slate-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
