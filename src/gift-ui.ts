import type { Locale } from './project';

const id = {
  formCode: 'FORM IM-01', paperSubtitle: 'punya satu permintaan untuk', swipeHint: 'GESER SETIAP LEMBAR KE KANAN',
  gateTitle: 'Permohonan', gateEmphasis: 'Izin Main', gateHint: 'Seseorang memilih bikin berkas lengkap daripada cuma bilang: “aku pergi dulu, ya.”',
  summaryTitle: 'Aku mau main sebentar.\nIni rencana lengkapnya.', requestLabel: 'PERMOHONAN', summaryPrefix: 'Buat', summarySuffix: 'supaya kamu nggak perlu tanya satu-satu dan aku nggak bisa menjawab, “lihat nanti, ya.”', reviewMark: 'UNTUK DIPERIKSA', requestTicket: 'REQUEST',
  partiesEyebrow: 'DUA PIHAK', partiesTitle: 'Yang minta izin & yang pegang stempel.', applicantRole: 'pengaju izin main', recipientRole: 'pemegang keputusan akhir', submitting: 'MENGAJUKAN', littleNote: 'CATATAN KECIL', verified: 'DATA SESUAI',
  planTitle: 'Bukan cuma “pergi bentar, ya”.', planSheet: 'LEMBAR RENCANA', purpose: 'KEPERLUAN', note: 'CATATAN',
  commitmentTitle: 'Janji kecil biar kamu tetap tenang.', applicantChecklist: 'CHECKLIST PEMOHON', checkAfterRead: 'centang setelah dibaca',
  defenseTitle: 'Versi jujur dari si pemohon.', goodIntent: 'Dengan niat baik,', honestStamp: 'JUJUR\n& JELAS',
  decisionTitle: 'Stempel akhirnya ada di tanganmu.', decisionPrompt: 'Kalau semuanya sudah pas, turunkan stempel untuk menerbitkan kartu izinnya.', stampAction: 'BERI STEMPEL', approvedStamp: 'DISETUJUI',
  completeEyebrow: 'BERKAS SELESAI', completeTitle: 'Izin resmi sudah keluar.', office: 'RELATIONSHIP OFFICE', status: 'STATUS',
  pagesLabel: 'Lembar berkas izin main', navigationLabel: 'Navigasi lembar berkas', previousPage: 'Lembar sebelumnya', nextPage: 'Lembar berikutnya', choosePage: 'Pilih lembar', openSheet: 'Buka lembar',
  preparingCard: 'Menyiapkan kartu izin…', cardReady: 'Kartu izin berhasil dibuat.', cardFailed: 'Kartu belum berhasil dibuat. Silakan coba lagi.', shareReady: 'Kartu izin siap dibagikan.', shareFailed: 'Kartu belum berhasil dibagikan. Silakan coba lagi.',
};

const en: typeof id = {
  formCode: 'FORM GP-01', paperSubtitle: 'has one request for', swipeHint: 'SWIPE EACH SHEET TO THE RIGHT',
  gateTitle: 'Going-Out', gateEmphasis: 'Permit', gateHint: 'Someone chose to prepare a complete file instead of simply saying: “I’m heading out.”',
  summaryTitle: 'I want to go out for a while.\nHere is the full plan.', requestLabel: 'REQUEST', summaryPrefix: 'For', summarySuffix: 'so you do not have to ask for every detail or hear “I’ll tell you later.”', reviewMark: 'FOR REVIEW', requestTicket: 'REQUEST',
  partiesEyebrow: 'TWO PEOPLE', partiesTitle: 'The applicant & the person holding the stamp.', applicantRole: 'going-out permit applicant', recipientRole: 'holder of the final stamp', submitting: 'SUBMITTING TO', littleNote: 'A SMALL NOTE', verified: 'DETAILS VERIFIED',
  planTitle: 'More than just “I’ll be out for a bit”.', planSheet: 'PROPOSED PLAN', purpose: 'PURPOSE', note: 'NOTE',
  commitmentTitle: 'Small promises to help you feel at ease.', applicantChecklist: 'APPLICANT CHECKLIST', checkAfterRead: 'tick after reading',
  defenseTitle: 'An honest note from the applicant.', goodIntent: 'With good intentions,', honestStamp: 'HONEST\n& CLEAR',
  decisionTitle: 'The final stamp is in your hands.', decisionPrompt: 'If everything looks right, place the stamp to issue the permit card.', stampAction: 'PLACE THE STAMP', approvedStamp: 'APPROVED',
  completeEyebrow: 'FILE COMPLETE', completeTitle: 'The official permit is ready.', office: 'RELATIONSHIP OFFICE', status: 'STATUS',
  pagesLabel: 'Going-out permit sheets', navigationLabel: 'Permit sheet navigation', previousPage: 'Previous sheet', nextPage: 'Next sheet', choosePage: 'Choose a sheet', openSheet: 'Open sheet',
  preparingCard: 'Preparing your permit card…', cardReady: 'Your permit card is ready.', cardFailed: 'The card could not be created yet. Please try again.', shareReady: 'Your permit card is ready to share.', shareFailed: 'The card could not be shared yet. Please try again.',
};

export function getGiftUi(locale: Locale) {
  return locale === 'en' ? en : id;
}
