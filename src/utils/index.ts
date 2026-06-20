/**
 * 生成唯一ID
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * 获取中文拼音首字母
 */
export function getFirstLetter(str: string): string {
  if (!str) return '#';
  const first = str.charAt(0);
  // 简单判断：如果是英文字母直接返回大写
  if (/[a-zA-Z]/.test(first)) return first.toUpperCase();
  // 中文拼音首字母映射（常用）
  const pinyinMap: Record<string, string> = {
    '阿': 'A', '氨': 'A', '奥': 'A', '安': 'A',
    '白': 'B', '布': 'B', '苯': 'B', '丙': 'B',
    '草': 'C', '穿': 'C', '雌': 'C',
    '地': 'D', '对': 'D', '多': 'D', '丁': 'D',
    '恩': 'E', '二': 'E',
    '芬': 'F', '氟': 'F', '复': 'F',
    '甘': 'G', '格': 'G', '果': 'G',
    '红': 'H', '环': 'H', '磺': 'H',
    '甲': 'J', '金': 'J', '肌': 'J',
    '卡': 'K', '克': 'K', '口': 'K',
    '利': 'L', '氯': 'L', '罗': 'L', '雷': 'L',
    '马': 'M', '美': 'M', '吗': 'M', '莫': 'M',
    '尼': 'N', '诺': 'N', '纳': 'N',
    '欧': 'O',
    '普': 'P', '葡': 'P', '泼': 'P',
    '青': 'Q', '氢': 'Q', '曲': 'Q',
    '瑞': 'R', '乳': 'R',
    '三': 'S', '双': 'S', '沙': 'S', '舒': 'S',
    '头': 'T', '替': 'T', '酮': 'T',
    '维': 'W', '万': 'W',
    '西': 'X', '硝': 'X', '辛': 'X', '小': 'X',
    '氧': 'Y', '胰': 'Y', '乙': 'Y', '盐': 'Y', '叶': 'Y',
    '中': 'Z', '左': 'Z', '注': 'Z', '制': 'Z',
  };
  return pinyinMap[first] || first.toUpperCase();
}

/**
 * 格式化时间
 */
export function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return '刚刚';
  if (diff < hour) return `${Math.floor(diff / minute)}分钟前`;
  if (diff < day) return `${Math.floor(diff / hour)}小时前`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}天前`;

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * 防抖
 */
export function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }) as T;
}
