import '@fontsource/dm-serif-display/latin-400.css';
import '@fontsource/caveat/latin-600.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import '@fontsource/ibm-plex-mono/latin-600.css';
import '@fontsource/plus-jakarta-sans/latin-400.css';
import '@fontsource/plus-jakarta-sans/latin-500.css';
import '@fontsource/plus-jakarta-sans/latin-600.css';
import '@fontsource/plus-jakarta-sans/latin-700.css';
import './studio.css';
import QRCode from 'qrcode';

import { demoProject } from './demo';
import { getGiftUi } from './gift-ui';
import { validateProject, type IzinMainProject, type Locale, type ThemeId } from './project';
import { studioText } from './studio-copy';
import { themes } from './themes';

interface PlaylistSong {
  title: string;
  artist: string;
  genre?: string;
  coverUrl?: string;
  audioUrl: string;
  audioName?: string;
}

interface PresetPayload {
  title: string;
  description: string;
  before: string;
  after: string;
  apply: () => void;
}

const app = document.querySelector<HTMLDivElement>('#app')!;
if (!app) throw new Error('App root is missing');

document.body.className = 'studio-body';
document.documentElement.dataset.theme = 'district-office';
document.title = 'Izin Main Studio';

const pathParts = window.location.pathname.split('/').filter(Boolean);
const projectId = pathParts[1] || 'demo-permit';
const accessToken = new URLSearchParams(window.location.search).get('token');

const icon = (name: 'arrow' | 'check' | 'eye' | 'image' | 'music' | 'upload' | 'save' | 'close' | 'copy' | 'spark' | 'folder' | 'download' | 'heart') => {
  const paths: Record<typeof name, string> = {
    arrow: '<path d="M5 12h14M14 7l5 5-5 5"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    eye: '<path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m4 17 4.5-4.5 3.5 3 2.5-2.5 5.5 5"/>',
    music: '<path d="M9 18V6l9-2v12"/><circle cx="6" cy="18" r="3"/><circle cx="15" cy="16" r="3"/>',
    upload: '<path d="M12 16V4m-5 5 5-5 5 5M4 20h16"/>',
    save: '<path d="M5 4h12l2 2v14H5z"/><path d="M8 4v6h8V4M8 20v-6h8v6"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    copy: '<rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
    spark: '<path d="m12 3 1.4 4.1L18 9l-4.6 1.9L12 15l-1.4-4.1L6 9l4.6-1.9zM18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8z"/>',
    folder: '<path d="M3 7.5h7l2.2 2.5H21v9.5H3z"/><path d="M3 7.5V5h7l2 2.5"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M5 21h14"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/>',
  };
  return `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`;
};

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function cloneStarter(): IzinMainProject {
  const starter = structuredClone(demoProject);
  starter.id = projectId;
  return starter;
}

const draftKey = `izin-main:studio-draft:${projectId}`;
const previewKey = `izin-main:studio-preview:${projectId}`;
const publishedKey = `izin-main:published:${projectId}`;

function loadDraft(): IzinMainProject {
  try {
    const stored = localStorage.getItem(draftKey);
    return stored ? JSON.parse(stored) as IzinMainProject : cloneStarter();
  } catch {
    return cloneStarter();
  }
}

let project = loadDraft();
project.headings ??= defaultHeadings(project.locale);
const studioLanguageKey = `izin-main:studio-language:${projectId}`;
const storedStudioLanguage = localStorage.getItem(studioLanguageKey);
let uiLocale: Locale = storedStudioLanguage === 'en' ? 'en' : storedStudioLanguage === 'id' ? 'id' : (navigator.language.toLowerCase().startsWith('id') ? 'id' : 'en');
const c = () => studioText(uiLocale);
let currentStep = 0;
let saveTimer = 0;
let previewRefreshTimer = 0;
let playlist: PlaylistSong[] = [];
let presetPayload: PresetPayload | undefined;
let uploadAudioUrl = project.music?.audioUrl.startsWith('blob:') ? project.music.audioUrl : undefined;
let previewAudio: HTMLAudioElement | undefined;

const makeSteps = () => [
  { label: c().openingStep, short: c().openingShort, section: 'gate-title' },
  { label: c().summaryStep, short: c().summaryShort, section: 'summary-title' },
  { label: c().partiesStep, short: c().partiesShort, section: 'profile-title' },
  { label: c().planStep, short: c().planShort, section: 'plan-title' },
  { label: c().commitmentsStep, short: c().commitmentsShort, section: 'commitment-title' },
  { label: c().noteStep, short: c().noteShort, section: 'defense-title' },
  { label: c().decisionStep, short: c().decisionShort, section: 'decision-title' },
  { label: c().endingStep, short: c().endingShort, section: 'permit-title' },
  { label: c().styleStep, short: c().styleShort, section: 'summary-title' },
  { label: c().publishStep, short: c().publishShort, section: 'permit-title' },
];
let steps = makeSteps();

if (storedStudioLanguage && project.locale !== uiLocale) {
  translatePresetBackedContent(project.locale, uiLocale);
  project.locale = uiLocale;
  localStorage.setItem(draftKey, JSON.stringify(project));
}
document.documentElement.lang = uiLocale;

if (!accessToken) {
  app.innerHTML = `
    <main class="studio-access">
      <article>
        <span class="studio-kicker">IZIN MAIN STUDIO</span>
        <div class="studio-access__icon">${icon('folder')}</div>
        <h1>${c().invalidLinkTitle}</h1>
        <p>${c().invalidLinkText}</p>
      </article>
    </main>`;
} else if (!storedStudioLanguage) {
  mountLanguageGate();
} else {
  mountStudio();
}

function mountLanguageGate() {
  document.documentElement.lang = uiLocale;
  document.body.className = 'studio-body';
  app.innerHTML = `<main class="studio-language-gate">
    <section class="studio-language-gate__paper">
      <span class="studio-language-gate__tape" aria-hidden="true"></span>
      <span class="studio-kicker">${c().languageGateEyebrow}</span>
      <h1>${c().languageGateTitle}</h1>
      <p>${c().languageGateText}</p>
      <div class="studio-language-cards" role="group" aria-label="${c().studioAndGiftLanguage}">
        <button type="button" data-initial-locale="id" class="${uiLocale === 'id' ? 'is-selected' : ''}"><b>ID</b><span><strong>${c().idLanguage}</strong><small>${c().languageGateIdHint}</small></span></button>
        <button type="button" data-initial-locale="en" class="${uiLocale === 'en' ? 'is-selected' : ''}"><b>EN</b><span><strong>${c().enLanguage}</strong><small>${c().languageGateEnHint}</small></span></button>
      </div>
      <button class="studio-language-gate__continue" type="button" id="language-gate-continue">${c().languageGateContinue}${icon('arrow')}</button>
    </section>
  </main>`;
  app.querySelectorAll<HTMLButtonElement>('[data-initial-locale]').forEach((button) => button.addEventListener('click', () => {
    uiLocale = button.dataset.initialLocale as Locale;
    mountLanguageGate();
  }));
  app.querySelector<HTMLButtonElement>('#language-gate-continue')?.addEventListener('click', () => {
    changeStudioLocale(uiLocale);
    localStorage.setItem(studioLanguageKey, uiLocale);
    saveDraft();
    mountStudio();
  });
}

function changeStudioLocale(nextLocale: Locale) {
  const previousLocale = project.locale;
  if (previousLocale !== nextLocale) translatePresetBackedContent(previousLocale, nextLocale);
  uiLocale = nextLocale;
  project.locale = nextLocale;
  steps = makeSteps();
  document.documentElement.lang = nextLocale;
  localStorage.setItem(studioLanguageKey, nextLocale);
}

