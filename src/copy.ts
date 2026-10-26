import type { Locale } from './project';

const id = {
  agency: 'Kantor Perizinan Pacar', division: 'Divisi Main Sebentar & Pulang Tepat Waktu', statusPending: 'Menunggu stempel kamu',
  openFile: 'Buka berkas', fileFor: 'Berkas ditujukan kepada', summary: 'Ringkasan permohonan',
  applicant: 'Dua pihak', plan: 'Rencana main', commitments: 'Janji yang dibawa',
  defense: 'Catatan dari pemohon', decision: 'Stempel terakhir', requestNo: 'Nomor berkas',
  applicantName: 'Pemohon', recipientName: 'Penerima', activity: 'Keperluan', date: 'Tanggal',
  departure: 'Jam pergi', returnEstimate: 'Estimasi pulang', companions: 'Bersama', place: 'Tempat',
  address: 'Alamat', openMaps: 'Lihat lokasi', inspected: 'Sudah dibaca', signHere: 'Ditandatangani dengan niat baik',
  approved: 'Permohonan disetujui', printCard: 'Cetak kartu izin',
  download: 'Unduh PNG', share: 'Bagikan', close: 'Tutup',
  shareUnavailable: 'Fitur bagikan tidak tersedia. PNG sudah diunduh.', responseRecorded: 'Keputusanmu sudah dicatat.',
  audioAttachment: 'Lampiran audio', playMusic: 'Putar lagu', pauseMusic: 'Jeda lagu', musicUnavailable: 'Audio belum dapat diputar. Ketuk tombol untuk mencoba lagi.',
  demoPalette: 'Palet demo', documentOf: 'dokumen milik', page: 'lembar', of: 'dari', approvedAt: 'Disetujui',
};

const en: typeof id = {
  agency: 'Department of Relationship Affairs', division: 'Permit & Quality Time Division', statusPending: 'Awaiting review',
  openFile: 'Open the file', fileFor: 'File addressed to', summary: 'Request summary', applicant: 'Applicant profile',
  plan: 'Proposed plan', commitments: 'Statement & commitments', defense: 'A little defense note', decision: 'Decision desk',
  requestNo: 'Request number', applicantName: 'Applicant', recipientName: 'Recipient', activity: 'Purpose', date: 'Date',
  departure: 'Leaving at', returnEstimate: 'Return estimate', companions: 'Going with', place: 'Place', address: 'Address',
  openMaps: 'Open location', inspected: 'Reviewed', signHere: 'Signed with good intentions', approved: 'Request approved',
  printCard: 'Print permit card', download: 'Download PNG', share: 'Share', close: 'Close',
  shareUnavailable: 'Sharing is unavailable. The PNG has been downloaded.',
  responseRecorded: 'Your decision has been recorded.', audioAttachment: 'Audio attachment', playMusic: 'Play music', pauseMusic: 'Pause music', musicUnavailable: 'The audio could not start yet. Tap the button to try again.',
  demoPalette: 'Demo palette', documentOf: 'document for', page: 'sheet', of: 'of', approvedAt: 'Approved',
};

export const copy = { id, en };

export function getCopy(locale: Locale) {
  return copy[locale];
}
