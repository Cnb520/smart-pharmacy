// 用户
export interface User {
  id: string;
  phone: string;
  nickname: string;
  avatar: string;
  wx_open_id?: string;
  created_at: string;
}

// 药品
export interface Drug {
  id: string;
  name: string;
  generic_name: string;
  pinyin: string;
  first_letter: string;
  is_prescription: number; // 0/1 for SQLite
  category_id: string;
  category_name: string;
  routes: string; // JSON string array
  specification: string;
  dosage: string;
  manufacturer: string;
  approval_no: string;
  barcode: string;
  image_urls: string; // JSON string array
  indication: string;
  usage: string;
  adverse_reactions: string;
  contraindication: string;
  precautions: string;
  storage: string;
  valid_period: string;
  created_at: string;
}

// 药品分类
export interface DrugCategory {
  id: string;
  name: string;
  parent_id: string | null;
  type: 'prescription' | 'otc' | 'general';
  icon: string;
}

// 文章
export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  cover_image: string;
  tags: string; // JSON string array
  source: string;
  author: string;
  view_count: number;
  comment_count: number;
  published_at: string;
}

// 评论
export interface Comment {
  id: string;
  article_id: string;
  user_id: string;
  nickname: string;
  avatar: string;
  content: string;
  created_at: string;
}

// 收藏夹
export interface FavoriteFolder {
  id: string;
  user_id: string;
  name: string;
  cover_image: string;
  item_count: number;
  created_at: string;
}

// 收藏项
export interface FavoriteItem {
  id: string;
  folder_id: string;
  drug_id: string;
  created_at: string;
}

// 浏览记录
export interface BrowseHistory {
  id: string;
  user_id: string;
  target_type: 'drug' | 'article';
  target_id: string;
  title: string;
  cover_image: string;
  created_at: string;
}