function requestTitlePresets(locale: Locale) {
  return locale === 'en'
    ? { serious: 'A Very Serious Going-Out Request', short: 'One Evening with My Friends', sweet: 'Out for a While, Home with a Smile' }
    : { serious: 'Permohonan Izin Main yang Sangat Serius', short: 'Satu Malam Bersama Teman-Teman', sweet: 'Pergi Sebentar, Pulang Tetap Sayang' };
}

function introPresets(locale: Locale) {
  return locale === 'en'
    ? {
        sweet: 'Before I go, I want every part of the plan to be clear so you can feel at ease.',
        funny: 'Instead of saying “we’ll see”, this time I came prepared with a file that is almost official.',
      }
    : {
        sweet: 'Sebelum aku pergi, aku ingin semua rencananya jelas supaya kamu tetap tenang.',
        funny: 'Daripada jawab “lihat nanti”, kali ini aku datang membawa berkas yang niatnya hampir resmi.',
      };
}

function notePresets(locale: Locale) {
  return locale === 'en'
    ? {
        sweet: 'I just want a little time with my friends while making sure you still feel at ease. I will keep you updated, take care of myself, and come home with stories for you.',
        funny: 'I am going out for a while, not disappearing from civilization. My phone stays on, updates keep coming, and I will be home as agreed.',
        direct: 'I will let you know when I arrive, tell you if the plan changes, and come home around the estimated time.',
      }
    : {
        sweet: 'Aku cuma ingin punya waktu sebentar bersama teman-teman, tapi tetap ingin kamu merasa tenang. Aku akan kasih kabar, menjaga diri, dan pulang membawa cerita buat kamu.',
        funny: 'Aku pergi sebentar, bukan menghilang dari peradaban. HP tetap aktif, kabar tetap jalan, dan aku pulang sesuai kesepakatan.',
        direct: 'Aku akan memberi kabar setelah sampai, mengabari kalau rencana berubah, dan pulang sesuai estimasi.',
      };
}

function demoHeadings(locale: Locale): NonNullable<IzinMainProject['headings']> {
  return locale === 'en' ? {
    openingTitle: 'Official Request',
    openingEmphasis: 'Going-Out Permit',
    summaryTitle: 'I want to go out for a while.\nHere is the complete plan.',
    partiesTitle: 'The applicant & the one holding the stamp.',
    planTitle: 'More than just “I’ll be out for a bit”.',
    commitmentsTitle: 'Small promises to help you feel at ease.',
    defenseTitle: 'The applicant’s honest version.',
    decisionTitle: 'The final stamp is in your hands.',
    endingTitle: 'The official permit has been issued.',
  } : structuredClone(demoProject.headings!);
}

function localizedDefaults(locale: Locale) {
  return locale === 'en' ? {
    role: 'your partner who would rather explain the plan than leave you guessing',
    intro: 'I am meeting my friends this Saturday. Instead of sending a vague “I’ll let you know later”, I put every detail into this little file.',
    requestTitle: 'Out for a while, home with a smile',
    activity: 'Ramen, a good conversation, and a board-game night',
    returnEstimate: '11:30 PM — midnight at the latest',
    companions: 'Raka, Dimas, and Farel — the usual team',
    note: 'If the venue changes or the plan runs late, I will tell you first instead of disappearing and returning with a tiny “hehe”.',
    commitments: [
      'I will let you know as soon as I arrive',
      'My phone will not suddenly turn into a rock',
      'I will tell you before moving somewhere else',
      'I will be home around the agreed time',
      'Tomorrow still includes special time for us',
    ],
    defense: 'I just want a little time to recharge with my friends. You will not have to guess where I am or when I will be home—I will keep you updated, stay safe, and come back with stories for you.',
    eyebrow: 'Every detail has been read (or lovingly swiped through)',
    question: 'So… may I go out for a while?',
    approvedLabel: 'Approved',
    approvedMessage: 'Yay, the stamp is down! Thank you for trusting me. Every promise in this file still applies.',
    cardTitle: 'Official Going-Out Permit',
    cardFooter: 'Valid while updates are given, time is respected, and stories are brought home.',
  } : {
    role: demoProject.applicant.role || '',
    intro: demoProject.applicant.intro || '',
    requestTitle: demoProject.request.title,
    activity: demoProject.request.activity,
    returnEstimate: demoProject.request.returnEstimate,
    companions: demoProject.request.companions || '',
    note: demoProject.request.note || '',
    commitments: demoProject.commitments.map((item) => item.text),
    defense: demoProject.defenseNote,
    eyebrow: demoProject.decision.eyebrow || '',
    question: demoProject.decision.question,
    approvedLabel: demoProject.decision.approvedLabel,
    approvedMessage: demoProject.decision.approvedMessage,
    cardTitle: demoProject.card.title,
    cardFooter: demoProject.card.footer || '',
  };
}

function translatePresetBackedContent(from: Locale, to: Locale) {
  if (from === to) return;
  project.headings ??= defaultHeadings(from);
  const oldHeadingSets = [defaultHeadings(from), demoHeadings(from), headingPreset('playful', from), headingPreset('warm', from), headingPreset('official', from)];
  const newHeadingSets = [defaultHeadings(to), demoHeadings(to), headingPreset('playful', to), headingPreset('warm', to), headingPreset('official', to)];
  (Object.keys(project.headings) as Array<keyof NonNullable<IzinMainProject['headings']>>).forEach((key) => {
    const match = oldHeadingSets.findIndex((set) => set[key] === project.headings![key]);
    if (match >= 0) project.headings![key] = newHeadingSets[match][key];
  });

  const replaceKnown = (value: string, oldValues: string[], newValues: string[]) => {
    const index = oldValues.indexOf(value);
    return index >= 0 ? newValues[index] : value;
  };
  const oldTitles = requestTitlePresets(from);
  const newTitles = requestTitlePresets(to);
  project.request.title = replaceKnown(project.request.title, Object.values(oldTitles), Object.values(newTitles));
  const oldIntros = introPresets(from);
  const newIntros = introPresets(to);
  project.applicant.intro = replaceKnown(project.applicant.intro || '', Object.values(oldIntros), Object.values(newIntros));
  const oldNotes = notePresets(from);
  const newNotes = notePresets(to);
  project.defenseNote = replaceKnown(project.defenseNote, Object.values(oldNotes), Object.values(newNotes));

  const oldDefaults = localizedDefaults(from);
  const newDefaults = localizedDefaults(to);
  const swap = (value: string | undefined, oldValue: string, newValue: string) => value === oldValue ? newValue : value;
  project.applicant.role = swap(project.applicant.role, oldDefaults.role, newDefaults.role);
  project.applicant.intro = swap(project.applicant.intro, oldDefaults.intro, newDefaults.intro);
  project.request.title = swap(project.request.title, oldDefaults.requestTitle, newDefaults.requestTitle) || project.request.title;
  project.request.activity = swap(project.request.activity, oldDefaults.activity, newDefaults.activity) || project.request.activity;
  project.request.returnEstimate = swap(project.request.returnEstimate, oldDefaults.returnEstimate, newDefaults.returnEstimate) || project.request.returnEstimate;
  project.request.companions = swap(project.request.companions, oldDefaults.companions, newDefaults.companions);
  project.request.note = swap(project.request.note, oldDefaults.note, newDefaults.note);
  project.commitments.forEach((item, index) => {
    if (item.text === oldDefaults.commitments[index]) item.text = newDefaults.commitments[index] || item.text;
  });
  project.defenseNote = swap(project.defenseNote, oldDefaults.defense, newDefaults.defense) || project.defenseNote;
  project.decision.eyebrow = swap(project.decision.eyebrow, oldDefaults.eyebrow, newDefaults.eyebrow);
  project.decision.question = swap(project.decision.question, oldDefaults.question, newDefaults.question) || project.decision.question;
  project.decision.approvedLabel = swap(project.decision.approvedLabel, oldDefaults.approvedLabel, newDefaults.approvedLabel) || project.decision.approvedLabel;
  project.decision.approvedMessage = swap(project.decision.approvedMessage, oldDefaults.approvedMessage, newDefaults.approvedMessage) || project.decision.approvedMessage;
  project.card.title = swap(project.card.title, oldDefaults.cardTitle, newDefaults.cardTitle) || project.card.title;
  project.card.footer = swap(project.card.footer, oldDefaults.cardFooter, newDefaults.cardFooter);
}

