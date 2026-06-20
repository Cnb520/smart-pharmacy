import { Router, Request, Response } from 'express';
import getDb from '../db';

export const drugsRouter = Router();

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

// GET / - 药品列表
drugsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const { keyword, category, isPrescription, route, firstLetter, page = '1', pageSize = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const size = Math.max(1, Math.min(100, parseInt(pageSize as string) || 20));
    const offset = (pageNum - 1) * size;

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (keyword) {
      conditions.push('(name LIKE ? OR generic_name LIKE ?)');
      const kw = `%${keyword}%`;
      params.push(kw, kw);
    }

    if (category) {
      conditions.push('category_id = ?');
      params.push(category);
    }

    if (isPrescription !== undefined && isPrescription !== '') {
      conditions.push('is_prescription = ?');
      params.push(isPrescription === '1' || isPrescription === 'true' ? 1 : 0);
    }

    if (route) {
      conditions.push('routes LIKE ?');
      params.push(`%${route}%`);
    }

    if (firstLetter) {
      conditions.push('first_letter = ?');
      params.push((firstLetter as string).toUpperCase());
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const countRow = db.prepare(`SELECT COUNT(*) as total FROM drugs ${whereClause}`).get(...params);
    const total = (countRow?.total as number) || 0;

    const rows = db.prepare(`SELECT * FROM drugs ${whereClause} ORDER BY name LIMIT ? OFFSET ?`).all(...params, size, offset);

    res.json({
      data: rows.map(parseDrug),
      total,
      page: pageNum,
      pageSize: size,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// GET /:id - 药品详情
drugsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const row = db.prepare('SELECT * FROM drugs WHERE id = ?').get(req.params.id);
    if (!row) {
      res.status(404).json({ error: '药品不存在' });
      return;
    }
    res.json({ data: parseDrug(row) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
});
