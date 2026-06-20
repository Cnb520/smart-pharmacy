import { Router, Response } from 'express';
import getDb from '../db';
import { authMiddleware, AuthRequest } from '../auth';
import { v4 as uuidv4 } from 'uuid';

export const historyRouter = Router();

// 所有路由都需要登录
historyRouter.use(authMiddleware);

function parseHistory(row: Record<string, unknown>) {
  return {
    id: row.id,
    userId: row.user_id,
    targetType: row.target_type,
    targetId: row.target_id,
    title: row.title,
    coverImage: row.cover_image,
    createdAt: row.created_at,
  };
}

// GET / - 获取浏览记录
historyRouter.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const db = await getDb();
    const limit = Math.max(1, Math.min(500, parseInt(req.query.limit as string) || 100));
    const rows = db.prepare('SELECT * FROM browse_history WHERE user_id = ? ORDER BY created_at DESC LIMIT ?').all(req.userId, limit);
    res.json({ data: rows.map(parseHistory) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// POST / - 添加浏览记录
historyRouter.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const db = await getDb();
    const { targetType, targetId, title, coverImage } = req.body;
    if (!targetType || !targetId) {
      res.status(400).json({ error: '目标类型和ID不能为空' });
      return;
    }

    // 去重：同一用户+同一targetId+同一targetType的记录先删除
    db.prepare('DELETE FROM browse_history WHERE user_id = ? AND target_id = ? AND target_type = ?').run(req.userId, targetId, targetType);

    const id = 'history_' + uuidv4().slice(0, 12);
    const now = new Date().toISOString();
    db.prepare('INSERT INTO browse_history (id, user_id, target_type, target_id, title, cover_image, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      id, req.userId, targetType, targetId, title || '', coverImage || '', now
    );

    const row = db.prepare('SELECT * FROM browse_history WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    if (!row) {
      res.status(500).json({ error: '浏览记录创建失败' });
      return;
    }

    res.status(201).json({ data: parseHistory(row) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
});
