import { Router, Request, Response } from 'express';
import getDb from '../db';
import { generateToken } from '../auth';
import { v4 as uuidv4 } from 'uuid';

export const authRouter = Router();

// POST /send-code - 发送验证码
authRouter.post('/send-code', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const { phone } = req.body;
    if (!phone || !/^1\d{10}$/.test(phone)) {
      res.status(400).json({ error: '请输入正确的手机号' });
      return;
    }

    // 检查60秒内是否已发送过
    const recent = db.prepare(
      "SELECT created_at FROM verification_codes WHERE phone = ? AND created_at > datetime('now', '-60 seconds')"
    ).get(phone);
    if (recent) {
      res.status(429).json({ error: '验证码已发送，请60秒后重试' });
      return;
    }

    // 生成6位验证码，5分钟有效期
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    db.prepare(
      'INSERT INTO verification_codes (phone, code, expires_at) VALUES (?, ?, ?)'
    ).run(phone, code, expiresAt);

    // 模拟发送短信：开发环境下打印到控制台
    console.log(`\n📱 ========== 短信验证码 ==========`);
    console.log(`   手机号：${phone}`);
    console.log(`   验证码：${code}`);
    console.log(`   有效期：5 分钟`);
    console.log(`==================================\n`);

    res.json({ data: { phone, sent: true } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// POST /login - 手机号验证码登录
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const { phone, code } = req.body;
    if (!phone) {
      res.status(400).json({ error: '手机号不能为空' });
      return;
    }
    if (!code) {
      res.status(400).json({ error: '验证码不能为空' });
      return;
    }

    // 验证验证码：查找最新一条未使用且未过期的验证码
    const record = db.prepare(
      `SELECT * FROM verification_codes
       WHERE phone = ? AND used = 0 AND expires_at > datetime('now')
       ORDER BY created_at DESC LIMIT 1`
    ).get(phone);

    if (!record) {
      res.status(400).json({ error: '验证码已过期或不存在，请重新获取' });
      return;
    }

    if (String(record.code) !== code) {
      res.status(400).json({ error: '验证码错误' });
      return;
    }

    // 标记验证码已使用
    db.prepare('UPDATE verification_codes SET used = 1 WHERE id = ?').run(record.id);

    // 查找或创建用户
    let user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);

    if (!user) {
      const id = 'user_' + uuidv4().slice(0, 12);
      const nickname = '用户' + phone.slice(-4);
      const now = new Date().toISOString();
      db.prepare('INSERT INTO users (id, phone, nickname, created_at) VALUES (?, ?, ?, ?)').run(id, phone, nickname, now);

      // 创建默认收藏夹
      const folderId = 'folder_' + uuidv4().slice(0, 12);
      db.prepare('INSERT INTO favorite_folders (id, user_id, name, created_at) VALUES (?, ?, ?, ?)').run(folderId, id, '默认收藏夹', now);

      user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
      if (!user) {
        res.status(500).json({ error: '用户创建失败' });
        return;
      }
    }

    const u = user;
    const uid = String(u.id);
    const uphone = String(u.phone || '');
    const token = generateToken({ userId: uid, phone: uphone });

    res.json({
      data: {
        user: {
          id: uid,
          phone: uphone,
          nickname: u.nickname,
          avatar: u.avatar,
          wxOpenId: u.wx_open_id || '',
          createdAt: u.created_at,
        },
        token,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// POST /wechat - 微信登录
authRouter.post('/wechat', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const { wxOpenId, nickname, avatar } = req.body;
    if (!wxOpenId) {
      res.status(400).json({ error: '微信OpenId不能为空' });
      return;
    }

    let user = db.prepare('SELECT * FROM users WHERE wx_open_id = ?').get(wxOpenId);

    if (!user) {
      const id = 'user_' + uuidv4().slice(0, 12);
      const name = nickname || '微信用户';
      const avt = avatar || '';
      const now = new Date().toISOString();
      db.prepare('INSERT INTO users (id, nickname, avatar, wx_open_id, created_at) VALUES (?, ?, ?, ?, ?)').run(id, name, avt, wxOpenId, now);

      // 创建默认收藏夹
      const folderId = 'folder_' + uuidv4().slice(0, 12);
      db.prepare('INSERT INTO favorite_folders (id, user_id, name, created_at) VALUES (?, ?, ?, ?)').run(folderId, id, '默认收藏夹', now);

      user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
      if (!user) {
        res.status(500).json({ error: '用户创建失败' });
        return;
      }
    }

    const u = user;
    const uid = String(u.id);
    const uphone = String(u.phone || '');
    const token = generateToken({ userId: uid, phone: uphone });

    res.json({
      data: {
        user: {
          id: u.id,
          phone: u.phone || '',
          nickname: u.nickname,
          avatar: u.avatar,
          wxOpenId: u.wx_open_id || '',
          createdAt: u.created_at,
        },
        token,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
});
