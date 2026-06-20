import { Router, Request, Response } from 'express';
import getDb from '../db';

export const articlesRouter = Router();

function safeJsonParse(str: string, fallback: unknown) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

function parseArticle(row: Record<string, unknown>) {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    content: row.content,
    coverImage: row.cover_image,
    tags: safeJsonParse(row.tags as string, []),
    source: row.source,
    author: row.author,
    viewCount: row.view_count,
    commentCount: row.comment_count,
    publishedAt: row.published_at,
  };
}

// GET / - 文章列表
articlesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const { page = '1', pageSize = '10' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const size = Math.max(1, Math.min(100, parseInt(pageSize as string) || 10));
    const offset = (pageNum - 1) * size;

    const countRow = db.prepare('SELECT COUNT(*) as total FROM articles').get();
    const total = (countRow?.total as number) || 0;

    const rows = db.prepare('SELECT * FROM articles ORDER BY published_at DESC LIMIT ? OFFSET ?').all(size, offset);

    res.json({
      data: rows.map(parseArticle),
      total,
      page: pageNum,
      pageSize: size,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// GET /:id - 文章详情
articlesRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const row = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id);
    if (!row) {
      res.status(404).json({ error: '文章不存在' });
      return;
    }

    // 增加浏览次数
    db.prepare('UPDATE articles SET view_count = view_count + 1 WHERE id = ?').run(req.params.id);

    // 重新获取更新后的数据
    const updated = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id) as Record<string, unknown> | undefined;
    if (!updated) return res.status(404).json({ error: '文章不存在' });

    res.json({ data: parseArticle(updated) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
});
