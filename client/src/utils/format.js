export const APPLICATION_TYPE_LABELS = {
  MOTORCYCLE: 'Sepeda Motor',
  CAR: 'Mobil',
  MULTIPURPOSE: 'Multiguna',
};

export const STATUS_LABELS = {
  PENDING: 'Menunggu',
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak',
};

const numberFormat = new Intl.NumberFormat('id-ID');

const dateFormat = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Asia/Jakarta',
});

const timeFormat = new Intl.DateTimeFormat('id-ID', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Asia/Jakarta',
});

export function formatNumber(value) {
  return numberFormat.format(value);
}

export function formatCurrency(value) {
  return `Rp${numberFormat.format(value)}`;
}

export function formatDate(value) {
  return dateFormat.format(new Date(value));
}

// The staff reading this work in Jakarta, so the time zone is stated rather than local.
export function formatDateTime(value) {
  const date = new Date(value);
  return `${dateFormat.format(date)} pukul ${timeFormat.format(date)} WIB`;
}
