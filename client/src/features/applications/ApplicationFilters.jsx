import { useEffect, useState } from 'react';
import { APPLICATION_TYPE_LABELS } from '../../utils/format.js';

const SEARCH_DEBOUNCE_MS = 300;

const STATUS_TABS = [
  { value: '', label: 'Semua', countKey: 'all' },
  { value: 'PENDING', label: 'Menunggu', countKey: 'PENDING' },
  { value: 'APPROVED', label: 'Disetujui', countKey: 'APPROVED' },
  { value: 'REJECTED', label: 'Ditolak', countKey: 'REJECTED' },
];

export function ApplicationFilters({ filters, counts, onChange }) {
  const [searchDraft, setSearchDraft] = useState(filters.search);

  // The input leads while typing; the URL catches up once the typing pauses.
  useEffect(() => setSearchDraft(filters.search), [filters.search]);

  useEffect(() => {
    if (searchDraft === filters.search) {
      return undefined;
    }
    const timer = setTimeout(
      () => onChange('search', searchDraft),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [searchDraft, filters.search, onChange]);

  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center">
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {STATUS_TABS.map((tab) => {
          const active = filters.status === tab.value;
          return (
            <button
              key={tab.countKey}
              type="button"
              aria-pressed={active}
              onClick={() => onChange('status', tab.value)}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 ${
                active
                  ? 'border-blue-800 bg-blue-50 text-blue-800'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${
                  active
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {counts ? counts[tab.countKey] : '–'}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:ml-auto">
        <div className="relative w-full sm:w-72">
          <svg
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="9" cy="9" r="6" />
            <path d="m14 14 3 3" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
            placeholder="Cari nama atau nomor identitas"
            aria-label="Cari nama atau nomor identitas"
            className="h-11 w-full rounded-lg border border-slate-300 bg-white pr-3 pl-9 text-base text-slate-900 placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
          />
        </div>

        <select
          value={filters.type}
          onChange={(event) => onChange('type', event.target.value)}
          aria-label="Tipe pengajuan"
          className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 sm:w-auto"
        >
          <option value="">Semua tipe</option>
          {Object.entries(APPLICATION_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
