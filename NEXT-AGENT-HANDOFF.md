# Izin Main — Handoff untuk Agent Berikutnya

Dokumen ini adalah titik masuk operasional untuk melanjutkan project **Izin Main**. Baca juga `AGENTS.md`, `PRD.md`, dan `README.md` sebelum mengubah kode.

## 1. Apa project ini?

Izin Main adalah gift digital **self-edit** yang mengubah permintaan izin pergi/main menjadi berkas interaktif yang lucu, hangat, dan tetap jelas. Penerima membuka map dokumen, membaca identitas pengaju dan penerima, melihat detail rencana, komitmen, catatan personal, lalu menyetujui permintaan. Hasil persetujuan dapat dibuat menjadi kartu PNG untuk dibagikan.

Pengalaman utama memakai halaman dokumen horizontal/swipe, bukan halaman panjang. Produk mendukung Bahasa Indonesia dan English, beberapa tema warna, dua foto identitas, musik, live preview, serta tampilan mobile-first.

## 2. Teknologi dan arsitektur

- Frontend: Vite + TypeScript, tanpa framework UI besar.
- Backend: Cloudflare Worker.
- Data: Cloudflare KV melalui binding `IZIN_MAIN_KV`.
- Media: Cloudflare R2 melalui binding `MEDIA`, memakai prefix `izin-main/{projectId}/`.
- Hosting frontend production: direncanakan mengikuti pola Vercel/static gift lain.
- Pembayaran: belum dihubungkan ke production; integrasi berikutnya harus dimulai di `pakasir-sandbox`.

Kontrak penyimpanan penting:

- `draft:{projectId}` — draft Studio.
- `gift:{projectId}` — gift yang sudah dipublikasikan.
- `response:{projectId}` — jawaban penerima.
- `project-meta:{projectId}` — metadata dan status project.
- `studio-access:{token}` — akses Studio.

Jangan mengarang struktur baru sebelum mengecek schema dan route Worker yang sudah ada.

## 3. Tahap yang sudah selesai

### Phase 1 — Gift pages

Sudah diimplementasikan:

- opening map/berkas dengan animasi;
- navigasi antar-sheet secara horizontal/swipe;
- identitas pengaju dan penerima dengan dua foto terpisah;
- detail rencana dengan field tempat/alamat/lokasi yang boleh kosong;
- komitmen, sticky note/catatan personal, keputusan `Disetujui`, dan ending;
- musik dengan kontrol kecil di kanan atas;
- auto-play setelah gesture membuka berkas, sesuai batasan browser;
- kartu persetujuan PNG yang responsif;
- Bahasa Indonesia dan English;
- beberapa tema warna dan layout mobile-first.

### Phase 2 — Customer Studio

Sudah diimplementasikan dan diringkas menjadi **7 langkah**:

1. Opening & dua orang — judul opening, nomor berkas, dua foto, nama, panggilan, role, dan kalimat pembuka.
2. Ringkasan & rencana pergi — judul halaman dan detail waktu/tempat/rencana.
3. Komitmen — judul halaman dan daftar janji.
4. Catatan personal — judul halaman dan pesan.
5. Keputusan & ending — copy persetujuan, judul ending, dan kartu hasil.
6. Gaya & musik — tema warna dan soundtrack.
7. Publish — validasi, publish, link gift, serta QR/barcode.

Studio sudah memiliki:

- UI Studio bilingual ID/EN;
- preset mengikuti bahasa aktif;
- autosave draft;
- tombol Previous/Next;
- preview yang membuka tepat ke section yang sedang diedit;
- upload media;
- publish terpisah dari draft;
- QR/barcode dan link hasil.

Perbaikan preview penting: `studioPreview` boleh merender draft yang belum lengkap. Validasi ketat tetap berlaku untuk publish dan gift publik. Jangan mengembalikan validasi ketat ke jalur preview karena akan membuat layar preview kosong saat customer masih mengedit.

### Phase 3 — Worker dan admin internal

Implementasi lokal sudah tersedia:

- health check Worker;
- project listing dan pembuatan project internal;
- akses Studio berbasis token;
- save draft dan publish;
- upload/serve media R2;
- gift publik dan pencatatan response;
- admin lokal dengan autentikasi token;
- metadata/status project dan retry/reissue access yang relevan.

Phase 3 telah lolos pemeriksaan teknis lokal, tetapi masih perlu persetujuan visual/operasional owner sebelum dianggap final untuk production.

### Phase 4 — sandbox checkout dan storefront

Implementasi lokal sudah tersedia:

- endpoint Worker `POST /api/integrations/orders` dengan Bearer secret dan idempotensi per Order ID;
- record `order:{orderId}` yang menghubungkan order ke project;
- SKU `izin-main` Rp15.000 di whitelist `pakasir-sandbox`;
- generator link Studio, email self-edit, order status, retry, dan sales count;
- halaman `/catalog/izin-main`, kartu homepage/catalog, modal demo dua tema, Gift Finder, metadata, analytics, sitemap, dan showcase asli dari Gift Pages desktop.

Belum dilakukan: deploy Worker/sandbox/storefront dan uji pembayaran Pakasir sandbox yang benar-benar live. Production gateway belum disentuh.

## 4. Status verifikasi terakhir

Tanggal pemeriksaan: **29 Oktober 2026**.

