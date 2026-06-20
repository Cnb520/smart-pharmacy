import { create } from 'zustand';
import type { User, FavoriteFolder, FavoriteItem, BrowseHistory } from '@/types';
import {
  authApi,
  setToken,
  clearToken,
  favoritesApi,
  historyApi,
  userApi,
} from '@/api';
import type { LoginResult } from '@/api';

interface AppStore {
  // 用户
  user: User | null;
  isLoggedIn: boolean;

  // 登录
  login: (phone: string, code: string) => Promise<LoginResult>;
  wechatLogin: (wxOpenId: string, nickname: string, avatar: string) => Promise<LoginResult>;
  logout: () => void;
  updateProfile: (data: { nickname?: string; avatar?: string }) => Promise<void>;

  // 搜索历史（本地 localStorage）
  searchHistory: string[];
  addSearchHistory: (keyword: string) => void;
  clearSearchHistory: () => void;

  // 浏览记录
  browseHistory: BrowseHistory[];
  loadBrowseHistory: () => Promise<void>;
  addBrowseRecord: (record: { targetType: string; targetId: string; title: string; coverImage: string }) => Promise<void>;
  clearBrowseHistory: () => void;

  // 收藏夹
  favoriteFolders: FavoriteFolder[];
  favoriteItems: FavoriteItem[];
  loadFavoriteFolders: () => Promise<void>;
  createFolder: (name: string) => Promise<void>;
  renameFolder: (id: string, name: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  toggleFavorite: (drugId: string, folderId: string) => Promise<boolean>;
  isFavorited: (drugId: string) => boolean;
  getFavoriteFoldersByDrug: (drugId: string) => FavoriteFolder[];
}

const SEARCH_HISTORY_KEY = 'pharmacy_search_history';

function loadSearchHistory(): string[] {
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSearchHistory(history: string[]): void {
  try {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
  } catch {
    // 静默失败
  }
}

export const useStore = create<AppStore>()((set, get) => ({
  // ======================== 用户 ========================
  user: null,
  isLoggedIn: false,

  login: async (phone: string, code: string) => {
    const result = await authApi.phoneLogin(phone, code);
    setToken(result.token);
    set({ user: result.user, isLoggedIn: true });
    // 登录后加载收藏夹
    try {
      const { data: folders } = await favoritesApi.getFolders();
      set({ favoriteFolders: folders });
    } catch {
      // 加载失败不影响登录
    }
    return result;
  },

  wechatLogin: async (wxOpenId: string, nickname: string, avatar: string) => {
    const result = await authApi.wechatLogin(wxOpenId, nickname, avatar);
    setToken(result.token);
    set({ user: result.user, isLoggedIn: true });
    // 登录后加载收藏夹
    try {
      const { data: folders } = await favoritesApi.getFolders();
      set({ favoriteFolders: folders });
    } catch {
      // 加载失败不影响登录
    }
    return result;
  },

  logout: () => {
    clearToken();
    set({
      user: null,
      isLoggedIn: false,
      favoriteFolders: [],
      favoriteItems: [],
      browseHistory: [],
    });
  },

  updateProfile: async (data) => {
    const { data: updated } = await userApi.updateProfile(data);
    set({ user: updated });
  },

  // ======================== 搜索历史 ========================
  searchHistory: loadSearchHistory(),

  addSearchHistory: (keyword: string) => {
    const trimmed = keyword.trim();
    if (!trimmed) return;
    const { searchHistory } = get();
    const updated = [trimmed, ...searchHistory.filter((k) => k !== trimmed)].slice(0, 20);
    set({ searchHistory: updated });
    saveSearchHistory(updated);
  },

  clearSearchHistory: () => {
    set({ searchHistory: [] });
    saveSearchHistory([]);
  },

  // ======================== 浏览记录 ========================
  browseHistory: [],

  loadBrowseHistory: async () => {
    try {
      const { data } = await historyApi.list();
      set({ browseHistory: data });
    } catch {
      // 加载失败保持当前状态
    }
  },

  addBrowseRecord: async (record) => {
    try {
      await historyApi.add(record);
    } catch {
      // 添加失败静默处理
    }
    // 乐观更新本地列表
    const { browseHistory, user } = get();
    const newRecord: BrowseHistory = {
      id: '',
      userId: user?.id ?? '',
      targetType: record.targetType as BrowseHistory['targetType'],
      targetId: record.targetId,
      title: record.title,
      coverImage: record.coverImage,
      createdAt: new Date().toISOString(),
    };
    const filtered = browseHistory.filter(
      (b) => !(b.targetId === newRecord.targetId && b.targetType === newRecord.targetType),
    );
    const updated = [newRecord, ...filtered].slice(0, 100);
    set({ browseHistory: updated });
  },

  clearBrowseHistory: () => {
    set({ browseHistory: [] });
  },

  // ======================== 收藏夹 ========================
  favoriteFolders: [],
  favoriteItems: [],

  loadFavoriteFolders: async () => {
    try {
      const { data: folders } = await favoritesApi.getFolders();
      set({ favoriteFolders: folders });
    } catch {
      // 加载失败保持当前状态
    }
  },

  createFolder: async (name: string) => {
    try {
      await favoritesApi.createFolder(name);
    } catch {
      // 创建失败静默处理
    }
    // 重新加载收藏夹
    try {
      const { data: folders } = await favoritesApi.getFolders();
      set({ favoriteFolders: folders });
    } catch {
      // 加载失败保持当前状态
    }
  },

  renameFolder: async (id: string, name: string) => {
    try {
      await favoritesApi.renameFolder(id, name);
      const { favoriteFolders } = get();
      const updated = favoriteFolders.map((f) =>
        f.id === id ? { ...f, name } : f,
      );
      set({ favoriteFolders: updated });
    } catch {
      // 重命名失败保持当前状态
    }
  },

  deleteFolder: async (id: string) => {
    try {
      await favoritesApi.deleteFolder(id);
    } catch {
      // 删除失败静默处理
    }
    const { favoriteFolders, favoriteItems } = get();
    const updatedFolders = favoriteFolders.filter((f) => f.id !== id);
    const updatedItems = favoriteItems.filter((i) => i.folderId !== id);
    set({ favoriteFolders: updatedFolders, favoriteItems: updatedItems });
  },

  toggleFavorite: async (drugId: string, folderId: string) => {
    try {
      const { data } = await favoritesApi.toggle(drugId, folderId);
      const { favoriteItems, favoriteFolders } = get();

      if (data.favorited) {
        // 添加收藏
        const newItem: FavoriteItem = {
          id: '',
          folderId,
          drugId,
          createdAt: new Date().toISOString(),
        };
        const updatedItems = [...favoriteItems, newItem];
        const updatedFolders = favoriteFolders.map((f) =>
          f.id === folderId ? { ...f, itemCount: f.itemCount + 1 } : f,
        );
        set({ favoriteItems: updatedItems, favoriteFolders: updatedFolders });
      } else {
        // 取消收藏
        const updatedItems = favoriteItems.filter(
          (i) => !(i.drugId === drugId && i.folderId === folderId),
        );
        const updatedFolders = favoriteFolders.map((f) =>
          f.id === folderId ? { ...f, itemCount: Math.max(0, f.itemCount - 1) } : f,
        );
        set({ favoriteItems: updatedItems, favoriteFolders: updatedFolders });
      }

      return data.favorited;
    } catch {
      return false;
    }
  },

  isFavorited: (drugId: string): boolean => {
    return get().favoriteItems.some((i) => i.drugId === drugId);
  },

  getFavoriteFoldersByDrug: (drugId: string): FavoriteFolder[] => {
    const { favoriteFolders, favoriteItems } = get();
    const folderIds = favoriteItems
      .filter((i) => i.drugId === drugId)
      .map((i) => i.folderId);
    return favoriteFolders.filter((f) => folderIds.includes(f.id));
  },
}));
