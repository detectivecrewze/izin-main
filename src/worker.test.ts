import { describe, expect, it } from 'vitest';
import worker, { type Env } from '../worker/src/index';
import { demoProject } from './demo';

class MemoryKv {
  values = new Map<string, string>();
  async get(key: string) { return this.values.get(key) ?? null; }
  async put(key: string, value: string) { this.values.set(key, value); }
  async list(options: { prefix?: string } = {}) {
    const prefix = options.prefix || '';
    return { keys: [...this.values.keys()].filter((key) => key.startsWith(prefix)).map((name) => ({ name })), list_complete: true };
  }
}

class MemoryR2 {
  values = new Map<string, { data: ArrayBuffer; type: string }>();
  async put(key: string, value: ArrayBuffer | ReadableStream | Blob, options?: { httpMetadata?: { contentType?: string } }) {
    const data = value instanceof ArrayBuffer ? value : value instanceof Blob ? await value.arrayBuffer() : new ArrayBuffer(0);
    this.values.set(key, { data, type: options?.httpMetadata?.contentType || 'application/octet-stream' });
  }
  async get(key: string) {
    const value = this.values.get(key);
    if (!value) return null;
    return {
      body: new Blob([value.data]).stream(), httpEtag: 'test-etag',
      writeHttpMetadata(headers: Headers) { headers.set('Content-Type', value.type); },
    };
  }
}

function setup() {
  const pending: Promise<unknown>[] = [];
  const env = {
    IZIN_MAIN_KV: new MemoryKv(), MEDIA: new MemoryR2(), ADMIN_TOKEN: 'phase-3-test',
    ORDER_INGEST_SECRET: 'phase-4-ingest-test',
    ALLOWED_ORIGINS: 'http://127.0.0.1:5176', PUBLIC_APP_URL: 'https://izin.example', PUBLIC_API_URL: 'https://api.izin.example',
  } as unknown as Env;
  const context = { waitUntil(promise: Promise<unknown>) { pending.push(promise); } };
  const call = (path: string, init: RequestInit = {}) => worker.fetch(new Request(`https://api.izin.example${path}`, init), env, context);
  return { env, call, drain: () => Promise.all(pending) };
}

describe('phase 3 worker flow', () => {
  it('creates, saves, publishes, records approval, and reports status', async () => {
    const { call, drain } = setup();
    const admin = { Authorization: 'Bearer phase-3-test', 'Content-Type': 'application/json' };
    const created = await call('/v1/internal/projects', { method: 'POST', headers: admin, body: JSON.stringify({ idempotencyKey: 'order-001', projectId: 'permit-flow', locale: 'id' }) });
    expect(created.status).toBe(201);
    const creation = await created.json() as { studioUrl: string };
    const token = new URL(creation.studioUrl).searchParams.get('token')!;

    const repeated = await call('/v1/internal/projects', { method: 'POST', headers: admin, body: JSON.stringify({ idempotencyKey: 'order-001', projectId: 'different', locale: 'en' }) });
    expect((await repeated.json() as { studioUrl: string }).studioUrl).toBe(creation.studioUrl);
    expect((await call('/v1/studio/permit-flow?token=wrong')).status).toBe(401);

    const draftResponse = await call(`/v1/studio/permit-flow?token=${token}`);
    const draft = (await draftResponse.json() as { project: typeof demoProject }).project;
    draft.applicant.name = 'Adit';
    expect((await call(`/v1/studio/permit-flow/draft?token=${token}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ project: draft }) })).status).toBe(200);

    const publishable = structuredClone(demoProject);
    publishable.id = 'permit-flow';
    const published = await call(`/v1/studio/permit-flow/publish?token=${token}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ project: publishable }) });
    expect(published.status).toBe(200);
    expect((await call('/v1/gifts/permit-flow')).status).toBe(200);

    const approved = await call('/v1/responses/permit-flow', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'approved' }) });
    expect(approved.status).toBe(201);
    await drain();
    const studio = await call(`/v1/studio/permit-flow?token=${token}`);
    expect((await studio.json() as { status: string; response: { status: string } }).status).toBe('Disetujui');
    const listed = await call('/v1/internal/projects', { headers: admin });
    expect((await listed.json() as { projects: Array<{ status: string }> }).projects[0].status).toBe('Disetujui');
  });

  it('stores uploaded media below the product prefix', async () => {
    const { env, call } = setup();
    const admin = { Authorization: 'Bearer phase-3-test', 'Content-Type': 'application/json' };
    const created = await call('/v1/internal/projects', { method: 'POST', headers: admin, body: JSON.stringify({ idempotencyKey: 'upload-001', projectId: 'permit-upload', locale: 'id' }) });
    const token = new URL((await created.json() as { studioUrl: string }).studioUrl).searchParams.get('token')!;
    const uploaded = await call(`/v1/studio/permit-upload/upload?token=${token}`, { method: 'POST', headers: { 'Content-Type': 'image/webp', 'X-Filename': 'photo.webp' }, body: new Uint8Array([1, 2, 3]) });
    const result = await uploaded.json() as { key: string; url: string };
    expect(uploaded.status).toBe(201);
    expect(result.key).toMatch(/^izin-main\/permit-upload\//);
    expect((env.MEDIA as unknown as MemoryR2).values.has(result.key)).toBe(true);
  });
});

describe('phase 4 paid-order ingestion', () => {
  it('creates one Studio link per paid order and rejects invalid authorization', async () => {
    const { env, call } = setup();
    const payload = JSON.stringify({ orderId: 'ORDER-IZIN-001', customerName: 'Aldo', customerEmail: 'aldo@example.com' });
    expect((await call('/api/integrations/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload })).status).toBe(401);

    const headers = { Authorization: 'Bearer phase-4-ingest-test', 'Content-Type': 'application/json' };
    const first = await call('/api/integrations/orders', { method: 'POST', headers, body: payload });
    expect(first.status).toBe(201);
    const created = await first.json() as { created: boolean; projectId: string; studioUrl: string; giftUrl: string };
    expect(created.created).toBe(true);
    expect(created.projectId).toMatch(/^permit-/);
    expect(new URL(created.studioUrl).searchParams.get('token')).toBeTruthy();
    expect(created.giftUrl).toContain(`gift=${created.projectId}`);

    const repeated = await call('/api/integrations/orders', { method: 'POST', headers, body: payload });
    const reused = await repeated.json() as typeof created;
    expect(reused.created).toBe(false);
    expect(reused.projectId).toBe(created.projectId);
    expect(reused.studioUrl).toBe(created.studioUrl);
    expect((env.IZIN_MAIN_KV as unknown as MemoryKv).values.has('order:ORDER-IZIN-001')).toBe(true);
  });
});
