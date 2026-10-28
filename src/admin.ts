import '@fontsource/dm-serif-display/latin-400.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import '@fontsource/ibm-plex-mono/latin-600.css';
import '@fontsource/plus-jakarta-sans/latin-400.css';
import '@fontsource/plus-jakarta-sans/latin-600.css';
import '@fontsource/plus-jakarta-sans/latin-700.css';
import './admin.css';

import { ApiError, createAdminProject, listAdminProjects, reissueStudioAccess, retryProjectFulfillment, type AdminProjectSummary } from './api';

const app = document.querySelector<HTMLDivElement>('#app')!;
if (!app) throw new Error('App root is missing');
document.body.className = 'admin-body';
document.documentElement.lang = 'id';
document.title = 'Izin Main — Admin Internal';

const sessionKey = 'izin-main:admin-session';
let adminToken = sessionStorage.getItem(sessionKey) || '';
let projects: AdminProjectSummary[] = [];
let filter = 'Semua';

const icon = (name: 'folder' | 'lock' | 'refresh' | 'copy' | 'open' | 'plus' | 'logout' | 'alert') => {
  const paths = {
    folder: '<path d="M3 7.5h7l2.2 2.5H21v9.5H3z"/><path d="M3 7.5V5h7l2 2.5"/>',
    lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    refresh: '<path d="M20 6v5h-5M4 18v-5h5"/><path d="M6.1 9a7 7 0 0 1 11.5-2.4L20 11M4 13l2.4 4.4A7 7 0 0 0 17.9 15"/>',
    copy: '<rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
    open: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 13v7H4V6h7"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    logout: '<path d="M10 5H4v14h6M14 8l4 4-4 4M8 12h10"/>',
    alert: '<path d="M12 3 2.5 20h19z"/><path d="M12 9v4M12 17h.01"/>',
  } as const;
  return `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`;
};

function escapeHtml(value: unknown) {
  return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

function humanDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function renderLogin(error = '') {
  app.innerHTML = `<main class="admin-login">
    <section class="admin-login__paper">
      <span class="admin-tape" aria-hidden="true"></span>
      <div class="admin-login__mark">${icon('lock')}</div>
      <p class="admin-kicker">INTERNAL ACCESS</p>
      <h1>Meja administrasi Izin Main</h1>
      <p>Masukkan token admin Worker. Token hanya disimpan selama tab ini terbuka.</p>
      <form id="admin-login-form">
        <label><span>Admin token</span><input type="password" name="token" autocomplete="current-password" required /></label>
        ${error ? `<div class="admin-error">${icon('alert')}<span>${escapeHtml(error)}</span></div>` : ''}
        <button type="submit">Buka dashboard</button>
      </form>
    </section>
  </main>`;
  app.querySelector<HTMLFormElement>('#admin-login-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget as HTMLFormElement);
    adminToken = String(form.get('token') || '').trim();
    try {
      projects = (await listAdminProjects(adminToken)).projects;
      sessionStorage.setItem(sessionKey, adminToken);
      renderDashboard();
    } catch (cause) {
      renderLogin(cause instanceof ApiError && cause.status === 401 ? 'Token admin tidak valid.' : 'Dashboard belum dapat dimuat. Pastikan Worker aktif.');
    }
  });
}

function statusCount(status: string) { return projects.filter((project) => project.status === status).length; }

function renderDashboard(message = '') {
  const filtered = filter === 'Semua' ? projects : projects.filter((project) => project.status === filter);
  app.innerHTML = `<div class="admin-shell">
    <header class="admin-header">
      <a href="/" class="admin-brand"><span>${icon('folder')}</span><span><small>IZIN MAIN</small><strong>Admin Internal</strong></span></a>
      <div><button type="button" id="refresh-projects">${icon('refresh')}<span>Refresh</span></button><button type="button" id="logout-admin">${icon('logout')}<span>Keluar</span></button></div>
    </header>
    <main class="admin-main">
      <section class="admin-hero">
        <div><p class="admin-kicker">MEJA KERJA INTERNAL</p><h1>Order dan project</h1><p>Kelola akses Studio, status pengerjaan, link gift, dan error fulfillment tanpa membuka editor kedua.</p></div>
        <button type="button" id="open-create-project">${icon('plus')} Buat project manual</button>
      </section>
      ${message ? `<div class="admin-notice">${escapeHtml(message)}</div>` : ''}
      <section class="admin-metrics">
        ${['Semua', 'Belum diedit', 'Draft', 'Published', 'Disetujui'].map((status) => `<button type="button" data-filter="${status}" class="${filter === status ? 'is-active' : ''}"><span>${status}</span><strong>${status === 'Semua' ? projects.length : statusCount(status)}</strong></button>`).join('')}
      </section>
      <section class="admin-create" id="create-project-panel" hidden>
        <div><p class="admin-kicker">PROJECT MANUAL</p><h2>Buat akses Studio baru</h2><p>Data customer tetap diisi oleh customer melalui Studio. Admin hanya membuat project dan link aksesnya.</p></div>
        <form id="create-project-form">
          <label><span>Order ID <i>opsional</i></span><input name="orderId" placeholder="Contoh: INV-2026-001" /></label>
          <label><span>Project slug <i>opsional</i></span><input name="projectId" placeholder="Contoh: izin-adit" pattern="[a-zA-Z0-9-]+" /></label>
          <label><span>Bahasa awal</span><select name="locale"><option value="id">Bahasa Indonesia</option><option value="en">English</option></select></label>
          <button type="submit">${icon('plus')} Buat project</button>
        </form>
      </section>
      <section class="admin-projects">
        <div class="admin-projects__head"><div><p class="admin-kicker">PROJECT LIST</p><h2>${filtered.length} project</h2></div><span>Terakhir diperbarui otomatis setelah refresh</span></div>
        <div class="admin-table-wrap"><table><thead><tr><th>Project</th><th>Status</th><th>Pemohon → penerima</th><th>Diperbarui</th><th>Aksi</th></tr></thead>
        <tbody>${filtered.length ? filtered.map(projectRow).join('') : `<tr><td colspan="5"><div class="admin-empty">Belum ada project pada filter ini.</div></td></tr>`}</tbody></table></div>
      </section>
    </main>
  </div>`;
  bindDashboard();
}

