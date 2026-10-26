import '@fontsource/dm-serif-display/latin-400.css';
import '@fontsource/caveat/latin-400.css';
import '@fontsource/caveat/latin-600.css';
import '@fontsource/sacramento/latin-400.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import '@fontsource/ibm-plex-mono/latin-600.css';
import '@fontsource/plus-jakarta-sans/latin-400.css';
import '@fontsource/plus-jakarta-sans/latin-500.css';
import '@fontsource/plus-jakarta-sans/latin-600.css';
import '@fontsource/plus-jakarta-sans/latin-700.css';
import './styles.css';

import { getCopy } from './copy';
import { demoProject } from './demo';
import { getGiftUi } from './gift-ui';
import { formatGiftDate, safeExternalUrl, safeMediaUrl, validateProject, type IzinMainProject, type PermitResponse, type ThemeId } from './project';
import { themes } from './themes';

const pageParams = new URLSearchParams(window.location.search);
const studioPreviewId = pageParams.get('studioPreview');
const publishedGiftId = pageParams.get('gift');
const storedProjectKey = studioPreviewId
  ? `izin-main:studio-preview:${studioPreviewId}`
  : publishedGiftId
    ? `izin-main:published:${publishedGiftId}`
    : undefined;

function readStoredProject(key?: string): IzinMainProject | undefined {
  if (!key) return undefined;
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as IzinMainProject : undefined;
  } catch {
    return undefined;
  }
}

const project = structuredClone(readStoredProject(storedProjectKey) ?? demoProject);
const requestedTheme = pageParams.get('theme');
if (requestedTheme && requestedTheme in themes) project.theme = requestedTheme as ThemeId;
const strings = getCopy(project.locale);
const ui = getGiftUi(project.locale);
const dateLocale = project.locale === 'id' ? 'id-ID' : 'en-US';
const headings = {
  openingTitle: ui.gateTitle,
  openingEmphasis: ui.gateEmphasis,
  summaryTitle: ui.summaryTitle,
  partiesTitle: ui.partiesTitle,
  planTitle: ui.planTitle,
  commitmentsTitle: ui.commitmentTitle,
  defenseTitle: ui.defenseTitle,
  decisionTitle: ui.decisionTitle,
  endingTitle: ui.completeTitle,
  ...project.headings,
};
const root = document.querySelector<HTMLDivElement>('#app');

if (!root) throw new Error('App root is missing');

document.title = `Izin Main — ${project.applicant.nickname || project.applicant.name}`;

const issues = validateProject(project, { allowLocalMedia: Boolean(studioPreviewId) });
if (issues.length) throw new Error(`Invalid demo project: ${issues.join(', ')}`);

const icon = (name: 'folder' | 'arrow' | 'pin' | 'clock' | 'people' | 'check' | 'download' | 'share' | 'message' | 'close' | 'play' | 'pause' | 'music' | 'musicOff') => {
  const paths: Record<typeof name, string> = {
    folder: '<path d="M3 7.5h7l2.2 2.5H21v9.5H3z"/><path d="M3 7.5V5h7l2 2.5"/>',
    arrow: '<path d="M5 12h14M14 7l5 5-5 5"/>',
    pin: '<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
    people: '<circle cx="9" cy="8" r="3"/><path d="M3 20c.5-4 2.5-6 6-6s5.5 2 6 6"/><path d="M16 5.5a3 3 0 0 1 0 5.5M17 14c2.5.4 3.8 2.3 4 5"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M5 21h14"/>',
    share: '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.5m-7.6 6.9 7.6 4.5"/>',
    message: '<path d="M4 5h16v11H9l-5 4z"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    play: '<path d="m9 7 8 5-8 5z"/>',
    pause: '<path d="M9 7v10M15 7v10"/>',
    music: '<path d="M9 18V6l9-2v12"/><circle cx="6" cy="18" r="3"/><circle cx="15" cy="16" r="3"/>',
    musicOff: '<path d="M9 14.5V6l9-2v12"/><circle cx="6" cy="18" r="3"/><circle cx="15" cy="16" r="3"/><path d="M4 4l16 16"/>',
  };
  return `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`;
};

