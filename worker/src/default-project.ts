import type { IzinMainProject, Locale } from '../../src/project';

export function createDefaultProject(projectId: string, locale: Locale): IzinMainProject {
  const english = locale === 'en';
  return {
    schemaVersion: 1,
    id: projectId,
    locale,
    theme: 'district-office',
    requestNumber: `IM/${new Date().getFullYear()}/${projectId.slice(-8).toUpperCase()}`,
    applicant: {
      name: '',
      nickname: '',
      role: english ? 'your partner who will keep you updated' : 'pacarmu yang tetap memberi kabar',
      intro: english
        ? 'I made this little file so every part of the plan is clear from the beginning.'
        : 'Aku membuat berkas kecil ini supaya semua rencananya jelas dari awal.',
    },
    recipient: { name: '', nickname: '' },
    request: {
      title: english ? 'Out for a While, Home with a Smile' : 'Pergi Sebentar, Pulang Tetap Sayang',
      activity: '', date: '', departureTime: '', returnEstimate: '', companions: '', venue: '', address: '', mapsUrl: '', note: '',
    },
    headings: english ? {
      openingTitle: 'Going-Out', openingEmphasis: 'Permit', summaryTitle: 'I have a plan.\nHere are all the details.',
      partiesTitle: 'The applicant & the person holding the stamp.', planTitle: 'More than just “I’ll be out for a bit”.',
      commitmentsTitle: 'Small promises to help you feel at ease.', defenseTitle: 'An honest note from the applicant.',
      decisionTitle: 'The final stamp is in your hands.', endingTitle: 'The official permit is ready.',
    } : {
      openingTitle: 'Permohonan', openingEmphasis: 'Izin Main', summaryTitle: 'Aku punya rencana.\nIni semua detailnya.',
      partiesTitle: 'Yang minta izin & yang pegang stempel.', planTitle: 'Bukan cuma “pergi bentar, ya”.',
      commitmentsTitle: 'Janji kecil biar kamu tetap tenang.', defenseTitle: 'Versi jujur dari si pemohon.',
      decisionTitle: 'Stempel akhirnya ada di tanganmu.', endingTitle: 'Izin resmi sudah keluar.',
    },
    commitments: (english ? [
      'I will let you know as soon as I arrive', 'My phone will stay reachable', 'I will tell you if the plan changes',
      'I will be home around the agreed time', 'Tomorrow still includes special time for us',
    ] : [
      'Begitu sampai, aku langsung kasih kabar', 'HP tetap aktif dan bisa dihubungi', 'Kalau rencana berubah, aku bilang dulu',
      'Pulang sesuai waktu yang disepakati', 'Besok tetap ada waktu khusus untuk kita',
    ]).map((text, index) => ({ id: `commitment-${index + 1}`, text, enabled: index < 4, order: index + 1 })),
    defenseNote: english
      ? 'I want a little time with my friends while making sure you still feel at ease. I will keep you updated and come home as agreed.'
      : 'Aku ingin punya waktu sebentar bersama teman-teman, tapi tetap ingin kamu tenang. Aku akan memberi kabar dan pulang sesuai kesepakatan.',
    decision: {
      eyebrow: english ? 'Every detail has been reviewed' : 'Semua detail sudah diperiksa',
      question: english ? 'So… may I go out for a while?' : 'Jadi… boleh aku main sebentar?',
      approvedLabel: english ? 'Approved' : 'Disetujui',
      approvedMessage: english ? 'Thank you for trusting me. Every promise in this file still applies.' : 'Terima kasih sudah percaya. Semua janji di berkas ini tetap berlaku.',
    },
    card: {
      title: english ? 'Official Going-Out Permit' : 'Surat Izin Main Resmi',
      footer: english ? 'Valid while updates are given and time is respected.' : 'Sah selama tetap memberi kabar dan ingat waktu.',
    },
  };
}
