# PRD — Izin Main

## 1. Ringkasan produk

**Izin Main** adalah kado digital self-edit berbentuk permohonan izin yang lucu, personal, dan terasa seperti berkas administrasi hubungan. Customer menyusun permohonannya sendiri melalui Studio, lalu mengirim gift kepada pasangan. Penerima membuka map permohonan, memeriksa rencana, membaca komitmen dan pesan personal, lalu menekan **Disetujui** untuk menerbitkan kartu izin digital.

Produk ini menyelesaikan masalah yang nyata dan mudah dipahami: seseorang ingin pergi bersama teman atau mengikuti kegiatan, tetapi bingung menyampaikan rencana dengan jelas, manis, dan tidak terkesan asal meminta izin. Gift membantu menyampaikan konteks serta komitmen dengan cara yang ringan tanpa menghilangkan hak penerima untuk berdiskusi.

Nama produk dan nama proyek: **Izin Main**. Slug teknis yang direkomendasikan: `izin-main`.

## 2. Prinsip produk yang dikunci

- Model penjualan: **self-edit**, bukan Terima Jadi.
- Customer mendapatkan link Studio setelah pembayaran dan mengisi sendiri.
- Gift harus selesai dibuat tanpa bantuan tim pada kondisi normal.
- Pengalaman utama berbentuk satu berkas permohonan yang dibuka lalu diperiksa **per lembar secara horizontal** dengan swipe, tombol panah, atau keyboard; bukan halaman vertikal panjang dan bukan game kompleks.
- Mobile experience adalah prioritas pertama pada lebar 320, 390, dan 428 px.
- Tidak ada data kendaraan.
- Tidak ada nomor WhatsApp customer, pemohon, atau penerima.
- Tidak ada tombol yang membuka WhatsApp dari gift.
- Keputusan penerima hanya menampilkan **Disetujui**, sesuai keputusan produk terbaru.
- Produk tidak boleh memberi kesan bahwa pasangan wajib meminta izin karena gender. Copy menyebut pemohon dan penerima secara netral.
- Gift tidak menampilkan editor, kontrol tema, atau data internal.
- Semua isi gift berasal dari project data; komponen tidak menyimpan data demo secara hardcode.
- Fase berikutnya tidak boleh dimulai sebelum acceptance gate fase aktif disetujui owner.

## 3. Target market

### Target utama

- Pasangan usia kurang lebih 17–35 tahun.
- Customer yang sering merasa canggung ketika harus menjelaskan rencana pergi.
- Pasangan yang menyukai humor hubungan, konten relatable, dan pengalaman digital yang dapat dibagikan.
- Customer yang membutuhkan hadiah kecil dengan harga terjangkau dan dapat dibuat cepat.

### Target sekunder

- Sahabat atau anggota keluarga yang memiliki kebiasaan saling memberi kabar sebelum pergi.
- Hubungan jarak jauh yang membutuhkan komunikasi rencana lebih jelas.

### Bukan target produk

- Sistem pelacakan lokasi.
- Form persetujuan hukum atau keselamatan.
- Alat untuk mengawasi pasangan.
- Undangan acara publik atau daftar tamu.

## 4. Nilai jual utama

1. **Problem solving yang langsung dipahami** — membantu menyampaikan rencana secara lengkap tanpa chat panjang yang berantakan.
2. **Mudah dibuat** — customer hanya mengisi beberapa langkah singkat di Studio.
3. **Relatable dan mudah viral** — tampilan “surat izin resmi untuk pasangan” mempunyai hook video yang kuat.
4. **Personal tetapi ringan** — nama, foto, alasan, komitmen, dan pesan dapat disesuaikan.
5. **Ada hasil yang dapat dibagikan** — penerima memperoleh kartu izin digital setelah menyetujui.

Tagline utama:

> Karena izin main juga pantas diajukan dengan niat.

Alternatif copy untuk materi promosi:

- “Bukan takut. Cuma menghargai yang menunggu di rumah.”
- “Biar rencananya jelas, izinnya manis, dan pulangnya tetap ingat waktu.”
- “Ajukan rencana. Tulis janji. Tunggu stempel persetujuan.”

## 5. Tone dan batas etika

Tone produk adalah playful, hangat, jujur, dan sedikit absurd seperti kantor administrasi hubungan. Produk boleh bercanda tentang “permohonan”, “berkas”, dan “stempel”, tetapi tidak boleh menyiratkan kepemilikan atas pasangan.

