# 📝 実装計画書（TDD準拠版）：No.35「ジャーナリングアプリ」

**作成日**: 2025-01-13
**バージョン**: 1.0
**アプリ番号**: 35

---

## 実装方針

### TDD（テスト駆動開発）の適用
すべてのPhaseで **Red → Green → Refactor** サイクルを厳守します。

```
Red（失敗）: テストを先に書き、失敗することを確認
Green（成功）: テストを通す最小限のコードを実装
Refactor（改善）: テストが通った状態でコードを改善
```

### 実装の流れ
1. **Phase 0**: テスト環境構築
2. **Phase 1-9**: 機能実装（各Phase内でTDDサイクル）
3. **Phase 10**: 統合テスト・E2Eテスト・リファクタリング

---

## Phase 0: テスト環境構築（予定工数: 2時間）

### 0-1. Next.js 14プロジェクトセットアップ（Red）
【 】プロジェクト作成前のテスト失敗確認
```bash
npx create-next-app@14 app035-journaling --typescript --tailwind --app
cd app035-journaling
```

### 0-2. テストライブラリインストール（Green）
【 】Jest + React Testing Library設定
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
npm install --save-dev @testing-library/user-event
```

【 】Playwright E2Eテストセットアップ
```bash
npm install --save-dev @playwright/test
npx playwright install
```

【 】Jest設定ファイル作成
- `jest.config.js`
- `jest.setup.js`

### 0-3. IndexedDB用テストモック設定（Refactor）
【 】fake-indexeddb インストール
```bash
npm install --save-dev fake-indexeddb
```

【 】IndexedDBモック設定
- `__mocks__/indexeddb.ts` 作成
- テスト環境でのIndexedDB動作確認

【 】テスト実行確認
```bash
npm run test
```

**完了条件**:
- ✅ テストが実行できる環境が整っている
- ✅ IndexedDBのモックが正しく動作

---

## Phase 1: IndexedDB実装（予定工数: 8時間）

### 1-1. IndexedDB基本機能テスト作成（Red）
【 】`lib/db.test.ts` 作成
- DB初期化テスト
- エントリー追加テスト（CRUD: Create）
- エントリー取得テスト（CRUD: Read）
- エントリー更新テスト（CRUD: Update）
- エントリー削除テスト（CRUD: Delete）
- インデックスによる検索テスト（日付、タグ、カテゴリ）

**テスト例**:
```typescript
describe('JournalDB', () => {
  it('should initialize database', async () => {
    const db = await initDB();
    expect(db).toBeDefined();
  });

  it('should add journal entry', async () => {
    const entry: Partial<JournalEntry> = {
      content: 'テスト記録',
      tags: ['テスト'],
      category: '学習',
    };
    const id = await addEntry(entry);
    expect(id).toBeDefined();
  });
});
```

### 1-2. IndexedDB実装（Green）
【 】`lib/db.ts` 実装
- `initDB`: データベース初期化
- `addEntry`: エントリー追加
- `getEntry`: エントリー取得
- `updateEntry`: エントリー更新
- `deleteEntry`: エントリー削除
- `getAllEntries`: 全エントリー取得
- `getEntriesByDateRange`: 日付範囲で取得
- `getEntriesByTag`: タグで取得
- `getEntriesByCategory`: カテゴリで取得

**完了条件**:
- ✅ すべてのテストがパス
- ✅ CRUD操作が正しく動作

### 1-3. IndexedDBリファクタリング（Refactor）
【 】コードの整理
- エラーハンドリングの追加
- トランザクション管理の最適化
- 型安全性の向上

【 】テスト再実行
```bash
npm run test -- lib/db.test.ts
```

**完了条件**:
- ✅ テストが引き続きすべてパス
- ✅ コードの保守性が向上

---

## Phase 2: 検索・フィルタリング実装（予定工数: 6時間）

### 2-1. 検索機能テスト作成（Red）
【 】`lib/search.test.ts` 作成
- 全文検索テスト（Fuse.js）
- タグ検索テスト
- カテゴリフィルタテスト
- 日付範囲フィルタテスト
- 複合フィルタテスト

**テスト例**:
```typescript
describe('Search', () => {
  it('should search entries by content', () => {
    const entries = [/* テストデータ */];
    const results = searchEntries(entries, '仕事');
    expect(results.length).toBeGreaterThan(0);
  });

  it('should filter entries by tag', () => {
    const entries = [/* テストデータ */];
    const results = filterEntries(entries, { tags: ['健康'] });
    expect(results.every(e => e.tags.includes('健康'))).toBe(true);
  });
});
```

### 2-2. 検索機能実装（Green）
【 】Fuse.jsインストール
```bash
npm install fuse.js
```

【 】`lib/search.ts` 実装
- `searchEntries`: 全文検索（Fuse.js使用）
- `filterEntries`: フィルタリング
- `combineSearchAndFilter`: 検索とフィルタの組み合わせ

**完了条件**:
- ✅ すべてのテストがパス
- ✅ 検索結果が適切

### 2-3. 検索機能リファクタリング（Refactor）
【 】Fuse.js設定の最適化
- 閾値調整
- キーの重み付け調整

【 】パフォーマンス最適化
- デバウンス処理の追加
- 結果のキャッシング

【 】テスト再実行
```bash
npm run test -- lib/search.test.ts
```

**完了条件**:
- ✅ テストが引き続きすべてパス
- ✅ 検索パフォーマンスが向上

---

## Phase 3: AI会話機能実装（予定工数: 10時間）

### 3-1. AI会話機能テスト作成（Red）
【 】`lib/aiChat.test.ts` 作成
- AIChatクラスの初期化テスト
- メッセージ送信テスト
- 会話履歴管理テスト
- プロンプト構築テスト

**テスト例**:
```typescript
describe('AIChat', () => {
  it('should initialize with entry content', () => {
    const chat = new AIChat('api-key', 'ジャーナル内容');
    expect(chat.getConversationHistory().length).toBeGreaterThan(0);
  });

  it('should send message and receive response', async () => {
    const chat = new AIChat('api-key', 'ジャーナル内容');
    const response = await chat.sendMessage('この気持ちについて話したい');
    expect(response).toBeDefined();
  });
});
```

### 3-2. AI会話機能実装（Green）
【 】`lib/aiChat.ts` 実装
- `AIChat` クラス
- `sendMessage` メソッド
- `buildPrompt` メソッド（会話履歴を考慮）
- `getConversationHistory` メソッド

【 】`lib/aiService.ts` にGoogle AI API統合
- 会話用プロンプトの最適化
- コンテキスト管理

**完了条件**:
- ✅ すべてのテストがパス
- ✅ AI会話が自然に動作

### 3-3. AI会話機能リファクタリング（Refactor）
【 】プロンプトの最適化
- システムプロンプトの改善
- 会話履歴の要約（長くなった場合）

【 】エラーハンドリングの強化
- API エラーの適切な処理
- リトライロジック

【 】テスト再実行
```bash
npm run test -- lib/aiChat.test.ts
```

**完了条件**:
- ✅ テストが引き続きすべてパス
- ✅ 会話品質が向上

---

## Phase 4: AI分析機能実装（予定工数: 8時間）

### 4-1. AI分析機能テスト作成（Red）

【 】`lib/emotionAnalysis.test.ts` 作成
- 感情分析テスト
- ポジティブ/ネガティブ判定テスト
- 感情スコアの妥当性テスト

【 】`lib/summary.test.ts` 作成
- 週次要約生成テスト
- 月次要約生成テスト
- テーマ抽出テスト

【 】`lib/aiService.test.ts` 更新
- 内省の質問提案テスト
- 振り返り提案テスト

**テスト例**:
```typescript
describe('EmotionAnalysis', () => {
  it('should analyze emotion from entry', async () => {
    const analysis = await analyzeEmotion('api-key', '今日はとても嬉しい！');
    expect(analysis.positive).toBeGreaterThan(analysis.negative);
    expect(analysis.emotions.joy).toBeGreaterThan(50);
  });
});
```

### 4-2. AI分析機能実装（Green）

【 】`lib/emotionAnalysis.ts` 実装
- `analyzeEmotion` 関数
- JSON パース処理
- エラーハンドリング

【 】`lib/summary.ts` 実装
- `generateWeeklySummary` 関数
- `generateMonthlySummary` 関数
- テーマ抽出ロジック

【 】`lib/aiService.ts` 更新
- `generateReflectionQuestions` 関数
- `generateReflectionSuggestions` 関数

**完了条件**:
- ✅ すべてのテストがパス
- ✅ 感情分析の精度が適切
- ✅ 要約が適切

### 4-3. AI分析機能リファクタリング（Refactor）

【 】プロンプトの最適化
- 感情分析の精度向上
- 要約の品質向上

【 】結果のキャッシング
- 同じエントリーの再分析を避ける

【 】テスト再実行
```bash
npm run test -- lib/emotionAnalysis.test.ts lib/summary.test.ts
```

**完了条件**:
- ✅ テストが引き続きすべてパス
- ✅ AI分析の品質が向上

---

## Phase 5: エクスポート・インポート実装（予定工数: 6時間）

### 5-1. エクスポート・インポートテスト作成（Red）

【 】`lib/export.test.ts` 作成
- YAMLエクスポートテスト
- Markdownエクスポートテスト
- フォーマットの正確性テスト

【 】`lib/import.test.ts` 作成
- Markdownインポートテスト
- 日付パーステスト
- タグ・カテゴリ抽出テスト

**テスト例**:
```typescript
describe('Export', () => {
  it('should export entries to YAML', () => {
    const entries = [/* テストデータ */];
    const yaml = exportToYAML(entries);
    expect(yaml).toContain('id:');
    expect(yaml).toContain('content:');
  });
});

