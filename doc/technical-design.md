# 🛠️ 技術設計書：No.35「ジャーナリングアプリ」

**作成日**: 2025-01-13
**バージョン**: 1.0
**アプリ番号**: 35

---

## 1. 技術スタック

### 1.1 推奨構成
- **フレームワーク**: Next.js 14.x（App Router）
- **言語**: TypeScript 5.x
- **UI**: React 18.x
- **スタイリング**: Tailwind CSS v3
- **アニメーション**: Framer Motion
- **PWA**: next-pwa
- **AI API**: Google AI Studio (Gemini API)
- **データベース**: IndexedDB（大容量対応）
- **状態管理**: React Context API + Zustand（複雑な状態管理用）
- **検索**: Fuse.js（全文検索）
- **日付処理**: date-fns

### 1.2 開発ツール
- **リンター**: ESLint 8.x
- **フォーマッター**: Prettier
- **パッケージマネージャー**: npm または pnpm

---

## 2. アーキテクチャ設計

### 2.1 コンポーネント構成

```
app/
├── layout.tsx                  // ルートレイアウト（PWA設定含む）
├── page.tsx                    // メインページ（記録画面）
├── calendar/
│   └── page.tsx                // カレンダー画面
├── list/
│   └── page.tsx                // リスト画面
├── ai-chat/
│   └── [id]/
│       └── page.tsx            // AI会話画面
├── analytics/
│   └── page.tsx                // 感情分析画面
├── settings/
│   └── page.tsx                // 設定画面
├── components/
│   ├── JournalEditor.tsx       // ジャーナル入力エディタ
│   ├── TagInput.tsx            // タグ入力
│   ├── CategorySelect.tsx      // カテゴリ選択
│   ├── ImageUpload.tsx         // 画像アップロード
│   ├── Calendar.tsx            // カレンダーコンポーネント
│   ├── EntryList.tsx           // エントリーリスト
│   ├── EntryCard.tsx           // エントリーカード
│   ├── SearchBar.tsx           // 検索バー
│   ├── FilterPanel.tsx         // フィルタパネル
│   ├── AIChatBox.tsx           // AI会話ボックス
│   ├── EmotionChart.tsx        // 感情グラフ
│   ├── SummaryCard.tsx         // 要約カード
│   ├── ExportDialog.tsx        // エクスポートダイアログ
│   ├── ImportDialog.tsx        // インポートダイアログ
│   ├── BackupDialog.tsx        // バックアップダイアログ
│   └── AIContentSection.tsx    // AI生成コンテンツ表示（共通）
├── lib/
│   ├── db.ts                   // IndexedDB管理
│   ├── search.ts               // 検索エンジン（Fuse.js）
│   ├── export.ts               // エクスポート機能（YAML/Markdown）
│   ├── import.ts               // インポート機能（Markdown）
│   ├── backup.ts               // クラウドバックアップ
│   ├── aiService.ts            // Google AI Studio API統合（共通）
│   ├── aiChat.ts               // AI会話機能
│   ├── emotionAnalysis.ts      // 感情分析
│   ├── summary.ts              // 要約生成
│   └── storage.ts              // ローカルストレージ管理（共通）
├── hooks/
│   ├── useJournalDB.ts         // IndexedDBカスタムフック
│   ├── useSearch.ts            // 検索カスタムフック
│   ├── useAIChat.ts            // AI会話カスタムフック
│   ├── useEmotionAnalysis.ts   // 感情分析カスタムフック
│   └── useAIGeneration.ts      // AI生成カスタムフック（共通）
├── store/
│   └── journalStore.ts         // Zustand状態管理
└── types/
    └── journal.ts              // 型定義
```

### 2.2 データフロー

```
[JournalEditor]
    ↓ 入力
[journalStore] → [IndexedDB] → 保存
    ↓
[EntryList] / [Calendar] ← 取得

[SearchBar]
    ↓ 検索クエリ
[useSearch] → [Fuse.js] → 検索結果
    ↓
[EntryList]

[AIContentSection]
    ↓ クリック
[useAIGeneration] → Google AI API → AI生成結果
    ↓
[SummaryCard] / [EmotionChart]

[AIChatBox]
    ↓ 会話入力
[useAIChat] → Google AI API → AI応答
    ↓
[AIChatBox] 更新
```