const detailRow = (label: string, value: string, iconName?: 'pin' | 'clock' | 'people') => `
  <div class="detail-row">
    ${iconName ? `<span class="detail-icon">${icon(iconName)}</span>` : ''}
    <span class="detail-label">${label}</span>
    <strong>${value}</strong>
  </div>`;

const enabledCommitments = project.commitments.filter((item) => item.enabled).sort((a, b) => a.order - b.order);
const mapUrl = safeExternalUrl(project.request.mapsUrl);
const musicAudioUrl = safeMediaUrl(project.music?.audioUrl, Boolean(studioPreviewId));
const recipientDisplay = project.recipient.nickname || project.recipient.name;

root.innerHTML = `
  <div class="grain" aria-hidden="true"></div>

  <section class="gate" id="gate" aria-labelledby="gate-title">
    <div class="desk-shadow desk-shadow--one" aria-hidden="true"></div>
    <div class="desk-shadow desk-shadow--two" aria-hidden="true"></div>
    <div class="gate__folder-wrap">
      <div class="folder" id="folder">
        <div class="folder__paper" aria-hidden="true">
          <span>${ui.formCode} / ${project.requestNumber}</span>
          <strong>${ui.paperTitle.replace('\n', '<br>')}</strong>
          <small>${project.applicant.nickname || project.applicant.name} ${ui.paperSubtitle} ${recipientDisplay}</small>
          <i>${ui.swipeHint}</i>
        </div>
        <div class="folder__front">
          <span class="folder__tab">BERKAS MASUK</span>
          <div class="folder__string folder__string--top" aria-hidden="true"></div>
          <div class="folder__string folder__string--bottom" aria-hidden="true"></div>
          <span class="folder__seal" aria-hidden="true"></span>
          <div class="folder__content">
            <span class="micro-label">${strings.agency}</span>
            <h1 id="gate-title">${headings.openingTitle}<br><em>${headings.openingEmphasis}</em></h1>
            <div class="gate__meta">
              <span>${strings.requestNo}</span>
              <strong>${project.requestNumber}</strong>
            </div>
            <div class="gate__recipient">
              <span>${strings.fileFor}</span>
              <strong>${project.recipient.name}</strong>
            </div>
            <span class="pending-stamp">${strings.statusPending}</span>
          </div>
        </div>
      </div>
      <button class="open-file" id="open-file" type="button">${icon('folder')}<span>${strings.openFile}</span>${icon('arrow')}</button>
      <p class="gate__hint">${ui.gateHint}</p>
    </div>
  </section>

  <main class="gift" id="gift" aria-hidden="true">
    <div class="gift-pages" id="gift-pages" tabindex="0" aria-label="${ui.pagesLabel}">
    <section class="summary-section section-pad gift-page" data-page="summary" aria-labelledby="summary-title">
      <div class="section-heading reveal">
        <span>01 / 07</span>
        <div><p>${strings.summary}</p><h2 id="summary-title">${headings.summaryTitle.replace('\n', '<br>')}</h2></div>
      </div>
      <div class="summary-grid">
        <article class="summary-paper reveal">
          <span class="paperclip" aria-hidden="true"></span>
          <p class="document-kicker">${ui.requestLabel} / ${project.requestNumber}</p>
          <h3>${project.request.title}</h3>
          <p class="summary-intro">${ui.summaryPrefix} <strong>${recipientDisplay}</strong>, ${ui.summarySuffix}</p>
          <div class="summary-table">
            ${detailRow(strings.applicantName, project.applicant.name)}
            ${detailRow(strings.date, formatGiftDate(project.request.date, project.locale))}
            ${detailRow(strings.departure, project.request.departureTime)}
            ${detailRow(strings.returnEstimate, project.request.returnEstimate)}
          </div>
          <span class="review-mark">${ui.reviewMark}</span>
        </article>
        <aside class="request-ticket reveal" aria-label="Nomor permohonan">
          <span>${ui.requestTicket}</span><strong>${project.requestNumber}</strong><i></i>
          <small>${project.applicant.nickname || project.applicant.name} → ${recipientDisplay}</small>
        </aside>
      </div>
    </section>

    <section class="profile-section section-pad gift-page" data-page="profile" aria-labelledby="profile-title">
      <div class="section-heading reveal">
        <span>02 / 07</span>
        <div><p>${ui.partiesEyebrow}</p><h2 id="profile-title">${headings.partiesTitle}</h2></div>
      </div>
      <article class="identity-file reveal">
        <div class="identity-file__people">
          <figure class="person-card person-card--applicant">
            <div class="person-card__photo">
              ${project.applicant.photoUrl ? `<img src="${project.applicant.photoUrl}" alt="Foto ${project.applicant.name}" />` : `<span>${project.applicant.name.slice(0, 1)}</span>`}
            </div>
            <figcaption><span>${strings.applicantName.toUpperCase()}</span><strong>${project.applicant.name}</strong><small>${project.applicant.role || ui.applicantRole}</small></figcaption>
          </figure>
          <div class="case-connection" aria-hidden="true"><span>${ui.submitting}</span><i>${icon('arrow')}</i></div>
          <figure class="person-card person-card--recipient">
            <div class="person-card__photo">
              ${project.recipient.photoUrl ? `<img src="${project.recipient.photoUrl}" alt="Foto ${project.recipient.name}" />` : `<span>${project.recipient.name.slice(0, 1)}</span>`}
            </div>
            <figcaption><span>${strings.recipientName.toUpperCase()}</span><strong>${project.recipient.name}</strong><small>${ui.recipientRole}</small></figcaption>
          </figure>
        </div>
        <div class="identity-file__body">
          <span class="micro-label">${ui.littleNote}</span>
          <h3>${project.applicant.nickname || project.applicant.name} → ${recipientDisplay}</h3>
          ${project.applicant.intro ? `<p>${project.applicant.intro}</p>` : ''}
          <div class="signature">
            <span>${project.applicant.nickname || project.applicant.name}</span>
            <small>${strings.signHere}</small>
          </div>
        </div>
        <span class="identity-file__verified">${ui.verified}</span>
      </article>
    </section>

    <section class="plan-section section-pad gift-page" data-page="plan" aria-labelledby="plan-title">
      <div class="section-heading reveal">
        <span>03 / 07</span>
        <div><p>${strings.plan}</p><h2 id="plan-title">${headings.planTitle}</h2></div>
      </div>
      <div class="plan-layout">
        <article class="plan-form reveal">
          <div class="plan-form__head"><span>${ui.planSheet}</span><strong>${project.requestNumber}</strong></div>
          <div class="plan-form__hero">
            <span>${ui.purpose}</span><h3>${project.request.activity}</h3>
          </div>
          <div class="plan-form__grid">
            ${detailRow(strings.date, formatGiftDate(project.request.date, project.locale), 'clock')}
            ${detailRow(strings.departure, project.request.departureTime, 'clock')}
            ${detailRow(strings.returnEstimate, project.request.returnEstimate, 'clock')}
            ${project.request.companions ? detailRow(strings.companions, project.request.companions, 'people') : ''}
            ${project.request.venue ? detailRow(strings.place, project.request.venue, 'pin') : ''}
            ${project.request.address ? detailRow(strings.address, project.request.address, 'pin') : ''}
          </div>
          ${project.request.note ? `<p class="plan-note"><span>${ui.note}</span>${project.request.note}</p>` : ''}
          ${mapUrl ? `<a class="map-link" href="${mapUrl}" target="_blank" rel="noreferrer">${icon('pin')}<span>${strings.openMaps}</span>${icon('arrow')}</a>` : ''}
        </article>
        <aside class="calendar-card reveal" aria-label="Tanggal kegiatan">
          <span>${new Intl.DateTimeFormat(dateLocale, { month: 'long' }).format(new Date(`${project.request.date}T12:00:00`)).toUpperCase()}</span>
          <strong>${new Date(`${project.request.date}T12:00:00`).getDate()}</strong>
          <small>${new Intl.DateTimeFormat(dateLocale, { weekday: 'long' }).format(new Date(`${project.request.date}T12:00:00`)).toUpperCase()}</small>
          <i>19:30 — ${project.request.returnEstimate.split('—')[0].trim()}</i>
        </aside>
      </div>
    </section>

    <section class="commitment-section section-pad gift-page" data-page="commitments" aria-labelledby="commitment-title">
      <div class="section-heading reveal">
        <span>04 / 07</span>
        <div><p>${strings.commitments}</p><h2 id="commitment-title">${headings.commitmentsTitle}</h2></div>
      </div>
      <article class="commitment-sheet reveal">
        <div class="commitment-sheet__header"><span>${ui.applicantChecklist}</span><small>${ui.checkAfterRead}</small></div>
        <ol>
          ${enabledCommitments.map((item, index) => `<li style="--delay:${index * 90}ms"><span>${icon('check')}</span><p>${item.text}</p><small>0${index + 1}</small></li>`).join('')}
        </ol>
        <div class="commitment-sheet__footer"><span>${project.applicant.nickname || project.applicant.name}</span><i></i><small>${strings.inspected}</small></div>
      </article>
    </section>

    <section class="defense-section section-pad gift-page" data-page="defense" aria-labelledby="defense-title">
      <div class="section-heading reveal">
        <span>05 / 07</span>
        <div><p>${strings.defense}</p><h2 id="defense-title">${headings.defenseTitle}</h2></div>
      </div>
      <article class="memo reveal">
        <span class="memo__tape" aria-hidden="true"></span>
        <p>“${project.defenseNote}”</p>
        <div><span>${ui.goodIntent}</span><strong>${project.applicant.nickname || project.applicant.name}</strong></div>
        <i class="memo__stamp">${ui.honestStamp.replace('\n', '<br>')}</i>
      </article>
    </section>

    <section class="decision-section section-pad gift-page" data-page="decision" aria-labelledby="decision-title">
      <div class="section-heading reveal">
        <span>06 / 07</span>
        <div><p>${strings.decision}</p><h2 id="decision-title">${headings.decisionTitle}</h2></div>
      </div>
      <article class="decision-file reveal" id="decision-file">
        <p class="document-kicker">${project.decision.eyebrow}</p>
        <h3>${project.decision.question}</h3>
        <p class="decision-file__message" id="decision-message">${ui.decisionPrompt}</p>
        <div class="decision-actions" id="decision-actions">
          <button class="approve-button" id="approve-button" type="button"><span class="button-seal">${icon('check')}</span><span><small>${ui.stampAction}</small>${project.decision.approvedLabel}</span></button>
        </div>
        <div class="decision-stamp" id="decision-stamp" aria-hidden="true"><span>${ui.approvedStamp}</span><small>${project.requestNumber}</small></div>
      </article>
    </section>

    <section class="permit-section section-pad gift-page" data-page="permit" id="permit-section" aria-labelledby="permit-title" hidden>
      <div class="section-heading reveal is-visible">
        <span>07 / 07</span>
        <div><p>${ui.completeEyebrow}</p><h2 id="permit-title">${headings.endingTitle}</h2></div>
      </div>
      <div class="permit-printer is-printing" id="permit-printer">
        <div class="permit-printer__machine"><span>${ui.office}</span><i></i></div>
        <article class="permit-card" id="permit-card">
          <div class="permit-card__top"><span>${strings.agency}</span><strong>${project.card.title}</strong><small>${project.requestNumber}</small></div>
          <div class="permit-card__approved"><span>${icon('check')}</span><div><small>${ui.status}</small><strong>${ui.approvedStamp}</strong></div></div>
          <dl>
            <div><dt>${strings.applicantName}</dt><dd>${project.applicant.name}</dd></div>
            <div><dt>${strings.date}</dt><dd>${formatGiftDate(project.request.date, project.locale)}</dd></div>
            <div><dt>${strings.departure}</dt><dd>${project.request.departureTime}</dd></div>
            <div><dt>${strings.returnEstimate}</dt><dd>${project.request.returnEstimate}</dd></div>
            <div><dt>${strings.activity}</dt><dd>${project.request.activity}</dd></div>
          </dl>
          <p>${project.card.footer || ''}</p>
          <div class="permit-card__seal"><span>APPROVED</span><small id="approval-date"></small></div>
        </article>
      </div>
      <div class="permit-actions">
        <button type="button" id="download-card">${icon('download')}<span>${strings.download}</span></button>
        <button type="button" id="share-card">${icon('share')}<span>${strings.share}</span></button>
      </div>
      <p class="action-status" id="action-status" aria-live="polite"></p>
    </section>
    </div>
    ${project.music && musicAudioUrl ? `
    <div class="audio-toggle" id="audio-toggle">
      <audio id="gift-audio" preload="metadata" src="${musicAudioUrl}"></audio>
      <button type="button" id="music-toggle" aria-label="${strings.playMusic}" title="${strings.playMusic}">${icon('musicOff')}</button>
      <p class="audio-toggle__status" id="music-status" aria-live="polite"></p>
    </div>` : ''}
    <nav class="page-navigation" aria-label="${ui.navigationLabel}">
      <button type="button" class="page-navigation__button page-navigation__button--prev" id="page-prev" aria-label="${ui.previousPage}">${icon('arrow')}</button>
      <div class="page-navigation__progress">
        <span id="page-current">01</span><i></i><span id="page-total">06</span>
      </div>
      <div class="page-navigation__dots" id="page-dots" aria-label="${ui.choosePage}"></div>
      <button type="button" class="page-navigation__button" id="page-next" aria-label="${ui.nextPage}">${icon('arrow')}</button>
    </nav>
  </main>

`;

