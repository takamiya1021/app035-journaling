/**
 * Phase 2-1: 検索・フィルタリング機能テスト（Red）
 */

import { searchEntries, filterEntries, combineSearchAndFilter } from './search';
import type { JournalEntry, Category } from '@/types/journal';

// テストデータ
const createMockEntry = (
  id: string,
  content: string,
  tags: string[],
  category: Category,
  date: Date
): JournalEntry => ({
  id,
  content,
  tags,
  category,
  images: [],
  aiConversations: [],
  createdAt: date,
  updatedAt: date,
});

const mockEntries: JournalEntry[] = [
  createMockEntry(
    '1',
    '今日は仕事で大きな成果があった。チームメンバーと協力して目標を達成できた。',
    ['仕事', '達成感', 'チーム'],
    '仕事',
    new Date('2025-01-10')
  ),
  createMockEntry(
    '2',
    '朝から気分が良い。健康的な朝食を食べて、ジョギングもできた。',
    ['健康', '運動', '朝'],
    'プライベート',
    new Date('2025-01-11')
  ),
  createMockEntry(
    '3',
    '新しいプログラミング言語を学び始めた。TypeScriptの型システムが面白い。',
    ['学習', 'プログラミング', 'TypeScript'],
    '学習',
    new Date('2025-01-12')
  ),
  createMockEntry(
    '4',
    '仕事のプロジェクトが難航している。でも諦めずに頑張る。',
    ['仕事', '挑戦'],
    '仕事',
    new Date('2025-01-13')
  ),
  createMockEntry(
    '5',
    '友人と楽しい時間を過ごした。久しぶりに笑った。',
    ['友人', '楽しい'],
    'プライベート',
    new Date('2025-01-14')
  ),
];

describe('Search Functions', () => {
  describe('searchEntries - 全文検索（Fuse.js）', () => {
    it('should search entries by content keyword', () => {
      const results = searchEntries(mockEntries, '仕事');
      expect(results.length).toBe(2);
      expect(results.every(entry => entry.content.includes('仕事'))).toBe(true);
    });

    it('should return fuzzy match results', () => {
      const results = searchEntries(mockEntries, 'プログラム');
      expect(results.length).toBeGreaterThan(0);
      // プログラミング を含むエントリーがマッチするはず
      expect(results.some(entry => entry.content.includes('プログラミング'))).toBe(true);
    });

    it('should search in tags', () => {
      const results = searchEntries(mockEntries, '健康');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(entry => entry.tags.includes('健康'))).toBe(true);
    });

    it('should return empty array for non-matching query', () => {
      const results = searchEntries(mockEntries, 'xyz123notfound');
      expect(results).toEqual([]);
    });

    it('should return all entries for empty query', () => {
      const results = searchEntries(mockEntries, '');
      expect(results).toEqual(mockEntries);
    });

    it('should be case insensitive', () => {
      const results = searchEntries(mockEntries, 'TYPESCRIPT');
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('filterEntries - フィルタリング', () => {
    describe('タグフィルタ', () => {
      it('should filter entries by single tag', () => {
        const results = filterEntries(mockEntries, { tags: ['仕事'] });
        expect(results.length).toBe(2);
        expect(results.every(entry => entry.tags.includes('仕事'))).toBe(true);
      });

      it('should filter entries by multiple tags (OR condition)', () => {
        const results = filterEntries(mockEntries, { tags: ['健康', '学習'] });
        expect(results.length).toBe(2);
        expect(
          results.every(entry =>
            entry.tags.includes('健康') || entry.tags.includes('学習')
          )
        ).toBe(true);
      });

      it('should return empty array when no entries match tag', () => {
        const results = filterEntries(mockEntries, { tags: ['存在しないタグ'] });
        expect(results).toEqual([]);
      });
    });

    describe('カテゴリフィルタ', () => {
      it('should filter entries by category', () => {
        const results = filterEntries(mockEntries, { category: '仕事' });
        expect(results.length).toBe(2);
        expect(results.every(entry => entry.category === '仕事')).toBe(true);
      });

      it('should filter entries by プライベート category', () => {
        const results = filterEntries(mockEntries, { category: 'プライベート' });
        expect(results.length).toBe(2);
        expect(results.every(entry => entry.category === 'プライベート')).toBe(true);
      });
    });

    describe('日付範囲フィルタ', () => {
      it('should filter entries by date range', () => {
        const startDate = new Date('2025-01-11');
        const endDate = new Date('2025-01-13');
        const results = filterEntries(mockEntries, {
          dateRange: { start: startDate, end: endDate },
        });
        expect(results.length).toBe(3);
        expect(
          results.every(
            entry =>
              entry.createdAt >= startDate && entry.createdAt <= endDate
          )
        ).toBe(true);
      });

      it('should include entries on boundary dates', () => {
        const startDate = new Date('2025-01-10');
        const endDate = new Date('2025-01-10');
        const results = filterEntries(mockEntries, {
          dateRange: { start: startDate, end: endDate },
        });
        expect(results.length).toBe(1);
        expect(results[0].id).toBe('1');
      });
    });

    describe('複合フィルタ', () => {
      it('should apply multiple filters (AND condition)', () => {
        const results = filterEntries(mockEntries, {
          tags: ['仕事'],
          category: '仕事',
        });
        expect(results.length).toBe(2);
        expect(
          results.every(
            entry => entry.tags.includes('仕事') && entry.category === '仕事'
          )
        ).toBe(true);
      });

      it('should apply tag, category, and date range filters', () => {
        const startDate = new Date('2025-01-10');
        const endDate = new Date('2025-01-13');
        const results = filterEntries(mockEntries, {
          tags: ['仕事'],
          category: '仕事',
          dateRange: { start: startDate, end: endDate },
        });
        expect(results.length).toBe(2);
      });

      it('should return empty array when filters do not match', () => {
        const results = filterEntries(mockEntries, {
          tags: ['健康'],
          category: '仕事',
        });
        expect(results).toEqual([]);
      });
    });

    describe('フィルタなし', () => {
      it('should return all entries when no filters applied', () => {
        const results = filterEntries(mockEntries, {});
        expect(results).toEqual(mockEntries);
      });
    });
  });

  describe('combineSearchAndFilter - 検索とフィルタの組み合わせ', () => {
    it('should combine search and filter', () => {
      const results = combineSearchAndFilter(mockEntries, '仕事', {
        category: '仕事',
      });
      expect(results.length).toBe(2);
      expect(
        results.every(
          entry => entry.content.includes('仕事') && entry.category === '仕事'
        )
      ).toBe(true);
    });

    it('should apply search first, then filter', () => {
      const results = combineSearchAndFilter(mockEntries, 'プログラミング', {
        category: '学習',
      });
      expect(results.length).toBe(1);
      expect(results[0].id).toBe('3');
    });

    it('should return empty array when search and filter do not match', () => {
      const results = combineSearchAndFilter(mockEntries, '仕事', {
        category: 'プライベート',
      });
      expect(results).toEqual([]);
    });

    it('should work with only search query', () => {
      const results = combineSearchAndFilter(mockEntries, '健康', {});
      expect(results.length).toBeGreaterThan(0);
    });

    it('should work with only filter options', () => {
      const results = combineSearchAndFilter(mockEntries, '', {
        tags: ['学習'],
      });
      expect(results.length).toBe(1);
    });
  });
});
