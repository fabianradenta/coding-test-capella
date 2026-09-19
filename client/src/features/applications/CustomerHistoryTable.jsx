import { Link } from 'react-router';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import {
  APPLICATION_TYPE_LABELS,
  formatCurrency,
  formatDate,
} from '../../utils/format.js';

const HEADER_CLASS =
  'px-5 py-3 text-xs font-medium tracking-wide text-slate-500 uppercase';
const CELL_CLASS = 'px-5 py-3 text-sm text-slate-700';

export function CustomerHistoryTable({ applications, currentId }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[48rem] border-collapse">
        <thead className="border-y border-slate-200 bg-slate-50">
          <tr>
            <th scope="col" className={`${HEADER_CLASS} text-left`}>
              Tanggal
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
            <th scope="col" className={`${HEADER_CLASS} text-left`}>
              Status
            </th>
            <th scope="col" className={`${HEADER_CLASS} text-left`}>
              Kuota
            </th>
            <th scope="col" className={`${HEADER_CLASS} text-left`}>
              <span className="sr-only">Aksi</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {applications.map((application) => {
            const isCurrent = application.id === currentId;
            const isCounted = application.status !== 'REJECTED';

            return (
              <tr
                key={application.id}
                className={`border-b border-slate-200 last:border-b-0 ${
                  isCurrent ? 'bg-blue-50/60' : ''
                }`}
              >
                <td className={`${CELL_CLASS} whitespace-nowrap`}>
                  {formatDate(application.submittedAt)}
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
                <td className={CELL_CLASS}>
                  <StatusBadge status={application.status} />
                </td>
                <td
                  className={`${CELL_CLASS} ${isCounted ? '' : 'text-slate-400'}`}
                >
                  {isCounted ? 'Dihitung' : 'Tidak dihitung'}
                </td>
                <td className={`${CELL_CLASS} text-right`}>
                  {isCurrent ? (
                    <span className="text-sm font-medium text-blue-800">
                      Sedang dilihat
                    </span>
                  ) : (
                    <Link
                      to={`/applications/${application.id}`}
                      className="text-sm font-medium text-blue-800 hover:underline"
                    >
                      Detail
                    </Link>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
