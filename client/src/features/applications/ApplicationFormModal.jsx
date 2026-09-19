import { useEffect, useState } from 'react';
import { createApplication } from '../../api/applications.js';
import { getCustomer } from '../../api/customers.js';
import { Alert } from '../../components/Alert.jsx';
import { Button } from '../../components/Button.jsx';
import { FormField, inputClassName } from '../../components/FormField.jsx';
import { Modal } from '../../components/Modal.jsx';
import {
  APPLICATION_TYPE_LABELS,
  formatCurrency,
  formatNumber,
} from '../../utils/format.js';
import { CustomerQuotaNotice } from './CustomerQuotaNotice.jsx';
import {
  checkBusinessRules,
  digitsOnly,
  monthlyPaymentOf,
  toNumber,
  validateFields,
} from './applicationRules.js';

const IDENTITY_LENGTH = 16;

const EMPTY_VALUES = {
  identityNumber: '',
  name: '',
  monthlyIncome: '',
  applicationType: '',
  requestedAmount: '',
  tenor: '',
  notes: '',
};

export function ApplicationFormModal({ open, onClose, onSaved }) {
  const [values, setValues] = useState(EMPTY_VALUES);
  const [fieldErrors, setFieldErrors] = useState({});
  const [ruleError, setRuleError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lookup, setLookup] = useState({ state: 'idle' });

  const { identityNumber } = values;

  useEffect(() => {
    if (identityNumber.length !== IDENTITY_LENGTH) {
      setLookup({ state: 'idle' });
      return undefined;
    }

    const controller = new AbortController();
    setLookup({ state: 'loading' });

    getCustomer(identityNumber, { signal: controller.signal })
      .then((customer) => {
        setLookup({ state: 'found', customer });
        setValues((current) => ({ ...current, name: customer.name }));
        setFieldErrors((current) => ({ ...current, name: undefined }));
      })
      .catch((err) => {
        if (err.name === 'AbortError') {
          return;
        }
        // Anything other than "not registered yet" still lets the form be submitted;
        // the server checks the customer again anyway.
        setLookup(
          err.status === 404
            ? { state: 'new' }
            : { state: 'error', message: err.message },
        );
      });

    return () => controller.abort();
  }, [identityNumber]);

  function setIdentityNumber(value) {
    setValues((current) => ({
      ...current,
      identityNumber: value,
      // A name that came from a lookup must not survive a change of identity number.
      name: lookup.state === 'found' ? '' : current.name,
    }));
    setFieldErrors((current) => ({ ...current, identityNumber: undefined }));
    setRuleError(null);
  }

  function setField(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
    setRuleError(null);
  }

  function close() {
    setValues(EMPTY_VALUES);
    setFieldErrors({});
    setRuleError(null);
    setLookup({ state: 'idle' });
    onClose();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isQuotaFull) {
      return;
    }

    const errors = validateFields(values);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setRuleError(null);
      return;
    }

    const violation = checkBusinessRules(values);
    if (violation) {
      setFieldErrors({});
      setRuleError(violation);
      return;
    }

    setIsSaving(true);
    try {
      const application = await createApplication({
        identityNumber: values.identityNumber.trim(),
        name: values.name.trim(),
        applicationType: values.applicationType,
        requestedAmount: toNumber(values.requestedAmount),
        tenor: toNumber(values.tenor),
        monthlyIncome: toNumber(values.monthlyIncome),
        notes: values.notes.trim(),
      });
      close();
      onSaved(application);
    } catch (err) {
      setFieldErrors(err.fields ?? {});
      setRuleError(err.fields ? null : { message: err.message });
    } finally {
      setIsSaving(false);
    }
  }

  const existingCustomer = lookup.state === 'found' ? lookup.customer : null;
  const identityHint = {
    loading: 'Mengecek data nasabah…',
    new: 'Belum terdaftar, nasabah baru akan dibuat.',
    error: 'Gagal mengecek data nasabah, isi nama secara manual.',
  }[lookup.state];
  const isQuotaFull = existingCustomer?.quota.remaining === 0;

  const monthlyPayment = monthlyPaymentOf(
    toNumber(values.requestedAmount),
    toNumber(values.tenor),
  );

  return (
    <Modal
      open={open}
      onClose={close}
      labelledBy="form-pengajuan-judul"
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit} noValidate>
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <h2
              id="form-pengajuan-judul"
              className="text-lg font-semibold text-slate-900"
            >
              Tambah Pengajuan
            </h2>
            <p className="mt-0.5 text-sm text-slate-600">
              Isi nomor identitas terlebih dahulu untuk mengecek data nasabah.
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Tutup form"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5">
          {isQuotaFull ? (
            <Alert title="Nasabah telah mencapai batas maksimal 3 pengajuan">
              <p>
                Selesaikan atau tolak salah satu pengajuan yang masih berjalan
                sebelum menambah pengajuan baru.
              </p>
            </Alert>
          ) : null}

          {ruleError && !isQuotaFull ? (
            <Alert title={ruleError.message}>
              {ruleError.detail ? <p>{ruleError.detail}</p> : null}
            </Alert>
          ) : null}

          <section className="space-y-4">
            <h3 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Data Nasabah
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Nomor identitas"
                htmlFor="identityNumber"
                error={fieldErrors.identityNumber}
                hint={identityHint}
              >
                <input
                  id="identityNumber"
                  inputMode="numeric"
                  autoComplete="off"
                  value={values.identityNumber}
                  onChange={(event) =>
                    setIdentityNumber(
                      digitsOnly(event.target.value, IDENTITY_LENGTH),
                    )
                  }
                  aria-invalid={Boolean(fieldErrors.identityNumber)}
                  aria-describedby={
                    fieldErrors.identityNumber
                      ? 'identityNumber-error'
                      : undefined
                  }
                  className={inputClassName(
                    Boolean(fieldErrors.identityNumber),
                    'tabular-nums',
                  )}
                />
              </FormField>

              <FormField
                label="Nama lengkap"
                htmlFor="name"
                error={fieldErrors.name}
              >
                <input
                  id="name"
                  value={values.name}
                  onChange={(event) => setField('name', event.target.value)}
                  readOnly={Boolean(existingCustomer)}
                  aria-invalid={Boolean(fieldErrors.name)}
                  aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                  className={inputClassName(
                    Boolean(fieldErrors.name),
                    existingCustomer
                      ? 'bg-slate-100 text-slate-600'
                      : undefined,
                  )}
                />
              </FormField>
            </div>

            {existingCustomer ? (
              <CustomerQuotaNotice customer={existingCustomer} />
            ) : null}
          </section>

          <section className="space-y-4">
            <h3 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Data Pembiayaan
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Pendapatan bulanan"
                htmlFor="monthlyIncome"
                error={fieldErrors.monthlyIncome}
              >
                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-base text-slate-500">
                    Rp
                  </span>
                  <input
                    id="monthlyIncome"
                    inputMode="numeric"
                    value={
                      values.monthlyIncome === ''
                        ? ''
                        : formatNumber(Number(values.monthlyIncome))
                    }
                    onChange={(event) =>
                      setField(
                        'monthlyIncome',
                        digitsOnly(event.target.value, 12),
                      )
                    }
                    aria-invalid={Boolean(fieldErrors.monthlyIncome)}
                    aria-describedby={
                      fieldErrors.monthlyIncome
                        ? 'monthlyIncome-error'
                        : undefined
                    }
                    className={inputClassName(
                      Boolean(fieldErrors.monthlyIncome),
                      'pl-10 tabular-nums',
                    )}
                  />
                </div>
              </FormField>

              <FormField
                label="Tipe pengajuan"
                htmlFor="applicationType"
                error={fieldErrors.applicationType}
              >
                <select
                  id="applicationType"
                  value={values.applicationType}
                  onChange={(event) =>
                    setField('applicationType', event.target.value)
                  }
                  aria-invalid={Boolean(fieldErrors.applicationType)}
                  aria-describedby={
                    fieldErrors.applicationType
                      ? 'applicationType-error'
                      : undefined
                  }
                  className={inputClassName(
                    Boolean(fieldErrors.applicationType),
                  )}
                >
                  <option value="">Pilih tipe</option>
                  {Object.entries(APPLICATION_TYPE_LABELS).map(
                    ([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ),
                  )}
                </select>
              </FormField>

              <FormField
                label="Nominal pengajuan"
                htmlFor="requestedAmount"
                error={fieldErrors.requestedAmount}
              >
                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-base text-slate-500">
                    Rp
                  </span>
                  <input
                    id="requestedAmount"
                    inputMode="numeric"
                    value={
                      values.requestedAmount === ''
                        ? ''
                        : formatNumber(Number(values.requestedAmount))
                    }
                    onChange={(event) =>
                      setField(
                        'requestedAmount',
                        digitsOnly(event.target.value, 12),
                      )
                    }
                    aria-invalid={Boolean(fieldErrors.requestedAmount)}
                    aria-describedby={
                      fieldErrors.requestedAmount
                        ? 'requestedAmount-error'
                        : undefined
                    }
                    className={inputClassName(
                      Boolean(fieldErrors.requestedAmount),
                      'pl-10 tabular-nums',
                    )}
                  />
                </div>
              </FormField>

              <FormField
                label="Tenor"
                htmlFor="tenor"
                error={fieldErrors.tenor}
              >
                <div className="relative">
                  <input
                    id="tenor"
                    inputMode="numeric"
                    value={values.tenor}
                    onChange={(event) =>
                      setField('tenor', digitsOnly(event.target.value, 3))
                    }
                    aria-invalid={Boolean(fieldErrors.tenor)}
                    aria-describedby={
                      fieldErrors.tenor ? 'tenor-error' : undefined
                    }
                    className={inputClassName(
                      Boolean(fieldErrors.tenor),
                      'pr-16 tabular-nums',
                    )}
                  />
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-base text-slate-500">
                    bulan
                  </span>
                </div>
              </FormField>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-lg bg-blue-50 px-4 py-3">
              <span className="text-sm text-blue-900">
                Estimasi tagihan per bulan
              </span>
              <span className="text-xl font-bold text-blue-900 tabular-nums">
                {monthlyPayment === null ? '—' : formatCurrency(monthlyPayment)}
              </span>
            </div>

            <FormField
              label="Catatan"
              htmlFor="notes"
              error={fieldErrors.notes}
            >
              <textarea
                id="notes"
                rows={3}
                value={values.notes}
                onChange={(event) => setField('notes', event.target.value)}
                placeholder="Contoh: tujuan pembiayaan"
                aria-invalid={Boolean(fieldErrors.notes)}
                aria-describedby={fieldErrors.notes ? 'notes-error' : undefined}
                className={inputClassName(
                  Boolean(fieldErrors.notes),
                  'h-auto py-2.5',
                )}
              />
            </FormField>
          </section>
        </div>

        <footer className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <Button onClick={close} disabled={isSaving}>
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSaving}
            disabled={isQuotaFull}
          >
            Simpan Pengajuan
          </Button>
        </footer>
      </form>
    </Modal>
  );
}
