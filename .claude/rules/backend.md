---
paths:
  - "backend/**"
---

# バックエンド規約

## フレームワーク

- Express 5 を使用する
- テンプレートエンジン: EJS

## ファイル配置

- ルート定義: `src/routes/` に配置し、`express.Router()` を使用する
- ビュー: `src/views/` に `.ejs` ファイルとして配置する
- 定数: `src/constants.js` に集約する

## アプリ起動パターン

- `require.main === module` で起動を分離し、`module.exports = app` でテスト可能にする