---

## 3. データモデル設計

### 3.1 IndexedDBスキーマ

```typescript
// lib/db.ts

interface JournalEntry {
  id: string;                    // UUID
  createdAt: Date;               // 作成日時（自動）
  updatedAt: Date;               // 更新日時（自動）
  content: string;               // 本文（プレーンテキスト）
  tags: string[];                // タグ配列
  category: Category;            // カテゴリ
  images: string[];              // 画像のbase64文字列配列
  aiConversations: AIConversation[];  // AI会話履歴
  emotionAnalysis?: EmotionAnalysis;  // 感情分析結果
}

type Category = '仕事' | 'プライベート' | '学習' | 'その他';

interface AIConversation {
  id: string;
  timestamp: Date;
  role: 'user' | 'ai';
  message: string;
}

interface EmotionAnalysis {
  positive: number;              // 0-100
  negative: number;              // 0-100
  emotions: {
    joy: number;                 // 喜び 0-100
    sadness: number;             // 悲しみ 0-100
    anger: number;               // 怒り 0-100
    fear: number;                // 恐れ 0-100
    surprise: number;            // 驚き 0-100
  };
  analyzedAt: Date;
}

interface WeeklySummary {
  id: string;
  weekStart: Date;               // 週の開始日
  weekEnd: Date;                 // 週の終了日
  summary: string;               // 要約文
  themes: string[];              // 抽出されたテーマ
  emotionTrend: EmotionAnalysis; // 週全体の感情傾向
  generatedAt: Date;
}

interface MonthlySummary {
  id: string;
  month: string;                 // YYYY-MM
  summary: string;
  themes: string[];
  emotionTrend: EmotionAnalysis;
  generatedAt: Date;
}
```

### 3.2 IndexedDB構造

```typescript
const DB_NAME = 'JournalingApp';
const DB_VERSION = 1;

const STORES = {
  entries: 'entries',           // JournalEntry
  weeklySummaries: 'weeklySummaries',   // WeeklySummary
  monthlySummaries: 'monthlySummaries', // MonthlySummary
};

// インデックス
const INDEXES = {
  entries: [
    { name: 'createdAt', keyPath: 'createdAt' },
    { name: 'tags', keyPath: 'tags', multiEntry: true },
    { name: 'category', keyPath: 'category' },
  ],
  weeklySummaries: [
    { name: 'weekStart', keyPath: 'weekStart' },
  ],
  monthlySummaries: [
    { name: 'month', keyPath: 'month' },
  ],
};
```

---

## 4. 検索・フィルタリング設計

### 4.1 Fuse.js設定

```typescript
// lib/search.ts
import Fuse from 'fuse.js';

const fuseOptions = {
  keys: [
    { name: 'content', weight: 0.7 },
    { name: 'tags', weight: 0.2 },
    { name: 'category', weight: 0.1 },
  ],
  threshold: 0.3,               // 厳密性（0=完全一致、1=何でもマッチ）
  includeScore: true,
  minMatchCharLength: 2,
};

export function searchEntries(entries: JournalEntry[], query: string): JournalEntry[] {
  const fuse = new Fuse(entries, fuseOptions);
  const results = fuse.search(query);
  return results.map(result => result.item);
}
```

### 4.2 フィルタリングロジック

```typescript
// lib/search.ts

interface FilterOptions {
  tags?: string[];
  category?: Category;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export function filterEntries(entries: JournalEntry[], options: FilterOptions): JournalEntry[] {
  let filtered = entries;

  // タグフィルタ
  if (options.tags && options.tags.length > 0) {
    filtered = filtered.filter(entry =>
      options.tags!.some(tag => entry.tags.includes(tag))
    );
  }

  // カテゴリフィルタ
  if (options.category) {
    filtered = filtered.filter(entry => entry.category === options.category);
  }

  // 日付範囲フィルタ
  if (options.dateRange) {
    filtered = filtered.filter(entry =>
      entry.createdAt >= options.dateRange!.start &&
      entry.createdAt <= options.dateRange!.end
    );
  }

  return filtered;
}
```

