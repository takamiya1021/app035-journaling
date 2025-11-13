/**
 * Phase 1: IndexedDB基本機能テスト（Red）
 */

import {
  initDB,
  addEntry,
  getEntry,
  updateEntry,
  deleteEntry,
  getAllEntries,
  getEntriesByDateRange,
  getEntriesByTag,
  getEntriesByCategory,
  closeDB,
} from './db';
import type { JournalEntry, CreateJournalEntry } from '@/types/journal';

describe('IndexedDB - Journal Database', () => {
  beforeEach(async () => {
    // 各テストの前にDBを初期化
    await initDB();
  });

  afterEach(async () => {
    // 各テストの後にDBをクリーンアップ
    await closeDB();
    indexedDB.deleteDatabase('JournalingApp');
  });

  describe('DB Initialization', () => {
    it('should initialize database', async () => {
      const db = await initDB();
      expect(db).toBeDefined();
      expect(db.name).toBe('JournalingApp');
      expect(db.version).toBe(1);
    });

    it('should create required object stores', async () => {
      const db = await initDB();
      expect(db.objectStoreNames.contains('entries')).toBe(true);
      expect(db.objectStoreNames.contains('weeklySummaries')).toBe(true);
      expect(db.objectStoreNames.contains('monthlySummaries')).toBe(true);
    });
  });

  describe('CRUD Operations - Create', () => {
    it('should add a journal entry', async () => {
      const entry: CreateJournalEntry = {
        content: 'テスト記録です',
        tags: ['テスト', '開発'],
        category: '学習',
        images: [],
        aiConversations: [],
      };

      const id = await addEntry(entry);
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
    });

    it('should add entry with auto-generated timestamps', async () => {
      const entry: CreateJournalEntry = {
        content: 'タイムスタンプテスト',
        tags: [],
        category: 'その他',
        images: [],
        aiConversations: [],
      };

      const id = await addEntry(entry);
      const savedEntry = await getEntry(id);

      expect(savedEntry).toBeDefined();
      expect(savedEntry!.createdAt).toBeInstanceOf(Date);
      expect(savedEntry!.updatedAt).toBeInstanceOf(Date);
    });

    it('should add entry with images', async () => {
      const entry: CreateJournalEntry = {
        content: '画像付きエントリー',
        tags: ['画像'],
        category: 'プライベート',
        images: ['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA'],
        aiConversations: [],
      };

      const id = await addEntry(entry);
      const savedEntry = await getEntry(id);

      expect(savedEntry).toBeDefined();
      expect(savedEntry!.images).toHaveLength(1);
    });
  });

  describe('CRUD Operations - Read', () => {
    it('should get a journal entry by id', async () => {
      const entry: CreateJournalEntry = {
        content: '取得テスト',
        tags: ['取得'],
        category: '仕事',
        images: [],
        aiConversations: [],
      };

      const id = await addEntry(entry);
      const savedEntry = await getEntry(id);

      expect(savedEntry).toBeDefined();
      expect(savedEntry!.id).toBe(id);
      expect(savedEntry!.content).toBe(entry.content);
    });

    it('should return undefined for non-existent entry', async () => {
      const entry = await getEntry('non-existent-id');
      expect(entry).toBeUndefined();
    });

    it('should get all journal entries', async () => {
      const entries: CreateJournalEntry[] = [
        {
          content: 'エントリー1',
          tags: ['test1'],
          category: '仕事',
          images: [],
          aiConversations: [],
        },
        {
          content: 'エントリー2',
          tags: ['test2'],
          category: '学習',
          images: [],
          aiConversations: [],
        },
      ];

      await addEntry(entries[0]);
      await addEntry(entries[1]);

      const allEntries = await getAllEntries();
      expect(allEntries).toHaveLength(2);
    });
  });

  describe('CRUD Operations - Update', () => {
    it('should update a journal entry', async () => {
      const entry: CreateJournalEntry = {
        content: '更新前',
        tags: ['before'],
        category: '学習',
        images: [],
        aiConversations: [],
      };

      const id = await addEntry(entry);

      await updateEntry(id, {
        content: '更新後',
        tags: ['after'],
      });

      const updatedEntry = await getEntry(id);
      expect(updatedEntry).toBeDefined();
      expect(updatedEntry!.content).toBe('更新後');
      expect(updatedEntry!.tags).toEqual(['after']);
    });

    it('should update updatedAt timestamp on update', async () => {
      const entry: CreateJournalEntry = {
        content: '更新タイムスタンプテスト',
        tags: [],
        category: 'その他',
        images: [],
        aiConversations: [],
      };

      const id = await addEntry(entry);
      const originalEntry = await getEntry(id);

      // 少し待機
      await new Promise(resolve => setTimeout(resolve, 10));

      await updateEntry(id, { content: '更新後' });
      const updatedEntry = await getEntry(id);

      expect(updatedEntry).toBeDefined();
      expect(updatedEntry!.updatedAt.getTime()).toBeGreaterThan(
        originalEntry!.updatedAt.getTime()
      );
    });
  });

  describe('CRUD Operations - Delete', () => {
    it('should delete a journal entry', async () => {
      const entry: CreateJournalEntry = {
        content: '削除テスト',
        tags: ['delete'],
        category: '仕事',
        images: [],
        aiConversations: [],
      };

      const id = await addEntry(entry);
      await deleteEntry(id);

      const deletedEntry = await getEntry(id);
      expect(deletedEntry).toBeUndefined();
    });

    it('should not throw error when deleting non-existent entry', async () => {
      await expect(deleteEntry('non-existent-id')).resolves.not.toThrow();
    });
  });

  describe('Query Operations - Date Range', () => {
    it('should get entries by date range', async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const entry: CreateJournalEntry = {
        content: '日付範囲テスト',
        tags: ['date'],
        category: '仕事',
        images: [],
        aiConversations: [],
      };

      await addEntry(entry);

      const entries = await getEntriesByDateRange(yesterday, tomorrow);
      expect(entries.length).toBeGreaterThan(0);
    });
  });

  describe('Query Operations - Tag', () => {
    it('should get entries by tag', async () => {
      const entries: CreateJournalEntry[] = [
        {
          content: 'タグテスト1',
          tags: ['健康', '運動'],
          category: 'プライベート',
          images: [],
          aiConversations: [],
        },
        {
          content: 'タグテスト2',
          tags: ['仕事', '会議'],
          category: '仕事',
          images: [],
          aiConversations: [],
        },
        {
          content: 'タグテスト3',
          tags: ['健康', '食事'],
          category: 'プライベート',
          images: [],
          aiConversations: [],
        },
      ];

      await addEntry(entries[0]);
      await addEntry(entries[1]);
      await addEntry(entries[2]);

      const healthEntries = await getEntriesByTag('健康');
      expect(healthEntries).toHaveLength(2);
      expect(healthEntries.every(e => e.tags.includes('健康'))).toBe(true);
    });
  });

  describe('Query Operations - Category', () => {
    it('should get entries by category', async () => {
      const entries: CreateJournalEntry[] = [
        {
          content: 'カテゴリテスト1',
          tags: [],
          category: '仕事',
          images: [],
          aiConversations: [],
        },
        {
          content: 'カテゴリテスト2',
          tags: [],
          category: '学習',
          images: [],
          aiConversations: [],
        },
        {
          content: 'カテゴリテスト3',
          tags: [],
          category: '仕事',
          images: [],
          aiConversations: [],
        },
      ];

      await addEntry(entries[0]);
      await addEntry(entries[1]);
      await addEntry(entries[2]);

      const workEntries = await getEntriesByCategory('仕事');
      expect(workEntries).toHaveLength(2);
      expect(workEntries.every(e => e.category === '仕事')).toBe(true);
    });
  });
});
