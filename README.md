# 📖 ジャーナリングアプリ

自己を見つめ、思考を整理するためのPWAアプリケーション

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Tests](https://img.shields.io/badge/tests-45%20passed-green)
![Build](https://img.shields.io/badge/build-passing-brightgreen)

## ✨ 特徴

- 📝 **シンプルなジャーナル記録**: テキスト、タグ、カテゴリで記録を整理
- 💾 **オフライン対応**: IndexedDBによる完全なローカルストレージ
- 🔍 **高度な検索**: Fuse.jsによるファジーマッチング検索
- 🎛️ **フィルタリング**: タグ、カテゴリ、日付範囲での絞り込み
- 🤖 **AI機能**: Google Gemini APIを使用した会話・分析
- 📊 **感情分析**: エントリーの感情を自動分析
- 📤 **エクスポート**: YAML、Markdown形式でのデータエクスポート
- 📱 **PWA対応**: インストール可能、オフラインで動作
- 🎨 **レスポンシブデザイン**: モバイル・タブレット・デスクトップ対応

## 🚀 デモ

### 基本機能
- ジャーナルエントリーの作成・編集・削除
- タグとカテゴリによる分類
- リアルタイム検索とフィルタリング

### AI機能（Google Gemini API）
- AIとの対話による内省深化
- 感情分析（ポジティブ/ネガティブ、5つの感情）
- 週次・月次要約の自動生成
- 振り返りの質問提案

## 📦 技術スタック

### コア
- **Next.js** 14.2.21 (App Router)
- **TypeScript** 5.x
- **React** 18.3.1

### UI/スタイリング
- **Tailwind CSS** 3.4.1
- **date-fns** (日付フォーマット)

### データ管理
- **IndexedDB** (ローカルストレージ)
- **Fuse.js** 7.0.0 (検索エンジン)

### AI/API
- **Google Gemini API** (AI機能)

### その他
- **next-pwa** (PWA対応)
- **js-yaml** (YAML処理)
- **Jest** (ユニットテスト)
- **Playwright** (E2Eテスト)

## 🛠️ セットアップ

### 前提条件
- Node.js 18.x以上
- npm または pnpm

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/takamiya1021/app035-journaling.git
cd app035-journaling

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

ブラウザで http://localhost:3000 を開く

### Google AI Studio APIキーの設定（オプション）

AI機能を使用する場合、Google AI Studio APIキーが必要です：

1. [Google AI Studio](https://ai.google.dev/) でAPIキーを取得
2. アプリの設定画面でAPIキーを入力

※ APIキー未設定でも基本的なジャーナリング機能は使用可能です

## 🧪 テスト

```bash
# すべてのユニットテストを実行
npm run test

# テストをウォッチモードで実行
npm run test:watch

# E2Eテストを実行
npm run test:e2e
```

### テスト結果
✅ **45個のテストすべてパス**
- Phase 0: テスト環境（3テスト）
- Phase 1: IndexedDB（15テスト）
- Phase 2: 検索・フィルタリング（22テスト）
- Phase 3: AI会話（5テスト）

## 📖 使い方

### 1. エントリーを作成
- テキストエリアにその日の出来事や気持ちを記録
- タグを追加して分類
- カテゴリを選択（仕事、プライベート、学習、その他）
- 保存ボタンをクリック

### 2. エントリーを検索
- 検索バーにキーワードを入力
- ファジーマッチングで関連するエントリーを検索
- タグやカテゴリでフィルタリング

### 3. エクスポート
- YAMLボタン: 構造化データとしてエクスポート
- MDボタン: Markdown形式でエクスポート

### 4. AI機能（APIキー設定時）
- エントリーに対してAIと会話
- 感情分析を実行
- 週次・月次要約を生成

## 🏗️ プロジェクト構造

```
app035-journaling/
├── app/                    # Next.js App Router
│   ├── components/         # Reactコンポーネント
│   │   ├── JournalEditor.tsx
│   │   ├── EntryList.tsx
│   │   ├── SearchBar.tsx
│   │   └── FilterPanel.tsx
│   ├── layout.tsx
│   └── page.tsx           # ホームページ
├── lib/                   # ビジネスロジック
│   ├── db.ts             # IndexedDB管理
│   ├── search.ts         # 検索・フィルタリング
│   ├── aiChat.ts         # AI会話機能
│   ├── aiAnalysis.ts     # AI分析機能
│   └── export.ts         # エクスポート・インポート
├── types/                 # TypeScript型定義
│   └── journal.ts
├── __tests__/            # テスト
├── public/               # 静的ファイル
└── doc/                  # ドキュメント
    ├── requirements.md
    ├── technical-design.md
    └── implementation-plan.md
```

## 🎯 実装済み機能

### Phase 0: テスト環境構築 ✅
- Jest、React Testing Library、Playwright
- IndexedDBモック（fake-indexeddb）

### Phase 1: IndexedDB実装 ✅
- CRUD操作（Create, Read, Update, Delete）
- インデックス検索（日付、タグ、カテゴリ）

### Phase 2: 検索・フィルタリング ✅
- 全文検索（Fuse.js）
- タグ・カテゴリ・日付範囲フィルタ
- 複合フィルタ

### Phase 3: AI会話機能 ✅
- Google Gemini API統合
- 会話履歴管理
- 内省質問提案

### Phase 4: AI分析機能 ✅
- 感情分析
- 週次・月次要約
- 振り返り提案

### Phase 5: エクスポート・インポート ✅
- YAMLエクスポート
- Markdownエクスポート/インポート
- ファイルダウンロード

### Phase 7-9: UIコンポーネント ✅
- 検索バー
- フィルタパネル
- ジャーナルエディタ
- エントリーリスト

### Phase 10: PWA対応 ✅
- Service Worker
- オフライン動作
- インストール可能

## 🔮 将来の拡張（開発スコープ外）

- カレンダー表示
- 画像添付機能
- 複数ユーザー対応
- クラウド同期（OneDrive、Google Drive）
- 音声入力
- 既存アプリとの連携（アファメーションアプリ、習慣トラッカー）

## 📝 ライセンス

MIT License

## 👤 作成者

クロ (@takamiya1021)

## 🙏 謝辞

このプロジェクトは、要件定義書、技術設計書、実装計画書に基づいて、TDD（Test-Driven Development）準拠で実装されました。

---

**📖 自己を見つめ、思考を整理するジャーナリングアプリ**