---

## 5. AI機能設計

### 5.1 AIと会話する機能

```typescript
// lib/aiChat.ts

export class AIChat {
  private apiKey: string;
  private conversationHistory: AIConversation[];

  constructor(apiKey: string, entryContent: string) {
    this.apiKey = apiKey;
    this.conversationHistory = [
      {
        id: generateId(),
        timestamp: new Date(),
        role: 'user',
        message: `以下は私のジャーナルエントリーです：\n\n${entryContent}`,
      },
    ];
  }

  async sendMessage(userMessage: string): Promise<string> {
    // ユーザーメッセージを履歴に追加
    this.conversationHistory.push({
      id: generateId(),
      timestamp: new Date(),
      role: 'user',
      message: userMessage,
    });

    // プロンプト構築
    const prompt = this.buildPrompt(userMessage);

    // Google AI Studio API呼び出し
    const response = await callGeminiAPI(this.apiKey, prompt);

    // AI応答を履歴に追加
    this.conversationHistory.push({
      id: generateId(),
      timestamp: new Date(),
      role: 'ai',
      message: response,
    });

    return response;
  }

  private buildPrompt(userMessage: string): string {
    const systemPrompt = `
あなたは親身になって話を聞くカウンセラーです。
ユーザーの内省を深めるために、適切な質問や共感を示してください。
会話履歴を考慮して、自然な対話を心がけてください。
    `;

    const conversationContext = this.conversationHistory
      .map(conv => `${conv.role === 'user' ? 'ユーザー' : 'AI'}: ${conv.message}`)
      .join('\n');

    return `${systemPrompt}\n\n${conversationContext}\n\nユーザー: ${userMessage}`;
  }

  getConversationHistory(): AIConversation[] {
    return this.conversationHistory;
  }
}
```

### 5.2 内省の質問提案

```typescript
// lib/aiService.ts

export async function generateReflectionQuestions(
  apiKey: string,
  entryContent: string
): Promise<string[]> {
  const prompt = `
以下のジャーナルエントリーを読んで、内省を深めるための質問を3つ提案してください。

ジャーナルエントリー:
${entryContent}

質問は以下の形式で出力してください（質問のみ、番号なし）:
- 質問1
- 質問2
- 質問3
  `;

  const response = await callGeminiAPI(apiKey, prompt);

  // レスポンスを配列に変換
  return response
    .split('\n')
    .filter(line => line.trim().startsWith('-'))
    .map(line => line.trim().substring(1).trim());
}
```

### 5.3 感情分析

```typescript
// lib/emotionAnalysis.ts

export async function analyzeEmotion(
  apiKey: string,
  entryContent: string
): Promise<EmotionAnalysis> {
  const prompt = `
以下のジャーナルエントリーから感情を分析してください。

ジャーナルエントリー:
${entryContent}

以下のJSON形式で出力してください:
{
  "positive": 0-100の数値,
  "negative": 0-100の数値,
  "emotions": {
    "joy": 0-100の数値,
    "sadness": 0-100の数値,
    "anger": 0-100の数値,
    "fear": 0-100の数値,
    "surprise": 0-100の数値
  }
}
  `;

  const response = await callGeminiAPI(apiKey, prompt);

  // JSONパース
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse emotion analysis');
  }

  const analysis = JSON.parse(jsonMatch[0]);

  return {
    ...analysis,
    analyzedAt: new Date(),
  };
}
```

### 5.4 要約生成

```typescript
// lib/summary.ts

export async function generateWeeklySummary(
  apiKey: string,
  entries: JournalEntry[]
): Promise<{ summary: string; themes: string[] }> {
  const entriesText = entries
    .map(entry => `${format(entry.createdAt, 'yyyy/MM/dd')}: ${entry.content}`)
    .join('\n\n');

  const prompt = `
以下は1週間分のジャーナルエントリーです。
全体を要約し、主なテーマを抽出してください。

${entriesText}