document.documentElement.dataset.theme = project.theme;
document.documentElement.lang = project.locale;

const gate = document.querySelector<HTMLElement>('#gate');
const folder = document.querySelector<HTMLElement>('#folder');
const gift = document.querySelector<HTMLElement>('#gift');
const openFileButton = document.querySelector<HTMLButtonElement>('#open-file');
const permitSection = document.querySelector<HTMLElement>('#permit-section');
const decisionFile = document.querySelector<HTMLElement>('#decision-file');
const decisionMessage = document.querySelector<HTMLElement>('#decision-message');
const decisionActions = document.querySelector<HTMLElement>('#decision-actions');
const decisionStamp = document.querySelector<HTMLElement>('#decision-stamp');
const actionStatus = document.querySelector<HTMLElement>('#action-status');
const pageDeck = document.querySelector<HTMLElement>('#gift-pages');
const pagePrevious = document.querySelector<HTMLButtonElement>('#page-prev');
const pageNext = document.querySelector<HTMLButtonElement>('#page-next');
const pageCurrent = document.querySelector<HTMLElement>('#page-current');
const pageTotal = document.querySelector<HTMLElement>('#page-total');
const pageDots = document.querySelector<HTMLElement>('#page-dots');
const giftAudio = document.querySelector<HTMLAudioElement>('#gift-audio');
const musicPlayer = document.querySelector<HTMLElement>('#audio-toggle');
const musicToggle = document.querySelector<HTMLButtonElement>('#music-toggle');
const musicStatus = document.querySelector<HTMLElement>('#music-status');