describe('Import', () => {
  it('should import entries from Markdown', () => {
    const markdown = '## 2025年1月13日...';
    const entries = importFromMarkdown(markdown);
    expect(entries.length).toBeGreaterThan(0);
  });
});
```

### 5-2. エクスポート・インポート実装（Green）

【 】js-yamlインストール
```bash
npm install js-yaml
npm install --save-dev @types/js-yaml
```

【 】`lib/export.ts` 実装
- `exportToYAML` 関数
- `exportToMarkdown` 関数

【 】`lib/import.ts` 実装
- `importFromMarkdown` 関数
- Markdownパーサー
- 日付パース処理

**完了条件**:
- ✅ すべてのテストがパス
- ✅ エクスポート・インポートが正しく動作

### 5-3. エクスポート・インポートリファクタリング（Refactor）

【 】フォーマットの改善
- Markdown可読性の向上
- YAML構造の最適化

【 】エラーハンドリング
- 不正なフォーマットの検出
- パースエラーの適切な処理

【 】テスト再実行
```bash
npm run test -- lib/export.test.ts lib/import.test.ts
```

**完了条件**:
- ✅ テストが引き続きすべてパス
- ✅ エクスポート・インポートの品質が向上

---

## Phase 6: クラウドバックアップ実装（予定工数: 8時間）

### 6-1. クラウドバックアップテスト作成（Red）

【 】`lib/backup.test.ts` 作成
- OneDriveバックアップテスト（モック）
- Google Driveバックアップテスト（モック）
- OAuth認証フローテスト（モック）

**テスト例**:
```typescript
describe('Backup', () => {
  it('should backup to OneDrive', async () => {
    const mockAuth = jest.fn().mockResolvedValue('mock-token');
    const entries = [/* テストデータ */];
    await backupToOneDrive(entries);
    expect(mockAuth).toHaveBeenCalled();
  });
});
```

### 6-2. クラウドバックアップ実装（Green）

【 】`lib/backup.ts` 実装
- `authenticateOneDrive` 関数（OAuth 2.0）
- `backupToOneDrive` 関数
- `authenticateGoogleDrive` 関数（OAuth 2.0）
- `backupToGoogleDrive` 関数

【 】OAuth認証フロー実装
- OneDrive認証
- Google Drive認証

**完了条件**:
- ✅ すべてのテストがパス
- ✅ バックアップが正しく動作

### 6-3. クラウドバックアップリファクタリング（Refactor）

【 】認証フローの改善
- トークンのリフレッシュ
- セキュアなトークン保存

【 】エラーハンドリング
- ネットワークエラーの処理
- 認証失敗の処理

【 】テスト再実行
```bash
npm run test -- lib/backup.test.ts
```

**完了条件**:
- ✅ テストが引き続きすべてパス
- ✅ バックアップの信頼性が向上

---

## Phase 7: UIコンポーネント実装（予定工数: 14時間）

### 7-1. コンポーネントテスト作成（Red）

【 】`components/JournalEditor.test.tsx` 作成
- テキスト入力テスト
- 自動保存テスト

【 】`components/TagInput.test.tsx` 作成
- タグ追加テスト
- オートコンプリートテスト

【 】`components/CategorySelect.test.tsx` 作成
- カテゴリ選択テスト

【 】`components/ImageUpload.test.tsx` 作成
- 画像アップロードテスト
- リサイズテスト

【 】`components/Calendar.test.tsx` 作成
- カレンダー表示テスト
- 日付選択テスト

【 】`components/EntryList.test.tsx` 作成
- リスト表示テスト
- ページネーションテスト

【 】`components/SearchBar.test.tsx` 作成
- 検索入力テスト
- デバウンステスト

【 】`components/FilterPanel.test.tsx` 作成
- フィルタ選択テスト
- 複合フィルタテスト

【 】`components/AIChatBox.test.tsx` 作成
- メッセージ送信テスト
- 会話履歴表示テスト

【 】`components/EmotionChart.test.tsx` 作成
- グラフ表示テスト
- データ可視化テスト

### 7-2. コンポーネント実装（Green）

【 】`components/JournalEditor.tsx` 実装
- ノート風デザイン
- テキストエリア
- 自動保存機能

【 】`components/TagInput.tsx` 実装
- タグ入力フィールド
- オートコンプリート

【 】`components/CategorySelect.tsx` 実装
- ドロップダウン選択

【 】`components/ImageUpload.tsx` 実装
- ドラッグ&ドロップ
- 画像リサイズ・圧縮

【 】`components/Calendar.tsx` 実装
- 月次カレンダー
- 記録マーク表示

【 】`components/EntryList.tsx` 実装
- 時系列リスト
- 無限スクロール

【 】`components/SearchBar.tsx` 実装
- 検索入力
- デバウンス処理

【 】`components/FilterPanel.tsx` 実装
- タグフィルタ
- カテゴリフィルタ
- 日付範囲フィルタ

【 】`components/AIChatBox.tsx` 実装
- メッセージ入力
- 会話履歴表示
- ローディング表示

【 】`components/EmotionChart.tsx` 実装
- Chart.jsまたはRecharts使用
- 感情推移グラフ

**完了条件**:
- ✅ すべてのコンポーネントテストがパス
- ✅ UIが要件通りに動作

### 7-3. UIコンポーネントリファクタリング（Refactor）

【 】デザインの統一
- 温かみのある色使い
- ノート風デザインの適用
- アニメーションの追加

【 】アクセシビリティ改善
- ARIA属性の追加
- キーボード操作対応

【 】テスト再実行
```bash
npm run test -- components/
```

**完了条件**:
- ✅ テストが引き続きすべてパス
- ✅ UIの統一感が向上
- ✅ アクセシビリティが改善

---

## Phase 8: カスタムフック実装（予定工数: 6時間）

### 8-1. カスタムフックテスト作成（Red）

【 】`hooks/useJournalDB.test.ts` 作成
- IndexedDB操作のテスト
- CRUD操作のテスト

【 】`hooks/useSearch.test.ts` 作成
- 検索機能のテスト
- フィルタ機能のテスト

【 】`hooks/useAIChat.test.ts` 作成
- AI会話のテスト
- 会話履歴管理のテスト

【 】`hooks/useEmotionAnalysis.test.ts` 作成
- 感情分析のテスト
- 結果管理のテスト

### 8-2. カスタムフック実装（Green）

【 】`hooks/useJournalDB.ts` 実装
- IndexedDB操作のフック化
- CRUD操作の状態管理

【 】`hooks/useSearch.ts` 実装
- 検索・フィルタのフック化
- 検索結果の状態管理

【 】`hooks/useAIChat.ts` 実装
- AI会話のフック化
- 会話状態の管理

【 】`hooks/useEmotionAnalysis.ts` 実装
- 感情分析のフック化
- 分析結果の状態管理

**完了条件**:
- ✅ すべてのフックテストがパス
- ✅ フックが正しく動作

### 8-3. カスタムフックリファクタリング（Refactor）

【 】フック間の依存関係の最適化
【 】メモリリークの防止（クリーンアップ）
【 】パフォーマンスの最適化（useMemo, useCallback）

【 】テスト再実行
```bash
npm run test -- hooks/
```

**完了条件**:
- ✅ テストが引き続きすべてパス
- ✅ パフォーマンスが向上

---

## Phase 9: 状態管理（Zustand）実装（予定工数: 4時間）

### 9-1. Zustandストアテスト作成（Red）

【 】`store/journalStore.test.ts` 作成
- ストアの初期化テスト
- アクションのテスト
- セレクタのテスト

**テスト例**:
```typescript
describe('JournalStore', () => {
  it('should initialize store', () => {
    const store = useJournalStore.getState();
    expect(store.entries).toEqual([]);
  });

  it('should add entry', () => {
    const { addEntry } = useJournalStore.getState();
    addEntry({ content: 'テスト', tags: [], category: '学習' });
    const { entries } = useJournalStore.getState();
    expect(entries.length).toBe(1);
  });
});
```

### 9-2. Zustandストア実装（Green）

【 】Zustandインストール
```bash
npm install zustand
```

【 】`store/journalStore.ts` 実装
- エントリー管理
- 検索・フィルタ状態
- AI会話状態
- UI状態（カレンダー日付等）

**完了条件**:
- ✅ すべてのストアテストがパス
- ✅ 状態管理が正しく動作

### 9-3. Zustandストアリファクタリング（Refactor）

【 】ストア構造の最適化
- 状態の分割（必要に応じて）
- セレクタの最適化

【 】テスト再実行
```bash
npm run test -- store/journalStore.test.ts
```

**完了条件**:
- ✅ テストが引き続きすべてパス
- ✅ 状態管理が効率的

---

## Phase 10: 統合テスト・PWA対応・リファクタリング（予定工数: 10時間）

### 10-1. E2Eテスト作成（Red）

【 】`e2e/journal-basic.spec.ts` 作成
- ジャーナル記録の基本フロー
  - テキスト入力 → タグ追加 → カテゴリ選択 → 保存
  - 画像添付
  - 保存後の表示確認
- カレンダー表示
  - 月次カレンダーの表示
  - 記録のある日のマーク確認
  - 日付選択でエントリー表示
- リスト表示
  - 時系列リスト表示
  - 新しい順・古い順の切り替え

【 】`e2e/search-filter.spec.ts` 作成
- 検索機能
  - 全文検索
  - タグ検索
  - 日付検索
- フィルタリング機能
  - カテゴリフィルタ
  - タグフィルタ
  - 複合フィルタ

【 】`e2e/ai-chat.spec.ts` 作成
- AI会話機能
  - エントリーからAI会話開始
  - メッセージ送信と応答確認
  - 会話履歴の保存確認

【 】`e2e/ai-analysis.spec.ts` 作成
- 感情分析
  - 感情分析の実行
  - グラフ表示確認
- 要約生成
  - 週次要約生成
  - 月次要約生成
- 内省質問・振り返り提案
  - 質問生成確認
  - 提案生成確認

【 】`e2e/export-import.spec.ts` 作成
- エクスポート機能
  - YAMLエクスポート
  - Markdownエクスポート
  - ファイルダウンロード確認
- インポート機能
  - Markdownインポート
  - データ復元確認

【 】`e2e/backup.spec.ts` 作成
- クラウドバックアップ
  - OneDriveバックアップ（モック）
  - Google Driveバックアップ（モック）
  - 認証フロー確認

### 10-2. E2Eテスト実装（Green）

【 】Playwrightテスト実装
- 各テストシナリオの実装
- スクリーンショット撮影
- データの永続性確認

【 】E2Eテスト実行
```bash
npx playwright test
```

**完了条件**:
- ✅ すべてのE2Eテストがパス
- ✅ 主要なユーザーフローが正しく動作

### 10-3. E2Eテストのリファクタリング（Refactor）

【 】テストコードの重複削除
- 共通セットアップの抽出
- 共通アサーションの関数化

【 】Page Objectパターンの適用
- `pages/JournalPage.ts` 作成
- `pages/CalendarPage.ts` 作成
- `pages/AIChatPage.ts` 作成
- ページ操作のカプセル化
- セレクタの一元管理

【 】ヘルパー関数の抽出
- `helpers/journal.ts` 作成
- 繰り返し処理の関数化
- 待機処理の共通化

【 】テスト可読性の向上
- テスト名の改善
- コメントの追加
- Given-When-Then形式の適用

【 】E2Eテスト再実行
```bash
npx playwright test
```

**完了条件**:
- ✅ テストが引き続きすべてパス
- ✅ テストコードの保守性が向上
- ✅ 新しいテストの追加が容易になった

### 10-4. PWA対応（Refactor）

【 】next-pwaインストール・設定
```bash
npm install next-pwa
```

【 】`next.config.js` 設定
- Service Worker有効化
- オフライン対応設定

【 】`manifest.json` 作成
- アプリ名、説明
- アイコン設定
- テーマカラー（温かみのある色）

【 】アイコン画像作成
- 192x192, 512x512サイズ

【 】PWA動作確認
- インストール可能性
- オフライン動作（記録・閲覧機能）

**完了条件**:
- ✅ PWAとしてインストール可能
- ✅ 記録・閲覧機能がオフラインで動作

### 10-5. パフォーマンス最適化（Refactor）

【 】IndexedDB最適化
- インデックスの最適化
- クエリの効率化

【 】検索最適化
- Fuse.js設定の調整
- デバウンス処理の最適化

【 】画像最適化
- 画像リサイズの最適化
- 圧縮の最適化
- Lazy loading実装

【 】バンドルサイズの最適化
- 不要なインポート削除
- コード分割（dynamic import）

【 】パフォーマンス測定
```bash
npm run build
npm run start
# Lighthouse実行
```

**完了条件**:
- ✅ 読み込み速度2秒以内
- ✅ 検索速度1秒以内
- ✅ Lighthouseスコア90以上

### 10-6. コードレビュー・最終リファクタリング（Refactor）

【 】全体コードレビュー
- 命名規則の統一
- コメントの追加・修正
- 型定義の最適化

【 】デザイン仕様の最終確認
- 温かみのある色使い
- ノート風デザイン
- アニメーションの滑らかさ
- レスポンシブデザイン

【 】アクセシビリティ最終確認
- ARIA属性の完全性
- キーボード操作の網羅性
- スクリーンリーダー対応

【 】全テスト実行
```bash
npm run test
npm run test:e2e
```

**完了条件**:
- ✅ すべてのテストがパス
- ✅ コードカバレッジ80%以上
- ✅ デザイン要件を満たしている
- ✅ アクセシビリティ基準を満たしている

### 10-7. ドキュメント整備（完了）

【 】README.md作成
- アプリ概要
- 機能一覧
- インストール手順
- 使い方
- 開発方法

【 】コードコメント最終確認
- 複雑なロジックの説明
- AI機能の説明
- IndexedDBの使い方の説明

【 】デプロイ手順書作成（該当する場合）

**完了条件**:
- ✅ ドキュメントが完全
- ✅ 第三者が理解できる内容

---

## 全体の完了条件

### 機能面
- ✅ ジャーナル記録機能（テキスト、タグ、カテゴリ、画像）が動作
- ✅ カレンダー表示・リスト表示が動作
- ✅ 検索・フィルタリング（全文検索、タグ、カテゴリ、日付）が動作
- ✅ AIと会話する機能が動作（重要）
- ✅ 内省の質問提案が動作
- ✅ 感情分析が動作（重要）
- ✅ 日記の要約（週次・月次）が動作
- ✅ 振り返りの提案が動作（重要）
- ✅ エクスポート（YAML、Markdown）が動作
- ✅ インポート（Markdown）が動作
- ✅ クラウドバックアップ（OneDrive、Google Drive）が動作

### 品質面
- ✅ すべてのユニットテストがパス
- ✅ すべてのE2Eテストがパス
- ✅ コードカバレッジ80%以上
- ✅ PWAとしてインストール可能
- ✅ 記録・閲覧機能がオフラインで動作
- ✅ Lighthouseスコア90以上
- ✅ 読み込み速度2秒以内
- ✅ 検索速度1秒以内

### ドキュメント面
- ✅ README.mdが完全
- ✅ コードコメントが適切
- ✅ 要件定義書との整合性確認
- ✅ 技術設計書との整合性確認

---

## リスク管理

### 技術リスク

| リスク | 対策 | 担当Phase |
|--------|------|-----------|
| IndexedDBの容量制限 | データ圧縮、古いデータのアーカイブ | Phase 1, 10 |
| AI会話の品質 | プロンプト最適化、コンテキスト管理 | Phase 3, 10 |
| 感情分析の精度 | プロンプト改善、複数回の分析 | Phase 4, 10 |
| クラウドバックアップの認証 | OAuth 2.0実装、セキュリティ対策 | Phase 6 |
| 検索パフォーマンス | Fuse.js最適化、デバウンス | Phase 2, 10 |

### スケジュールリスク

| リスク | 対策 | 担当Phase |
|--------|------|-----------|
| AI機能の実装時間 | Phase 3-4に十分な時間確保 | Phase 3, 4 |
| クラウド連携の複雑性 | OAuth認証の事前調査 | Phase 6 |
| E2Eテストの複雑性 | Page Objectパターン適用 | Phase 10 |

---

## 参考資料

### IndexedDB
- [MDN IndexedDB](https://developer.mozilla.org/ja/docs/Web/API/IndexedDB_API)
- [fake-indexeddb](https://www.npmjs.com/package/fake-indexeddb)

### 検索
- [Fuse.js](https://fusejs.io/)

### AI
- [Google AI Studio](https://ai.google.dev/)
- [Gemini API](https://ai.google.dev/gemini-api/docs)

### クラウド連携
- [Microsoft Graph API (OneDrive)](https://docs.microsoft.com/ja-jp/graph/api/resources/onedrive)
- [Google Drive API](https://developers.google.com/drive/api/v3/about-sdk)

### TDD
- [Jest公式ドキュメント](https://jestjs.io/ja/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright](https://playwright.dev/)

### Next.js 14
- [Next.js App Router](https://nextjs.org/docs/app)
- [next-pwa](https://www.npmjs.com/package/next-pwa)

---

**作成者**: クロ
**レビュー待ち**: あおいさん
**次ステップ**: 実装開始
