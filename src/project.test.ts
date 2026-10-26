import { describe, expect, it } from 'vitest';
import { demoProject } from './demo';
import { formatGiftDate, safeExternalUrl, validateProject } from './project';
import { studioText } from './studio-copy';

describe('project contract', () => {
  it('accepts the demo project', () => expect(validateProject(demoProject)).toEqual([]));
  it('requires at least two commitments', () => {
    const project = structuredClone(demoProject);
    project.commitments = project.commitments.map((item, index) => ({ ...item, enabled: index === 0 }));
    expect(validateProject(project)).toContain('At least two commitments are required');
  });
  it('rejects unsafe map URLs', () => expect(safeExternalUrl('javascript:alert(1)')).toBeUndefined());
  it('rejects unsafe music URLs', () => {
    const project = structuredClone(demoProject);
    project.music!.audioUrl = 'javascript:alert(1)';
    expect(validateProject(project)).toContain('Music URL must be HTTP or HTTPS');
  });
  it('accepts an empty optional location, address, maps link, and companion list', () => {
    const project = structuredClone(demoProject);
    project.request.companions = undefined;
    project.request.venue = undefined;
    project.request.address = undefined;
    project.request.mapsUrl = undefined;
    expect(validateProject(project)).toEqual([]);
  });
  it('formats Indonesian dates', () => expect(formatGiftDate('2026-11-14', 'id')).toContain('14 November 2026'));
  it('keeps Indonesian and English Studio copy in parity', () => {
    expect(Object.keys(studioText('en')).sort()).toEqual(Object.keys(studioText('id')).sort());
  });
});
