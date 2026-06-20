import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { authRouter } from './routes/auth.js';
import { drugsRouter } from './routes/drugs.js';
import { articlesRouter } from './routes/articles.js';
import { commentsRouter } from './routes/comments.js';
import { favoritesRouter } from './routes/favorites.js';
import { historyRouter } from './routes/history.js';
import { userRouter } from './routes/user.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const staticDir = path.join(__dirname, '../../dist');
const isProduction = process.env.NODE_ENV === 'production' || fs.existsSync(staticDir);

app.use(cors());
app.use(express.json());

// 路由注册
app.use('/api/auth', authRouter);
app.use('/api/drugs', drugsRouter);
app.use('/api/articles', articlesRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/history', historyRouter);
app.use('/api/user', userRouter);

// 生产环境：托管前端静态资源
if (isProduction) {
  app.use(express.static(staticDir));

  // SPA 回退：非 API 路由全部返回 index.html
  app.get('*', (_req, res) => {
    res.sendFile(path.join(staticDir, 'index.html'));
  });

  console.log(`📦 静态资源目录: ${staticDir}`);
}

app.listen(PORT, () => {
  console.log(`✅ 智慧药房服务已启动: http://localhost:${PORT}`);
  console.log(`   运行模式: ${isProduction ? '生产环境' : '开发环境'}`);
});
