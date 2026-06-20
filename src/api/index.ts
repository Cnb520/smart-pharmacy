import type {
  User,
  Drug,
  Article,
  Comment,
  FavoriteFolder,
  BrowseHistory,
} from '@/types';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

let authToken = localStorage.getItem('auth_token') || '';

export function setToken(token: string) {
  authToken = token;
  localStorage.setItem('auth_token', token);
}

export function clearToken() {
  authToken = '';
  localStorage.removeItem('auth_token');
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || '请求失败');
  }
  return json;
}

// ====== 认证 ======
export interface LoginResult { user: User; token: string }

export const authApi = {
  sendCode(phone: string): Promise<{ data: { phone: string; sent: boolean } }> {
    return request<{ data: { phone: string; sent: boolean } }>('/auth/send-code', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  },
  phoneLogin(phone: string, code: string): Promise<LoginResult> {
    return request<{ data: LoginResult }>(`/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ phone, code }),
    }).then(r => r.data);
  },
  wechatLogin(wxOpenId: string, nickname: string, avatar?: string): Promise<LoginResult> {
    return request<{ data: LoginResult }>(`/auth/wechat`, {
      method: 'POST',
      body: JSON.stringify({ wxOpenId, nickname, avatar }),
    }).then(r => r.data);
  },
};

// ====== 药品 ======
export interface DrugListResult { data: Drug[]; total: number; page: number; pageSize: number }

export const drugsApi = {
  list(params?: {
    keyword?: string; category?: string; isPrescription?: string;
    route?: string; firstLetter?: string; page?: number; pageSize?: number;
  }): Promise<DrugListResult> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') searchParams.set(k, String(v));
      });
    }
    const qs = searchParams.toString();
    return request<DrugListResult>(`/drugs${qs ? '?' + qs : ''}`);
  },
  detail(id: string): Promise<{ data: Drug }> {
    return request<{ data: Drug }>(`/drugs/${id}`);
  },
};

// ====== 文章 ======
export interface ArticleListResult { data: Article[]; total: number; page: number; pageSize: number }

export const articlesApi = {
  list(page = 1, pageSize = 10): Promise<ArticleListResult> {
    return request<ArticleListResult>(`/articles?page=${page}&pageSize=${pageSize}`);
  },
  detail(id: string): Promise<{ data: Article }> {
    return request<{ data: Article }>(`/articles/${id}`);
  },
};

// ====== 评论 ======
export const commentsApi = {
  list(articleId: string): Promise<{ data: Comment[] }> {
    return request<{ data: Comment[] }>(`/comments/article/${articleId}`);
  },
  create(articleId: string, content: string): Promise<{ data: Comment }> {
    return request<{ data: Comment }>('/comments', {
      method: 'POST',
      body: JSON.stringify({ articleId, content }),
    });
  },
  remove(id: string): Promise<void> {
    return request<void>(`/comments/${id}`, { method: 'DELETE' });
  },
};

// ====== 收藏夹 ======
export const favoritesApi = {
  getFolders(): Promise<{ data: FavoriteFolder[] }> {
    return request<{ data: FavoriteFolder[] }>('/favorites/folders');
  },
  createFolder(name: string): Promise<{ data: FavoriteFolder }> {
    return request<{ data: FavoriteFolder }>('/favorites/folders', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },
  renameFolder(id: string, name: string): Promise<void> {
    return request<void>(`/favorites/folders/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  },
  deleteFolder(id: string): Promise<void> {
    return request<void>(`/favorites/folders/${id}`, { method: 'DELETE' });
  },
  getItems(folderId: string): Promise<{ data: Drug[] }> {
    return request<{ data: Drug[] }>(`/favorites/folders/${folderId}/items`);
  },
  toggle(drugId: string, folderId: string): Promise<{ data: { favorited: boolean } }> {
    return request<{ data: { favorited: boolean } }>('/favorites/items', {
      method: 'POST',
      body: JSON.stringify({ drugId, folderId }),
    });
  },
  check(drugId: string): Promise<{ data: { favorited: boolean; folders: FavoriteFolder[] } }> {
    return request<{ data: { favorited: boolean; folders: FavoriteFolder[] } }>(`/favorites/items/check/${drugId}`);
  },
};

// ====== 浏览记录 ======
export const historyApi = {
  list(limit = 100): Promise<{ data: BrowseHistory[] }> {
    return request<{ data: BrowseHistory[] }>(`/history?limit=${limit}`);
  },
  add(record: { targetType: string; targetId: string; title: string; coverImage: string }): Promise<void> {
    return request<void>('/history', {
      method: 'POST',
      body: JSON.stringify(record),
    });
  },
};

// ====== 用户 ======
export const userApi = {
  getProfile(): Promise<{ data: User }> {
    return request<{ data: User }>('/user/profile');
  },
  updateProfile(data: { nickname?: string; avatar?: string }): Promise<{ data: User }> {
    return request<{ data: User }>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};