function mountStudio() {
  app.innerHTML = `
    <header class="studio-header">
      <a class="studio-brand" href="/" aria-label="Izin Main">
        <span>${icon('folder')}</span>
        <span><small>IZIN MAIN</small><strong>${c().brand}</strong></span>
      </a>
      <div class="studio-header__actions">
        <div class="studio-language-switch" role="group" aria-label="${c().studioAndGiftLanguage}">
          <span>${c().studioAndGiftLanguage}</span>
          <button type="button" data-studio-locale="id" class="${uiLocale === 'id' ? 'is-selected' : ''}" aria-pressed="${uiLocale === 'id'}">ID</button>
          <button type="button" data-studio-locale="en" class="${uiLocale === 'en' ? 'is-selected' : ''}" aria-pressed="${uiLocale === 'en'}">EN</button>
        </div>
        <span class="save-state" id="save-state">${icon('check')} ${c().saved}</span>
      </div>
    </header>

    <section class="studio-preview-rail" aria-label="${c().previewGift}">
      <div>${icon('eye')}<span><small>${c().previewGift}</small><strong id="preview-rail-label">${steps[currentStep].label}</strong></span></div>
      <p>${c().previewSectionHint}</p>
      <button class="preview-trigger" type="button" data-preview><span>${c().viewSection}</span>${icon('arrow')}</button>
    </section>

    <main class="studio-layout">
      <nav class="studio-steps" id="studio-steps" aria-label="${c().stepsLabel}"></nav>

      <section class="studio-editor" aria-live="polite">
        <div class="studio-editor__heading" id="studio-heading"></div>
        <form class="studio-form" id="studio-form" novalidate></form>
        <div class="studio-navigation">
          <button class="studio-navigation__back" id="step-back" type="button">${icon('arrow')}<span>${c().previous}</span></button>
          <button class="studio-navigation__next" id="step-next" type="button"><span>${c().next}</span>${icon('arrow')}</button>
        </div>
      </section>

      <aside class="studio-summary">
        <span class="studio-summary__clip" aria-hidden="true"></span>
        <p class="studio-kicker">${c().activeFile}</p>
        <h2 id="summary-title-side"></h2>
        <dl id="summary-list"></dl>
        <small>${c().draftSavedHint}</small>
      </aside>
    </main>

    <dialog class="studio-preview" id="preview-dialog">
      <div class="studio-preview__bar">
        <div><span>${c().livePreview}</span><strong id="preview-label"></strong></div>
        <button type="button" data-close-preview aria-label="${c().closePreview}">${icon('close')}</button>
      </div>
      <div class="studio-preview__screen"><iframe id="preview-frame" title="${c().previewFrameTitle}"></iframe></div>
    </dialog>

    <dialog class="preset-dialog" id="preset-dialog">
      <div class="preset-dialog__paper">
        <button class="preset-dialog__close" type="button" data-close-preset aria-label="${c().close}">${icon('close')}</button>
        <span class="studio-kicker">${c().confirmPreset}</span>
        <h2 id="preset-title">${c().usePresetQuestion}</h2>
        <p id="preset-description"></p>
        <div class="preset-compare">
          <div><span>${c().previousValue}</span><p id="preset-before"></p></div>
          <div><span>${c().nextValue}</span><p id="preset-after"></p></div>
        </div>
        <div class="preset-dialog__actions">
          <button type="button" data-close-preset>${c().cancel}</button>
          <button type="button" id="apply-preset">${c().applyPreset} ${icon('arrow')}</button>
        </div>
      </div>
    </dialog>`;

  bindShellEvents();
  renderStep();
  void loadPlaylist();
}

function renderSteps() {
  const nav = document.querySelector<HTMLElement>('#studio-steps');
  if (!nav) return;
  nav.innerHTML = steps.map((step, index) => `
    <button type="button" data-step="${index}" class="${index === currentStep ? 'is-active' : ''} ${index < currentStep ? 'is-complete' : ''}" aria-current="${index === currentStep ? 'step' : 'false'}">
      <span>${index < currentStep ? icon('check') : String(index + 1).padStart(2, '0')}</span>
      <span><strong>${step.label}</strong><small>${step.short}</small></span>
    </button>`).join('');
  nav.querySelectorAll<HTMLButtonElement>('[data-step]').forEach((button) => {
    button.addEventListener('click', () => {
      currentStep = Number(button.dataset.step);
      renderStep();
    });
  });
}

function field(label: string, path: string, value: string, options: { type?: string; placeholder?: string; hint?: string; required?: boolean } = {}) {
  return `<label class="studio-field"><span>${label}${options.required ? `<i>${c().required}</i>` : ''}</span>
    <input data-field="${path}" type="${options.type || 'text'}" value="${escapeHtml(value)}" placeholder="${escapeHtml(options.placeholder || '')}" ${options.required ? 'required' : ''} />
    ${options.hint ? `<small>${options.hint}</small>` : ''}
  </label>`;
}

function textarea(label: string, path: string, value: string, options: { placeholder?: string; hint?: string; maxlength?: number; required?: boolean } = {}) {
  return `<label class="studio-field studio-field--textarea"><span>${label}${options.required ? `<i>${c().required}</i>` : ''}</span>
    <textarea data-field="${path}" rows="5" maxlength="${options.maxlength || 500}" placeholder="${escapeHtml(options.placeholder || '')}" ${options.required ? 'required' : ''}>${escapeHtml(value)}</textarea>
    ${options.hint ? `<small>${options.hint}</small>` : ''}
  </label>`;
}

function photoUpload(kind: 'applicant' | 'recipient', label: string, name: string, photoUrl?: string) {
  return `<div class="photo-upload">
    <div class="photo-upload__preview">${photoUrl ? `<img src="${escapeHtml(photoUrl)}" alt="Preview ${escapeHtml(label)}" />` : `<span>${escapeHtml(name.slice(0, 1) || '?')}</span>`}</div>
    <div><strong>${label}</strong><p>${c().photoOptional}</p>
      <label class="file-button">${icon('image')}<span>${photoUrl ? c().changePhoto : c().choosePhoto}</span><input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" data-photo="${kind}" /></label>
    </div>
  </div>`;
}

type HeadingSection = 'opening' | 'summary' | 'parties' | 'plan' | 'commitments' | 'defense' | 'decision' | 'ending';

const headingFields: Record<Exclude<HeadingSection, 'opening'>, keyof NonNullable<IzinMainProject['headings']>> = {
  summary: 'summaryTitle',
  parties: 'partiesTitle',
  plan: 'planTitle',
  commitments: 'commitmentsTitle',
  defense: 'defenseTitle',
  decision: 'decisionTitle',
  ending: 'endingTitle',
};

