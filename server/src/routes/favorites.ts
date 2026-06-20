import { Router, Response } from 'express';
import getDb from '../db';
import { authMiddleware, AuthRequest } from '../auth';
import { v4 as uuidv4 } from 'uuid';

export const favoritesRouter = Router();

// 所有路由都需要登录
favoritesRouter.use(authMiddleware);

function parseFolder(row: Record<string, unknown>) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    coverImage: row.cover_image || '',
    itemCount: row.item_count,
    createdAt: row.created_at,
  };
}

function safeJsonParse(str: string, fallback: unknown) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

function parseDrug(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    genericName: row.generic_name,
    pinyin: row.pinyin,
    firstLetter: row.first_letter,
    isPrescription: !!row.is_prescription,
    categoryId: row.category_id,
    categoryName: row.category_name,
    routes: safeJsonParse(row.routes as string, []),
    specification: row.specification,
    dosage: row.dosage,
    manufacturer: row.manufacturer,
    approvalNo: row.approval_no,
    barcode: row.barcode,
    imageUrls: safeJsonParse(row.image_urls as string, []),
    indication: row.indication,
    usage: row.usage_text,
    adverseReactions: row.adverse_reactions,
    contraindication: row.contraindication,
    precautions: row.precautions,
    storage: row.storage,
    validPeriod: row.valid_period,
    createdAt: row.created_at,
  };
}

// GET /folders - 获取收藏夹列表
favoritesRouter.get('/folders', async (req: AuthRequest, res: Response) => {
  try {
    const db = await getDb();
    const folders = db.prepare('SELECT * FROM favorite_folders WHERE user_id = ? ORDER BY created_at').all(req.userId);
    res.json({ data: folders.map(parseFolder) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// POST /folders - 创建收藏夹
favoritesRouter.post('/folders', async (req: AuthRequest, res: Response) => {
  try {
    const db = await getDb();
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ error: '收藏夹名称不能为空' });
      return;
    }

    const id = 'folder_' + uuidv4().slice(0, 12);
    const now = new Date().toISOString();
    db.prepare('INSERT INTO favorite_folders (id, user_id, name, created_at) VALUES (?, ?, ?, ?)').run(id, req.userId, name, now);

    const row = db.prepare('SELECT * FROM favorite_folders WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    if (!row) {
      res.status(500).json({ error: '收藏夹创建失败' });
      return;
    }

    res.status(201).json({ data: parseFolder(row) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// PUT /folders/:id - 重命名收藏夹
favoritesRouter.put('/folders/:id', async (req: AuthRequest, res: Response) => {
  try {
    const db = await getDb();
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ error: '收藏夹名称不能为空' });
      return;
    }

    const folder = db.prepare('SELECT * FROM favorite_folders WHERE id = ?').get(req.params.id);
    if (!folder) {
      res.status(404).json({ error: '收藏夹不存在' });
      return;
    }

    if (folder.user_id !== req.userId) {
      res.status(403).json({ error: '只能操作自己的收藏夹' });
      return;
    }

    db.prepare('UPDATE favorite_folders SET name = ? WHERE id = ?').run(name, req.params.id);

    const updated = db.prepare('SELECT * FROM favorite_folders WHERE id = ?').get(req.params.id) as Record<string, unknown> | undefined;
    if (!updated) {
      res.status(404).json({ error: '收藏夹不存在' });
      return;
    }

    res.json({ data: parseFolder(updated) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// DELETE /folders/:id - 删除收藏夹（级联删除 items）
favoritesRouter.delete('/folders/:id', async (req: AuthRequest, res: Response) => {
  try {
    const db = await getDb();
    const folder = db.prepare('SELECT * FROM favorite_folders WHERE id = ?').get(req.params.id);
    if (!folder) {
      res.status(404).json({ error: '收藏夹不存在' });
      return;
    }

    if (folder.user_id !== req.userId) {
      res.status(403).json({ error: '只能操作自己的收藏夹' });
      return;
    }

    db.prepare('DELETE FROM favorite_items WHERE folder_id = ?').run(req.params.id);
    db.prepare('DELETE FROM favorite_folders WHERE id = ?').run(req.params.id);

    res.json({ data: null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// GET /folders/:id/items - 获取收藏夹内的药品
favoritesRouter.get('/folders/:folderId/items', async (req: AuthRequest, res: Response) => {
  try {
    const db = await getDb();
    const folder = db.prepare('SELECT * FROM favorite_folders WHERE id = ? AND user_id = ?').get(req.params.folderId, req.userId);
    if (!folder) {
      res.status(404).json({ error: '收藏夹不存在' });
      return;
    }

    const rows = db.prepare(
      `SELECT d.* FROM drugs d
       INNER JOIN favorite_items fi ON fi.drug_id = d.id
       WHERE fi.folder_id = ?
       ORDER BY fi.created_at DESC`
    ).all(req.params.folderId);

    res.json({ data: rows.map(parseDrug) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// POST /items - 切换收藏
favoritesRouter.post('/items', async (req: AuthRequest, res: Response) => {
  try {
    const db = await getDb();
    const { drugId, folderId } = req.body;
    if (!drugId || !folderId) {
      res.status(400).json({ error: '药品ID和收藏夹ID不能为空' });
      return;
    }

    // 检查收藏夹是否属于当前用户
    const folder = db.prepare('SELECT id FROM favorite_folders WHERE id = ? AND user_id = ?').get(folderId, req.userId);
    if (!folder) {
      res.status(404).json({ error: '收藏夹不存在' });
      return;
    }

    // 检查是否已收藏
    const existing = db.prepare('SELECT id FROM favorite_items WHERE folder_id = ? AND drug_id = ?').get(folderId, drugId);

    if (existing) {
      // 已收藏则取消
      db.prepare('DELETE FROM favorite_items WHERE id = ?').run(existing.id);
      db.prepare('UPDATE favorite_folders SET item_count = MAX(0, item_count - 1) WHERE id = ?').run(folderId);
      res.json({ data: { favorited: false } });
    } else {
      // 未收藏则添加
      const id = 'fi_' + uuidv4().slice(0, 12);
      const now = new Date().toISOString();
      db.prepare('INSERT INTO favorite_items (id, folder_id, drug_id, created_at) VALUES (?, ?, ?, ?)').run(id, folderId, drugId, now);
      db.prepare('UPDATE favorite_folders SET item_count = item_count + 1 WHERE id = ?').run(folderId);
      res.json({ data: { favorited: true } });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// GET /items/check/:drugId - 检查某药品是否已收藏
favoritesRouter.get('/items/check/:drugId', async (req: AuthRequest, res: Response) => {
  try {
    const db = await getDb();
    const drugId = req.params.drugId;

    // 查找该药品在用户所有收藏夹中的收藏记录
    const items = db.prepare(
      `SELECT fi.*, ff.name as folder_name FROM favorite_items fi
       INNER JOIN favorite_folders ff ON ff.id = fi.folder_id
       WHERE fi.drug_id = ? AND ff.user_id = ?`
    ).all(drugId, req.userId);

    const favorited = items.length > 0;

    const folders = items.map(item => ({
      id: item.folder_id,
      userId: req.userId,
      name: item.folder_name,
      coverImage: '',
      itemCount: 0,
      createdAt: item.created_at,
    }));

    res.json({ data: { favorited, folders } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
});
