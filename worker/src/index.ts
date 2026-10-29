import { validateProject, type IzinMainProject, type Locale, type PermitResponse } from '../../src/project';
import { createDefaultProject } from './default-project';

interface KvKey { name: string }
interface KvList { keys: KvKey[]; list_complete: boolean; cursor?: string }
interface KVNamespace {
  get(key: string, type?: 'text'): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  list(options?: { prefix?: string; cursor?: string; limit?: number }): Promise<KvList>;
}
interface R2ObjectBody { body: ReadableStream; httpEtag?: string; writeHttpMetadata(headers: Headers): void }
interface R2Bucket {
  put(key: string, value: ArrayBuffer | ReadableStream | Blob, options?: { httpMetadata?: { contentType?: string }; customMetadata?: Record<string, string> }): Promise<unknown>;
  get(key: string): Promise<R2ObjectBody | null>;
}
interface ExecutionContext { waitUntil(promise: Promise<unknown>): void }

export interface Env {
  IZIN_MAIN_KV: KVNamespace;
  MEDIA: R2Bucket;
  ADMIN_TOKEN: string;
  ORDER_INGEST_SECRET: string;
  ALLOWED_ORIGINS: string;
  PUBLIC_APP_URL: string;
  PUBLIC_API_URL: string;
}

type ProjectStatus = 'Belum diedit' | 'Draft' | 'Published' | 'Disetujui';
interface ProjectMeta {
  projectId: string;
  orderId?: string;
  status: ProjectStatus;
  locale: Locale;
  applicantName: string;
  recipientName: string;
  studioUrl: string;
  giftUrl?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}
interface StudioAccess { token: string; issuedAt: string }
interface CreateProjectInput { idempotencyKey?: string; orderId?: string; projectId?: string; locale?: Locale }
interface OrderIngestInput { orderId?: string; customerName?: string; customerEmail?: string; locale?: Locale }
interface OrderRecord {
  orderId: string;
  productId: 'izin-main';
  projectId: string;
  customerName?: string;
  customerEmail?: string;
  studioUrl: string;
  status: 'studio_ready';
  createdAt: string;
  updatedAt: string;
}

const encoder = new TextEncoder();
const json = (data: unknown, status = 200, headers: HeadersInit = {}) => new Response(JSON.stringify(data), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
});
const readJson = async <T>(request: Request): Promise<T> => {
  const size = Number(request.headers.get('content-length') || 0);
  if (size > 1_200_000) throw new HttpError(413, 'Request is too large.');
  try { return await request.json() as T; } catch { throw new HttpError(400, 'Invalid JSON body.'); }
};
class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }

const allowedOrigins = (env: Env) => env.ALLOWED_ORIGINS.split(',').map((item) => item.trim()).filter(Boolean);
function corsHeaders(request: Request, env: Env): Record<string, string> {
  const origin = request.headers.get('Origin');
  if (!origin) return {};
  if (!allowedOrigins(env).includes(origin)) throw new HttpError(403, 'Origin is not allowed.');
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'false',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Filename',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    Vary: 'Origin',
  };
}

async function safeEqual(left: string, right: string) {
  const [a, b] = await Promise.all([crypto.subtle.digest('SHA-256', encoder.encode(left)), crypto.subtle.digest('SHA-256', encoder.encode(right))]);
  const av = new Uint8Array(a); const bv = new Uint8Array(b);
  let difference = 0;
  for (let index = 0; index < av.length; index += 1) difference |= av[index] ^ bv[index];
  return difference === 0;
}
const token = () => `${crypto.randomUUID().replaceAll('-', '')}${crypto.randomUUID().replaceAll('-', '')}`;
const cleanId = (value: string) => value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 72);
const getJson = async <T>(kv: KVNamespace, key: string) => {
  const value = await kv.get(key, 'text');
  return value ? JSON.parse(value) as T : null;
};
const putJson = (kv: KVNamespace, key: string, value: unknown) => kv.put(key, JSON.stringify(value));
const studioUrl = (env: Env, projectId: string, accessToken: string) => `${env.PUBLIC_APP_URL.replace(/\/$/, '')}/studio/${encodeURIComponent(projectId)}?token=${encodeURIComponent(accessToken)}`;
const giftUrl = (env: Env, projectId: string, request?: Request) => {
  const origin = request?.headers.get('Origin');
  const localOrigin = origin && allowedOrigins(env).includes(origin) && ['localhost', '127.0.0.1'].includes(new URL(origin).hostname)
    ? origin
    : env.PUBLIC_APP_URL.replace(/\/$/, '');
  return `${localOrigin}/?gift=${encodeURIComponent(projectId)}`;
};