function sectionTitleEditor(section: HeadingSection) {
  const descriptions: Record<HeadingSection, string> = {
    opening: c().openingHeadingDescription,
    summary: c().summaryHeadingDescription,
    parties: c().partiesHeadingDescription,
    plan: c().planHeadingDescription,
    commitments: c().commitmentsHeadingDescription,
    defense: c().defenseHeadingDescription,
    decision: c().decisionHeadingDescription,
    ending: c().endingHeadingDescription,
  };
  const inputFields = section === 'opening'
    ? `<div class="field-grid">
        ${field(c().openingTitleLine, 'headings.openingTitle', project.headings!.openingTitle, { placeholder: uiLocale === 'id' ? 'Permohonan' : 'Official Request', required: true })}
        ${field(c().openingHighlight, 'headings.openingEmphasis', project.headings!.openingEmphasis, { placeholder: uiLocale === 'id' ? 'Izin Main' : 'Going-Out Permit', required: true })}
      </div>`
    : field(c().sectionTitle, `headings.${headingFields[section]}`, project.headings![headingFields[section]], { required: true });

  return `<fieldset class="choice-fieldset section-title-card">
    <legend>${c().sectionTitle}</legend>
    <p>${descriptions[section]}</p>
    <div class="section-title-card__presets">
      <span>${icon('spark')} ${c().choosePreset}</span>
      <button type="button" data-section-heading-preset="${section}:playful">${c().playful}</button>
      <button type="button" data-section-heading-preset="${section}:warm">${c().warm}</button>
      <button type="button" data-section-heading-preset="${section}:official">${c().officialFunny}</button>
    </div>
    ${inputFields}
    <small class="section-title-card__hint">${c().presetEditableHint}</small>
  </fieldset>`;
}

