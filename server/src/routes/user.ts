import { Router, Response } from 'express';
import getDb from '../db';
import { authMiddleware, AuthRequest } from '../auth';

export const userRouter = Router();

// 所有路由都需要登录
userRouter.use(authMiddleware);

// GET /profile - 获取个人信息
userRouter.get('/profile', async (req: AuthRequest, res: Response) => {
  try {
    const db = await getDb();
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
    if (!user) {
      res.status(404).json({ error: '用户不存在' });
      return;
    }

    res.json({
      data: {
        id: user.id,
        phone: user.phone || '',
        nickname: user.nickname,
        avatar: user.avatar,
        wxOpenId: user.wx_open_id || '',
        createdAt: user.created_at,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// PUT /profile - 更新个人信息
userRouter.put('/profile', async (req: AuthRequest, res: Response) => {
  try {
    const db = await getDb();
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
    if (!user) {
      res.status(404).json({ error: '用户不存在' });
      return;
    }

    const { nickname, avatar } = req.body;
    const updates: string[] = [];
    const params: unknown[] = [];

    if (nickname !== undefined && nickname !== null) {
      updates.push('nickname = ?');
      params.push(nickname);
    }
    if (avatar !== undefined && avatar !== null) {
      updates.push('avatar = ?');
      params.push(avatar);
    }

    if (updates.length > 0) {
      params.push(req.userId);
      db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    }

    const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId) as Record<string, unknown>;
    if (!updated) {
      res.status(404).json({ error: '用户不存在' });
      return;
    }

    res.json({
      data: {
        id: updated.id,
        phone: updated.phone || '',
        nickname: updated.nickname,
        avatar: updated.avatar,
        wxOpenId: updated.wx_open_id || '',
        createdAt: updated.created_at,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
});
