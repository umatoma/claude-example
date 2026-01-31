# バックエンド TypeScript 導入

> ステータス: 完了
> 作成日: 2026-01-31
> 最終更新: 2026-01-31

---

## Part 1: 仕様 (Specification)

### 1.1 概要

**目的**: バックエンドのソースコードを JavaScript から TypeScript に移行し、型安全性と開発体験を向上させる。

**スコープ**:
- 既存の全 .js ソースファイルを .ts に変換
- モジュールシステムを CommonJS から ESM に切り替え
- tsx による直接実行環境の構築
- tsconfig.json の追加（strict: true）
- テストファイルの .ts 化
- コーディング規約の更新

**動機**: TypeScript の型システムにより、開発時のバグ検出・コード補完・リファクタリング安全性が向上する。プロジェクトが小規模な今が移行の最適なタイミング。

### 1.2 詳細仕様

#### 機能要件

| ID | 機能 | 説明 | 優先度 |
|----|------|------|--------|
| F-001 | ソースファイル変換 | app.js, constants.js, routes/index.js を .ts に変換 | 必須 |
| F-002 | ESM 化 | require/module.exports を import/export に置換 | 必須 |
| F-003 | tsconfig.json 作成 | strict: true の TypeScript 設定ファイルを追加 | 必須 |
| F-004 | tsx 実行環境 | tsx による開発・本番実行環境を構築 | 必須 |
| F-005 | テストファイル変換 | index.spec.js を index.spec.ts に変換 | 必須 |
| F-006 | vitest 設定更新 | vitest.config.js を vitest.config.ts に変更 | 必須 |
| F-007 | コーディング規約更新 | code-style.md, testing.md の規約を TypeScript 用に更新 | 必須 |

#### API契約

API の変更なし。既存の動作を維持する。

##### GET /

- **説明**: トップページの表示（変更なし）
- **Response**:
  - Success (200):
    - Content-Type: text/html
    - Body: index.ejs テンプレートのレンダリング結果

#### データモデル

データモデルの変更なし。

#### ファイル変換仕様

##### src/app.ts（src/app.js から変換）

- `require` → `import` に変換
- `module.exports = app` → `export default app` に変換
- Express の型（`Application`）を適用
- `require.main === module` パターンを ESM 対応に変更

##### src/constants.ts（src/constants.js から変換）

- `module.exports` → `export` に変換
- `PORT` に `number` 型を明示

##### src/routes/index.ts（src/routes/index.js から変換）

- `require` → `import` に変換
- `module.exports` → `export default` に変換
- `Router`, `Request`, `Response` 型を適用