function renderStepContent() {
  if (currentStep === 0) return `
    <div class="form-section">
      <div class="form-section__title"><span>01</span><div><h2>${c().openingEditorTitle}</h2><p>${c().openingEditorText}</p></div></div>
      ${sectionTitleEditor('opening')}
      ${field(c().fileNumber, 'requestNumber', project.requestNumber, { placeholder: 'IM/1411/ADIT-07', hint: c().fileNumberHint })}
    </div>`;

  if (currentStep === 1) return `
    <div class="form-section">
      <div class="form-section__title"><span>02</span><div><h2>${c().summaryEditorTitle}</h2><p>${c().summaryEditorText}</p></div></div>
      ${sectionTitleEditor('summary')}
      <div class="preset-row"><span>${c().requestTitlePresets}</span><button type="button" data-title-preset="serious">${c().seriousFunny}</button><button type="button" data-title-preset="short">${c().short}</button><button type="button" data-title-preset="sweet">${c().sweet}</button></div>
      ${field(c().requestTitle, 'request.title', project.request.title, { placeholder: uiLocale === 'id' ? 'Contoh: Nongkrong sebentar, pulang tetap sayang' : 'Example: Out for a while, home with a smile', required: true, hint: c().requestTitleHint })}
    </div>`;

  if (currentStep === 2) return `
    <div class="form-section">
      <div class="form-section__title"><span>03</span><div><h2>${c().partiesEditorTitle}</h2><p>${c().partiesEditorText}</p></div></div>
      ${sectionTitleEditor('parties')}
      <div class="photo-grid">
        ${photoUpload('applicant', c().applicantPhoto, project.applicant.name, project.applicant.photoUrl)}
        ${photoUpload('recipient', c().recipientPhoto, project.recipient.name, project.recipient.photoUrl)}
      </div>
      <div class="field-grid">
        ${field(c().applicantName, 'applicant.name', project.applicant.name, { placeholder: uiLocale === 'id' ? 'Contoh: Adit Pranata' : 'Example: Adit Pranata', required: true })}
        ${field(c().applicantNickname, 'applicant.nickname', project.applicant.nickname || '', { placeholder: uiLocale === 'id' ? 'Contoh: Adit' : 'Example: Adit' })}
        ${field(c().recipientName, 'recipient.name', project.recipient.name, { placeholder: uiLocale === 'id' ? 'Contoh: Nara Putri' : 'Example: Nara Putri', required: true })}
        ${field(c().recipientNickname, 'recipient.nickname', project.recipient.nickname || '', { placeholder: uiLocale === 'id' ? 'Contoh: Nara' : 'Example: Nara' })}
      </div>
      ${field(c().applicantRole, 'applicant.role', project.applicant.role || '', { placeholder: uiLocale === 'id' ? 'Contoh: pacarmu yang tetap ingat waktu' : 'Example: your partner who will keep you updated', hint: c().applicantRoleHint })}
      <div class="preset-row"><span>${c().introPresets}</span><button type="button" data-intro-preset="sweet">${c().sweet}</button><button type="button" data-intro-preset="funny">${c().funny}</button></div>
      ${textarea(c().intro, 'applicant.intro', project.applicant.intro || '', { placeholder: uiLocale === 'id' ? 'Ceritakan singkat kenapa kamu membuat berkas ini…' : 'Briefly share why you made this little file…', hint: c().introHint, maxlength: 320 })}
    </div>`;

  if (currentStep === 3) return `
    <div class="form-section">
      <div class="form-section__title"><span>04</span><div><h2>${c().planEditorTitle}</h2><p>${c().planEditorText}</p></div></div>
      ${sectionTitleEditor('plan')}
      ${textarea(c().activity, 'request.activity', project.request.activity, { placeholder: uiLocale === 'id' ? 'Contoh: makan ramen lalu main board game' : 'Example: ramen and a board-game night', hint: c().activityHint, maxlength: 240, required: true })}
      <div class="field-grid field-grid--three">
        ${field(c().date, 'request.date', project.request.date, { type: 'date', required: true })}
        ${field(c().departure, 'request.departureTime', project.request.departureTime, { type: 'time', required: true })}
        ${field(c().returnEstimate, 'request.returnEstimate', project.request.returnEstimate, { placeholder: uiLocale === 'id' ? '23:30 / setelah acara selesai' : '11:30 PM / when the event ends', required: true })}
      </div>
      ${field(c().companions, 'request.companions', project.request.companions || '', { placeholder: uiLocale === 'id' ? 'Contoh: Raka, Dimas, dan Farel' : 'Example: Raka, Dimas, and Farel', hint: c().companionsHint })}
      <div class="field-grid">
        ${field(c().venue, 'request.venue', project.request.venue || '', { placeholder: uiLocale === 'id' ? 'Contoh: Ruang Temu Kemang' : 'Example: Common Room Kemang' })}
        ${field(c().address, 'request.address', project.request.address || '', { placeholder: uiLocale === 'id' ? 'Alamat lengkap (opsional)' : 'Full address (optional)' })}
      </div>
      ${field(c().maps, 'request.mapsUrl', project.request.mapsUrl || '', { type: 'url', placeholder: 'https://maps.google.com/...', hint: c().mapsHint })}
      ${textarea(c().planNote, 'request.note', project.request.note || '', { placeholder: uiLocale === 'id' ? 'Contoh: Kalau pindah tempat, aku kabari dulu.' : 'Example: I will tell you first if the venue changes.', maxlength: 260 })}
    </div>`;

  if (currentStep === 4) return `
    <div class="form-section">
      <div class="form-section__title"><span>05</span><div><h2>${c().commitmentsEditorTitle}</h2><p>${c().commitmentsEditorText}</p></div></div>
      ${sectionTitleEditor('commitments')}
      <div class="commitment-editor">
        ${project.commitments.map((item, index) => `<label class="commitment-editor__item ${item.enabled ? 'is-enabled' : ''}">
          <input type="checkbox" data-commitment-index="${index}" data-commitment-key="enabled" ${item.enabled ? 'checked' : ''} />
          <span>${item.enabled ? icon('check') : ''}</span>
          <input type="text" data-commitment-index="${index}" data-commitment-key="text" value="${escapeHtml(item.text)}" maxlength="120" aria-label="${c().commitmentLabel} ${index + 1}" />
          <small>${String(index + 1).padStart(2, '0')}</small>
        </label>`).join('')}
      </div>
    </div>`;

  if (currentStep === 5) return `
    <div class="form-section">
      <div class="form-section__title"><span>06</span><div><h2>${c().noteEditorTitle}</h2><p>${c().noteEditorText}</p></div></div>
      ${sectionTitleEditor('defense')}
      <div class="preset-row"><span>${c().messagePresets}</span><button type="button" data-note-preset="sweet">${c().sweet}</button><button type="button" data-note-preset="funny">${c().funny}</button><button type="button" data-note-preset="direct">${c().direct}</button></div>
      ${textarea(c().applicantMessage, 'defenseNote', project.defenseNote, { placeholder: uiLocale === 'id' ? 'Tulis alasan jujurmu dan bagaimana kamu akan menjaga kepercayaan…' : 'Share your honest reason and how you will keep their trust…', hint: c().applicantMessageHint, maxlength: 500, required: true })}
    </div>`;

  if (currentStep === 6) return `
    <div class="form-section">
      <div class="form-section__title"><span>07</span><div><h2>${c().decisionEditorTitle}</h2><p>${c().decisionEditorText}</p></div></div>
      ${sectionTitleEditor('decision')}
      ${field(c().decisionEyebrow, 'decision.eyebrow', project.decision.eyebrow || '', { placeholder: uiLocale === 'id' ? 'Semua detail sudah dibaca…' : 'Every detail has been read…' })}
      ${field(c().finalQuestion, 'decision.question', project.decision.question, { placeholder: uiLocale === 'id' ? 'Jadi… boleh aku main sebentar?' : 'So… may I go out for a while?', required: true })}
      ${field(c().approvalButton, 'decision.approvedLabel', project.decision.approvedLabel, { placeholder: uiLocale === 'id' ? 'Disetujui' : 'Approved', required: true })}
    </div>`;

  if (currentStep === 7) return `
    <div class="form-section">
      <div class="form-section__title"><span>08</span><div><h2>${c().endingEditorTitle}</h2><p>${c().endingEditorText}</p></div></div>
      ${sectionTitleEditor('ending')}
      ${textarea(c().approvedMessage, 'decision.approvedMessage', project.decision.approvedMessage, { placeholder: uiLocale === 'id' ? 'Terima kasih sudah percaya…' : 'Thank you for trusting me…', maxlength: 320, required: true })}
      ${field(c().permitCardTitle, 'card.title', project.card.title, { placeholder: uiLocale === 'id' ? 'Surat Izin Main Resmi' : 'Official Going-Out Permit', required: true })}
      ${textarea(c().permitCardFooter, 'card.footer', project.card.footer || '', { placeholder: uiLocale === 'id' ? 'Sah selama tetap memberi kabar…' : 'Valid while updates are given…', maxlength: 220 })}
    </div>`;

  if (currentStep === 8) return `
    <div class="form-section">
      <div class="form-section__title"><span>09</span><div><h2>${c().styleEditorTitle}</h2><p>${c().styleEditorText}</p></div></div>
      <fieldset class="choice-fieldset"><legend>${c().colorTheme}</legend><div class="theme-options">
        ${(Object.keys(themes) as ThemeId[]).map((themeId) => { const theme = themes[themeId]; return `<button type="button" data-theme="${themeId}" class="${project.theme === themeId ? 'is-selected' : ''}" style="--theme-color:${theme.color};--theme-dark:${theme.dark};--theme-paper:${theme.paper}"><span></span><strong>${theme.label}</strong><small>${themeId === 'district-office' ? c().districtThemeHint : c().crimsonThemeHint}</small></button>`; }).join('')}
      </div></fieldset>
      <fieldset class="choice-fieldset"><legend>${c().playlistTitle}</legend>
        <div class="playlist-grid" id="playlist-grid">${renderPlaylist()}</div>
      </fieldset>
      <div class="upload-song">
        <div>${icon('upload')}<span><strong>${c().uploadOwnSong}</strong><small>${c().uploadSongHint}</small></span></div>
        <label class="file-button">${c().chooseAudio}<input type="file" accept="audio/*" data-audio-upload /></label>
      </div>
    </div>`;

  const issues = translateIssues(validateProject(project, { allowLocalMedia: true }));
  const published = localStorage.getItem(publishedKey);
  return `
    <div class="form-section form-section--review">
      <div class="form-section__title"><span>10</span><div><h2>${c().publishEditorTitle}</h2><p>${c().publishEditorText}</p></div></div>
      <div class="review-grid">
        <article><span>${c().forLabel}</span><strong>${escapeHtml(project.recipient.nickname || project.recipient.name)}</strong><small>${escapeHtml(project.request.title)}</small></article>
        <article><span>${c().scheduleLabel}</span><strong>${escapeHtml(project.request.date)}</strong><small>${escapeHtml(project.request.departureTime)} — ${escapeHtml(project.request.returnEstimate)}</small></article>
        <article><span>${c().styleLabel}</span><strong>${escapeHtml(themes[project.theme].label)}</strong><small>${project.locale === 'id' ? c().idLanguage : c().enLanguage}</small></article>
        <article><span>${c().soundtrackLabel}</span><strong>${escapeHtml(project.music?.title || c().noMusic)}</strong><small>${escapeHtml(project.music?.artist || c().notSelected)}</small></article>
      </div>
      ${issues.length ? `<div class="validation-card"><strong>${c().issuesTitle}</strong><ul>${issues.map((issue) => `<li>${escapeHtml(issue)}</li>`).join('')}</ul></div>` : `<div class="ready-card">${icon('check')}<span><strong>${c().readyTitle}</strong><small>${c().readyText}</small></span></div>`}
      <button class="publish-button" id="publish-button" type="button" ${issues.length ? 'disabled' : ''}>${icon('save')}<span>${published ? c().updateGift : c().publishGift}</span>${icon('arrow')}</button>
      <div class="publish-result" id="publish-result" ${published ? '' : 'hidden'}>
        <article class="publish-barcode" id="publish-barcode">
          <span class="publish-barcode__tab">${c().shareReady}</span>
          <div class="publish-barcode__head"><span>${icon('heart')}</span><div><small>IZIN MAIN</small><strong>${c().scanTitle}</strong></div></div>
          <div class="publish-barcode__qr" id="published-qr" aria-label="Barcode gift"></div>
          <strong>${escapeHtml(project.recipient.nickname || project.recipient.name)}</strong>
          <small>${escapeHtml(project.requestNumber)}</small>
        </article>
        <span>${c().giftLink}</span><strong id="published-link">${escapeHtml(publicGiftUrl())}</strong>
        <div class="publish-result__actions"><button type="button" id="copy-link">${icon('copy')} ${c().copyLink}</button><a href="${escapeHtml(publicGiftUrl())}" target="_blank">${icon('eye')} ${c().openGift}</a><button type="button" id="download-barcode">${icon('download')} ${c().downloadBarcode}</button></div>
      </div>
    </div>`;
}

function renderPlaylist() {
  if (!playlist.length) return `<p class="playlist-loading">${c().loadingPlaylist}</p>`;
  return playlist.map((song, index) => {
    const selected = project.music?.audioUrl === song.audioUrl;
    return `<article class="song-card ${selected ? 'is-selected' : ''}">
      <button type="button" class="song-card__select" data-song="${index}">
        <span class="song-card__cover">${song.coverUrl ? `<img src="${escapeHtml(song.coverUrl)}" alt="" />` : icon('music')}</span>
        <span><strong>${escapeHtml(song.title)}</strong><small>${escapeHtml(song.artist)}</small></span>
        <i>${selected ? icon('check') : ''}</i>
      </button>
      <button type="button" class="song-card__play" data-play-song="${index}" aria-label="${c().previewSong} ${escapeHtml(song.title)}">${icon('music')}</button>
    </article>`;
  }).join('');
}

