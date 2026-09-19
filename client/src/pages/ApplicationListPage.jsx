import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Alert } from '../components/Alert.jsx';
import { Button } from '../components/Button.jsx';
import { Toast } from '../components/Toast.jsx';
import { ApplicationFormModal } from '../features/applications/ApplicationFormModal.jsx';
import { DecisionDialog } from '../features/applications/DecisionDialog.jsx';
import { ApplicationFilters } from '../features/applications/ApplicationFilters.jsx';
import { ApplicationsTable } from '../features/applications/ApplicationsTable.jsx';
import { useApplications } from '../features/applications/useApplications.js';

const FILTER_KEYS = ['search', 'status', 'type'];

export function ApplicationListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = {
    search: searchParams.get('search') ?? '',
    status: searchParams.get('status') ?? '',
    type: searchParams.get('type') ?? '',
  };

  const { data, error, isLoading, reload } = useApplications(filters);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [decisionTarget, setDecisionTarget] = useState(null);

  function closeDecision(outcome) {
    if (outcome === 'decided') {
      const { application, decision } = decisionTarget;
      setToast(
        `Pengajuan ${application.customerName} berhasil ${
          decision === 'APPROVED' ? 'disetujui' : 'ditolak'
        }`,
      );
    }
    if (outcome !== 'cancelled') {
      reload();
    }
    setDecisionTarget(null);
  }

  // Filters live in the URL so that going to a detail page and back keeps them.
  const changeFilter = useCallback(
    (key, value) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          if (value) {
            next.set(key, value);
          } else {
            next.delete(key);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const resetFilters = () => setSearchParams({}, { replace: true });

  const hasFilters = FILTER_KEYS.some((key) => filters[key] !== '');
  const items = data?.items ?? [];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Daftar Pengajuan
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Pengajuan terbaru ditampilkan paling atas.
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsFormOpen(true)}>
          Tambah Pengajuan
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <ApplicationFilters
          filters={filters}
          counts={data?.counts}
          onChange={changeFilter}
        />

        {error ? (
          <div className="p-4">
            <Alert title="Gagal memuat data pengajuan">
              <p className="mt-1">{error.message}</p>
              <Button className="mt-3" onClick={reload}>
                Coba lagi
              </Button>
            </Alert>
          </div>
        ) : null}

        {!error && !data && isLoading ? (
          <p className="p-8 text-center text-sm text-slate-600">
            Memuat pengajuan…
          </p>
        ) : null}

        {!error && data ? (
          <div className={isLoading ? 'opacity-60' : undefined}>
            {items.length > 0 ? (
              <ApplicationsTable
                items={items}
                onDecide={(application, decision) =>
                  setDecisionTarget({ application, decision })
                }
              />
            ) : (
              <div className="p-8 text-center">
                <p className="text-sm font-medium text-slate-900">
                  {hasFilters
                    ? 'Tidak ada pengajuan yang cocok'
                    : 'Belum ada pengajuan'}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {hasFilters
                    ? 'Coba ubah kata kunci atau filter yang dipakai.'
                    : 'Pengajuan yang dibuat akan muncul di sini.'}
                </p>
                {hasFilters ? (
                  <Button className="mx-auto mt-4" onClick={resetFilters}>
                    Reset filter
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    className="mx-auto mt-4"
                    onClick={() => setIsFormOpen(true)}
                  >
                    Tambah Pengajuan
                  </Button>
                )}
              </div>
            )}

            <div className="border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
              Menampilkan {items.length} dari {data.counts.all} pengajuan
            </div>
          </div>
        ) : null}
      </div>

      <ApplicationFormModal
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSaved={(application) => {
          setToast(`Pengajuan ${application.customerName} berhasil dibuat`);
          reload();
        }}
      />

      {decisionTarget ? (
        <DecisionDialog
          application={decisionTarget.application}
          decision={decisionTarget.decision}
          onClose={closeDecision}
        />
      ) : null}

      {toast ? <Toast message={toast} onClose={() => setToast(null)} /> : null}
    </div>
  );
}
