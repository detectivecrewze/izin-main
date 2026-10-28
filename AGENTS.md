# Izin Main — aturan kerja agent

Baca `PRD.md` dan `README.md` sepenuhnya sebelum mengubah proyek. Produk ini adalah gift **self-edit** berupa permohonan pergi yang playful dan sehat; bukan produk Terima Jadi, bukan sistem pelacakan, dan bukan alat kontrol pasangan.

## Acceptance gate wajib

Gift Pages dan Customer Studio sudah disetujui owner. Fase aktif sekarang adalah **Worker, storage, dan admin internal minimal**. Jangan mengerjakan payment/storefront production sebelum Phase 3 lolos review dan owner memberi arahan berikutnya.

## Data dan konten

- Semua konten gift berasal dari kontrak project dan data demo terpisah.
- Jangan hardcode nama, tanggal, lokasi, komitmen, atau pesan ke komponen renderer.
- Tidak ada field kendaraan, plat nomor, nomor WhatsApp, atau live location.
- Email pembayaran hanya untuk delivery akses Studio dan tidak pernah tampil di gift.
- Draft, published gift, dan recipient response adalah record terpisah.
- Jangan mengarang fakta customer.
- Preset tidak boleh mengubah nama, tanggal, waktu, lokasi, Maps, atau teman yang ikut.
- Recipient gift tidak menampilkan theme/language switch.

## Tone dan etika

Copy harus netral gender dan hangat. Keputusan produk terbaru hanya menampilkan aksi `Disetujui`; jangan menambahkan tombol kedua, tombol penolakan manipulatif, atau jalur diskusi tanpa arahan owner berikutnya.

## Kode dan visual

- Mobile-first pada 320, 390, dan 428 px.
- Gunakan Vite + TypeScript dan modul berdasarkan fitur.
- Schema, copy, theme, demo, renderer, Studio, dan API harus dipisahkan.
- Gunakan theme ID, bukan raw colors di project.
- Gunakan SVG atau CSS untuk ornamen; jangan memakai emoji platform.
- Hormati `prefers-reduced-motion`.
- Export PNG memakai ukuran renderer tetap 1080×1920.
- Pastikan field opsional tidak meninggalkan ruang kosong atau label yatim. `companions`, `venue`, `address`, dan `mapsUrl` boleh kosong.
- Foto pemohon dan foto penerima adalah dua field/upload terpisah; keduanya opsional dan tidak boleh saling menimpa.
- Musik berasal dari data project. Studio fase berikutnya memakai katalog `public/playlist.json` yang sama dengan produk lain atau upload customer, bukan daftar lagu hardcode di renderer.
- Judul opening, setiap lembar, dan ending berasal dari data project. Studio menempatkan editor judul dan tiga preset langsung di section yang bersangkutan—bukan dikumpulkan di halaman gaya—agar alurnya mudah dipahami. Preset tidak boleh mengubah fakta customer.
- Studio selalu dimulai dengan pilihan Bahasa Indonesia atau English. Pilihan ini mengatur bahasa seluruh UI Studio, fixed UI gift, dan semua preset. Pergantian bahasa hanya menerjemahkan copy default/preset yang dikenali; tulisan custom customer tidak boleh ditimpa otomatis.
- Gesture `Buka berkas` adalah titik autoplay yang sah; kegagalan audio tidak boleh mengunci gift dan kontrol on/off berbentuk tombol musik SVG ringkas di pojok kanan atas harus tetap tersedia tanpa menutupi dokumen.

## Infrastruktur

- Worker Cloudflare khusus produk.
- KV namespace khusus produk.
- R2 bersama `valentine-upload` dengan prefix `izin-main/{projectId}/`.
- `pakasir-sandbox` selalu menjadi tempat pertama untuk eksperimen payment.
- Business logic yang telah lulus dipindahkan terkontrol ke `pakasir-gateway`; jangan menyalin seluruh folder dan menghapus guard production.
- Admin internal memakai endpoint terautentikasi Worker dan tidak boleh menduplikasi editor Customer Studio.
- Draft yang belum lengkap harus boleh diautosave; validasi lengkap hanya wajib saat publish.
- Project creation wajib idempotent agar retry payment/webhook tidak membuat link Studio ganda.

## Larangan operasional

Jangan push atau deploy tanpa instruksi owner pada giliran aktif. Jangan deploy gateway/storefront production hanya karena test lokal lulus. Jangan commit `.dev.vars`, secret, Wrangler state, token, atau asset customer yang bersifat private.