let currentPageIndex = 0;
let pageScrollFrame = 0;

function syncMusicPlayer() {
  if (!giftAudio || !musicToggle) return;
  const isPlaying = !giftAudio.paused && !giftAudio.ended;
  musicPlayer?.classList.toggle('is-playing', isPlaying);
  const label = isPlaying ? strings.pauseMusic : strings.playMusic;
  musicToggle.innerHTML = icon(isPlaying ? 'music' : 'musicOff');
  musicToggle.setAttribute('aria-label', label);
  musicToggle.title = label;
}

function startGiftAudio() {
  if (!giftAudio) return;
  musicPlayer?.classList.remove('has-error');
  if (musicStatus) musicStatus.textContent = '';
  void giftAudio.play().catch(() => {
    musicPlayer?.classList.add('has-error');
    if (musicStatus) musicStatus.textContent = strings.musicUnavailable;
    syncMusicPlayer();
  });
}

giftAudio?.addEventListener('play', syncMusicPlayer);
giftAudio?.addEventListener('pause', syncMusicPlayer);
giftAudio?.addEventListener('ended', syncMusicPlayer);
giftAudio?.addEventListener('error', () => {
  musicPlayer?.classList.add('has-error');
  if (musicStatus) musicStatus.textContent = strings.musicUnavailable;
  syncMusicPlayer();
});