async function requireAdmin(request: Request, env: Env) {
  const header = request.headers.get('Authorization') || '';
  const supplied = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!supplied || !env.ADMIN_TOKEN || !(await safeEqual(supplied, env.ADMIN_TOKEN))) throw new HttpError(401, 'Admin access is required.');
}

async function requireOrderIngest(request: Request, env: Env) {
  const header = request.headers.get('Authorization') || '';
  const supplied = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!supplied || !env.ORDER_INGEST_SECRET || !(await safeEqual(supplied, env.ORDER_INGEST_SECRET))) {
    throw new HttpError(401, 'Order integration access is required.');
  }
}

async function requireStudioAccess(env: Env, projectId: string, supplied: string | null) {
  const access = await getJson<StudioAccess>(env.IZIN_MAIN_KV, `studio-access:${projectId}`);
  if (!access || !supplied || !(await safeEqual(supplied, access.token))) throw new HttpError(401, 'Studio link is invalid or no longer active.');
  return access;
}

async function rateLimit(request: Request, env: Env, bucket: string, limit: number) {
  const address = request.headers.get('CF-Connecting-IP') || 'local';
  const window = Math.floor(Date.now() / 60_000);
  const key = `rate:${bucket}:${address}:${window}`;
  const current = Number((await env.IZIN_MAIN_KV.get(key, 'text')) || 0) + 1;
  if (current > limit) throw new HttpError(429, 'Too many requests. Please wait a moment.');
  await env.IZIN_MAIN_KV.put(key, String(current), { expirationTtl: 120 });
}

async function updateMeta(env: Env, projectId: string, update: Partial<ProjectMeta>) {
  const current = await getJson<ProjectMeta>(env.IZIN_MAIN_KV, `project-meta:${projectId}`);
  if (!current) throw new HttpError(404, 'Project was not found.');
  const next = { ...current, ...update, updatedAt: new Date().toISOString() };
  await putJson(env.IZIN_MAIN_KV, `project-meta:${projectId}`, next);
  return next;
}

function validateIncomingProject(project: IzinMainProject, projectId: string) {
  if (project.id !== projectId) throw new HttpError(400, 'Project ID does not match the Studio URL.');
  const issues = validateProject(project);
  if (issues.length) throw new HttpError(422, issues.join(' '));
}

function validateIncomingDraft(project: IzinMainProject, projectId: string) {
  if (!project || typeof project !== 'object') throw new HttpError(400, 'Draft payload is invalid.');
  if (project.id !== projectId) throw new HttpError(400, 'Project ID does not match the Studio URL.');
  if (project.schemaVersion !== 1) throw new HttpError(422, 'Unsupported schema version.');
  if (project.locale !== 'id' && project.locale !== 'en') throw new HttpError(422, 'Draft locale is invalid.');
  if (project.theme !== 'district-office' && project.theme !== 'crimson-office') throw new HttpError(422, 'Draft theme is invalid.');
  if (!project.applicant || !project.recipient || !project.request || !project.decision || !project.card || !Array.isArray(project.commitments)) {
    throw new HttpError(422, 'Draft structure is incomplete.');
  }
}