##### tsconfig.json（新規作成）

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "noEmit": true,
    "declaration": true,
    "sourceMap": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules"]
}
```

##### package.json 変更

- scripts 更新:
  - `"start": "tsx src/app.ts"`
  - `"dev": "tsx watch src/app.ts"`
  - `"test": "vitest run"`（変更なし）
  - `"typecheck": "tsc --noEmit"`（新規追加）
- devDependencies 追加:
  - `typescript`
  - `tsx`
  - `@types/express`（Express 5 に型定義が同梱されていない場合）
- devDependencies 削除:
  - `nodemon`（tsx watch で代替）

#### コーディング規約の変更

##### .claude/rules/code-style.md

- モジュールシステム: CommonJS → ESM (`import`/`export`)
- ファイル拡張子: `.js` → `.ts`
- 型注釈: 関数の引数・戻り値に型を明示する

##### .claude/rules/testing.md

- テストファイル: `*.spec.js` → `*.spec.ts`

### 1.3 受入基準

| ID | Given (前提条件) | When (操作) | Then (期待結果) |
|----|-----------------|-------------|----------------|
| AC-001 | TypeScript 導入済み | `npm run dev` を実行 | tsx watch でサーバーが起動し、GET / が 200 を返す |
| AC-002 | TypeScript 導入済み | `npm start` を実行 | tsx でサーバーが起動し、正常に動作する |
| AC-003 | TypeScript 導入済み | `npm test` を実行 | 既存テスト3件が全て pass する |
| AC-004 | TypeScript 導入済み | `npm run typecheck` を実行 | 型エラーなしで完了する |
| AC-005 | TypeScript 導入済み | ソースファイルを確認 | 全ソースファイルが .ts で、import/export を使用している |

### 1.4 エッジケース

| ID | シナリオ | 期待される動作 |
|----|----------|---------------|
| EC-001 | Express 5 に @types/express が非対応 | Express 5 同梱の型定義を使用、または型定義ファイルを自作 |
| EC-002 | EJS テンプレートファイル (.ejs) | 変換対象外。TypeScript の影響を受けない |
| EC-003 | require.main === module パターン | ESM では使用不可。tsx の `import.meta.url` ベースの判定に変更 |

### 1.5 制約事項

#### セキュリティ

- 既存の動作を変更しない。型の追加のみ。

#### パフォーマンス

- tsx のランタイムオーバーヘッドは開発時のみ。本番環境での影響は最小限。

#### 依存関係

| パッケージ | バージョン | 用途 | 採用理由 |
|-----------|-----------|------|---------|
| typescript | latest | 型チェック（tsc --noEmit） | TypeScript の型システムを利用するための必須パッケージ |
| tsx | latest | .ts ファイルの直接実行 | ビルドステップ不要で .ts を実行でき、開発体験がシンプル |
| @types/express | latest | Express の型定義 | Express 5 に型定義が同梱されていない場合に必要 |

#### 削除する依存関係

| パッケージ | 理由 |
|-----------|------|
| nodemon | tsx watch で代替可能 |

### 1.6 テスト戦略

#### ユニットテスト

- なし（現在のコードベースにユニットテスト対象のロジックがない）

#### 統合テスト

- 既存の `src/routes/index.spec.ts`（リネーム後）の3テストケースが全て pass すること
  - GET / がステータス200を返す
  - レスポンスに `<h1>Claude Example</h1>` が含まれる
  - Content-Type が text/html を含む

### 1.7 不確実性

**未解決数**: 0

| ID | 質問 | 該当セクション | ステータス |
|----|------|--------------|-----------|
| - | - | - | - |

### 1.8 プロジェクト憲法チェックリスト

| 条 | 原則 | 準拠 | 備考 |
|----|------|------|------|
| I | モジュール先行 | - [x] | 既存のモジュール分離（app, constants, routes）を維持 |
| II | 契約先行 | - [x] | API契約に変更なし。型定義で契約がより明確になる |
| III | テスト先行 | - [x] | 既存テストを .ts に変換し、移行後にテストで動作を検証 |
| IV | 仕様完全性 | - [x] | 未解決の不確実性なし |
| V | 最小依存 | - [x] | 追加: typescript, tsx。削除: nodemon。最小限の依存追加 |
| VI | 関心の分離 | - [x] | 既存の責務分離を維持。型定義で責務がより明確になる |
| VII | 簡潔性ゲート | - [x] | 既存コードの構造を維持。型注釈の追加のみ |
| VIII | 直接利用 | - [x] | Express 標準 API を直接使用。不要な抽象化なし |
| IX | 統合テスト優先 | - [x] | Supertest による HTTP レベルの統合テストを維持 |

---

## Part 2: 実装計画 (Implementation Plan)

### 2.1 進捗サマリー

| フェーズ | ステータス | 進捗 |
|---------|-----------|------|
| フェーズ1: 環境構築 | 完了 | 3/3 |
| フェーズ2: ファイル変換 | 完了 | 5/5 |
| フェーズ3: 検証 | 完了 | 3/3 |
| フェーズ4: 規約更新 | 完了 | 2/2 |

**全体進捗**: 13/13 ステップ完了

### 2.2 アーキテクチャ変更

#### 新規ファイル
| ファイル | 責務 |
|---------|------|
| backend/tsconfig.json | TypeScript コンパイラ設定 |

#### 変更ファイル
| ファイル | 変更内容 |
|---------|---------|
| backend/package.json | scripts 更新、依存関係の追加・削除 |
| backend/src/app.js → app.ts | ESM化、型注釈追加 |
| backend/src/constants.js → constants.ts | ESM化、型注釈追加 |
| backend/src/routes/index.js → index.ts | ESM化、型注釈追加 |
| backend/src/routes/index.spec.js → index.spec.ts | リネーム（既にESM） |
| backend/vitest.config.js → vitest.config.ts | リネーム（既にESM） |

#### 削除ファイル
| ファイル | 理由 |
|---------|------|
| backend/src/app.js | .ts に置換 |
| backend/src/constants.js | .ts に置換 |
| backend/src/routes/index.js | .ts に置換 |
| backend/src/routes/index.spec.js | .ts に置換 |
| backend/vitest.config.js | .ts に置換 |

### 2.3 実装フェーズ

#### フェーズ1: 環境構築

| ステップ | タスク | ファイル | 依存 | 完了条件 |
|----------|--------|---------|------|---------|
| 1.1 | - [x] typescript, tsx, @types/express をインストール、nodemon を削除 | package.json | なし | devDependencies に追加・削除が反映されている |
| 1.2 | - [x] tsconfig.json を作成 | backend/tsconfig.json | なし | 仕様 1.2 の設定内容で作成済み |
| 1.3 | - [x] package.json の scripts を更新 | backend/package.json | 1.1 | start, dev, typecheck スクリプトが更新済み |

#### フェーズ2: ファイル変換

| ステップ | タスク | ファイル | 依存 | 完了条件 |
|----------|--------|---------|------|---------|
| 2.1 | - [x] constants.js → constants.ts に変換（ESM化、型注釈） | src/constants.ts | 1.2 | export で PORT を公開、number 型を明示 |
| 2.2 | - [x] routes/index.js → routes/index.ts に変換（ESM化、型注釈） | src/routes/index.ts | 1.2 | import/export 使用、Router/Request/Response 型適用 |
| 2.3 | - [x] app.js → app.ts に変換（ESM化、型注釈、エントリーポイント判定変更） | src/app.ts | 2.1, 2.2 | import/export 使用、import.meta ベースのエントリーポイント判定 |
| 2.4 | - [x] vitest.config.js → vitest.config.ts にリネーム | vitest.config.ts | 1.2 | ファイル名変更のみ（内容は既にESM） |
| 2.5 | - [x] index.spec.js → index.spec.ts にリネーム・調整 | src/routes/index.spec.ts | 2.3 | import パスが .ts ソースを参照、型エラーなし |

#### フェーズ3: 検証

| ステップ | タスク | ファイル | 依存 | 完了条件 |
|----------|--------|---------|------|---------|
| 3.1 | - [x] `npm run typecheck` で型チェック | - | 2.5 | エラーゼロで完了（AC-004） |
| 3.2 | - [x] `npm test` でテスト実行 | - | 3.1 | 3件全て pass（AC-003） |
| 3.3 | - [x] `npm start` で起動確認 | - | 3.2 | サーバーが正常起動（AC-002） |

#### フェーズ4: 規約更新

| ステップ | タスク | ファイル | 依存 | 完了条件 |
|----------|--------|---------|------|---------|
| 4.1 | - [x] code-style.md を TypeScript 用に更新 | .claude/rules/code-style.md | 3.2 | モジュール: ESM、拡張子: .ts、型注釈ルール追記 |
| 4.2 | - [x] testing.md を TypeScript 用に更新 | .claude/rules/testing.md | 3.2 | テストファイル: *.spec.ts に変更 |

### 2.4 シンプリシティゲート

- [x] 全ファイルが30行以下で、行数上限内に収まる見込み
- [x] ネスト深度は既存コードと同等（最大2レベル）
- [x] 新しい抽象化レイヤーの追加なし（型注釈の追加のみ）
- [x] ヘルパー関数・ユーティリティの新規作成なし

### 2.5 リスク評価

| リスク | 影響度 | 発生確率 | 軽減策 |
|--------|--------|---------|--------|
| @types/express が Express 5 と非互換 | 中 | 中 | Express 5 同梱の型を確認。非互換なら型定義ファイルを最小限自作 |
| tsx と vitest の相互干渉 | 低 | 低 | vitest は独自の TypeScript トランスフォームを持つため tsx に依存しない |
| import.meta の ESM エントリーポイント判定 | 低 | 低 | fileURLToPath + process.argv[1] の標準パターンを使用 |

### 2.6 成功基準

仕様の受入基準（1.3）を満たすこと:

- [x] AC-001: `npm run dev` で tsx watch サーバーが起動し GET / が 200 を返す
- [x] AC-002: `npm start` で tsx サーバーが正常に動作する
- [x] AC-003: `npm test` で既存テスト3件が全て pass する
- [x] AC-004: `npm run typecheck` で型エラーなしで完了する
- [x] AC-005: 全ソースファイルが .ts で import/export を使用している

### 2.7 実装ログ

| 日時 | ステップ | ステータス | 備考 |
|------|---------|-----------|------|
| 2026-01-31 | フェーズ1 | 完了 | typescript@5.9.3, tsx@4.21.0, @types/express@5.0.6 |
| 2026-01-31 | フェーズ2 | 完了 | 全5ファイル変換、旧ファイル削除 |
| 2026-01-31 | フェーズ3 | 完了 | @types/supertest@6.0.3 追加が必要だった（仕様記載漏れ） |
| 2026-01-31 | フェーズ4 | 完了 | code-style.md, testing.md 更新 |