function projectRow(project: AdminProjectSummary) {
  return `<tr data-project-id="${escapeHtml(project.projectId)}">
    <td><strong>${escapeHtml(project.projectId)}</strong><small>${escapeHtml(project.orderId || 'Tanpa Order ID')} · ${project.locale.toUpperCase()}</small>${project.error ? `<em>${icon('alert')}${escapeHtml(project.error)}</em>` : ''}</td>
    <td><span class="status-badge status-${project.status.toLowerCase().replaceAll(' ', '-')}">${escapeHtml(project.status)}</span></td>
    <td><strong>${escapeHtml(project.applicantName || 'Belum diisi')} → ${escapeHtml(project.recipientName || 'Belum diisi')}</strong></td>
    <td><time>${escapeHtml(humanDate(project.updatedAt))}</time></td>
    <td><div class="admin-actions">
      <a href="${escapeHtml(project.studioUrl)}" target="_blank" title="Buka Studio sebagai support">${icon('open')}<span>Studio</span></a>
      ${project.giftUrl ? `<button type="button" data-copy="${escapeHtml(project.giftUrl)}" title="Salin link gift">${icon('copy')}<span>Gift</span></button>` : ''}
      <button type="button" data-reissue="${escapeHtml(project.projectId)}" title="Buat ulang akses Studio">${icon('lock')}<span>Akses</span></button>
      <button type="button" data-retry="${escapeHtml(project.projectId)}" title="Retry fulfillment">${icon('refresh')}<span>Retry</span></button>
    </div></td>
  </tr>`;
}

function bindDashboard() {
  app.querySelector<HTMLButtonElement>('#logout-admin')?.addEventListener('click', () => { sessionStorage.removeItem(sessionKey); adminToken = ''; renderLogin(); });
  app.querySelector<HTMLButtonElement>('#refresh-projects')?.addEventListener('click', () => void refreshProjects());
  app.querySelector<HTMLButtonElement>('#open-create-project')?.addEventListener('click', () => {
    const panel = app.querySelector<HTMLElement>('#create-project-panel');
    if (panel) panel.hidden = !panel.hidden;
  });
  app.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach((button) => button.addEventListener('click', () => { filter = button.dataset.filter || 'Semua'; renderDashboard(); }));
  app.querySelector<HTMLFormElement>('#create-project-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget as HTMLFormElement);
    try {
      const result = await createAdminProject(adminToken, {
        orderId: String(data.get('orderId') || '').trim() || undefined,
        projectId: String(data.get('projectId') || '').trim() || undefined,
        locale: data.get('locale') === 'en' ? 'en' : 'id', idempotencyKey: crypto.randomUUID(),
      });
      await navigator.clipboard.writeText(result.studioUrl);
      await refreshProjects('Project dibuat. Link Studio sudah disalin.');
    } catch (cause) { renderDashboard(cause instanceof Error ? cause.message : 'Project belum berhasil dibuat.'); }
  });
  app.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((button) => button.addEventListener('click', async () => {
    await navigator.clipboard.writeText(button.dataset.copy || '');
    button.classList.add('is-copied'); button.querySelector('span')!.textContent = 'Tersalin';
    window.setTimeout(() => renderDashboard(), 1200);
  }));
  app.querySelectorAll<HTMLButtonElement>('[data-reissue]').forEach((button) => button.addEventListener('click', async () => {
    if (!window.confirm('Link Studio lama akan berhenti bekerja. Buat akses baru?')) return;
    try {
      const result = await reissueStudioAccess(adminToken, button.dataset.reissue || '');
      await navigator.clipboard.writeText(result.studioUrl);
      await refreshProjects('Akses Studio baru dibuat dan link sudah disalin.');
    } catch (cause) { renderDashboard(cause instanceof Error ? cause.message : 'Akses belum berhasil dibuat ulang.'); }
  }));
  app.querySelectorAll<HTMLButtonElement>('[data-retry]').forEach((button) => button.addEventListener('click', async () => {
    try { await retryProjectFulfillment(adminToken, button.dataset.retry || ''); await refreshProjects('Retry selesai.'); }
    catch (cause) { renderDashboard(cause instanceof Error ? cause.message : 'Retry belum berhasil.'); }
  }));
}

async function refreshProjects(message = '') {
  try { projects = (await listAdminProjects(adminToken)).projects; renderDashboard(message); }
  catch (cause) {
    if (cause instanceof ApiError && cause.status === 401) { sessionStorage.removeItem(sessionKey); adminToken = ''; renderLogin('Sesi admin sudah tidak berlaku.'); }
    else renderDashboard('Dashboard belum dapat diperbarui.');
  }
}

if (adminToken) void refreshProjects(); else renderLogin();
