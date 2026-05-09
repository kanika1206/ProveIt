

const BASE = process.env.NEXT_PUBLIC_API_URL || '';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('sl_token');
}

export function setToken(token: string) {
  localStorage.setItem('sl_token', token);
}

export function clearToken() {
  localStorage.removeItem('sl_token');
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }

  return res.json();
}

// Auth

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  email: string;
}

export const api = {
  auth: {
    signup: (body: { email: string; password: string; full_name?: string; college_id?: string }) =>
      request<AuthResponse>('/api/auth/signup', { method: 'POST', body: JSON.stringify(body) }),

    login: (body: { email: string; password: string }) =>
      request<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),

    logout: () => request('/api/auth/logout', { method: 'POST' }),
  },

  // Assessments

  assessments: {
    list: () => request<any[]>('/api/assessments'),

    start: (body: { assessment_type: string; question_count?: number }) =>
      request<any>('/api/assessments/start', { method: 'POST', body: JSON.stringify(body) }),

    submit: (body: { assessment_id: string; answers: Record<string, number | string> }) =>
      request<any>('/api/assessments/submit', { method: 'POST', body: JSON.stringify(body) }),

    result: (id: string) => request<any>(`/api/assessments/${id}/result`),
  },

  // Proofs

  proofs: {
    generate: (body: { commitment_id: string; threshold: number }) =>
      request<any>('/api/proofs/generate', { method: 'POST', body: JSON.stringify(body) }),

    verify: (proofId: string) => request<any>(`/api/proofs/${proofId}/verify`),

    list: () => request<any[]>('/api/proofs/my'),
  },

  // Ledger

  ledger: {
    entries: (limit = 20, offset = 0) =>
      request<any>(`/api/ledger/entries?limit=${limit}&offset=${offset}`),

    verify: () => request<any>('/api/ledger/verify'),
  },

  // Intelligence

  intel: {
    submit: (body: any) =>
      request<any>('/api/intelligence/submit', { method: 'POST', body: JSON.stringify(body) }),

    feed: (params?: { sector?: string; tier?: string }) => {
      const qs = new URLSearchParams(params as any).toString();
      return request<any>(`/api/intelligence/feed${qs ? '?' + qs : ''}`);
    },

    trends: () => request<any>('/api/intelligence/trends'),
  },

  // FL

  fl: {
    status: () => request<any>('/api/fl/status'),
    rounds: () => request<any[]>('/api/fl/rounds'),
    triggerRound: (numNodes = 5, strategy = 'fedavg') =>
      request<any>('/api/fl/trigger-round', {
        method: 'POST',
        body: JSON.stringify({ num_nodes: numNodes, strategy }),
      }),
  },

  // AI

  ai: {
    health: () => request<any>('/api/ai/health'),
    studyPlan: (assessmentId: string) => request<any>(`/api/ai/study-plan/${assessmentId}`),
  },

  // Misc

  colleges: () => request<any[]>('/api/colleges'),
  health: () => request<any>('/api/health'),
  debug: () => request<any>('/api/debug'),

  leaderboard: {
    get: (domain: string) => request<any>(`/api/leaderboard/${domain}`),
  },
};