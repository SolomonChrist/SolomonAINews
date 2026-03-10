// API client utility for frontend

const API_BASE_URL = '/api';

export interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed: ${endpoint}`, error);
    throw error;
  }
}

export const newsAPI = {
  getRecent: (limit = 50) => apiFetch(`/news/recent?limit=${limit}`),
  getByCategory: (category: string, limit = 50) =>
    apiFetch(`/news/category/${category}?limit=${limit}`),
  search: (query: string) => apiFetch(`/news/search?q=${encodeURIComponent(query)}`),
  refresh: (category: string) => apiFetch(`/news/refresh/${category}`, { method: 'POST' }),
};

export const twitterAPI = {
  getRecent: (limit = 50) => apiFetch(`/twitter/recent?limit=${limit}`),
  search: (query: string, limit = 50) =>
    apiFetch(`/twitter/search?q=${encodeURIComponent(query)}&limit=${limit}`),
  stream: (keywords: string[]) => apiFetch(`/twitter/stream`, { method: 'POST', body: { keywords } }),
};

export const videosAPI = {
  getLive: () => apiFetch(`/videos/live`),
  searchYouTube: (query: string, limit = 20) =>
    apiFetch(`/videos/youtube/live?q=${encodeURIComponent(query)}&limit=${limit}`),
  getCached: (limit = 30) => apiFetch(`/videos/cached?limit=${limit}`),
};

export const settingsAPI = {
  getPreferences: () => apiFetch(`/settings/preferences`),
  updatePreferences: (prefs: any) =>
    apiFetch(`/settings/preferences`, { method: 'POST', body: prefs }),
  getAll: () => apiFetch(`/settings/`),
  update: (key: string, value: string) =>
    apiFetch(`/settings/${key}`, { method: 'POST', body: { value } }),
};

// WebSocket utility
export class NewsWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;

  connect(url: string = 'ws://localhost:5000'): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.attemptReconnect(url);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  subscribe(source: 'news' | 'twitter' | 'videos', category?: string): void {
    this.send({
      type: 'subscribe',
      data: { source, category },
    });
  }

  search(query: string, source: 'news' | 'twitter'): void {
    this.send({
      type: 'search',
      data: { query, source },
    });
  }

  refresh(source: 'news' | 'videos', category?: string): void {
    this.send({
      type: 'refresh',
      data: { source, category },
    });
  }

  onMessage(callback: (data: any) => void): void {
    if (this.ws) {
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          callback(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
    }
  }

  close(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private attemptReconnect(url: string): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
      );
      setTimeout(() => this.connect(url), this.reconnectDelay);
    }
  }
}
