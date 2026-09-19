import { Link, useParams } from 'react-router';

export function ApplicationDetailPage() {
  const { id } = useParams();

  return (
    <div>
      <Link
        to="/"
        className="text-sm font-medium text-blue-800 hover:underline"
      >
        Kembali ke daftar
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">
        Detail Pengajuan
      </h1>
      <p className="mt-1 text-sm text-slate-600">{id}</p>
    </div>
  );
}
