# 実装計画: Node.js Hello World サーバー

## 概要

Node.jsとExpress.jsを使用した、シンプルなHello Worldサーバーを構築する。

## 要件

| 項目 | 内容 |
|------|------|
| 機能 | HTTPリクエストに対して「HELLO WORLD」を返すサーバー |
| 言語 | JavaScript |
| フレームワーク | Express.js |
| ポート番号 | 3000 |
| スコープ | 最小限のシンプルな実装 |

## ファイル構成

```
├── README.md                     # 使用方法（更新）
└── backend/                      # バックエンドアプリケーション
    ├── package.json              # backend固有の依存関係
    └── src/
        ├── routes/
        │   └── index.js          # ルート定義
        ├── constants.js          # 定数定義
        └── app.js                # エントリーファイル
```

> **Note**: モノレポ構造のコーディング規約に準拠

## 実装フェーズ

### フェーズ1: プロジェクト初期化

| ステップ | ファイル | アクション | 依存関係 |
|----------|----------|------------|----------|
| 1.1 | `backend/` | backendディレクトリ作成 | なし |
| 1.2 | `backend/package.json` | npm initでプロジェクト初期化、Express.js依存関係追加 | 1.1 |

### フェーズ2: サーバー実装

| ステップ | ファイル | アクション | 依存関係 |
|----------|----------|------------|----------|
| 2.1 | `backend/src/constants.js` | PORT定数を定義 | 1.2 |
| 2.2 | `backend/src/routes/index.js` | GETルート定義（HELLO WORLD） | 1.2 |
| 2.3 | `backend/src/app.js` | Expressアプリ設定、ルート読み込み、サーバー起動 | 2.1, 2.2 |

### フェーズ3: 開発環境整備

| ステップ | ファイル | アクション | 依存関係 |
|----------|----------|------------|----------|
| 3.1 | `backend/package.json` | start/devスクリプト追加 | 2.3 |

### フェーズ4: ドキュメント

| ステップ | ファイル | アクション | 依存関係 |
|----------|----------|------------|----------|
| 4.1 | `README.md` | 起動方法・使用方法を追記 | 3.1 |

## 依存パッケージ

| パッケージ | バージョン | 用途 |
|------------|------------|------|
| express | ^5.2.1 | Webフレームワーク |
| nodemon | ^3.x (devDependency) | 開発時ホットリロード |

## 実装詳細

### backend/src/constants.js

```javascript
const PORT = process.env.PORT || 3000;

module.exports = { PORT };
```

### backend/src/routes/index.js

```javascript
const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.send('HELLO WORLD');
});

module.exports = router;
```

### backend/src/app.js

```javascript
const express = require('express');
const { PORT } = require('./constants');
const indexRouter = require('./routes/index');

const app = express();

// ルート設定
app.use('/', indexRouter);

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
```

### backend/package.json

```json
{
  "name": "backend",
  "version": "1.0.0",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js"
  },
  "dependencies": {
    "express": "^5.2.1"
  },
  "devDependencies": {
    "nodemon": "^3.x"
  }
}
```

## 成功基準

- [x] `cd backend && npm install` で依存関係がインストールされる
- [x] `cd backend && npm start` でサーバーが起動する
- [x] `http://localhost:3000` にアクセスすると「HELLO WORLD」が表示される
- [ ] `cd backend && npm run dev` でホットリロード開発ができる

## リスク評価

| リスク | 影響度 | 発生確率 | 軽減策 |
|--------|--------|----------|--------|
| ポート競合 | 低 | 中 | 環境変数でポート設定可能 |
| Node.jsバージョン互換性 | 低 | 低 | package.jsonのenginesで指定 |

## 複雑度

| 項目 | 見積もり |
|------|----------|
| 全体の複雑度 | **低** |
| 必要なファイル数 | 5ファイル（README.md, package.json, app.js, constants.js, routes/index.js） |
| 依存パッケージ数 | 2パッケージ（express, nodemon） |

## ステータス

- [x] 計画作成完了
- [x] コーディング規約レビュー完了
- [x] ユーザー承認完了
- [x] 実装開始
- [x] 実装完了
- [x] テスト完了
