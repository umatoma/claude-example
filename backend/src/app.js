const express = require('express');
const { PORT } = require('./constants');
const indexRouter = require('./routes/index');

const app = express();

// ルート設定
app.use('/', indexRouter);

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
}).on('error', (err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
