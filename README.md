# auto-doc-source-test

AIドキュメント自動更新PoCの **実装用リポジトリ** です。題材として簡易Web電卓を実装しています。

このrepoの `main` に実装PRがマージされると、GitHub Actions（Workflow A）がIssue・PR・diffを収集し、AIでドキュメントへの影響を分析して、ドキュメント管理repo [auto-doc-result-test](https://github.com/Kouhei-Yoshida-Shukuminet/auto-doc-result-test) に更新PRを作成します。PoC全体の説明（流れ・権限・レビュー時のAI修正）は auto-doc-result-test の README を参照してください。

## 電卓アプリ

| 機能 | 内容 |
| --- | --- |
| 四則演算 | 加算・減算・乗算・除算 |
| 入力 | 数字、小数点、連続計算（左から順に評価） |
| クリア | `C` / `Esc` で入力と途中結果を破棄 |
| キーボード | 数字・`+ - * /`・`Enter`・`Esc` |

> ゼロ除算時のエラー表示は、確認シナリオ（Issue → 実装PR → Docs PR）の題材として **Issue #1 で追加** します。初期版では `Infinity` / `NaN` がそのまま表示されます。

### 技術選定

| 選択 | 理由 |
| --- | --- |
| HTML + CSS + ES Modules（フレームワーク・ビルドなし） | PoCの主目的はドキュメント更新ライフサイクルの検証のため、アプリは最小構成にした。依存がなく、diffが小さく読みやすい（AIに渡すコンテキストも小さい） |
| 計算ロジックを `src/calculator.js` に分離（DOM非依存の reducer） | ブラウザなしでテストできる |
| テストは `node --test` | Node.js 標準のテストランナーで、追加の依存が不要 |
| `scripts/serve.js`（標準モジュールのみの静的サーバ） | ES Modules は `file://` では読み込めないため |

### 構成

```text
auto-doc-source-test/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml          # テスト
│   │   └── docs-sync.yml   # Workflow A：マージ → Docs PR
│   ├── ISSUE_TEMPLATE/
│   └── pull_request_template.md
├── src/                    # 電卓アプリ
├── tests/
├── scripts/serve.js
└── README.md
```

### ローカルで動かす

Node.js 20 以上が必要です。

```bash
npm start   # http://localhost:8080
npm test
```

## 開発の進め方（Issue と PR の関連付け）

1. 変更内容をIssueにする（テンプレートあり）。
2. ブランチを切って実装し、PR本文に `Closes #<Issue番号>` を書く（PRテンプレートに記入欄あり）。
3. レビュー後、`main` へマージする。
4. Workflow A が起動し、docs repo に `docs/issue-<Issue番号>-pr-<PR番号>` ブランチのDocs PRが作られる。

Issueとの関連付けは、GitHubが解決した関連（PRの Development 欄＝`closingIssuesReferences`）を優先し、PR本文の `Closes/Fixes/Resolves #N` で補完します。関連Issueがない場合も、PR単位（`changes/pr-<番号>.md`）でDocs PRを作ります。

## Workflow A（`docs-sync.yml`）

```text
pull_request: closed（merged == true、同一repoのブランチ）
  → docs repo の main を checkout（AI処理コード・プロンプトは docs repo の automation/ にある）
  → Issue / PR本文 / 変更ファイル / diff / コミットを取得
  → AI：変更分析 → 更新対象判定 → ドキュメント生成
  → docs repo にブランチを push して PR 作成（同じ実装PRで再実行した場合は同じPRを更新）
```

手動再実行：Actions → **Docs sync (AI)** → Run workflow で実装PR番号を指定します。`ai_mode: mock` を選ぶと Claude API を呼ばずに流れだけを確認できます。

### このrepoに必要な設定

| 種別 | 名前 | 内容 |
| --- | --- | --- |
| Secret | `ANTHROPIC_API_KEY` | Claude API キー |
| Secret | `DOCS_REPO_TOKEN` | docs repo に branch作成・push・PR作成するためのトークン（下記） |
| Variable（任意） | `DOCS_REPO` | docs repo 名。既定は `Kouhei-Yoshida-Shukuminet/auto-doc-result-test` |
| Variable（任意） | `AUTO_DOC_AI_MODE` | `mock` にすると Claude API を呼ばない |

`DOCS_REPO_TOKEN` は **Fine-grained personal access token** を推奨します（Settings → Developer settings → Fine-grained tokens）。

- Repository access：**Only select repositories** → `auto-doc-result-test` のみ
- Repository permissions：**Contents: Read and write**、**Pull requests: Read and write**（Metadata: Read は自動付与）

実装repo自体へのアクセスはworkflowの `GITHUB_TOKEN`（`contents` / `pull-requests` / `issues` の read のみ）で行います。

設定コマンド例（値は対話入力され、履歴に残りません）：

```bash
gh secret set ANTHROPIC_API_KEY --repo Kouhei-Yoshida-Shukuminet/auto-doc-source-test
gh secret set DOCS_REPO_TOKEN   --repo Kouhei-Yoshida-Shukuminet/auto-doc-source-test
```
