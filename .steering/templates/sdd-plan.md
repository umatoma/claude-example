# {{FEATURE_NAME}}

> ステータス: {{STATUS}}
> 作成日: {{DATE}}
> 最終更新: {{LAST_UPDATED}}

---

## Part 1: 仕様 (Specification)

### 1.1 概要

**目的**: {{PURPOSE}}

**スコープ**: {{SCOPE}}

**動機**: {{MOTIVATION}}

### 1.2 詳細仕様

#### 機能要件

| ID | 機能 | 説明 | 優先度 |
|----|------|------|--------|
| F-001 | {{FEATURE}} | {{DESCRIPTION}} | {{PRIORITY}} |

#### API契約

##### {{METHOD}} {{PATH}}

- **説明**: {{ENDPOINT_DESCRIPTION}}
- **Request**:
  - Headers: {{HEADERS}}
  - Body:
    ```json
    {{REQUEST_BODY}}
    ```
- **Response**:
  - Success ({{SUCCESS_STATUS}}):
    ```json
    {{SUCCESS_RESPONSE}}
    ```
  - Error ({{ERROR_STATUS}}):
    ```json
    {{ERROR_RESPONSE}}
    ```

#### データモデル

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| {{FIELD}} | {{TYPE}} | {{REQUIRED}} | {{FIELD_DESCRIPTION}} |

### 1.3 受入基準

| ID | Given (前提条件) | When (操作) | Then (期待結果) |
|----|-----------------|-------------|----------------|
| AC-001 | {{GIVEN}} | {{WHEN}} | {{THEN}} |

### 1.4 エッジケース

| ID | シナリオ | 期待される動作 |
|----|----------|---------------|
| EC-001 | {{SCENARIO}} | {{EXPECTED_BEHAVIOR}} |

### 1.5 制約事項

#### セキュリティ
- {{SECURITY_CONSTRAINT}}

#### パフォーマンス
- {{PERFORMANCE_CONSTRAINT}}

#### 依存関係

| パッケージ | バージョン | 用途 | 採用理由 |
|-----------|-----------|------|---------|
| {{PACKAGE}} | {{VERSION}} | {{USAGE}} | {{JUSTIFICATION}} |

### 1.6 テスト戦略

#### ユニットテスト
- {{UNIT_TEST_TARGET}}

#### 統合テスト
- {{INTEGRATION_TEST_TARGET}}

### 1.7 不確実性

**未解決数**: {{UNRESOLVED_COUNT}}

| ID | 質問 | 該当セクション | ステータス |
|----|------|--------------|-----------|
| NC-001 | {{QUESTION}} | {{SECTION}} | 未解決 / 解決済み |

### 1.8 プロジェクト憲法チェックリスト

> `sdd-principles` スキルに定義されたプロジェクト憲法の各条項を記入する。

| 条 | 原則 | 準拠 | 備考 |
|----|------|------|------|
| {{ARTICLE_NUM}} | {{ARTICLE_PRINCIPLE}} | - [ ] | {{NOTE}} |

---

## Part 2: 実装計画 (Implementation Plan)

### 2.1 進捗サマリー

| フェーズ | ステータス | 進捗 |
|---------|-----------|------|
| フェーズ1: {{PHASE_NAME}} | 未着手 | 0/{{TOTAL}} |

**全体進捗**: 0/{{TOTAL_STEPS}} ステップ完了

### 2.2 アーキテクチャ変更

#### 新規ファイル
| ファイル | 責務 |
|---------|------|
| {{FILE_PATH}} | {{RESPONSIBILITY}} |

#### 変更ファイル
| ファイル | 変更内容 |
|---------|---------|
| {{FILE_PATH}} | {{CHANGE_DESCRIPTION}} |

### 2.3 実装フェーズ

#### フェーズ1: {{PHASE_NAME}}

| ステップ | タスク | ファイル | 依存 | 完了条件 |
|----------|--------|---------|------|---------|
| 1.1 | - [ ] {{TASK}} | {{FILE}} | なし | {{DONE_CRITERIA}} |

#### フェーズ2: {{PHASE_NAME}}

| ステップ | タスク | ファイル | 依存 | 完了条件 |
|----------|--------|---------|------|---------|
| 2.1 | - [ ] {{TASK}} | {{FILE}} | 1.x | {{DONE_CRITERIA}} |

### 2.4 シンプリシティゲート

- [ ] {{SIMPLICITY_CHECK}}

### 2.5 リスク評価

| リスク | 影響度 | 発生確率 | 軽減策 |
|--------|--------|---------|--------|
| {{RISK}} | {{IMPACT}} | {{PROBABILITY}} | {{MITIGATION}} |

### 2.6 成功基準

仕様の受入基準（1.3）を満たすこと:

- [ ] AC-001: {{ACCEPTANCE_CRITERIA_SUMMARY}}

### 2.7 実装ログ

| 日時 | ステップ | ステータス | 備考 |
|------|---------|-----------|------|
| {{DATETIME}} | {{STEP}} | {{STATUS}} | {{NOTE}} |