Aturan copy:

- Gunakan bahasa seperti “memberi kabar”, “membahas”, dan “membuat rencana jelas”.
- Hindari “harus nurut”, “wajib mengizinkan”, “takut pasangan”, dan stereotip gender.
- Respons penerima disimpan hanya untuk fungsi gift dan tidak ditampilkan sebagai leaderboard atau bahan mempermalukan.

## 6. Pengalaman penerima

Gift terasa seperti membuka map berkas di atas meja, lalu memeriksa lembar dokumen satu per satu. Antarlembar berpindah horizontal dengan swipe, tombol panah, dan keyboard; setiap lembar boleh memiliki scroll vertikal pendek bila kontennya lebih tinggi dari layar HP. Transisinya lembut dan berbasis kertas, cap, serta printer kecil.

### 6.1 Opening — Map permohonan masuk

Layar pertama menampilkan meja administrasi dan map tertutup. Label map dapat berisi:

- `DINAS URUSAN HUBUNGAN`
- `DIVISI PERIZINAN & QUALITY TIME`
- nomor permohonan;
- nama pemohon;
- status `MENUNGGU PEMERIKSAAN`.

Interaksi utama: penerima menarik tab atau menekan tombol **Buka Berkas**. Interaksi harus dapat digunakan dengan tap dan keyboard. Setelah map terbuka, lembar ringkasan keluar dengan animasi singkat.

Gesture **Buka Berkas** sekaligus mencoba memulai soundtrack gift agar autoplay tetap sesuai aturan browser mobile. Bila pemutaran ditolak atau audio gagal dimuat, gift tetap terbuka dan penerima dapat mencoba lagi dari player.

### 6.2 Ringkasan permohonan

Bagian ini memberi gambaran dalam beberapa detik:

- pemohon;
- penerima;
- judul permohonan;
- tanggal;
- waktu pergi dan estimasi pulang;
- lokasi atau area tujuan bila diisi;
- status pemeriksaan.

Tujuannya agar penerima langsung memahami konteks sebelum membaca detail.

Soundtrack berjalan tanpa panel besar. Setelah berkas dibuka, kontrolnya tampil sebagai **cap musik SVG kecil di pojok kanan atas**. Tombol yang sama digunakan untuk mematikan atau menyalakan kembali audio, dengan indikator gerak halus saat lagu aktif. Judul, cover, durasi, dan progress tidak ditampilkan pada gift agar dokumen tetap menjadi fokus utama.

### 6.3 Identitas dua pihak

Satu lembar relasi menampilkan pemohon dan penerima secara seimbang. Isinya:

- foto pemohon opsional;
- foto penerima opsional;
- nama pemohon;
- nama penerima;
- nama panggilan opsional;
- hubungan/peran opsional, misalnya `pacarmu yang baik`;
- satu kalimat pengantar singkat.

Studio menyediakan **dua upload foto terpisah**. Jika salah satu foto tidak diisi, kartu orang tersebut memakai monogram atau cap identitas, bukan placeholder gambar rusak.

### 6.4 Detail rencana

Data yang ditampilkan:

- kegiatan atau tujuan pergi;
- tanggal;
- jam berangkat;
- estimasi jam pulang;
- tempat atau area tujuan opsional;
- link Maps opsional;
- pergi bersama siapa;
- catatan tambahan opsional.

Tidak ada kendaraan dan nomor WhatsApp.

Estimasi pulang dapat berupa waktu atau teks pendek seperti `setelah acara selesai`, tetapi Studio memberi saran agar customer tetap memberikan perkiraan yang masuk akal.

### 6.5 Lembar komitmen

Pemohon memilih atau menulis komitmen. Preset awal:

- memberi kabar setelah sampai;
- tidak menghilang tanpa kabar;
- memberi tahu bila rencana berubah;
- menjaga diri;
- pulang sesuai estimasi;
- meluangkan waktu setelah kegiatan selesai.

Customer dapat mengaktifkan, menonaktifkan, mengurutkan, dan menambah maksimal dua komitmen khusus. Tampilan penerima berupa checklist yang tercentang satu per satu saat masuk viewport.

### 6.6 Catatan pembelaan

Satu catatan personal dari pemohon. Ini bukan surat panjang; idealnya 80–300 karakter. Contoh:

