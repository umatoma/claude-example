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

## コーディング規約

**重要**: 実装前に必ず参照すること。

coding-standardsスキルで定義されているコーディング規約・ベストプラクティス

## 計画と実装のワークフロー

**重要**: いきなり実装せず、以下のステップを踏むこと。

1. `/do-plan` - 計画書を作成し、ユーザー承認を得る
2. `/do-implement` - 計画書に基づいてステップバイステップで実装
3. `/code-review` - 実装完了後にコードレビュー

計画書は `.steering/` ディレクトリに保存される。

## Git規約

- コミットメッセージ: 日本語で簡潔に

## 利用可能なスキル

| スキル | 用途 |
|--------|------|
| coding-standards | コーディング規約・ベストプラクティス |
| backend-patterns | バックエンドアーキテクチャパターン |
| frontend-pattern | フロントエンド開発パターン |
| explain-code | コードの説明・図解 |
| sdd-principles | SDD原則・プロジェクト憲法・フェーズゲート |

## SDD ワークフロー

仕様駆動開発（SDD）: 仕様を真実の源泉とし、仕様 → 計画 → 実装のパイプラインで開発する。

**コマンド**:
1. `/x-specify` - 仕様書を作成（Part 1）、ユーザー承認を得る
2. `/x-plan` - 仕様に基づく実装計画を追記（Part 2）、ユーザー承認を得る
3. `/x-implement` - 計画に基づいてステップバイステップで実装

**計画書**: `.steering/[YYYYMMDD]-[name].md` に仕様+計画を統合保存。テンプレートは `.steering/templates/sdd-plan.md`。

**プロジェクト憲法**: `sdd-principles` スキルに定義。仕様・計画・実装の全フェーズで遵守する不変原則。