- `npm run check`: lulus.
- Unit test Izin Main: **10/10 lulus** dari 2 file test.
- TypeScript frontend: lulus.
- Worker typecheck: lulus.
- Production build: lulus.
- Worker `/health`: merespons sehat dengan service `izin-main-worker`.
- Frontend root, Studio demo, dan admin: HTTP 200.
- Endpoint admin terautentikasi: berhasil, project lokal terbaca.
- Browser smoke: Studio menampilkan 7 langkah; modal live preview memuat gift asli dan membuka section yang benar.

- pakasir-sandbox: **50/50 test lulus**, termasuk Pakasir v2, produk lama, DFY, The Plan, dan Izin Main.
- storefront lint: 0 error; production build lulus dan route `/catalog/izin-main` terbuat.
- integrasi langsung pakasir-sandbox module → Worker lokal lulus dan terbukti idempotent.

Ini membuktikan implementasi lokal sehat. Ini **belum** membuktikan pembayaran Pakasir sandbox live atau pembayaran production karena belum ada deployment yang diizinkan.

## 5. Cara menjalankan lokal

Pastikan dependency sudah terpasang:

```powershell
npm install
```

Terminal 1 — Worker lokal:

```powershell
npm run worker:dev
```

Terminal 2 — frontend pada port yang diizinkan CORS lokal:

```powershell
npx vite --host 127.0.0.1 --port 5176
```

URL lokal:

- Gift/demo: `http://127.0.0.1:5176/`
- Studio demo: `http://127.0.0.1:5176/studio/permit-adit-001?token=demo-access`
- Admin: `http://127.0.0.1:5176/admin`
- Worker: `http://127.0.0.1:8787`
- Token admin development: `local-phase3-admin`

Token di atas hanya untuk development. Jangan pakai sebagai secret production dan jangan commit `.dev.vars`.

Catatan: `npm run dev` memakai port default Vite. Untuk QA terpadu saat ini, gunakan port `5176` karena origin tersebut sudah disiapkan pada konfigurasi lokal Worker.

## 6. Pekerjaan berikutnya — release Phase 4

Phase berikutnya adalah menghubungkan produk ke alur penjualan, tetapi kerjakan bertahap:

1. Minta izin owner sebelum melakukan deployment apa pun.
2. Buat namespace KV Izin Main production dan isi ID nyata pada `wrangler.toml`.
3. Set secret Worker `ADMIN_TOKEN` dan `ORDER_INGEST_SECRET`; secret gateway `IZIN_MAIN_INGEST_SECRET` harus sama.
4. Deploy Worker Izin Main dan verifikasi `/health` serta order ingestion.
5. Deploy `pakasir-sandbox`, lalu uji end-to-end: checkout -> pembayaran -> email -> Studio -> upload -> publish -> gift -> response.
6. Setelah sandbox live terbukti stabil dan owner mengizinkan, port perubahan terkontrol ke `pakasir-gateway`. Jangan menyalin seluruh folder secara buta.
7. Deploy storefront dan frontend Izin Main, lalu smoke test desktop/mobile.

Tidak boleh push, deploy Worker production, atau mengubah gateway production tanpa izin eksplisit owner.

## 7. Prasyarat sebelum production

- Buat namespace KV production yang nyata dan ganti placeholder ID pada `wrangler.toml`.
- Set `ADMIN_TOKEN` sebagai secret Worker production.
- Pastikan `ALLOWED_ORIGINS`, public frontend URL, dan API URL sesuai domain production.
- Verifikasi binding R2 `MEDIA` dan bucket `valentine-upload`.
- Set `ORDER_INGEST_SECRET` pada Worker Izin Main dan `IZIN_MAIN_INGEST_SECRET` pada gateway dengan nilai yang sama.
- Pastikan `.dev.vars`, token, dan secret lain tidak masuk Git.
- Jalankan kembali `npm run check`.
- Jalankan smoke test mobile dan desktop pada deployment staging.
- Uji publish, upload, QR/barcode, response, serta locale ID/EN.

### Peringatan Wrangler

Saat QA lokal terakhir, Wrangler yang terpasang mendukung compatibility date sampai `2026-01-31`, sementara project meminta `2026-10-01`. Wrangler memakai fallback lokal dan Worker tetap berjalan. Sebelum production, upgrade Wrangler lalu ulangi typecheck dan smoke test. Jangan mengubah compatibility date secara asal hanya untuk menghilangkan warning.

## 8. File yang wajib dibaca

- `PRD.md` — keputusan produk dan urutan phase.
- `AGENTS.md` — aturan kerja agent.
- `README.md` — status dan perintah project.
- `src/main.ts` — routing gift/Studio/admin dan aturan preview.
- `src/project.ts` serta schema terkait — kontrak data project.
- `src/studio/` — Studio customer.
- `src/admin/` — dashboard internal.
- `worker/src/` — API Worker dan penyimpanan.
- `wrangler.toml` — binding serta konfigurasi Worker.

## 9. Checklist agent berikutnya

Sebelum menulis kode:

1. Baca dokumen ini, `AGENTS.md`, `PRD.md`, dan `README.md` sampai selesai.
2. Jalankan `git status` dan jangan menimpa perubahan owner.
3. Jalankan `npm run check` sebagai baseline.
4. Konfirmasi Phase 3 sudah diterima owner secara visual.
5. Kerjakan Phase 4 di sandbox dahulu.
6. Catat hasil checkout, email, fulfillment, Studio, publish, dan response secara terpisah.
7. Minta izin sebelum push/deploy atau menyentuh production gateway.

## 10. Status Git dan deployment pada handoff ini

- Tidak ada push Git pada sesi QA/handoff ini.
- Tidak ada deployment production pada sesi QA/handoff ini.
- Frontend dan Worker hanya dijalankan secara lokal.