> Aku ingin pergi sebentar bersama teman-teman, tetapi aku tetap ingin kamu tahu rencananya dengan jelas. Aku akan memberi kabar dan pulang sesuai yang kita sepakati.

Tampil seperti sticky note atau lembar memo bertanda tangan.

### 6.7 Meja keputusan

Penerima melihat ringkasan akhir dan satu aksi **Disetujui**. Tombol memberikan stempel persetujuan, menyimpan respons, lalu membuka kartu izin. Tidak ada tombol kedua atau alur catatan diskusi pada versi ini.

### 6.8 Hasil akhir — Kartu Izin Main

Setelah disetujui, sebuah printer/cap administrasi menghasilkan kartu digital yang memuat:

- `IZIN MAIN — DISETUJUI`;
- nama pemohon;
- tanggal;
- jam pergi dan estimasi pulang;
- tujuan singkat;
- nomor permohonan;
- tanggal/jam persetujuan;
- tanda stempel visual.

Kartu dapat diunduh sebagai PNG dan dibagikan melalui Web Share API. Rasio awal yang direkomendasikan adalah 9:16 untuk Instagram Story, dengan layout renderer tetap 1080×1920 dan tidak bergantung pada ukuran viewport.

## 7. Arah visual

### 7.1 Konsep utama

**Kantor administrasi hubungan versi handmade.** Tampilan menggabungkan map arsip, kertas karbon, stempel tinta, nomor dokumen, paperclip, foto identitas, garis formulir, sticky note, dan printer/cap mekanis.

Visual harus terasa hangat dan romantis, bukan seperti website pemerintahan sungguhan atau dashboard korporat.

### 7.2 Palet tema awal

Gift mendukung beberapa tema dari satu struktur layout:

1. **Kantor Kecamatan** — olive, krem, merah cap, tinta hitam.
2. **Crimson Office** — burgundy, ivory, charcoal, dusty rose.
3. **Night Clearance** — navy gelap, abu kertas, biru cap, amber.
4. **Pink Department** — dusty pink, cream, plum, merah lembut.

Stage 1 wajib membuktikan dua tema dahulu: **Kantor Kecamatan** dan **Crimson Office**. Dua tema lainnya dapat diselesaikan setelah sistem token warna stabil.

### 7.3 Tipografi

Gunakan font yang berlisensi aman dan tersedia secara lokal/build-time:

- judul dokumen: `DM Serif Display`; dipertahankan karena terasa editorial, hangat, dan tetap cocok dengan komposisi dokumen handmade;
- metadata dan nomor berkas: monospace/typewriter seperti `IBM Plex Mono`;
- body dan kontrol: sans yang humanis dan mudah dibaca;
- tanda tangan: `Sacramento`, sama dengan gaya signature Letter Project dan sengaja dibedakan dari tulisan catatan;
- isi catatan sticky note: `Caveat`; handwriting hanya untuk teks personal, bukan detail jadwal penting.

Pilihan final font dikunci setelah owner menyetujui mockup Gift Pages.

### 7.4 Motion

- map terbuka dan lembar keluar;
- foto identitas seperti ditempel;
- checklist muncul satu per satu;
- garis tanda tangan tergambar;
- stempel persetujuan jatuh dengan sedikit ink spread;
- kartu izin keluar dari printer secara perlahan;
- semua animasi memiliki versi `prefers-reduced-motion`.

Tidak memakai confetti generik atau emoji platform.

## 8. Konten dan field project

### Wajib

- locale gift;
- theme ID;
- nama pemohon;
- nama penerima;
- judul permohonan;
- kegiatan/tujuan pergi;
- tanggal;
- jam berangkat;
- estimasi pulang;
- minimal dua komitmen;
- catatan personal;
- teks pertanyaan keputusan.

### Opsional

- nama panggilan pemohon dan penerima;
- foto pemohon;
- foto penerima;
- peran/hubungan lucu;
- pergi bersama siapa;
- lokasi/area;
- alamat;
- Maps URL;
- catatan rencana;
- tanda tangan visual;
- soundtrack dari playlist atau upload sendiri;
- dua komitmen khusus;
- subtitle dan copy dekoratif.

### Tidak dikumpulkan

- kendaraan;
- plat nomor;
- nomor WhatsApp;
- email dalam isi gift;
- live location;
- password akun sosial;
- data identitas resmi.

