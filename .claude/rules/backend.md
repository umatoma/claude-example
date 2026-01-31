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
- 定数: `src/constants.ts` に集約する

## アプリ起動パターン

- `process.argv[1]` と `import.meta.url` の比較で起動を分離し、`export default app` でテスト可能にする