function renderStep() {
  renderSteps();
  const heading = document.querySelector<HTMLElement>('#studio-heading');
  const form = document.querySelector<HTMLFormElement>('#studio-form');
  if (!heading || !form) return;
  heading.innerHTML = `<span>${c().step} ${String(currentStep + 1).padStart(2, '0')} / ${String(steps.length).padStart(2, '0')}</span><h1>${steps[currentStep].label}</h1><p>${steps[currentStep].short}</p>`;
  form.innerHTML = renderStepContent();
  bindFormEvents(form);
  const previewRailLabel = document.querySelector<HTMLElement>('#preview-rail-label');
  if (previewRailLabel) previewRailLabel.textContent = steps[currentStep].label;
  const back = document.querySelector<HTMLButtonElement>('#step-back');
  const next = document.querySelector<HTMLButtonElement>('#step-next');
  if (back) back.disabled = currentStep === 0;
  if (next) {
    next.hidden = currentStep === steps.length - 1;
    next.querySelector('span')!.textContent = currentStep === steps.length - 2 ? c().reviewPublish : c().next;
  }
  renderSideSummary();
  if (currentStep === steps.length - 1 && localStorage.getItem(publishedKey)) void renderPublishBarcode();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function bindShellEvents() {
  document.querySelectorAll<HTMLButtonElement>('[data-studio-locale]').forEach((button) => button.addEventListener('click', () => {
    const next = button.dataset.studioLocale as Locale;
    if (next === uiLocale) return;
    changeStudioLocale(next);
    queueSave();
    mountStudio();
  }));
  document.querySelector<HTMLButtonElement>('#step-back')?.addEventListener('click', () => {
    if (currentStep > 0) { currentStep -= 1; renderStep(); }
  });
  document.querySelector<HTMLButtonElement>('#step-next')?.addEventListener('click', () => {
    if (currentStep < steps.length - 1) { currentStep += 1; renderStep(); }
  });
  document.querySelectorAll<HTMLButtonElement>('[data-preview]').forEach((button) => button.addEventListener('click', openPreview));
  document.querySelectorAll<HTMLButtonElement>('[data-close-preview]').forEach((button) => button.addEventListener('click', () => document.querySelector<HTMLDialogElement>('#preview-dialog')?.close()));
  document.querySelectorAll<HTMLButtonElement>('[data-close-preset]').forEach((button) => button.addEventListener('click', () => document.querySelector<HTMLDialogElement>('#preset-dialog')?.close()));
  document.querySelector<HTMLButtonElement>('#apply-preset')?.addEventListener('click', () => {
    presetPayload?.apply();
    document.querySelector<HTMLDialogElement>('#preset-dialog')?.close();
    queueSave();
    renderStep();
  });
}

function bindFormEvents(form: HTMLFormElement) {
  form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-field]').forEach((input) => {
    input.addEventListener('input', () => {
      setProjectValue(input.dataset.field!, input.value);
      queueSave();
      renderSideSummary();
    });
  });

  form.querySelectorAll<HTMLInputElement>('[data-commitment-index]').forEach((input) => {
    input.addEventListener(input.type === 'checkbox' ? 'change' : 'input', () => {
      const item = project.commitments[Number(input.dataset.commitmentIndex)];
      if (!item) return;
      if (input.dataset.commitmentKey === 'enabled') item.enabled = input.checked;
      else item.text = input.value;
      input.closest('.commitment-editor__item')?.classList.toggle('is-enabled', item.enabled);
      queueSave();
    });
  });

  form.querySelectorAll<HTMLInputElement>('[data-photo]').forEach((input) => input.addEventListener('change', () => void handlePhoto(input)));
  form.querySelector<HTMLInputElement>('[data-audio-upload]')?.addEventListener('change', (event) => handleAudioUpload(event.currentTarget as HTMLInputElement));

  form.querySelectorAll<HTMLButtonElement>('[data-theme]').forEach((button) => button.addEventListener('click', () => {
    project.theme = button.dataset.theme as ThemeId;
    document.documentElement.dataset.theme = project.theme;
    queueSave();
    renderStep();
  }));
  form.querySelectorAll<HTMLButtonElement>('[data-song]').forEach((button) => button.addEventListener('click', () => selectSong(Number(button.dataset.song))));
  form.querySelectorAll<HTMLButtonElement>('[data-play-song]').forEach((button) => button.addEventListener('click', () => toggleSongPreview(Number(button.dataset.playSong), button)));

  form.querySelectorAll<HTMLButtonElement>('[data-title-preset]').forEach((button) => button.addEventListener('click', () => openTitlePreset(button.dataset.titlePreset!)));
  form.querySelectorAll<HTMLButtonElement>('[data-intro-preset]').forEach((button) => button.addEventListener('click', () => openIntroPreset(button.dataset.introPreset!)));
  form.querySelectorAll<HTMLButtonElement>('[data-note-preset]').forEach((button) => button.addEventListener('click', () => openNotePreset(button.dataset.notePreset!)));
  form.querySelectorAll<HTMLButtonElement>('[data-section-heading-preset]').forEach((button) => button.addEventListener('click', () => {
    const [section, tone] = button.dataset.sectionHeadingPreset!.split(':') as [HeadingSection, string];
    openSectionHeadingPreset(section, tone);
  }));

  form.querySelector<HTMLButtonElement>('#publish-button')?.addEventListener('click', publishGift);
  form.querySelector<HTMLButtonElement>('#copy-link')?.addEventListener('click', () => void copyGiftLink());
  form.querySelector<HTMLButtonElement>('#download-barcode')?.addEventListener('click', () => void downloadPublishBarcode());
}

function setProjectValue(path: string, value: string) {
  const keys = path.split('.');
  let target = project as unknown as Record<string, unknown>;
  keys.slice(0, -1).forEach((key) => { target = target[key] as Record<string, unknown>; });
  target[keys.at(-1)!] = value;
}

function queueSave() {
  const state = document.querySelector<HTMLElement>('#save-state');
  if (state) { state.classList.add('is-saving'); state.innerHTML = `${icon('save')} ${c().saving}`; }
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(saveDraft, 520);
}

function saveDraft() {
  const state = document.querySelector<HTMLElement>('#save-state');
  try {
    localStorage.setItem(draftKey, JSON.stringify(project));
    writePreviewProject();
    if (state) {
      state.classList.remove('is-saving', 'has-error');
      state.innerHTML = `${icon('check')} ${c().saved}`;
    }
  } catch {
    if (state) {
      state.classList.remove('is-saving');
      state.classList.add('has-error');
      state.textContent = c().saveFailedShort;
    }
  }
}

function writePreviewProject() {
  const snapshot = structuredClone(project);
  if (snapshot.music?.source === 'upload' && uploadAudioUrl) snapshot.music.audioUrl = uploadAudioUrl;
  localStorage.setItem(previewKey, JSON.stringify(snapshot));
  const dialog = document.querySelector<HTMLDialogElement>('#preview-dialog');
  if (dialog?.open) {
    window.clearTimeout(previewRefreshTimer);
    previewRefreshTimer = window.setTimeout(refreshPreviewFrame, 360);
  }
}

function renderSideSummary() {
  const title = document.querySelector<HTMLElement>('#summary-title-side');
  const list = document.querySelector<HTMLElement>('#summary-list');
  if (title) title.textContent = project.request.title || (uiLocale === 'id' ? 'Berkas izin main' : 'Going-out permit');
  if (list) list.innerHTML = `
    <div><dt>${c().applicantSummary}</dt><dd>${escapeHtml(project.applicant.nickname || project.applicant.name || c().notFilled)}</dd></div>
    <div><dt>${c().recipientSummary}</dt><dd>${escapeHtml(project.recipient.nickname || project.recipient.name || c().notFilled)}</dd></div>
    <div><dt>${c().date}</dt><dd>${escapeHtml(project.request.date || c().notFilled)}</dd></div>
    <div><dt>${c().themeSummary}</dt><dd>${escapeHtml(themes[project.theme].label)}</dd></div>`;
}