musicToggle?.addEventListener('click', () => {
  if (!giftAudio) return;
  if (giftAudio.paused) startGiftAudio();
  else giftAudio.pause();
});

function availablePages() {
  return Array.from(document.querySelectorAll<HTMLElement>('.gift-page')).filter((page) => !page.hidden);
}

function revealPage(page?: HTMLElement) {
  page?.querySelectorAll<HTMLElement>('.reveal').forEach((element, index) => {
    window.setTimeout(() => element.classList.add('is-visible'), index * 80);
  });
}

function renderPageNavigation() {
  const pages = availablePages();
  currentPageIndex = Math.max(0, Math.min(currentPageIndex, pages.length - 1));
  if (pageCurrent) pageCurrent.textContent = String(currentPageIndex + 1).padStart(2, '0');
  if (pageTotal) pageTotal.textContent = String(pages.length).padStart(2, '0');
  if (pagePrevious) pagePrevious.disabled = currentPageIndex === 0;
  if (pageNext) pageNext.disabled = currentPageIndex === pages.length - 1;
  if (pageDots) {
    pageDots.innerHTML = pages.map((page, index) => `<button type="button" data-page-dot="${index}" aria-label="${ui.openSheet} ${index + 1}: ${page.dataset.page || ''}" aria-current="${index === currentPageIndex ? 'page' : 'false'}"></button>`).join('');
    pageDots.querySelectorAll<HTMLButtonElement>('[data-page-dot]').forEach((button) => {
      button.addEventListener('click', () => goToPage(Number(button.dataset.pageDot)));
    });
  }
  revealPage(pages[currentPageIndex]);
}

