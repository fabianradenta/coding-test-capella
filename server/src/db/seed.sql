INSERT INTO customers (name, identity_number) VALUES
  ('Siti Aminah', '3201014405900001'),
  ('Budi Santoso', '3273051209880002'),
  ('Budi Santoso', '3578062501920003'),
  ('Dewi Lestari', '3174045511930004'),
  ('Agus Prasetyo', '3671011708850005'),
  ('Rina Marlina', '3204026003950006');

INSERT INTO applications (
  customer_id,
  application_type,
  requested_amount,
  tenor,
  monthly_income,
  notes,
  monthly_payment,
  status,
  submitted_at
)
SELECT
  c.id,
  v.application_type,
  v.requested_amount,
  v.tenor,
  v.monthly_income,
  v.notes,
  v.monthly_payment,
  v.status,
  now() - v.age
FROM (
  VALUES
    ('3201014405900001', 'MOTORCYCLE', 18000000, 12, 7500000, 'Pembelian motor untuk operasional warung.', 1500000, 'APPROVED', interval '12 days'),
    ('3201014405900001', 'MULTIPURPOSE', 10000000, 3, 7500000, 'Biaya renovasi dapur, tenor pendek.', 3333334, 'REJECTED', interval '8 days'),
    ('3201014405900001', 'CAR', 150000000, 24, 7500000, 'Mobil bekas untuk antar barang dagangan.', 6250000, 'PENDING', interval '2 days'),
    ('3273051209880002', 'CAR', 120000000, 24, 9500000, 'Kendaraan keluarga, sudah ada DP 20 persen.', 5000000, 'PENDING', interval '1 day'),
    ('3578062501920003', 'MOTORCYCLE', 22500000, 18, 6000000, 'Motor untuk kerja harian di Surabaya.', 1250000, 'APPROVED', interval '5 days'),
    ('3174045511930004', 'MULTIPURPOSE', 50000000, 24, 15000000, 'Dana pendidikan anak tahun ajaran baru.', 2083334, 'APPROVED', interval '20 days'),
    ('3174045511930004', 'MOTORCYCLE', 20000000, 12, 15000000, 'Motor kedua untuk anak kuliah.', 1666667, 'PENDING', interval '7 days'),
    ('3174045511930004', 'CAR', 90000000, 24, 15000000, 'Mobil untuk usaha rental.', 3750000, 'PENDING', interval '3 days'),
    ('3671011708850005', 'MULTIPURPOSE', 7500000, 6, 3200000, 'Modal tambahan untuk stok toko kelontong.', 1250000, 'REJECTED', interval '15 days')
) AS v (
  identity_number,
  application_type,
  requested_amount,
  tenor,
  monthly_income,
  notes,
  monthly_payment,
  status,
  age
)
JOIN customers c ON c.identity_number = v.identity_number;
