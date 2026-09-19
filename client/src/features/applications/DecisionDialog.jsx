import { useState } from 'react';
import { decideApplication } from '../../api/applications.js';
import { Alert } from '../../components/Alert.jsx';
import { Button } from '../../components/Button.jsx';
import { Modal } from '../../components/Modal.jsx';
import {
  APPLICATION_TYPE_LABELS,
  formatCurrency,
  STATUS_LABELS,
} from '../../utils/format.js';

const DECISIONS = {
  APPROVED: {
    title: 'Setujui pengajuan ini?',
    confirmLabel: 'Ya, Setujui',
    variant: 'approveSolid',
    iconClass: 'bg-green-100 text-green-700',
    icon: 'M4 10.5 8 14.5 16 6',
  },
  REJECTED: {
    title: 'Tolak pengajuan ini?',
    confirmLabel: 'Ya, Tolak',
    variant: 'rejectSolid',
    iconClass: 'bg-red-100 text-red-600',
    icon: 'M6 6l8 8M14 6l-8 8',
  },
};

function SummaryRow({ label, children }) {
  return (
    <div className="flex justify-between gap-6 py-1">
      <dt className="text-sm text-slate-600">{label}</dt>
      <dd className="text-sm font-medium text-slate-900 tabular-nums">
        {children}
      </dd>
    </div>
  );
}

export function DecisionDialog({ application, decision, onClose }) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const config = DECISIONS[decision];

  async function confirm() {
    setIsSaving(true);
    try {
      await decideApplication(application.id, decision);
      onClose('decided');
    } catch (err) {
      setError(err);
      // A rejected decision means someone else already decided, so the page is out of date.
      if (err.status === 409) {
        setIsSaving(false);
        return;
      }
      setIsSaving(false);
    }
  }

  return (
    <Modal
      open
      onClose={() => onClose(error?.status === 409 ? 'stale' : 'cancelled')}
      labelledBy="dialog-keputusan-judul"
      className="max-w-md"
    >
      <div className="p-6">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-full ${config.iconClass}`}
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              d={config.icon}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>

        <h2
          id="dialog-keputusan-judul"
          className="mt-4 text-lg font-semibold text-slate-900"
        >
          {config.title}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Status akan berubah menjadi {STATUS_LABELS[decision]} dan tidak dapat
          diubah kembali.
        </p>

        <dl className="mt-4 rounded-lg bg-slate-50 p-4">
          <SummaryRow label="Nasabah">{application.customerName}</SummaryRow>
          <SummaryRow label="Tipe">
            {APPLICATION_TYPE_LABELS[application.applicationType]}
          </SummaryRow>
          <SummaryRow label="Nominal">
            {formatCurrency(application.requestedAmount)}
          </SummaryRow>
          <SummaryRow label="Tenor">{application.tenor} bulan</SummaryRow>
          <SummaryRow label="Tagihan">
            {formatCurrency(application.monthlyPayment)} / bulan
          </SummaryRow>
        </dl>

        {error ? (
          <div className="mt-4">
            <Alert title={error.message} />
          </div>
        ) : null}

        <div className="mt-5 flex justify-end gap-3">
          <Button
            onClick={() =>
              onClose(error?.status === 409 ? 'stale' : 'cancelled')
            }
            disabled={isSaving}
          >
            Batal
          </Button>
          <Button
            variant={config.variant}
            loading={isSaving}
            disabled={error?.status === 409}
            onClick={confirm}
          >
            {config.confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