function goToPage(index: number, behavior: ScrollBehavior = 'smooth') {
  const pages = availablePages();
  if (!pageDeck || !pages.length) return;
  currentPageIndex = Math.max(0, Math.min(index, pages.length - 1));
  pageDeck.scrollTo({ left: pages[currentPageIndex].offsetLeft, behavior });
  pages[currentPageIndex].scrollTo({ top: 0, behavior: 'auto' });
  renderPageNavigation();
}

function goToSection(section: string, behavior: ScrollBehavior = 'auto') {
  const target = document.querySelector<HTMLElement>(`#${CSS.escape(section)}`);
  const page = target?.closest<HTMLElement>('.gift-page') || target;
  const index = availablePages().indexOf(page as HTMLElement);
  if (index >= 0) window.setTimeout(() => goToPage(index, behavior), 80);
}

pagePrevious?.addEventListener('click', () => goToPage(currentPageIndex - 1));
pageNext?.addEventListener('click', () => goToPage(currentPageIndex + 1));
pageDeck?.addEventListener('scroll', () => {
  window.cancelAnimationFrame(pageScrollFrame);
  pageScrollFrame = window.requestAnimationFrame(() => {
    if (!pageDeck.clientWidth) return;
    const nextIndex = Math.round(pageDeck.scrollLeft / pageDeck.clientWidth);
    if (nextIndex !== currentPageIndex) {
      currentPageIndex = nextIndex;
      renderPageNavigation();
    }
  });
}, { passive: true });

