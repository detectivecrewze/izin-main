# Izin Main

Izin Main adalah gift digital self-edit berbentuk permohonan pergi yang personal, lucu, dan jelas. Customer menyusun berkas melalui Studio, memilih judul, gaya, dan soundtrack, lalu membagikan gift kepada pasangan untuk disetujui.

## Status proyek

**Fase 2 — Customer Studio telah diimplementasikan secara lokal dan menunggu review owner.** Gift Pages sudah disetujui. Worker, dashboard, payment, storefront, dan deployment belum dikerjakan. Jangan memulai Fase 3 sebelum owner menyatakan pengalaman Studio sudah disetujui.

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

Studio diawali pilihan Bahasa Indonesia atau English yang berlaku sekaligus untuk UI Studio, fixed UI gift, dan semua preset. Bahasa juga dapat diganti dari header; hanya copy default/preset yang dikenali yang ikut berubah, sedangkan tulisan custom customer selalu dipertahankan. Setelah itu Studio terdiri dari sepuluh langkah yang mengikuti section gift sebenarnya: Opening, Ringkasan, Dua Pihak, Rencana, Komitmen, Catatan, Keputusan, Ending, Gaya & Musik, lalu Publish. Setiap section mempunyai field judul dan preset sendiri. Studio menyimpan draft otomatis di browser, membuka preview gift asli langsung ke section terkait melalui bar preview di bagian atas, menyediakan tema, playlist, upload lokal untuk QA, serta publish lokal terpisah dari save. Setelah publish, Studio menghasilkan link dan barcode dokumen yang dapat diunduh. Token pada URL adalah simulasi capability access sampai Worker Fase 3 tersedia.

## Stack rencana

- Vite + TypeScript
- Cloudflare Worker + KV
- R2 bucket `valentine-upload` dengan prefix `izin-main/`
- Vercel frontend
- Pakasir API v2 melalui sandbox terlebih dahulu