以下のJSON形式で出力してください:
{
  "summary": "150文字程度の要約",
  "themes": ["テーマ1", "テーマ2", "テーマ3"]
}
  `;

  const response = await callGeminiAPI(apiKey, prompt);

  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse summary');
  }

  return JSON.parse(jsonMatch[0]);
}

export async function generateMonthlySummary(
  apiKey: string,
  entries: JournalEntry[]
): Promise<{ summary: string; themes: string[] }> {
  // 週次要約と同様のロジック（期間が異なるだけ）
  // ...
}
```

### 5.5 振り返り提案

```typescript
// lib/aiService.ts

export async function generateReflectionSuggestions(
  apiKey: string,
  period: 'weekly' | 'monthly',
  summary: string
): Promise<string[]> {
  const periodText = period === 'weekly' ? '1週間' : '1ヶ月';

  const prompt = `
以下は${periodText}の要約です。
振り返りを深めるための質問を3つ提案してください。

要約:
${summary}

質問は以下の形式で出力してください（質問のみ、番号なし）:
- 質問1
- 質問2
- 質問3
  `;

  const response = await callGeminiAPI(apiKey, prompt);

  return response
    .split('\n')
    .filter(line => line.trim().startsWith('-'))
    .map(line => line.trim().substring(1).trim());
}
```

---

## 6. エクスポート・インポート設計

### 6.1 YAMLエクスポート

```typescript
// lib/export.ts
import yaml from 'js-yaml';

export function exportToYAML(entries: JournalEntry[]): string {
  const data = entries.map(entry => ({
    id: entry.id,
    createdAt: entry.createdAt.toISOString(),
    content: entry.content,
    tags: entry.tags,
    category: entry.category,
    // 画像はbase64なので容量大きいため省略可能
  }));

  return yaml.dump(data);
}
```

### 6.2 Markdownエクスポート

```typescript
// lib/export.ts

export function exportToMarkdown(entries: JournalEntry[]): string {
  return entries
    .map(entry => {
      const date = format(entry.createdAt, 'yyyy年MM月dd日 HH:mm');
      const tags = entry.tags.map(tag => `#${tag}`).join(' ');

      return `
## ${date}

**カテゴリ**: ${entry.category}
**タグ**: ${tags}

${entry.content}

---
      `.trim();
    })
    .join('\n\n');
}
```

### 6.3 Markdownインポート

```typescript
// lib/import.ts

export function importFromMarkdown(markdown: string): Partial<JournalEntry>[] {
  // Markdownを解析してエントリーに変換
  const entries: Partial<JournalEntry>[] = [];

  // ## で始まる行を日付として認識
  const sections = markdown.split(/^## /m).filter(Boolean);

  for (const section of sections) {
    const lines = section.split('\n');
    const dateStr = lines[0].trim();

    // 日付パース
    const date = parseDate(dateStr);

    // タグ・カテゴリ抽出
    const tags: string[] = [];
    let category: Category = 'その他';
    let content = '';

    let inContent = false;
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('**タグ**:')) {
        const tagStr = line.replace('**タグ**:', '').trim();
        tags.push(...tagStr.split(/\s+/).map(t => t.replace('#', '')));
      } else if (line.startsWith('**カテゴリ**:')) {
        category = line.replace('**カテゴリ**:', '').trim() as Category;
      } else if (line.trim() === '---') {
        break;
      } else if (inContent || (!line.startsWith('**') && line.trim())) {
        inContent = true;
        content += line + '\n';
      }
    }

    entries.push({
      createdAt: date,
      content: content.trim(),
      tags,
      category,
    });
  }

  return entries;
}
```

---

## 7. クラウドバックアップ設計

### 7.1 OneDrive統合

```typescript
// lib/backup.ts

export async function backupToOneDrive(entries: JournalEntry[]): Promise<void> {
  // OAuth 2.0認証
  const accessToken = await authenticateOneDrive();

  // YAMLエクスポート
  const yaml = exportToYAML(entries);

  // ファイル名
  const filename = `journal-backup-${format(new Date(), 'yyyy-MM-dd')}.yaml`;

  // OneDrive APIでアップロード
  const response = await fetch(
    'https://graph.microsoft.com/v1.0/me/drive/root:/JournalingApp/' + filename + ':/content',
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/x-yaml',
      },
      body: yaml,
    }
  );

  if (!response.ok) {
    throw new Error('OneDrive backup failed');
  }
}
```

### 7.2 Google Drive統合

```typescript
// lib/backup.ts

