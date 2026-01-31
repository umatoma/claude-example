# CLAUDE.md

このファイルはClaude Codeがプロジェクトを理解するためのガイドです。

## プロジェクト概要

モノレポ構成のNode.js/Express.jsプロジェクト。

## プロジェクト構造

```
project-root/
├── backend/          # バックエンドアプリケーション
│   ├── package.json
│   └── src/
│       ├── routes/   # ルート定義
│       ├── constants.js
│       └── app.js    # エントリーポイント
└── frontend/         # フロントエンドアプリケーション（未実装）
```

## 開発コマンド

```bash
# バックエンド
cd backend && npm install   # 依存関係インストール
cd backend && npm start     # 本番モード起動
cd backend && npm run dev   # 開発モード起動（ホットリロード）
```

## CLAUDE.md・Rules のベストプラクティス

- 具体的に書く: 「コードを適切にフォーマットする」ではなく「インデントはスペース2つを使用する」のように記述する
- 構造化して整理する: 各ルールは箇条書きにし、関連するルールは見出しでグループ化する
- 定期的に見直す: プロジェクトの進化に合わせてルールを更新し、常に最新の情報を反映する