Email checkout boleh tetap dipakai oleh payment gateway untuk mengirim akses Studio, tetapi tidak menjadi field konten project dan tidak ditampilkan di gift.

## 9. Bahasa

- Bahasa v1 tersedia dalam Bahasa Indonesia dan English. Customer memilih bahasa sebelum langkah pertama Studio dibuka.
- Kontrak data menyiapkan `locale: "id" | "en"` sejak awal.
- Fixed UI copy disimpan dalam dictionary bertipe dan memiliki key parity.
- English diberi nama konteks `Going-Out Permit`, tetapi tidak mengubah brand produk `Izin Main`.
- Tidak ada tombol bahasa di recipient gift.
- Pilihan bahasa awal mengubah seluruh UI Studio, fixed UI gift, dan semua preset siap pakai. Switch ID/EN tetap tersedia di header Studio.
- Saat bahasa diganti, copy default atau preset yang masih dikenali boleh mengikuti bahasa baru. Tulisan personal yang sudah diketik customer tidak diterjemahkan atau ditimpa otomatis.

## 10. Kontrak data awal

Kontrak final dikunci sebelum komponen Gift Pages berkembang. Bentuk awal:

```ts
type Locale = "id" | "en";
type ThemeId = "district-office" | "crimson-office" | "night-clearance" | "pink-department";
type ResponseStatus = "pending" | "approved";

interface PermitCommitment {
  id: string;
  text: string;
  enabled: boolean;
  order: number;
}

interface IzinMainProject {
  schemaVersion: 1;
  id: string;
  locale: Locale;
  theme: ThemeId;
  requestNumber: string;
  applicant: {
    name: string;
    nickname?: string;
    role?: string;
    photoUrl?: string;
    intro?: string;
  };
  recipient: {
    name: string;
    nickname?: string;
    photoUrl?: string;
  };
  music?: {
    title: string;
    artist: string;
    audioUrl: string;
    coverUrl?: string;
    source?: "playlist" | "upload";
  };
  request: {
    title: string;
    activity: string;
    date: string;
    departureTime: string;
    returnEstimate: string;
    companions?: string;
    venue?: string;
    address?: string;
    mapsUrl?: string;
    note?: string;
  };
  headings?: {
    openingTitle: string;
    openingEmphasis: string;
    summaryTitle: string;
    partiesTitle: string;
    planTitle: string;
    commitmentsTitle: string;
    defenseTitle: string;
    decisionTitle: string;
    endingTitle: string;
  };
  commitments: PermitCommitment[];
  defenseNote: string;
  decision: {
    eyebrow?: string;
    question: string;
    approvedLabel: string;
    approvedMessage: string;
  };
  card: {
    title: string;
    footer?: string;
  };
}

interface PermitResponse {
  projectId: string;
  status: ResponseStatus;
  respondedAt: string;
}
```

Data demo wajib menggunakan kontrak ini. Theme menyimpan ID, bukan warna mentah. Respons disimpan terpisah dari snapshot gift.

## 11. Stack dan arsitektur

### Frontend

- Vite + TypeScript.
- Renderer gift modular dan mobile-first.
- Studio berada di repo yang sama agar memakai schema, theme, copy, dan renderer preview yang sama.
- Vercel untuk hosting frontend.

### Backend

- Cloudflare Worker khusus Izin Main.
- KV namespace baru untuk project, draft, gift, akses Studio, order, dan respons.
- R2 bucket `valentine-upload` dengan prefix `izin-main/{projectId}/` untuk foto pemohon dan asset customer.
- Tidak membuat bucket baru bila bucket bersama masih sesuai.

### Penyimpanan yang direkomendasikan

```text
order:{orderId}                 # metadata pembayaran dan project
studio-access:{projectId}       # magic token/session customer
draft:{projectId}               # autosave Studio customer
gift:{projectId}                # snapshot yang dipublish
response:{projectId}            # persetujuan penerima
project-meta:{projectId}        # metadata internal bila diperlukan
```

Draft dan gift harus terpisah. Perubahan Studio tidak mengubah gift live sebelum customer menekan Publish/Perbarui Gift.

## 12. Alur bisnis self-edit

### Setelah checkout berhasil

