const path = require('path');
const express = require('express');
const { PORT } = require('./constants');
const indexRouter = require('./routes/index');

const app = express();

// ビューエンジン設定
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ルート設定
app.use('/', indexRouter);

// サーバー起動
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  }).on('error', (err) => {
    console.error('Server failed to start:', err);
    process.exit(1);
  });
}

module.exports = app;
