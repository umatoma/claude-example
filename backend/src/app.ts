import path from 'path';
import { fileURLToPath } from 'url';
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import { PORT } from './constants';
import indexRouter from './routes/index';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// セキュリティヘッダー設定
app.use(helmet());

// ビューエンジン設定
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ルート設定
app.use('/', indexRouter);

// エラーハンドラー（スタックトレース漏洩防止）
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.message);
  res.status(500).send('Internal Server Error');
});

// サーバー起動
if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  }).on('error', (err: Error) => {
    console.error('Server failed to start:', err);
    process.exit(1);
  });
}

export default app;
