const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') || '/api';

export class ApiClientError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const json = await res.json();
    if (!res.ok || json.success === false) {
      throw new ApiClientError(
        res.status,
        json?.error?.message || res.statusText,
        json?.error?.details
      );
    }
    return json.data as T;
  }

  if (!res.ok) {
    throw new ApiClientError(res.status, res.statusText);
  }

  return undefined as T;
}

export const api = {
  health: () => request<{ status: string }>('/health'),

  listItems: (params: Record<string, string | number | undefined>) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') qs.set(key, String(value));
    });
    return request<{ items: import('../types').LearningItem[]; pagination: import('../types').Pagination }>(
      `/items?${qs.toString()}`
    );
  },

  getItem: (id: string) =>
    request<{ item: import('../types').LearningItem; review: import('../types').ReviewState | null }>(
      `/items/${id}`
    ),

  createItem: (body: unknown) =>
    request<import('../types').LearningItem>('/items', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  updateItem: (id: string, body: unknown) =>
    request<import('../types').LearningItem>(`/items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  deleteItem: (id: string) =>
    request<{ deleted: boolean }>(`/items/${id}`, { method: 'DELETE' }),

  uploadAudio: (id: string, blob: Blob, filename: string) => {
    const form = new FormData();
    form.append('audio', blob, filename);
    return request<{ audioRecordingPath: string; audioMimeType: string }>(`/items/${id}/audio`, {
      method: 'POST',
      body: form,
    });
  },

  deleteAudio: (id: string) =>
    request<{ deleted: boolean }>(`/items/${id}/audio`, { method: 'DELETE' }),

  audioUrl: (id: string) => `${API_BASE}/items/${id}/audio`,

  dueReviews: (params: Record<string, string | number | undefined> = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') qs.set(key, String(value));
    });
    return request<
      Array<{ item: import('../types').LearningItem; review: import('../types').ReviewState }>
    >(`/reviews/due?${qs.toString()}`);
  },

  completeReview: (itemId: string, rating: import('../types').ReviewRating) =>
    request('/reviews/' + itemId + '/complete', {
      method: 'POST',
      body: JSON.stringify({ rating }),
    }),

  stats: () => request<import('../types').Stats>('/stats'),

  exportData: () => request<unknown>('/export'),

  importData: (payload: unknown) =>
    request<{ created: number; skipped: number; errors: unknown[] }>('/import', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
