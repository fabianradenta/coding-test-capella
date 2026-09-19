# Aplikasi Pengajuan Pembiayaan
> *Source code* ini dibuat untuk memenuhi *coding test* IT Department PT Capella Multidana, yaitu pembuatan *prototype internal tool* untuk pengajuan pembiayaan nasabah.

## Deskripsi Singkat Program
Program ini merupakan aplikasi web internal untuk mencatat, meninjau, dan memutuskan pengajuan pembiayaan nasabah untuk sepeda motor, mobil, dan multiguna. Staf dapat membuat pengajuan baru, melihat daftar pengajuan beserta tagihan per bulan, mencari dan memfilter pengajuan, melihat detail pengajuan, serta menyetujui atau menolak pengajuan melalui dialog konfirmasi. Seluruh aturan pengajuan, seperti batas pendapatan, nominal, tenor, dan jumlah pengajuan per nasabah, diterapkan di *backend*.

Spesifikasi lengkap, termasuk asumsi dan keputusan teknis, tersedia di [docs/spesifikasi-produk.pdf](docs/spesifikasi-produk.pdf).

## Requirements
- Node.js 22 atau lebih baru
- Docker
- React (Vite) dan Tailwind CSS
- Express
- PostgreSQL 17

## Cara Menjalankan Program
1. Pastikan Node.js dan Docker sudah terpasang di perangkat anda. Status pemasangan dapat diperiksa dengan menjalankan *command* `node --version` dan `docker --version` pada *terminal*.
2. *Clone repository* dan masuk ke *directory* proyek dengan *command* berikut
```
git clone https://github.com/fabianradenta/coding-test-capella.git
cd coding-test-capella
```
3. Jalankan *database* PostgreSQL. *Database* akan berjalan pada port 5433.
```
docker compose up -d
```
4. Pasang *dependency* untuk *backend* dan *frontend*
```
npm install --prefix server
npm install --prefix client
```
5. Siapkan *environment variable*, lalu buat *database* beserta data contoh
```
cp server/.env.example server/.env
npm run db:setup --prefix server
```
6. Jalankan *backend*
```
npm run dev --prefix server
```
7. Buka *terminal* baru, lalu jalankan *frontend*
```
npm run dev --prefix client
```
8. Buka `http://localhost:5173` pada *browser*.

## Pengujian
Pengujian otomatis tersedia untuk *backend* dan dijalankan dengan *command* berikut
```
npm test --prefix server
```

## Catatan
Program ini merupakan *prototype* untuk keperluan *coding test*, sehingga ruang lingkupnya dibatasi pada kebutuhan soal. Fitur seperti autentikasi, *audit trail*, perhitungan bunga, dan *pagination* belum tersedia.

## Author
Nama : Fabian Radenta Bangun<br>
Profile Github : [fabianradenta](https://github.com/fabianradenta)