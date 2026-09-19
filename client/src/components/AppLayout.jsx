import { Outlet } from 'react-router';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
          <span className="text-base font-bold text-slate-900">
            Pengajuan Pembiayaan
          </span>
          <span className="rounded-full border border-slate-200 px-2.5 py-0.5 text-xs text-slate-600">
            Internal
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}