document.addEventListener('keydown', (event) => {
  if (!document.body.classList.contains('gift-open')) return;
  const target = event.target as HTMLElement | null;
  if (target?.matches('input, textarea, select, button, a')) return;
  if (event.key === 'ArrowRight') { event.preventDefault(); goToPage(currentPageIndex + 1); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); goToPage(currentPageIndex - 1); }
});

if (pageParams.get('open') === '1' && pageParams.get('section') !== 'gate-title') {
  gate?.setAttribute('hidden', '');
  gift?.removeAttribute('aria-hidden');
  document.body.classList.add('gift-open');
  renderPageNavigation();
  const target = pageParams.get('section');
  if (target) goToSection(target);
}

openFileButton?.addEventListener('click', () => {
  openFileButton.disabled = true;
  startGiftAudio();
  folder?.classList.add('is-opening');
  window.setTimeout(() => {
    gift?.removeAttribute('aria-hidden');
    document.body.classList.add('gift-open');
    renderPageNavigation();
    goToPage(0, 'auto');
  }, 1050);
  window.setTimeout(() => {
    gate?.setAttribute('hidden', '');
    pageDeck?.focus({ preventScroll: true });
  }, 1750);
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('is-visible');
  });
}, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

document.querySelectorAll<HTMLElement>('.reveal').forEach((element) => observer.observe(element));

function storeResponse(response: PermitResponse) {
  localStorage.setItem(`izin-main:demo-response:${project.id}`, JSON.stringify(response));
}

document.querySelector<HTMLButtonElement>('#approve-button')?.addEventListener('click', () => {
  const now = new Date();
  storeResponse({ projectId: project.id, status: 'approved', respondedAt: now.toISOString() });
  decisionFile?.classList.add('is-approved');
  decisionStamp?.removeAttribute('aria-hidden');
  if (decisionMessage) decisionMessage.textContent = project.decision.approvedMessage;
  if (decisionActions) decisionActions.hidden = true;
  const approvalDate = document.querySelector<HTMLElement>('#approval-date');
  if (approvalDate) approvalDate.textContent = `${strings.approvedAt} ${new Intl.DateTimeFormat(dateLocale, { dateStyle: 'medium' }).format(now)}`;
  window.setTimeout(() => {
    permitSection?.removeAttribute('hidden');
    renderPageNavigation();
    goToPage(availablePages().length - 1);
  }, 780);
});

function wrapCanvasText(context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines = 5) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (context.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = test;
  }
  if (line) lines.push(line);
  lines.slice(0, maxLines).forEach((item, index) => context.fillText(item, x, y + index * lineHeight));
  return y + Math.min(lines.length, maxLines) * lineHeight;
}