function openPreview() {
  saveDraft();
  const dialog = document.querySelector<HTMLDialogElement>('#preview-dialog');
  const label = document.querySelector<HTMLElement>('#preview-label');
  if (label) label.textContent = steps[currentStep].label;
  refreshPreviewFrame();
  dialog?.showModal();
}

function refreshPreviewFrame() {
  const frame = document.querySelector<HTMLIFrameElement>('#preview-frame');
  if (!frame) return;
  const params = new URLSearchParams({ open: '1', studioPreview: projectId, section: steps[currentStep].section });
  frame.src = `/?${params.toString()}`;
}

async function loadPlaylist() {
  try {
    const response = await fetch('/playlist.json');
    if (!response.ok) throw new Error('Playlist unavailable');
    playlist = await response.json() as PlaylistSong[];
    if (currentStep === 8) renderStep();
  } catch {
    const grid = document.querySelector<HTMLElement>('#playlist-grid');
    if (grid) grid.innerHTML = `<p class="playlist-loading">${c().playlistFailed}</p>`;
  }
}

function selectSong(index: number) {
  const song = playlist[index];
  if (!song) return;
  uploadAudioUrl = undefined;
  project.music = { title: song.title, artist: song.artist, audioUrl: song.audioUrl, coverUrl: song.coverUrl, source: 'playlist' };
  queueSave();
  renderStep();
}

function toggleSongPreview(index: number, button: HTMLButtonElement) {
  const song = playlist[index];
  if (!song) return;
  if (previewAudio && previewAudio.src === song.audioUrl && !previewAudio.paused) {
    previewAudio.pause();
    button.classList.remove('is-playing');
    return;
  }
  previewAudio?.pause();
  document.querySelectorAll('.song-card__play.is-playing').forEach((item) => item.classList.remove('is-playing'));
  previewAudio = new Audio(song.audioUrl);
  previewAudio.play().then(() => button.classList.add('is-playing')).catch(() => button.classList.remove('is-playing'));
  previewAudio.addEventListener('ended', () => button.classList.remove('is-playing'), { once: true });
}

function handleAudioUpload(input: HTMLInputElement) {
  const file = input.files?.[0];
  if (!file) return;
  if (uploadAudioUrl) URL.revokeObjectURL(uploadAudioUrl);
  uploadAudioUrl = URL.createObjectURL(file);
  project.music = {
    title: file.name.replace(/\.[^.]+$/, ''),
    artist: c().ownUploadArtist,
    audioUrl: uploadAudioUrl,
    source: 'upload',
  };
  queueSave();
  renderStep();
}

async function handlePhoto(input: HTMLInputElement) {
  const file = input.files?.[0];
  if (!file) return;
  const button = input.closest<HTMLElement>('.file-button');
  button?.classList.add('is-loading');
  try {
    const dataUrl = await compressImage(file);
    const kind = input.dataset.photo as 'applicant' | 'recipient';
    project[kind].photoUrl = dataUrl;
    queueSave();
    renderStep();
  } finally {
    button?.classList.remove('is-loading');
  }
}

async function compressImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL('image/webp', .78);
}

function openTitlePreset(tone: string) {
  const values: Record<string, string> = requestTitlePresets(project.locale);
  openPreset({
    title: c().replaceRequestTitle,
    description: c().replaceRequestTitleText,
    before: project.request.title,
    after: values[tone],
    apply: () => { project.request.title = values[tone]; },
  });
}

function openIntroPreset(tone: string) {
  const values: Record<string, string> = introPresets(project.locale);
  openPreset({
    title: c().replaceIntro,
    description: c().replaceIntroText,
    before: project.applicant.intro || c().noIntro,
    after: values[tone],
    apply: () => { project.applicant.intro = values[tone]; },
  });
}

function openNotePreset(tone: string) {
  const values: Record<string, string> = notePresets(project.locale);
  openPreset({
    title: c().replaceNote,
    description: c().replaceNoteText,
    before: project.defenseNote,
    after: values[tone],
    apply: () => { project.defenseNote = values[tone]; },
  });
}

function defaultHeadings(locale: Locale): NonNullable<IzinMainProject['headings']> {
  const ui = getGiftUi(locale);
  return {
    openingTitle: ui.gateTitle,
    openingEmphasis: ui.gateEmphasis,
    summaryTitle: ui.summaryTitle,
    partiesTitle: ui.partiesTitle,
    planTitle: ui.planTitle,
    commitmentsTitle: ui.commitmentTitle,
    defenseTitle: ui.defenseTitle,
    decisionTitle: ui.decisionTitle,
    endingTitle: ui.completeTitle,
  };
}

function headingPreset(tone: string, locale: Locale): NonNullable<IzinMainProject['headings']> {
  const id: Record<string, NonNullable<IzinMainProject['headings']>> = {
    playful: {
      openingTitle: 'Berkas Rahasia', openingEmphasis: 'Mau Main', summaryTitle: 'Aku punya rencana.\nKali ini lengkap, kok.', partiesTitle: 'Yang pergi & yang pegang stempel.', planTitle: 'Biar nggak ada jawaban “lihat nanti”.', commitmentsTitle: 'Janji yang nggak cuma jadi wacana.', defenseTitle: 'Pembelaan singkat dari tersangka.', decisionTitle: 'Satu stempel sebelum aku berangkat.', endingTitle: 'Operasi main resmi disetujui.',
    },
    warm: {
      openingTitle: 'Satu Rencana', openingEmphasis: 'Untuk Kamu', summaryTitle: 'Aku mau pergi sebentar.\nTapi tetap ingin kamu tenang.', partiesTitle: 'Aku yang mengajukan, kamu yang kupercaya.', planTitle: 'Semua detail yang ingin kamu tahu.', commitmentsTitle: 'Hal kecil yang akan aku jaga.', defenseTitle: 'Sedikit isi hati sebelum pergi.', decisionTitle: 'Kalau semuanya sudah terasa pas…', endingTitle: 'Terima kasih sudah mempercayaiku.',
    },
    official: {
      openingTitle: 'Permohonan Resmi', openingEmphasis: 'Izin Main', summaryTitle: 'Ringkasan pengajuan\nyang sangat serius.', partiesTitle: 'Pemohon dan pejabat pemberi stempel.', planTitle: 'Lampiran rencana perjalanan singkat.', commitmentsTitle: 'Pernyataan tanggung jawab pemohon.', defenseTitle: 'Nota pembelaan yang jujur.', decisionTitle: 'Meja persetujuan akhir.', endingTitle: 'Surat izin resmi telah diterbitkan.',
    },
  };
  const en: Record<string, NonNullable<IzinMainProject['headings']>> = {
    playful: {
      openingTitle: 'Secret File', openingEmphasis: 'Going Out', summaryTitle: 'I have a plan.\nA complete one this time.', partiesTitle: 'The one going out & the stamp holder.', planTitle: 'No more “I’ll tell you later”.', commitmentsTitle: 'Promises that are more than talk.', defenseTitle: 'A short defense from the suspect.', decisionTitle: 'One stamp before I head out.', endingTitle: 'Going-out mission officially approved.',
    },
    warm: {
      openingTitle: 'A Small Plan', openingEmphasis: 'For You', summaryTitle: 'I want to go out for a while.\nAnd help you feel at ease.', partiesTitle: 'I am asking because I trust you.', planTitle: 'Every detail you may want to know.', commitmentsTitle: 'The small things I promise to keep.', defenseTitle: 'A little note before I go.', decisionTitle: 'If everything feels right…', endingTitle: 'Thank you for trusting me.',
    },
    official: {
      openingTitle: 'Official Request', openingEmphasis: 'Going-Out Permit', summaryTitle: 'A very serious\nrequest summary.', partiesTitle: 'The applicant and official stamp holder.', planTitle: 'Attached short-trip itinerary.', commitmentsTitle: 'Applicant responsibility statement.', defenseTitle: 'An honest defense memorandum.', decisionTitle: 'Final approval desk.', endingTitle: 'The official permit has been issued.',
    },
  };
  return (locale === 'en' ? en : id)[tone] || defaultHeadings(locale);
}