export async function backupToGoogleDrive(entries: JournalEntry[]): Promise<void> {
  // OAuth 2.0認証
  const accessToken = await authenticateGoogleDrive();

  // YAMLエクスポート
  const yaml = exportToYAML(entries);

  // ファイル名
  const filename = `journal-backup-${format(new Date(), 'yyyy-MM-dd')}.yaml`;

  // Google Drive APIでアップロード
  const metadata = {
    name: filename,
    mimeType: 'application/x-yaml',
    parents: ['appDataFolder'], // アプリ専用フォルダ
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([yaml], { type: 'application/x-yaml' }));

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: form,
    }
  );

  if (!response.ok) {
    throw new Error('Google Drive backup failed');
  }
}
```

---

## 8. UI/UXデザイン設計

### 8.1 ノート風デザイン

```typescript
// components/JournalEditor.tsx

export function JournalEditor({ onSave }: Props) {
  return (
    <div className="relative">
      {/* 紙のテクスチャ背景 */}
      <div className="absolute inset-0 bg-cream-100 opacity-50 bg-paper-texture" />

      {/* エディタ */}
      <textarea
        className="
          relative z-10 w-full min-h-[400px] p-8
          bg-transparent border-none outline-none
          text-gray-800 font-handwriting text-lg
          leading-relaxed
        "
        placeholder="今日の出来事や気持ちを書いてみましょう..."
      />

      {/* 罫線（オプション） */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="border-b border-gray-200"
            style={{ marginTop: `${(i + 1) * 30}px` }}
          />
        ))}
      </div>
    </div>
  );
}
```

### 8.2 温かみのある色使い

```typescript
// tailwind.config.js

module.exports = {
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FFFEF9',
          100: '#FFF9E6',
          200: '#FFF4CC',
          // ...
        },
        warm: {
          orange: '#FF9966',
          peach: '#FFCC99',
          pink: '#FFB3BA',
        },
      },
      fontFamily: {
        handwriting: ['"Noto Sans JP"', 'sans-serif'], // 手書き風フォント
      },
      backgroundImage: {
        'paper-texture': "url('/textures/paper.png')",
      },
    },
  },
};
```

---

## 9. PWA設定

### 9.1 manifest.json

```json
{
  "name": "ジャーナリングアプリ",
  "short_name": "Journal",
  "description": "自己を見つめ、思考を整理するジャーナリングアプリ",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FFF9E6",
  "theme_color": "#FF9966",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 10. パフォーマンス最適化

### 10.1 IndexedDB最適化
- インデックスの適切な設定（createdAt, tags, category）
- クエリの効率化（範囲検索、複合インデックス）
- データの分割（古いデータのアーカイブ）

### 10.2 検索最適化
- Fuse.jsの閾値調整
- 検索結果のページネーション（無限スクロール）
- デバウンス処理（検索入力時）

### 10.3 画像最適化
- 画像のリサイズ（最大1920x1080）
- 圧縮（JPEG品質80%）
- 遅延読み込み（Lazy loading）

---

## 11. テスト戦略

### 11.1 単体テスト
- IndexedDB操作（CRUD）
- 検索機能（Fuse.js）
- フィルタリング機能
- エクスポート・インポート

### 11.2 統合テスト
- AI機能全体
- 感情分析の精度
- クラウドバックアップ

### 11.3 E2Eテスト
- ジャーナル記録フロー
- 検索・フィルタフロー
- AI会話フロー
- エクスポート・インポートフロー

---

## 12. 次ステップ

1. ✅ 技術設計書レビュー・承認
2. ⬜ 実装計画書作成（TDD準拠版）
3. ⬜ 開発環境セットアップ
4. ⬜ 実装開始（Claude Code on the Web）

---

**作成者**: クロ
**レビュー待ち**: あおいさん
