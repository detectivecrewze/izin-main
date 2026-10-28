import type { IzinMainProject, PermitResponse } from './project';

const configuredBase = String(import.meta.env.VITE_IZIN_MAIN_API_URL || '/api').replace(/\/$/, '');

export interface StudioPayload {
  project: IzinMainProject;
  response: PermitResponse | null;
  status: 'Belum diedit' | 'Draft' | 'Published' | 'Disetujui';
  updatedAt?: string;
  giftUrl?: string;
}

export interface AdminProjectSummary {
  projectId: string;
  orderId?: string;
  status: StudioPayload['status'];
  locale: 'id' | 'en';
  applicantName: string;
  recipientName: string;
  studioUrl: string;
  giftUrl?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${configuredBase}${path}`, {
    ...init,
    headers: { Accept: 'application/json', ...init.headers },
  });
  const payload = await response.json().catch(() => ({})) as { error?: string } & T;
  if (!response.ok) throw new ApiError(response.status, payload.error || `Request failed (${response.status})`);
  return payload;
}

const studioPath = (projectId: string, token: string, suffix = '') =>
  `/v1/studio/${encodeURIComponent(projectId)}${suffix}?token=${encodeURIComponent(token)}`;

export function loadStudioProject(projectId: string, token: string) {
  return apiFetch<StudioPayload>(studioPath(projectId, token));
}

export function saveStudioDraft(projectId: string, token: string, project: IzinMainProject) {
  return apiFetch<{ ok: true; updatedAt: string }>(studioPath(projectId, token, '/draft'), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project }),
  });
}

export function publishStudioGift(projectId: string, token: string, project: IzinMainProject) {
  return apiFetch<{ ok: true; giftUrl: string; publishedAt: string }>(studioPath(projectId, token, '/publish'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project }),
  });
}

export async function uploadStudioMedia(projectId: string, token: string, file: Blob, filename: string) {
  return apiFetch<{ ok: true; url: string; key: string }>(studioPath(projectId, token, '/upload'), {
    method: 'POST',
    headers: { 'Content-Type': file.type || 'application/octet-stream', 'X-Filename': filename },
    body: file,
  });
}

export function loadPublicGift(projectId: string) {
  return apiFetch<{ project: IzinMainProject }>(`/v1/gifts/${encodeURIComponent(projectId)}`);
}

export function loadPublicResponse(projectId: string) {
  return apiFetch<{ response: PermitResponse | null }>(`/v1/responses/${encodeURIComponent(projectId)}`);
}

export function approvePublicGift(projectId: string) {
  return apiFetch<{ response: PermitResponse }>(`/v1/responses/${encodeURIComponent(projectId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'approved' }),
  });
}

const adminHeaders = (token: string) => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' });

export function listAdminProjects(token: string) {
  return apiFetch<{ projects: AdminProjectSummary[] }>('/v1/internal/projects', { headers: adminHeaders(token) });
}

export function createAdminProject(token: string, input: { orderId?: string; projectId?: string; locale: 'id' | 'en'; idempotencyKey: string }) {
  return apiFetch<{ project: AdminProjectSummary; studioUrl: string }>('/v1/internal/projects', {
    method: 'POST', headers: adminHeaders(token), body: JSON.stringify(input),
  });
}

export function reissueStudioAccess(token: string, projectId: string) {
  return apiFetch<{ studioUrl: string }>(`/v1/internal/projects/${encodeURIComponent(projectId)}/reissue-access`, {
    method: 'POST', headers: adminHeaders(token),
  });
}

export function retryProjectFulfillment(token: string, projectId: string) {
  return apiFetch<{ ok: true; project: AdminProjectSummary }>(`/v1/internal/projects/${encodeURIComponent(projectId)}/retry`, {
    method: 'POST', headers: adminHeaders(token),
  });
}
