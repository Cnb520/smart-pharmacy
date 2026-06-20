import { Router, Request, Response } from 'express';
import getDb from '../db';
import { authMiddleware, AuthRequest } from '../auth';
import { v4 as uuidv4 } from 'uuid';

export const commentsRouter = Router();

function parseComment(row: Record<string, unknown>) {
  return {
    id: row.id,
    articleId: row.article_id,
    userId: row.user_id,
    nickname: row.nickname,
    avatar: row.avatar,
    content: row.content,
    createdAt: row.created_at,
  };
}

// GET /article/:articleId - 获取文章评论
commentsRouter.get('/article/:articleId', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const rows = db.prepare('SELECT * FROM comments WHERE article_id = ? ORDER BY created_at DESC').all(req.params.articleId);
    res.json({ data: rows.map(parseComment) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// POST / - 发表评论（需要登录）
commentsRouter.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const db = await getDb();
    const { articleId, content } = req.body;
    if (!articleId || !content) {
      res.status(400).json({ error: '文章ID和评论内容不能为空' });
      return;
    }

    // 检查文章是否存在
    const article = db.prepare('SELECT id FROM articles WHERE id = ?').get(articleId);
    if (!article) {
      res.status(404).json({ error: '文章不存在' });
      return;
    }

    // 获取用户信息
    const user = db.prepare('SELECT nickname, avatar FROM users WHERE id = ?').get(req.userId);
    if (!user) {
      res.status(404).json({ error: '用户不存在' });
      return;
    }

    const id = 'comment_' + uuidv4().slice(0, 12);
    const now = new Date().toISOString();
    db.prepare('INSERT INTO comments (id, article_id, user_id, nickname, avatar, content, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      id, articleId, req.userId, user.nickname, user.avatar, content, now
    );

    // 更新文章评论数
    db.prepare('UPDATE articles SET comment_count = comment_count + 1 WHERE id = ?').run(articleId);

    const row = db.prepare('SELECT * FROM comments WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    if (!row) {
      res.status(500).json({ error: '评论创建失败' });
      return;
    }

    res.status(201).json({ data: parseComment(row) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// DELETE /:id - 删除评论（需要登录，只能删自己的）
commentsRouter.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const db = await getDb();
    const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(req.params.id);
    if (!comment) {
      res.status(404).json({ error: '评论不存在' });
      return;
    }

    if (comment.user_id !== req.userId) {
      res.status(403).json({ error: '只能删除自己的评论' });
      return;
    }

    db.prepare('DELETE FROM comments WHERE id = ?').run(req.params.id);

    // 更新文章评论数
    db.prepare('UPDATE articles SET comment_count = MAX(0, comment_count - 1) WHERE id = ?').run(comment.article_id);

    res.json({ data: null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
});
