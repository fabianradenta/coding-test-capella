import { Link } from 'react-router';
import { Button, buttonClassName } from '../../components/Button.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import {
  APPLICATION_TYPE_LABELS,
  formatCurrency,
  formatDate,
} from '../../utils/format.js';

const HEADER_CLASS =
  'px-4 py-3 text-xs font-medium tracking-wide text-slate-500 uppercase';
const CELL_CLASS = 'px-4 py-3 text-sm text-slate-700';

function RowActions({ application, onDecide }) {
  return (
    <div className="flex flex-nowrap gap-2 whitespace-nowrap">
      {application.status === 'PENDING' ? (
        <>
          <Button
            variant="approve"
            onClick={() => onDecide(application, 'APPROVED')}
          >
            Setujui
          </Button>
          <Button
            variant="reject"
            onClick={() => onDecide(application, 'REJECTED')}
          >
            Tolak
          </Button>
        </>
      ) : null}
      <Link
        to={`/applications/${application.id}`}
        className={buttonClassName('secondary')}
      >
        Detail
      </Link>
    </div>
  );
}

function CardField({ label, children }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-900 tabular-nums">{children}</dd>
    </div>
  );
}

// Below the table breakpoint the same rows are stacked, so nothing needs sideways scrolling.
function ApplicationCard({ application, onDecide }) {
  return (
    <li className="border-b border-slate-200 p-4 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-slate-900">
            {application.customerName}
          </p>
          <p className="text-xs text-slate-500 tabular-nums">
            {application.identityNumber}
          </p>
        </div>
        <StatusBadge status={application.status} />
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-y-3">
        <CardField label="Tipe">
          {APPLICATION_TYPE_LABELS[application.applicationType]} ·{' '}
          {application.tenor} bln
        </CardField>
        <CardField label="Tanggal">
          {formatDate(application.submittedAt)}
        </CardField>
        <CardField label="Nominal">
          {formatCurrency(application.requestedAmount)}
        </CardField>
        <CardField label="Tagihan / bln">
          {formatCurrency(application.monthlyPayment)}
        </CardField>
      </dl>

      <div className="mt-4">
        <RowActions application={application} onDecide={onDecide} />
      </div>
    </li>
  );
}

export function ApplicationsTable({ items, onDecide }) {
  return (
    <>
      <ul className="md:hidden">
        {items.map((application) => (
          <ApplicationCard
            key={application.id}
            application={application}
            onDecide={onDecide}
          />
        ))}
      </ul>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[62rem] border-collapse">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th scope="col" className={`${HEADER_CLASS} text-left`}>
                Nasabah
              </th>
              <th scope="col" className={`${HEADER_CLASS} text-left`}>
                Tipe
              </th>
              <th scope="col" className={`${HEADER_CLASS} text-right`}>
                Nominal
              </th>
              <th scope="col" className={`${HEADER_CLASS} text-left`}>
                Tenor
              </th>
              <th scope="col" className={`${HEADER_CLASS} text-right`}>
                Tagihan / Bln
              </th>
              <th scope="col" className={`${HEADER_CLASS} text-left`}>
                Tanggal
              </th>
              <th scope="col" className={`${HEADER_CLASS} text-left`}>
                Status
              </th>
              <th scope="col" className={`${HEADER_CLASS} text-left`}>
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((application) => (
              <tr
                key={application.id}
                className="border-b border-slate-200 last:border-b-0"
              >
                <td className={CELL_CLASS}>
                  <div className="font-medium text-slate-900">
                    {application.customerName}
                  </div>
                  <div className="text-xs text-slate-500 tabular-nums">
                    {application.identityNumber}
                  </div>
                </td>
                <td className={CELL_CLASS}>
                  {APPLICATION_TYPE_LABELS[application.applicationType]}
                </td>
                <td className={`${CELL_CLASS} text-right tabular-nums`}>
                  {formatCurrency(application.requestedAmount)}
                </td>
                <td className={`${CELL_CLASS} tabular-nums`}>
                  {application.tenor} bln
                </td>
                <td className={`${CELL_CLASS} text-right tabular-nums`}>
                  {formatCurrency(application.monthlyPayment)}
                </td>
                <td className={`${CELL_CLASS} whitespace-nowrap`}>
                  {formatDate(application.submittedAt)}
                </td>
                <td className={CELL_CLASS}>
                  <StatusBadge status={application.status} />
                </td>
                <td className={CELL_CLASS}>
                  <RowActions application={application} onDecide={onDecide} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