```text
Customer membayar
→ gateway memverifikasi webhook
→ Worker Izin Main membuat project + akses Studio
→ email sukses berisi tombol Buka Studio
→ customer mengisi dan melihat live preview
→ customer publish
→ link gift final muncul dan dapat disalin
→ customer mengirim link kepada penerima
→ respons penerima tersimpan
→ customer melihat hasil respons di Studio
```

Customer tidak menerima form terpisah. Studio adalah satu-satunya tempat customer menyusun gift.

### Harga awal

Rekomendasi harga peluncuran: **Rp15.000**. Harga belum dianggap terkunci sampai integrasi storefront disetujui owner.

## 13. Tahapan pengerjaan dan acceptance gates

## Fase 0 — Fondasi produk dan PRD

Deliverable:

- `PRD.md`;
- `AGENTS.md`;
- `README.md`;
- keputusan positioning, alur, field, dan visual;
- rancangan schema awal;
- pembagian fase serta larangan deployment.

Gate: owner menyetujui konsep produk sebelum implementasi Gift Pages dimulai.

## Fase 1 — Gift Pages

Ini adalah fase pertama implementasi dan fokus utama. Jangan membuat Studio, dashboard, checkout, atau Worker production sebelum visual gift disetujui.

### Deliverable

- satu demo lengkap dengan data realistis;
- opening map interaktif;
- ringkasan permohonan;
- profil pemohon;
- detail rencana;
- lembar komitmen;
- catatan pembelaan;
- meja keputusan;
- stempel persetujuan;
- kartu izin PNG/share;
- tombol musik SVG ringkas di pojok kanan atas dan autoplay setelah gesture Buka Berkas;
- dua tema visual awal;
- data demo terpisah dari renderer;
- fixed copy Indonesia melalui dictionary;
- respons demo lokal untuk pengujian UI.

### Acceptance criteria

- owner menyukai visual mobile dan desktop;
- tidak ada horizontal overflow pada 320, 390, dan 428 px;
- seluruh section tetap baik untuk teks pendek/panjang dan field opsional kosong;
- motion terasa halus dan tidak memperlambat halaman;
- tombol dapat digunakan dengan tap dan keyboard;
- `prefers-reduced-motion` berfungsi;
- PNG 1080×1920 konsisten di iPhone dan Android;
- Web Share API dan fallback download berfungsi;
- tidak ada emoji platform;
- tidak ada brand For you, Always. di recipient gift kecuali owner meminta;
- visual dua tema benar-benar berbeda tetapi memakai layout dan schema yang sama.

**Hard gate:** Fase 2 tidak boleh dimulai sampai owner mengatakan Gift Pages sudah disetujui.

## Fase 2 — Customer Studio Editor

Studio adalah bagian paling penting setelah Gift Pages karena seluruh pengalaman customer terjadi di sini. Studio harus terasa seperti menyusun berkas permohonan yang menyenangkan, bukan mengisi dashboard teknis.

### Struktur langkah yang direkomendasikan

1. **Opening** — judul sampul dan nomor berkas.
2. **Ringkasan** — judul section dan judul rencana.
3. **Dua pihak** — judul section, nama, panggilan, dua upload foto terpisah, dan intro.
4. **Rencana pergi** — judul section, aktivitas, tanggal, waktu, estimasi pulang, lokasi, Maps, dan teman yang ikut.
5. **Komitmen** — judul section dan checklist janji.
6. **Catatan** — judul section dan pesan personal.
7. **Keputusan** — judul section, pengantar, pertanyaan, dan label persetujuan.
8. **Ending** — judul section, pesan setelah disetujui, judul kartu, dan kalimat penutup.
9. **Gaya & musik** — tema, lagu dari `playlist.json`, atau upload lagu sendiri. Bahasa sudah dipilih sebelum Studio dibuka dan dapat diganti dari header.
10. **Publish** — validasi, link final, dan barcode dokumen siap unduh.

### Fitur wajib

