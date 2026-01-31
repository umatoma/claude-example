# CLAUDE.md

このファイルはClaude Codeがプロジェクトを理解するためのガイドです。

## プロジェクト概要

モノレポ構成のTypeScript/Express 5プロジェクト。テンプレートエンジンにEJSを使用。

## プロジェクト構造

```
project-root/
├── backend/              # バックエンドアプリケーション
│   ├── src/
│   │   ├── routes/       # Express Routerによるルート定義
│   │   └── views/        # EJSテンプレート
│   ├── vitest.config.ts
│   ├── tsconfig.json
│   └── package.json
├── frontend/             # フロントエンド（未実装）
├── .claude/
│   ├── rules/            # コーディング・テスト・バックエンド規約
│   ├── commands/         # SDDワークフローコマンド
│   ├── agents/           # 計画・実装エージェント定義
│   └── skills/           # SDDスキル定義
└── .steering/            # SDD計画文書
```

## 開発コマンド

```bash
cd backend && npm install       # 依存関係インストール
cd backend && npm start         # 本番モード起動
cd backend && npm run dev       # 開発モード起動（ホットリロード）
cd backend && npm test          # テスト実行（Vitest）
cd backend && npm run typecheck # 型チェック（tsc --noEmit）
```

## 規約

コーディング規約・テスト規約・バックエンド規約は `.claude/rules/` に定義されている。

## ワークフロー

- SDD（スペック駆動開発）の計画文書は `.steering/` に配置する
- ワークフローコマンド: `/sdd-specify`（仕様作成）→ `/sdd-plan`（計画作成）→ `/sdd-implement`（実装）
