// 用户
export interface User {
  id: string;
  phone: string;
  nickname: string;
  avatar: string;
  wxOpenId?: string;
  createdAt: string;
}

// 药品
export interface Drug {
  id: string;
  name: string;
  genericName: string;
  pinyin: string;
  firstLetter: string;
  isPrescription: boolean;
  categoryId: string;
  categoryName: string;
  routes: string[];
  specification: string;
  dosage: string;
  manufacturer: string;
  approvalNo: string;
  barcode: string;
  imageUrls: string[];
  indication: string;
  usage: string;
  adverseReactions: string;
  contraindication: string;
  precautions: string;
  storage: string;
  validPeriod: string;
  createdAt: string;
}

// 药品分类
export interface DrugCategory {
  id: string;
  name: string;
  parentId: string | null;
  type: 'prescription' | 'otc' | 'general';
  icon: string;
}

// 文章
export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  coverImage: string;
  tags: string[];
  source: string;
  author: string;
  viewCount: number;
  commentCount: number;
  publishedAt: string;
}

// 评论
export interface Comment {
  id: string;
  articleId: string;
  userId: string;
  nickname: string;
  avatar: string;
  content: string;
  createdAt: string;
}

// 收藏夹
export interface FavoriteFolder {
  id: string;
  userId: string;
  name: string;
  coverImage?: string;
  itemCount: number;
  createdAt: string;
}

// 收藏项
export interface FavoriteItem {
  id: string;
  folderId: string;
  drugId: string;
  createdAt: string;
}

// 浏览记录
export interface BrowseHistory {
  id: string;
  userId: string;
  targetType: 'drug' | 'article';
  targetId: string;
  title: string;
  coverImage: string;
  createdAt: string;
}

// AI 消息
export interface AiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