- magic-link access dari email pembayaran;
- autosave draft dengan status yang jelas;
- Previous/Next dan progress steps;
- live preview memakai renderer Gift Pages yang sama;
- preview otomatis menuju section yang sedang diedit;
- preset komitmen yang aman;
- tiga preset judul pada setiap section yang mengikuti bahasa gift, modal konfirmasi sebelum mengganti, serta edit manual judul opening sampai ending;
- language gate wajib sebelum langkah pertama, terjemahan penuh UI Studio ID/EN, dan switch bahasa header yang sekaligus mengubah locale gift serta sumber preset;
- theme cards dengan preview visual;
- katalog lagu memakai `playlist.json` yang sama dengan produk lain, lengkap dengan cover, judul, artis, dan preview;
- pilihan upload lagu sendiri sebagai alternatif playlist;
- upload foto langsung ke R2;
- upload pemohon dan penerima disimpan sebagai dua URL berbeda; keduanya opsional dan tidak saling menimpa;
- validasi manusiawi, bukan pesan teknis;
- publish terpisah dari save;
- copy link gift;
- lihat respons `Disetujui`;
- update dan republish tanpa mengganti link;
- mobile-first karena sebagian besar customer mengedit dari HP.

### Yang tidak boleh ada

- field kendaraan;
- field WhatsApp;
- seluruh KV key atau istilah backend;
- kontrol desain mentah seperti color picker bebas;
- editor drag-and-drop kompleks;
- form panjang satu halaman tanpa progress;

### Acceptance criteria

- customer baru dapat menyelesaikan gift kurang dari 7 menit;
- input tetap tersimpan setelah refresh;
- upload foto dari iPhone dan Android berhasil;
- preview tidak memaksa customer mengulang opening setiap kali;
- publish menghasilkan gift yang sama dengan preview;
- link Studio tidak dapat dibuka tanpa token/session yang sah;
- response penerima terlihat tanpa perlu dashboard internal.

**Hard gate:** backend/admin dan checkout production belum dilanjutkan sebelum owner menyetujui pengalaman Studio.

## Fase 3 — Worker, penyimpanan, dan admin internal

Setelah Gift Pages dan Studio disetujui, sambungkan fitur yang sudah ada ke backend nyata.

### Deliverable Worker

- create project idempotent;
- akses Studio bertoken;
- load/save draft;
- upload R2;
- publish gift;
- load public gift;
- save/load recipient response;
- rate limit dan validasi schema;
- CORS production yang ketat;
- endpoint internal untuk retry fulfillment.

### Admin internal minimal

- daftar order/project;
- status `Belum diedit`, `Draft`, `Published`, `Disetujui`;
- buka Studio sebagai support dengan akses internal;
- salin link gift;
- reset/reissue Studio access;
- lihat error fulfillment;
- tidak menduplikasi seluruh editor customer.

## Fase 4 — Sandbox payment dan storefront

Semua integrasi dimulai di `pakasir-sandbox`.

### Deliverable

- whitelist SKU dan harga server-side;
- generator order Izin Main;
- email sukses dengan tombol Studio;
- order status dengan Studio link yang benar;
- retry fulfillment idempotent;
- sales count normalization;
- kartu produk storefront;
- halaman `/catalog/izin-main`;
- demo modal dengan theme selector;
- asset showcase dari Gift Pages yang sudah disetujui;
- Gift Finder, sitemap, analytics, dan metadata.

### E2E sandbox wajib

```text
Storefront
→ checkout Pakasir sandbox
→ pembayaran sukses
→ webhook tervalidasi
→ project dibuat sekali
→ email Studio masuk
→ customer edit dan upload foto
→ publish
→ recipient membuka gift
→ recipient memilih respons
→ respons terlihat di Studio customer
```

Setelah seluruh alur sandbox lulus, business logic dapat dipindahkan secara terkontrol ke `pakasir-gateway`. Jangan mengganti seluruh folder gateway secara buta.

**Production gateway, storefront production, Worker production, dan deployment frontend memerlukan izin eksplisit owner.**

## Fase 5 — Launch dan iterasi

- smoke test production;
- verifikasi email, Studio, gift, respons, dan count;
- video showcase mobile;
- pantau error upload dan fulfillment;
- kumpulkan titik customer berhenti di Studio;
- evaluasi penambahan English dan dua tema lanjutan;
- jangan menambah fitur besar sebelum alur utama stabil.

## 14. Preset Studio

Preset harus mempercepat pembuatan tanpa mengubah fakta customer.

### Preset judul

- `Permohonan Izin Main yang Sangat Serius`
- `Satu Malam Bersama Teman-Teman`
- `Permohonan Pergi Sebentar, Pulang Tetap Sayang`

