/**
 * Phase 2-3: 検索・フィルタリング機能（Refactor）
 * パフォーマンス最適化とユーティリティ追加
 */

import Fuse from 'fuse.js';
import type { JournalEntry, Category } from '@/types/journal';

/**
 * フィルタオプション
 */
export interface FilterOptions {
  tags?: string[];
  category?: Category;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

/**
 * Fuse.js設定
 * - content: 70%の重み（本文検索が最優先）
 * - tags: 20%の重み（タグも重要）
 * - category: 10%の重み（カテゴリは補助的）
 */
const fuseOptions = {
  keys: [
    { name: 'content', weight: 0.7 },
    { name: 'tags', weight: 0.2 },
    { name: 'category', weight: 0.1 },
  ],
  threshold: 0.3, // 0=完全一致、1=何でもマッチ
  includeScore: true,
  minMatchCharLength: 1,
  ignoreLocation: true, // 位置に関係なく検索
  isCaseSensitive: false, // 大文字小文字を区別しない
};

/**
 * Fuse.jsインスタンスキャッシュ（パフォーマンス最適化）
 */
let fuseInstance: Fuse<JournalEntry> | null = null;
let cachedEntriesLength = 0;

/**
 * Fuse.jsインスタンスを取得（再利用）
 */
function getFuseInstance(entries: JournalEntry[]): Fuse<JournalEntry> {
  // エントリー数が変わった場合は再作成
  if (!fuseInstance || cachedEntriesLength !== entries.length) {
    fuseInstance = new Fuse(entries, fuseOptions);
    cachedEntriesLength = entries.length;
  }
  return fuseInstance;
}

/**
 * Fuse.jsインスタンスキャッシュをクリア
 */
export function clearSearchCache(): void {
  fuseInstance = null;
  cachedEntriesLength = 0;
}

/**
 * 全文検索（Fuse.js使用、キャッシュ最適化済み）
 * @param entries - 検索対象のエントリー配列
 * @param query - 検索クエリ
 * @returns 検索結果のエントリー配列（関連度順）
 */
export function searchEntries(
  entries: JournalEntry[],
  query: string
): JournalEntry[] {
  // 空のクエリの場合は全エントリーを返す
  if (!query || query.trim() === '') {
    return entries;
  }

  // キャッシュされたFuseインスタンスを使用（パフォーマンス向上）
  const fuse = getFuseInstance(entries);
  const results = fuse.search(query);

  // スコア順に並び替え済み
  return results.map((result) => result.item);
}

/**
 * フィルタリング
 * @param entries - フィルタ対象のエントリー配列
 * @param options - フィルタオプション
 * @returns フィルタ結果のエントリー配列
 */
export function filterEntries(
  entries: JournalEntry[],
  options: FilterOptions
): JournalEntry[] {
  let filtered = entries;

  // タグフィルタ（OR条件）
  if (options.tags && options.tags.length > 0) {
    filtered = filtered.filter((entry) =>
      options.tags!.some((tag) => entry.tags.includes(tag))
    );
  }

  // カテゴリフィルタ
  if (options.category) {
    filtered = filtered.filter((entry) => entry.category === options.category);
  }

  // 日付範囲フィルタ
  if (options.dateRange) {
    const { start, end } = options.dateRange;
    filtered = filtered.filter((entry) => {
      const entryDate = entry.createdAt;
      return entryDate >= start && entryDate <= end;
    });
  }

  return filtered;
}

/**
 * 検索とフィルタの組み合わせ
 * @param entries - 対象のエントリー配列
 * @param query - 検索クエリ
 * @param options - フィルタオプション
 * @returns 検索・フィルタ結果のエントリー配列
 */
export function combineSearchAndFilter(
  entries: JournalEntry[],
  query: string,
  options: FilterOptions
): JournalEntry[] {
  // 1. まず検索を実行
  let results = searchEntries(entries, query);

  // 2. 次にフィルタを適用
  results = filterEntries(results, options);

  return results;
}

/**
 * デバウンス関数（UI統合時に使用）
 * @param func - デバウンスする関数
 * @param delay - 遅延時間（ミリ秒）
 * @returns デバウンスされた関数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}
