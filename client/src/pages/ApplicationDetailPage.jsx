import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { Alert } from '../components/Alert.jsx';
import { Button } from '../components/Button.jsx';
import { Card } from '../components/Card.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { Toast } from '../components/Toast.jsx';
import { ApplicationFormModal } from '../features/applications/ApplicationFormModal.jsx';
import { CustomerHistoryTable } from '../features/applications/CustomerHistoryTable.jsx';
import { DecisionDialog } from '../features/applications/DecisionDialog.jsx';
import { useApplicationDetail } from '../features/applications/useApplicationDetail.js';
import {
  APPLICATION_TYPE_LABELS,
  formatCurrency,
  formatDateTime,
  formatNumber,
} from '../utils/format.js';

function BackLink() {
  return (
    <Link
      to="/"
      className="inline-flex h-11 items-center gap-1.5 text-sm font-medium text-blue-800 hover:underline"
    >
      <svg
        className="h-4 w-4"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M12 4 7 10l5 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Kembali ke daftar
    </Link>
  );
}

function DetailRow({ label, children }) {
  return (
    <div className="flex flex-wrap justify-between gap-x-6 gap-y-1 py-2">
      <dt className="text-sm text-slate-600">{label}</dt>
      <dd className="text-sm font-medium text-slate-900">{children}</dd>
    </div>
  );
}

function PaymentBox({ label, value, highlighted = false }) {
  return (
    <div
      className={`min-w-[11rem] flex-1 rounded-lg border p-4 ${
        highlighted
          ? 'border-blue-200 bg-blue-50 text-blue-900'
          : 'border-slate-200 bg-white text-slate-900'
      }`}
    >
      <p
        className={`text-sm ${highlighted ? 'text-blue-800' : 'text-slate-600'}`}
      >
        {label}
      </p>
      <p className="mt-1 text-xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

export function ApplicationDetailPage() {
  const { id } = useParams();
  const { data, error, isLoading, reload } = useApplicationDetail(id);
  const [decision, setDecision] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState(null);

  function closeDecision(outcome) {
    if (outcome === 'decided') {
      setToast(
        `Pengajuan ${data.customer.name} berhasil ${
          decision === 'APPROVED' ? 'disetujui' : 'ditolak'
        }`,
      );
    }
    if (outcome !== 'cancelled') {
      reload();
    }
    setDecision(null);
  }

  if (isLoading && !data) {
    return (
      <div>
        <BackLink />
        <p className="mt-8 text-sm text-slate-600">Memuat pengajuan…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <BackLink />
        <div className="mt-6 max-w-xl">
          <Alert
            title={
              error.status === 404
                ? 'Pengajuan tidak ditemukan'
                : 'Gagal memuat pengajuan'
            }
          >
            <p className="mt-1">
              {error.status === 404
                ? 'Pengajuan mungkin sudah dihapus atau tautannya keliru.'
                : error.message}
            </p>
            {error.status === 404 ? null : (
              <Button className="mt-3" onClick={reload}>
                Coba lagi
              </Button>
            )}
          </Alert>
        </div>
      </div>
    );
  }

  const { application, customer, customerApplications, quota } = data;

  return (
    <div>
      <BackLink />

      <div className="mt-4 mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">
              {customer.name}
            </h1>
            <StatusBadge status={application.status} />
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Pengajuan {APPLICATION_TYPE_LABELS[application.applicationType]},
            diajukan {formatDateTime(application.submittedAt)}
          </p>
        </div>

        {application.status === 'PENDING' ? (
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setIsEditing(true)}>Edit</Button>
            <Button variant="reject" onClick={() => setDecision('REJECTED')}>
              Tolak
            </Button>
            <Button variant="approve" onClick={() => setDecision('APPROVED')}>
              Setujui
            </Button>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Informasi Nasabah">
          <dl className="divide-y divide-slate-100">
            <DetailRow label="Nama lengkap">{customer.name}</DetailRow>
            <DetailRow label="Nomor identitas">
              <span className="tabular-nums">{customer.identityNumber}</span>
            </DetailRow>
            <DetailRow label="Kuota pengajuan">
              {quota.used} dari {quota.limit} terpakai
            </DetailRow>
          </dl>
        </Card>

        <Card title="Informasi Pembiayaan">
          <dl className="divide-y divide-slate-100">
            <DetailRow label="Tipe pengajuan">
              {APPLICATION_TYPE_LABELS[application.applicationType]}
            </DetailRow>
            <DetailRow label="Nominal pengajuan">
              <span className="tabular-nums">
                {formatCurrency(application.requestedAmount)}
              </span>
            </DetailRow>
            <DetailRow label="Tenor">
              <span className="tabular-nums">{application.tenor} bulan</span>
            </DetailRow>
            <DetailRow label="Pendapatan bulanan">
              <span className="tabular-nums">
                {formatCurrency(application.monthlyIncome)}
              </span>
            </DetailRow>
          </dl>
        </Card>
      </div>

      <div className="mt-4">
        <Card title="Rincian Tagihan">
          <div className="flex flex-wrap items-stretch gap-3">
            <PaymentBox
              label="Nominal pengajuan"
              value={formatCurrency(application.requestedAmount)}
            />
            <span className="self-center text-lg text-slate-400">÷</span>
            <PaymentBox
              label="Tenor"
              value={`${formatNumber(application.tenor)} bulan`}
            />
            <span className="self-center text-lg text-slate-400">=</span>
            <PaymentBox
              label="Tagihan per bulan"
              value={formatCurrency(application.monthlyPayment)}
              highlighted
            />
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Dibulatkan ke atas ke rupiah terdekat. Perhitungan tidak memasukkan
            bunga atau biaya lain.
          </p>
        </Card>
      </div>

      <div className="mt-4">
        <Card title="Catatan">
          <p className="text-sm whitespace-pre-line text-slate-700">
            {application.notes}
          </p>
        </Card>
      </div>

      <div className="mt-4">
        <Card
          title="Riwayat Pengajuan Nasabah"
          padded={false}
          action={
            <span className="text-sm text-slate-600">
              Pengajuan ditolak tidak dihitung dalam kuota
            </span>
          }
        >
          <CustomerHistoryTable
            applications={customerApplications}
            currentId={application.id}
          />
        </Card>
      </div>

      {isEditing ? (
        <ApplicationFormModal
          application={application}
          onClose={() => setIsEditing(false)}
          onSaved={(saved) => {
            setIsEditing(false);
            setToast(`Pengajuan ${saved.customerName} berhasil diperbarui`);
            reload();
          }}
        />
      ) : null}

      {decision ? (
        <DecisionDialog
          application={application}
          decision={decision}
          onClose={closeDecision}
        />
      ) : null}

      {toast ? <Toast message={toast} onClose={() => setToast(null)} /> : null}
    </div>
  );
}