Preset di atas mengubah judul permohonan pada isi berkas. Setiap section dari Opening sampai Ending juga mempunyai tiga preset lokal—`Playful`, `Hangat`, dan `Resmi lucu`—tepat di halaman Studio yang bersangkutan. Modal konfirmasi memperlihatkan teks sebelum dan sesudah, kemudian customer tetap dapat mengedit judulnya secara manual. Preset mengikuti locale gift dan hanya mengubah judul section aktif; nama, jadwal, lokasi, komitmen, serta pesan customer tidak pernah ikut tertimpa.

### Preset intro

- `Dengan penuh niat baik, aku mengajukan satu rencana kecil untuk diperiksa.`
- `Sebelum aku pergi, aku ingin semua rencananya jelas dan kamu tetap merasa tenang.`

### Preset catatan

Preset tersedia dalam tone manis, lucu, dan to the point. Menerapkan preset harus memakai modal konfirmasi bila akan mengganti tulisan customer. Preset tidak boleh mengubah nama, tanggal, waktu, lokasi, teman, atau Maps.

## 15. Keamanan dan privasi

- Tidak menyimpan data yang tidak dibutuhkan.
- Studio link adalah private capability dan tidak boleh muncul pada endpoint publik.
- Public gift hanya mengembalikan data yang memang perlu dilihat penerima.
- Maps URL divalidasi sebagai HTTP/HTTPS.
- Upload foto memvalidasi MIME, ukuran, dan nama file.
- Foto dikompresi ke WebP bila memungkinkan.
- Respons penerima divalidasi dan dibatasi panjangnya.
- Email checkout tidak dimasukkan ke project publik.
- Secret Worker tidak pernah berada di `VITE_*` atau source control.
- `.dev.vars`, output Wrangler, dan token lokal di-ignore.

## 16. Testing minimum

### Unit dan contract

- schema project valid/invalid;
- theme ID;
- parity copy locale;
- estimasi pulang teks/waktu;
- optional field behavior;
- preset safety;
- URL validation;
- response validation;
- project creation idempotency;
- auth/token Studio;
- upload MIME dan size;
- price manipulation dan duplicate webhook;
- sales count normalization.

### Browser QA

- 320, 390, 428 px, tablet, dan desktop;
- Safari iPhone dan Chrome Android;
- keyboard dan visible focus;
- reduced motion;
- teks sangat panjang;
- tanpa foto, lokasi, alamat, dan Maps;
- gambar lambat/gagal;
- share ditolak;
- download PNG;
- refresh ketika autosave berlangsung;
- status respons berubah setelah recipient memilih.

## 17. Definition of Done

Produk Izin Main dianggap siap diluncurkan hanya jika:

- Gift Pages disetujui owner secara eksplisit.
- Studio disetujui owner secara eksplisit.
- Mobile 320–428 px stabil.
- Data project tidak hardcode di komponen.
- Draft, published gift, dan response terpisah.
- Upload production menghasilkan URL R2, bukan localhost.
- Customer menerima Studio, bukan form Terima Jadi.
- Recipient response terlihat di Studio.
- Sandbox E2E lulus dari checkout sampai respons.
- Harga server-side tidak dapat dimanipulasi.
- Email dan status order menampilkan link yang benar.
- Sales count berasal dari paid production order.
- Tidak ada field kendaraan atau WhatsApp.
- Tidak ada secret di repo.
- Unit test, typecheck, lint, dan production build lulus.
- README dan AGENTS sesuai implementasi aktual.
- Push/deploy production hanya dilakukan setelah izin owner.

## 18. Keputusan terbuka sebelum Fase 1

Keputusan ini tidak menghalangi pembuatan folder/PRD, tetapi harus dipilih saat mulai visual Gift Pages:

1. Apakah foto pemohon berbentuk pas foto administrasi, potongan scrapbook, atau dapat dipilih di antara keduanya?
2. Apakah kartu hasil akhir hanya 9:16 atau juga mempunyai versi kecil 4:5?
3. Apakah nomor permohonan dibuat otomatis seluruhnya atau customer dapat memilih akhiran lucu?
4. Apakah English ikut diluncurkan pada v1 atau setelah versi Indonesia stabil?
5. Apakah harga peluncuran tetap Rp15.000 atau memakai introductory price lain?

Default kerja bila belum diputuskan: pas foto bergaya scrapbook, PNG 9:16 saja, nomor otomatis, Indonesia-first dengan struktur bilingual, dan harga rencana Rp15.000.

