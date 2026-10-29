export type Locale = 'id' | 'en';
export type ThemeId = 'district-office' | 'crimson-office';
export type ResponseStatus = 'pending' | 'approved';

export interface PermitCommitment {
  id: string;
  text: string;
  enabled: boolean;
  order: number;
}

export interface IzinMainProject {
  schemaVersion: 1;
  id: string;
  locale: Locale;
  theme: ThemeId;
  requestNumber: string;
  applicant: {
    name: string;
    nickname?: string;
    role?: string;
    photoUrl?: string;
    intro?: string;
  };
  recipient: {
    name: string;
    nickname?: string;
    photoUrl?: string;
  };
  music?: {
    title: string;
    artist: string;
    audioUrl: string;
    coverUrl?: string;
    source?: 'playlist' | 'upload';
  };
  request: {
    title: string;
    activity: string;
    date: string;
    departureTime: string;
    returnEstimate: string;
    companions?: string;
    venue?: string;
    address?: string;
    mapsUrl?: string;
    note?: string;
  };
  headings?: {
    openingTitle: string;
    openingEmphasis: string;
    summaryTitle: string;
    partiesTitle: string;
    planTitle: string;
    commitmentsTitle: string;
    defenseTitle: string;
    decisionTitle: string;
    endingTitle: string;
  };
  commitments: PermitCommitment[];
  defenseNote: string;
  decision: {
    eyebrow?: string;
    question: string;
    approvedLabel: string;
    approvedMessage: string;
  };
  card: {
    title: string;
    footer?: string;
  };
}

export interface PermitResponse {
  projectId: string;
  status: ResponseStatus;
  respondedAt: string;
}

export function validateProject(project: IzinMainProject, options: { allowLocalMedia?: boolean } = {}): string[] {
  const issues: string[] = [];
  if (project.schemaVersion !== 1) issues.push('Unsupported schema version');
  if (!project.id.trim()) issues.push('Project ID is required');
  if (!project.applicant.name.trim()) issues.push('Applicant name is required');
  if (!project.recipient.name.trim()) issues.push('Recipient name is required');
  if (!project.request.title.trim()) issues.push('Request title is required');
  if (!project.request.activity.trim()) issues.push('Activity is required');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(project.request.date)) issues.push('Date must use YYYY-MM-DD');
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(project.request.departureTime)) issues.push('Departure time must use HH:mm');
  if (!project.request.returnEstimate.trim()) issues.push('Return estimate is required');
  if (project.commitments.filter((item) => item.enabled && item.text.trim()).length < 2) issues.push('At least two commitments are required');
  if (!project.defenseNote.trim()) issues.push('Personal note is required');
  if (project.request.mapsUrl && !safeExternalUrl(project.request.mapsUrl)) issues.push('Maps URL must be HTTP or HTTPS');
  if (project.music) {
    if (!project.music.title.trim()) issues.push('Music title is required');
    if (!project.music.artist.trim()) issues.push('Music artist is required');
    if (!safeMediaUrl(project.music.audioUrl, options.allowLocalMedia)) issues.push('Music URL must be HTTP or HTTPS');
    if (project.music.coverUrl && !safeMediaUrl(project.music.coverUrl, options.allowLocalMedia)) issues.push('Music cover URL must be HTTP or HTTPS');
  }
  return issues;
}

export function safeMediaUrl(value?: string, allowLocalMedia = false): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (url.protocol === 'https:' || url.protocol === 'http:') return url.href;
    if (allowLocalMedia && (url.protocol === 'blob:' || url.protocol === 'data:')) return value;
    return undefined;
  } catch {
    return undefined;
  }
}

export function safeExternalUrl(value?: string): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : undefined;
  } catch {
    return undefined;
  }
}

export function formatGiftDate(date: string, locale: Locale): string {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return '—';
  return new Intl.DateTimeFormat(locale === 'id' ? 'id-ID' : 'en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(parsed);
}

export function getGiftDateParts(date: string, locale: Locale): { month: string; day: string; weekday: string } {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return { month: '—', day: '—', weekday: '—' };
  const dateLocale = locale === 'id' ? 'id-ID' : 'en-US';
  return {
    month: new Intl.DateTimeFormat(dateLocale, { month: 'long' }).format(parsed).toUpperCase(),
    day: String(parsed.getDate()),
    weekday: new Intl.DateTimeFormat(dateLocale, { weekday: 'long' }).format(parsed).toUpperCase(),
  };
}