async function renderPermitCard(): Promise<Blob> {
  await document.fonts.ready;
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is unavailable');
  const theme = themes[project.theme];
  context.fillStyle = theme.dark;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = theme.paper;
  context.fillRect(72, 72, 936, 1776);
  context.strokeStyle = theme.color;
  context.lineWidth = 5;
  context.strokeRect(104, 104, 872, 1712);
  context.setLineDash([12, 10]);
  context.lineWidth = 2;
  context.strokeRect(136, 136, 808, 1648);
  context.setLineDash([]);

  context.textAlign = 'center';
  context.fillStyle = theme.color;
  context.font = '600 24px "IBM Plex Mono", monospace';
  context.fillText(strings.agency.toUpperCase(), 540, 204);
  context.fillStyle = theme.ink;
  context.font = '400 76px "DM Serif Display", serif';
  const titleBottom = wrapCanvasText(context, project.card.title, 540, 286, 730, 82, 2);
  context.font = '600 24px "IBM Plex Mono", monospace';
  context.fillStyle = theme.color;
  context.fillText(project.requestNumber, 540, titleBottom + 30);

  const stampY = titleBottom + 178;
  context.beginPath();
  context.arc(540, stampY, 112, 0, Math.PI * 2);
  context.lineWidth = 9;
  context.strokeStyle = theme.color;
  context.stroke();
  context.beginPath();
  context.arc(540, stampY, 94, 0, Math.PI * 2);
  context.lineWidth = 2;
  context.stroke();
  context.font = '600 31px "IBM Plex Mono", monospace';
  context.fillText(ui.approvedStamp.toUpperCase(), 540, stampY + 10);

  const fields = [
    [strings.applicantName, project.applicant.name],
    [strings.date, formatGiftDate(project.request.date, project.locale)],
    [strings.departure, project.request.departureTime],
    [strings.returnEstimate, project.request.returnEstimate],
    [strings.activity, project.request.activity],
  ];
  let y = stampY + 192;
  for (const [label, value] of fields) {
    context.fillStyle = `${theme.color}20`;
    context.fillRect(162, y - 27, 756, 2);
    context.textAlign = 'left';
    context.fillStyle = theme.color;
    context.font = '600 20px "IBM Plex Mono", monospace';
    context.fillText(label.toUpperCase(), 176, y);
    context.fillStyle = theme.ink;
    context.font = '500 31px "Plus Jakarta Sans", sans-serif';
    y = wrapCanvasText(context, value, 176, y + 48, 728, 40, 3) + 42;
  }

  const footerY = Math.min(1645, Math.max(y + 34, 1480));
  context.strokeStyle = `${theme.color}44`;
  context.lineWidth = 2;
  context.beginPath(); context.moveTo(176, footerY - 42); context.lineTo(904, footerY - 42); context.stroke();
  context.fillStyle = theme.color;
  context.font = '400 39px "DM Serif Display", serif';
  context.textAlign = 'center';
  wrapCanvasText(context, project.card.footer || '', 540, footerY, 690, 48, 3);
  context.font = '400 19px "IBM Plex Mono", monospace';
  context.fillText(`${ui.approvedStamp.toUpperCase()} / ${new Intl.DateTimeFormat(dateLocale, { dateStyle: 'long' }).format(new Date())}`, 540, 1752);
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Unable to export PNG')), 'image/png'));
}

function downloadBlob(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `izin-main-${project.applicant.nickname?.toLowerCase() || 'approved'}.png`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

document.querySelector<HTMLButtonElement>('#download-card')?.addEventListener('click', async () => {
  try {
    actionStatus!.textContent = ui.preparingCard;
    downloadBlob(await renderPermitCard());
    actionStatus!.textContent = ui.cardReady;
  } catch {
    actionStatus!.textContent = ui.cardFailed;
  }
});

document.querySelector<HTMLButtonElement>('#share-card')?.addEventListener('click', async () => {
  try {
    actionStatus!.textContent = ui.preparingCard;
    const blob = await renderPermitCard();
    const file = new File([blob], `izin-main-${project.applicant.nickname?.toLowerCase() || 'approved'}.png`, { type: 'image/png' });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ title: project.card.title, text: `${project.request.title} — ${project.requestNumber}`, files: [file] });
      actionStatus!.textContent = ui.shareReady;
    } else {
      downloadBlob(blob);
      actionStatus!.textContent = strings.shareUnavailable;
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') actionStatus!.textContent = '';
    else actionStatus!.textContent = ui.shareFailed;
  }
});