function openSectionHeadingPreset(section: HeadingSection, tone: string) {
  const current = project.headings ?? defaultHeadings(project.locale);
  const next = headingPreset(tone, project.locale);
  const labels: Record<HeadingSection, string> = {
    opening: c().openingSectionName,
    summary: c().summarySectionName,
    parties: c().partiesSectionName,
    plan: c().planSectionName,
    commitments: c().commitmentsSectionName,
    defense: c().defenseSectionName,
    decision: c().decisionSectionName,
    ending: c().endingSectionName,
  };
  const before = section === 'opening'
    ? `${current.openingTitle} / ${current.openingEmphasis}`
    : current[headingFields[section]];
  const after = section === 'opening'
    ? `${next.openingTitle} / ${next.openingEmphasis}`
    : next[headingFields[section]];

  openPreset({
    title: c().sectionPresetTitle.replace('{section}', labels[section]),
    description: c().sectionPresetText,
    before,
    after,
    apply: () => {
      if (section === 'opening') {
        project.headings!.openingTitle = next.openingTitle;
        project.headings!.openingEmphasis = next.openingEmphasis;
      } else {
        project.headings![headingFields[section]] = next[headingFields[section]];
      }
    },
  });
}

function openPreset(payload: PresetPayload) {
  presetPayload = payload;
  document.querySelector<HTMLElement>('#preset-title')!.textContent = payload.title;
  document.querySelector<HTMLElement>('#preset-description')!.textContent = payload.description;
  document.querySelector<HTMLElement>('#preset-before')!.textContent = payload.before;
  document.querySelector<HTMLElement>('#preset-after')!.textContent = payload.after;
  document.querySelector<HTMLDialogElement>('#preset-dialog')?.showModal();
}

function translateIssues(issues: string[]) {
  const translations: Record<string, string> = {
    'Applicant name is required': c().issueApplicant,
    'Recipient name is required': c().issueRecipient,
    'Request title is required': c().issueRequestTitle,
    'Activity is required': c().issueActivity,
    'Date must use YYYY-MM-DD': c().issueDate,
    'Departure time must use HH:mm': c().issueDeparture,
    'Return estimate is required': c().issueReturn,
    'At least two commitments are required': c().issueCommitments,
    'Personal note is required': c().issueNote,
    'Maps URL must be HTTP or HTTPS': c().issueMaps,
    'Music URL must be HTTP or HTTPS': c().issueMusic,
  };
  return issues.map((issue) => translations[issue] || issue);
}

function publishGift() {
  saveDraft();
  const issues = validateProject(project, { allowLocalMedia: true });
  if (issues.length) return;
  const snapshot = structuredClone(project);
  if (snapshot.music?.source === 'upload' && uploadAudioUrl) snapshot.music.audioUrl = uploadAudioUrl;
  localStorage.setItem(publishedKey, JSON.stringify(snapshot));
  const result = document.querySelector<HTMLElement>('#publish-result');
  result?.removeAttribute('hidden');
  const button = document.querySelector<HTMLButtonElement>('#publish-button');
  if (button) button.innerHTML = `${icon('check')}<span>${c().giftUpdated}</span>`;
  document.querySelector<HTMLElement>('#published-link')!.textContent = publicGiftUrl();
  void renderPublishBarcode();
}

function publicGiftUrl() {
  const url = new URL('/', window.location.origin);
  url.searchParams.set('gift', projectId);
  return url.href;
}

async function copyGiftLink() {
  await navigator.clipboard.writeText(publicGiftUrl());
  const button = document.querySelector<HTMLButtonElement>('#copy-link');
  if (button) {
    button.innerHTML = `${icon('check')} ${c().copied}`;
    window.setTimeout(() => { button.innerHTML = `${icon('copy')} ${c().copyLink}`; }, 1600);
  }
}

async function createQrDataUrl(size = 360) {
  const theme = themes[project.theme];
  return QRCode.toDataURL(publicGiftUrl(), {
    width: size,
    margin: 2,
    errorCorrectionLevel: 'H',
    color: { dark: theme.dark, light: theme.paper },
  });
}

async function renderPublishBarcode() {
  const holder = document.querySelector<HTMLElement>('#published-qr');
  if (!holder) return;
  holder.innerHTML = `<span class="publish-qr-loading">${c().makingBarcode}</span>`;
  try {
    const dataUrl = await createQrDataUrl(360);
    holder.innerHTML = `<img src="${dataUrl}" alt="Barcode untuk membuka gift ${escapeHtml(project.recipient.nickname || project.recipient.name)}" />`;
  } catch {
    holder.innerHTML = `<span class="publish-qr-loading">${c().barcodeFailed}</span>`;
  }
}

async function downloadPublishBarcode() {
  await document.fonts.ready;
  const theme = themes[project.theme];
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const context = canvas.getContext('2d');
  if (!context) return;

  context.fillStyle = theme.dark;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = theme.paper;
  context.fillRect(78, 72, 924, 1206);
  context.strokeStyle = theme.color;
  context.lineWidth = 5;
  context.strokeRect(108, 102, 864, 1146);
  context.setLineDash([12, 10]);
  context.lineWidth = 2;
  context.strokeRect(138, 132, 804, 1086);
  context.setLineDash([]);

  context.textAlign = 'center';
  context.fillStyle = theme.color;
  context.font = '600 23px "IBM Plex Mono", monospace';
  context.fillText(project.locale === 'id' ? 'KANTOR PERIZINAN PACAR' : 'PARTNER PERMIT OFFICE', 540, 205);
  context.fillStyle = theme.ink;
  context.font = '400 58px "DM Serif Display", serif';
  context.fillText(project.locale === 'id' ? 'Berkas Siap Dibuka' : 'A File Ready to Open', 540, 286);
  context.font = '500 25px "Plus Jakarta Sans", sans-serif';
  context.fillStyle = theme.color;
  context.fillText(`${project.locale === 'id' ? 'UNTUK' : 'FOR'} ${String(project.recipient.nickname || project.recipient.name).toUpperCase()}`, 540, 340);

  const qrImage = new Image();
  qrImage.src = await createQrDataUrl(560);
  await qrImage.decode();
  context.drawImage(qrImage, 260, 390, 560, 560);

  context.save();
  context.translate(540, 1008);
  context.strokeStyle = theme.color;
  context.lineWidth = 10;
  context.beginPath();
  context.moveTo(0, 48);
  context.bezierCurveTo(-95, -15, -120, -95, -48, -112);
  context.bezierCurveTo(-10, -121, 0, -84, 0, -84);
  context.bezierCurveTo(0, -84, 10, -121, 48, -112);
  context.bezierCurveTo(120, -95, 95, -15, 0, 48);
  context.stroke();
  context.restore();

  context.fillStyle = theme.ink;
  context.font = '600 22px "IBM Plex Mono", monospace';
  context.fillText(project.requestNumber, 540, 1112);
  context.fillStyle = theme.color;
  context.font = '500 21px "Plus Jakarta Sans", sans-serif';
  context.fillText(project.locale === 'id' ? 'SCAN BARCODE UNTUK MEMBUKA GIFT' : 'SCAN THE QR CODE TO OPEN THE GIFT', 540, 1160);

  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error('Unable to export barcode')), 'image/png'));
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `barcode-izin-main-${project.recipient.nickname?.toLowerCase() || 'gift'}.png`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
