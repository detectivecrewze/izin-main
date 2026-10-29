# Izin Main

Izin Main adalah gift digital self-edit berbentuk permohonan pergi yang personal, lucu, dan jelas. Customer menyusun berkas melalui Studio, memilih judul, gaya, dan soundtrack, lalu membagikan gift kepada pasangan untuk disetujui.

## Status proyek

**Fase 4 — integrasi penjualan sudah diimplementasikan dan diverifikasi secara lokal.** Gift Pages, Customer Studio, Worker, admin internal, integrasi `pakasir-sandbox`, dan halaman storefront Izin Main sudah tersedia. Deployment sandbox, port ke `pakasir-gateway` production, serta deployment storefront/Worker production tetap menunggu izin eksplisit owner.

Urutan pengerjaan yang wajib:

1. Gift Pages — desain dan recipient experience.
2. Customer Studio — pengalaman self-edit.
3. Worker, storage, dan admin internal minimal.
4. Pakasir sandbox dan storefront.
5. Production release setelah izin eksplisit.

Fase berikutnya tidak dimulai sebelum fase aktif disetujui owner. Baca `PRD.md` untuk spesifikasi lengkap dan `AGENTS.md` untuk aturan kerja.

## Preview lokal

```bash
npm install
npm run dev
```

Root URL menampilkan opening map. Parameter demo yang tersedia:

- `?open=1` membuka gift langsung untuk QA.
- `?theme=crimson-office` menampilkan palet Crimson Office.
- `?open=1&section=decision-title` membuka gift pada section keputusan untuk QA.

Pada alur penerima normal, tombol `Buka berkas` sekaligus mencoba memulai soundtrack. Kontrol audio tampil sebagai tombol musik SVG ringkas di pojok kanan atas; ketuk untuk jeda atau memutar kembali tanpa menutupi dokumen. Pembukaan langsung melalui `?open=1` sengaja tidak memaksa autoplay karena tidak memiliki gesture pengguna.

Parameter tersebut hanya merupakan bantuan demo Fase 1 dan bukan kontrak URL gift production.

Customer Studio lokal tersedia melalui:

```text
/studio/permit-adit-001?token=demo-access
```

Studio diawali pilihan Bahasa Indonesia atau English yang berlaku sekaligus untuk UI Studio, fixed UI gift, dan semua preset. Bahasa juga dapat diganti dari header; hanya copy default/preset yang dikenali yang ikut berubah, sedangkan tulisan custom customer selalu dipertahankan. Studio diringkas menjadi tujuh langkah: Opening & Identitas, Ringkasan & Rencana, Komitmen, Catatan, Keputusan & Ending, Gaya & Musik, lalu Publish. Editor judul berada bersama isi halaman yang bersangkutan agar customer tidak bolak-balik. Pada project Worker, autosave menyimpan draft ke KV, upload foto/musik masuk R2, publish membuat record gift terpisah, dan respons penerima kembali terlihat di Studio.

Dashboard internal tersedia di `/admin`. Token hanya disimpan pada `sessionStorage` tab browser. Dashboard dapat membuat project idempotent, memfilter status, membuka Studio untuk support, menyalin link gift, menerbitkan ulang akses Studio, dan melihat error fulfillment.

Untuk local full-flow, jalankan frontend dan Worker pada terminal terpisah:

```bash
npm run dev
npm run worker:dev
```

Salin `.dev.vars.example` menjadi `.dev.vars` dan gunakan token lokal. Vite meneruskan `/api` ke Worker lokal pada port 8787.

## Stack rencana

- Vite + TypeScript
- Cloudflare Worker + KV terpisah untuk draft, published gift, metadata, akses Studio, dan respons penerima
- R2 bucket `valentine-upload` dengan prefix `izin-main/`
- Vercel frontend
- Pakasir API v2 melalui sandbox terlebih dahulu

## Konfigurasi Worker

- Secret wajib: `ADMIN_TOKEN` dan `ORDER_INGEST_SECRET`
- Binding KV: `IZIN_MAIN_KV`
- Binding R2: `MEDIA`, bucket `valentine-upload`
- Prefix media: `izin-main/{projectId}/`
- Vars: `ALLOWED_ORIGINS`, `PUBLIC_APP_URL`, dan `PUBLIC_API_URL`

ID namespace pada `wrangler.toml` masih placeholder lokal. Jangan deploy sebelum ID KV, URL production, origin production, serta secret sudah diisi dan owner memberi izin eksplisit.

## Integrasi Phase 4

Worker menyediakan `POST /api/integrations/orders` untuk gateway pembayaran. Endpoint ini memakai Bearer `ORDER_INGEST_SECRET`, menyimpan `order:{orderId}`, dan membuat tepat satu project berdasarkan idempotency key `${orderId}:izin-main`. Respons mengembalikan `studioUrl` customer dan aman dipanggil ulang tanpa membuat project ganda.

Implementasi sandbox berada di `pakasir-sandbox` dengan SKU `izin-main` seharga **Rp15.000**. Produk tetap self-edit: setelah pembayaran terverifikasi, customer menerima link Studio melalui email dan halaman order status. Storefront lokal sudah memiliki `/catalog/izin-main`, demo dua tema, Gift Finder, sales count, sitemap, metadata, dan screenshot showcase Gift Pages asli.

Verifikasi lokal 29 Oktober 2026:

- Izin Main `npm run check`: 10/10 test lulus, Worker typecheck lulus, production build lulus.
- pakasir-sandbox `npm test`: 50/50 test lulus.
- storefront lint: 0 error (warning lama tetap ada).
- storefront production build: lulus dan `/catalog/izin-main` diprerender.
- uji integrasi langsung sandbox module → Worker lokal: satu order menghasilkan satu project/Studio URL dan panggilan kedua memakai project yang sama.
