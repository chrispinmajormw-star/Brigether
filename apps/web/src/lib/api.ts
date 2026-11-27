const DEMO = process.env.NEXT_PUBLIC_DEMO === 'true';
const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Request failed (${res.status})`);
  }
  return res.json();
}

const realApi = {
  signup: (b: { email: string; password: string; displayName: string }) =>
    req<{ user: any }>('/auth/signup', { method: 'POST', body: JSON.stringify(b) }),
  login: (b: { email: string; password: string }) =>
    req<{ user: any }>('/auth/login', { method: 'POST', body: JSON.stringify(b) }),
  logout: () => req<{ ok: boolean }>('/auth/logout', { method: 'POST' }),
  me: () => req<{ id: string; email: string; displayName: string }>('/auth/me'),
  createMeeting: (b: { title: string; scheduledStart?: string; scheduledEnd?: string }) =>
    req<any>('/meetings', { method: 'POST', body: JSON.stringify(b) }),
  myMeetings: () => req<any[]>('/meetings/mine'),
  getMeeting: (code: string) => req<any>(`/meetings/${code}`),
  getToken: (code: string, displayName: string) =>
    req<{ token: string; url: string; room: string }>(`/meetings/${code}/token`, {
      method: 'POST',
      body: JSON.stringify({ code, displayName }),
    }),
};

// ---- Demo mode: everything lives in this browser's localStorage ----
const ls = {
  get<T>(k: string, d: T): T {
    try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; }
  },
  set(k: string, v: unknown) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
const newCode = () => {
  const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () => a[Math.floor(Math.random() * a.length)]).join('');
};
const DEMO_MEETING = { id: 'demo', code: 'DEMO1234', title: 'Weekly Sync', status: 'live', lowBandwidthDefault: false };

const demoApi: typeof realApi = {
  async signup({ email, password, displayName }) {
    const users = ls.get<any[]>('bg:users', []);
    if (users.some((u) => u.email === email)) throw new Error('Email already registered');
    const user = { id: crypto.randomUUID(), email, password, displayName };
    ls.set('bg:users', [...users, user]);
    ls.set('bg:session', user.id);
    return { user: { id: user.id, email, displayName } };
  },
  async login({ email, password }) {
    const u = ls.get<any[]>('bg:users', []).find((x) => x.email === email && x.password === password);
    if (!u) throw new Error('Invalid credentials');
    ls.set('bg:session', u.id);
    return { user: { id: u.id, email: u.email, displayName: u.displayName } };
  },
  async logout() { ls.set('bg:session', null); return { ok: true }; },
  async me() {
    const id = ls.get<string | null>('bg:session', null);
    const u = ls.get<any[]>('bg:users', []).find((x) => x.id === id);
    if (!u) throw new Error('Unauthorized');
    return { id: u.id, email: u.email, displayName: u.displayName };
  },
  async createMeeting(b) {
    const me = ls.get<string | null>('bg:session', null);
    const m = { id: crypto.randomUUID(), hostId: me, code: newCode(), title: b.title, status: 'live', lowBandwidthDefault: false, createdAt: Date.now() };
    ls.set('bg:meetings', [m, ...ls.get<any[]>('bg:meetings', [])]);
    return m;
  },
  async myMeetings() {
    const me = ls.get<string | null>('bg:session', null);
    return ls.get<any[]>('bg:meetings', []).filter((m) => m.hostId === me);
  },
  async getMeeting(code) {
    const c = code.toUpperCase();
    const m = ls.get<any[]>('bg:meetings', []).find((x) => x.code === c);
    if (m) return m;
    if (c === DEMO_MEETING.code) return DEMO_MEETING;
    throw new Error('Meeting not found (demo meetings only exist in the browser that created them)');
  },
  async getToken(code) {
    return { token: 'demo-token', url: 'demo://no-media-server', room: code.toUpperCase() };
  },
};

export const api = DEMO ? demoApi : realApi;