async function listAllMeta(env: Env) {
  const projects: ProjectMeta[] = [];
  let cursor: string | undefined;
  do {
    const page = await env.IZIN_MAIN_KV.list({ prefix: 'project-meta:', cursor, limit: 250 });
    const values = await Promise.all(page.keys.map((key) => getJson<ProjectMeta>(env.IZIN_MAIN_KV, key.name)));
    projects.push(...values.filter((value): value is ProjectMeta => Boolean(value)));
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  return projects.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

async function createProjectFromInput(body: CreateProjectInput, env: Env) {
  const idempotencyKey = String(body.idempotencyKey || '').trim().slice(0, 128);
  if (!idempotencyKey) throw new HttpError(400, 'idempotencyKey is required.');
  const existingId = await env.IZIN_MAIN_KV.get(`idempotency:${idempotencyKey}`, 'text');
  if (existingId) {
    const [meta, access] = await Promise.all([
      getJson<ProjectMeta>(env.IZIN_MAIN_KV, `project-meta:${existingId}`),
      getJson<StudioAccess>(env.IZIN_MAIN_KV, `studio-access:${existingId}`),
    ]);
    if (meta && access) return { project: meta, studioUrl: studioUrl(env, existingId, access.token), idempotent: true };
  }

  const locale: Locale = body.locale === 'en' ? 'en' : 'id';
  const requestedId = body.projectId ? cleanId(body.projectId) : '';
  const projectId = requestedId || `permit-${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}`;
  if (!projectId) throw new HttpError(400, 'projectId is invalid.');
  if (await env.IZIN_MAIN_KV.get(`project-meta:${projectId}`, 'text')) throw new HttpError(409, 'Project ID is already in use.');
  const access: StudioAccess = { token: token(), issuedAt: new Date().toISOString() };
  const project = createDefaultProject(projectId, locale);
  const now = new Date().toISOString();
  const meta: ProjectMeta = {
    projectId, orderId: body.orderId?.trim() || undefined, status: 'Belum diedit', locale,
    applicantName: '', recipientName: '', studioUrl: studioUrl(env, projectId, access.token), createdAt: now, updatedAt: now,
  };
  await Promise.all([
    putJson(env.IZIN_MAIN_KV, `draft:${projectId}`, project),
    putJson(env.IZIN_MAIN_KV, `studio-access:${projectId}`, access),
    putJson(env.IZIN_MAIN_KV, `project-meta:${projectId}`, meta),
    env.IZIN_MAIN_KV.put(`idempotency:${idempotencyKey}`, projectId),
  ]);
  return { project: meta, studioUrl: meta.studioUrl, idempotent: false };
}

async function createProject(request: Request, env: Env) {
  await requireAdmin(request, env);
  return createProjectFromInput(await readJson<CreateProjectInput>(request), env);
}

async function ingestPaidOrder(request: Request, env: Env) {
  await requireOrderIngest(request, env);
  const body = await readJson<OrderIngestInput>(request);
  const orderId = String(body.orderId || '').trim().slice(0, 128);
  if (!orderId) throw new HttpError(400, 'orderId is required.');
  if (!/^[A-Za-z0-9._:-]+$/.test(orderId)) throw new HttpError(400, 'orderId contains unsupported characters.');

  const existingOrder = await getJson<OrderRecord>(env.IZIN_MAIN_KV, `order:${orderId}`);
  if (existingOrder) {
    return {
      created: false,
      projectId: existingOrder.projectId,
      studioUrl: existingOrder.studioUrl,
      giftUrl: giftUrl(env, existingOrder.projectId),
    };
  }

  const locale: Locale = body.locale === 'en' ? 'en' : 'id';
  const creation = await createProjectFromInput({
    idempotencyKey: `${orderId}:izin-main`,
    orderId,
    locale,
  }, env);
  const now = new Date().toISOString();
  const order: OrderRecord = {
    orderId,
    productId: 'izin-main',
    projectId: creation.project.projectId,
    customerName: String(body.customerName || '').trim().slice(0, 160) || undefined,
    customerEmail: String(body.customerEmail || '').trim().toLowerCase().slice(0, 254) || undefined,
    studioUrl: creation.studioUrl,
    status: 'studio_ready',
    createdAt: now,
    updatedAt: now,
  };
  await putJson(env.IZIN_MAIN_KV, `order:${orderId}`, order);
  return {
    created: !creation.idempotent,
    projectId: order.projectId,
    studioUrl: order.studioUrl,
    giftUrl: giftUrl(env, order.projectId),
  };
}

async function handle(request: Request, env: Env, context: ExecutionContext) {
  const url = new URL(request.url);
  const path = url.pathname;
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(request, env) });
  const cors = corsHeaders(request, env);
  if (path === '/health') return json({ ok: true, service: 'izin-main-worker' }, 200, cors);
  if (path === '/api/integrations/orders' && request.method === 'POST') {
    return json(await ingestPaidOrder(request, env), 201, cors);
  }

  if (path === '/v1/internal/projects' && request.method === 'GET') {
    await requireAdmin(request, env);
    return json({ projects: await listAllMeta(env) }, 200, cors);
  }
  if (path === '/v1/internal/projects' && request.method === 'POST') return json(await createProject(request, env), 201, cors);

  const internalMatch = path.match(/^\/v1\/internal\/projects\/([^/]+)\/(reissue-access|retry)$/);
  if (internalMatch && request.method === 'POST') {
    await requireAdmin(request, env);
    const projectId = decodeURIComponent(internalMatch[1]);
    if (!await env.IZIN_MAIN_KV.get(`project-meta:${projectId}`, 'text')) throw new HttpError(404, 'Project was not found.');
    if (internalMatch[2] === 'reissue-access') {
      const access: StudioAccess = { token: token(), issuedAt: new Date().toISOString() };
      await putJson(env.IZIN_MAIN_KV, `studio-access:${projectId}`, access);
      const meta = await updateMeta(env, projectId, { studioUrl: studioUrl(env, projectId, access.token) });
      return json({ studioUrl: meta.studioUrl }, 200, cors);
    }
    let draft = await getJson<IzinMainProject>(env.IZIN_MAIN_KV, `draft:${projectId}`);
    if (!draft) {
      const meta = await getJson<ProjectMeta>(env.IZIN_MAIN_KV, `project-meta:${projectId}`);
      draft = createDefaultProject(projectId, meta?.locale || 'id');
      await putJson(env.IZIN_MAIN_KV, `draft:${projectId}`, draft);
    }
    const project = await updateMeta(env, projectId, { error: undefined });
    return json({ ok: true, project }, 200, cors);
  }

  const studioMatch = path.match(/^\/v1\/studio\/([^/]+)(?:\/(draft|publish|upload))?$/);
  if (studioMatch) {
    await rateLimit(request, env, 'studio', 180);
    const projectId = decodeURIComponent(studioMatch[1]);
    await requireStudioAccess(env, projectId, url.searchParams.get('token'));
    const action = studioMatch[2];
    if (!action && request.method === 'GET') {
      const [project, response, meta] = await Promise.all([
        getJson<IzinMainProject>(env.IZIN_MAIN_KV, `draft:${projectId}`),
        getJson<PermitResponse>(env.IZIN_MAIN_KV, `response:${projectId}`),
        getJson<ProjectMeta>(env.IZIN_MAIN_KV, `project-meta:${projectId}`),
      ]);
      if (!project || !meta) throw new HttpError(404, 'Project was not found.');
      return json({ project, response, status: meta.status, updatedAt: meta.updatedAt, giftUrl: meta.giftUrl }, 200, cors);
    }
    if (action === 'draft' && request.method === 'PUT') {
      const { project } = await readJson<{ project: IzinMainProject }>(request);
      validateIncomingDraft(project, projectId);
      await putJson(env.IZIN_MAIN_KV, `draft:${projectId}`, project);
      const meta = await updateMeta(env, projectId, {
        status: 'Draft', locale: project.locale, applicantName: project.applicant.name, recipientName: project.recipient.name, error: undefined,
      });
      return json({ ok: true, updatedAt: meta.updatedAt }, 200, cors);
    }
    if (action === 'publish' && request.method === 'POST') {
      const { project } = await readJson<{ project: IzinMainProject }>(request);
      validateIncomingProject(project, projectId);
      const response = await getJson<PermitResponse>(env.IZIN_MAIN_KV, `response:${projectId}`);
      const publishedAt = new Date().toISOString();
      await Promise.all([putJson(env.IZIN_MAIN_KV, `draft:${projectId}`, project), putJson(env.IZIN_MAIN_KV, `gift:${projectId}`, { project, publishedAt })]);
      await updateMeta(env, projectId, {
        status: response ? 'Disetujui' : 'Published', locale: project.locale, applicantName: project.applicant.name,
        recipientName: project.recipient.name, giftUrl: giftUrl(env, projectId, request), error: undefined,
      });
      return json({ ok: true, giftUrl: giftUrl(env, projectId, request), publishedAt }, 200, cors);
    }
    if (action === 'upload' && request.method === 'POST') {
      const type = (request.headers.get('Content-Type') || '').split(';')[0].toLowerCase();
      const allowed: Record<string, { ext: string; max: number }> = {
        'image/jpeg': { ext: 'jpg', max: 8_000_000 }, 'image/png': { ext: 'png', max: 8_000_000 }, 'image/webp': { ext: 'webp', max: 8_000_000 },
        'image/heic': { ext: 'heic', max: 8_000_000 }, 'image/heif': { ext: 'heif', max: 8_000_000 }, 'audio/mpeg': { ext: 'mp3', max: 20_000_000 },
        'audio/mp4': { ext: 'm4a', max: 20_000_000 }, 'audio/x-m4a': { ext: 'm4a', max: 20_000_000 }, 'audio/wav': { ext: 'wav', max: 20_000_000 },
      };
      const rule = allowed[type];
      if (!rule) throw new HttpError(415, 'This file type is not supported.');
      const size = Number(request.headers.get('Content-Length') || 0);
      if (size && size > rule.max) throw new HttpError(413, 'The file is too large.');
      const data = await request.arrayBuffer();
      if (!data.byteLength || data.byteLength > rule.max) throw new HttpError(413, 'The file is empty or too large.');
      const key = `izin-main/${projectId}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${rule.ext}`;
      const originalName = (request.headers.get('X-Filename') || 'upload').replace(/[^a-zA-Z0-9._ -]/g, '').slice(0, 120);
      await env.MEDIA.put(key, data, { httpMetadata: { contentType: type }, customMetadata: { projectId, originalName } });
      // Media must be served by the same Worker environment that received the
      // upload. In local development this keeps local R2 objects on localhost;
      // in production the request origin is the deployed Worker domain.
      const mediaBaseUrl = new URL(request.url).origin;
      return json({ ok: true, key, url: `${mediaBaseUrl}/v1/media/${key}` }, 201, cors);
    }
  }

  const giftMatch = path.match(/^\/v1\/gifts\/([^/]+)$/);
  if (giftMatch && request.method === 'GET') {
    await rateLimit(request, env, 'public', 90);
    const record = await getJson<{ project: IzinMainProject; publishedAt: string }>(env.IZIN_MAIN_KV, `gift:${decodeURIComponent(giftMatch[1])}`);
    if (!record) throw new HttpError(404, 'Gift was not found.');
    return json(record, 200, { ...cors, 'Cache-Control': 'public, max-age=60' });
  }

  const responseMatch = path.match(/^\/v1\/responses\/([^/]+)$/);
  if (responseMatch) {
    await rateLimit(request, env, 'response', 45);
    const projectId = decodeURIComponent(responseMatch[1]);
    if (!await env.IZIN_MAIN_KV.get(`gift:${projectId}`, 'text')) throw new HttpError(404, 'Gift was not found.');
    if (request.method === 'GET') return json({ response: await getJson<PermitResponse>(env.IZIN_MAIN_KV, `response:${projectId}`) }, 200, cors);
    if (request.method === 'POST') {
      const body = await readJson<{ status?: string }>(request);
      if (body.status !== 'approved') throw new HttpError(400, 'Only the approved response is supported.');
      const existing = await getJson<PermitResponse>(env.IZIN_MAIN_KV, `response:${projectId}`);
      const response = existing || { projectId, status: 'approved' as const, respondedAt: new Date().toISOString() };
      if (!existing) await putJson(env.IZIN_MAIN_KV, `response:${projectId}`, response);
      context.waitUntil(updateMeta(env, projectId, { status: 'Disetujui' }));
      return json({ response }, existing ? 200 : 201, cors);
    }
  }

  if (path.startsWith('/v1/media/') && request.method === 'GET') {
    const key = decodeURIComponent(path.slice('/v1/media/'.length));
    if (!key.startsWith('izin-main/')) throw new HttpError(404, 'Media was not found.');
    const object = await env.MEDIA.get(key);
    if (!object) throw new HttpError(404, 'Media was not found.');
    const headers = new Headers({ ...cors, 'Cache-Control': 'public, max-age=31536000, immutable', ETag: object.httpEtag || '' });
    object.writeHttpMetadata(headers);
    return new Response(object.body, { headers });
  }

  throw new HttpError(404, 'Endpoint was not found.');
}

export default {
  async fetch(request: Request, env: Env, context: ExecutionContext) {
    try { return await handle(request, env, context); }
    catch (error) {
      const status = error instanceof HttpError ? error.status : 500;
      const message = error instanceof Error && status < 500 ? error.message : 'Unexpected server error.';
      let cors: HeadersInit = {};
      try { cors = corsHeaders(request, env); } catch { /* preserve original error */ }
      return json({ error: message }, status, cors);
    }
  },
};
