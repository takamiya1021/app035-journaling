/**
 * Phase 1: IndexedDB実装（Green）
 * ジャーナルエントリーのIndexedDB管理
 */

import type {
  JournalEntry,
  CreateJournalEntry,
  UpdateJournalEntry,
  WeeklySummary,
  MonthlySummary,
  Category,
} from '@/types/journal';
import { DB_NAME, DB_VERSION, STORES } from '@/types/journal';

let dbInstance: IDBDatabase | null = null;

/**
 * UUID生成（RFC 4122 v4準拠）
 */
function generateUUID(): string {
  // ブラウザ環境でcrypto.randomUUIDが利用可能な場合
  if (
    typeof globalThis !== 'undefined' &&
    globalThis.crypto &&
    typeof globalThis.crypto.randomUUID === 'function'
  ) {
    return globalThis.crypto.randomUUID();
  }

  // フォールバック実装
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * IndexedDBを初期化
 */
export async function initDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open database'));
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // entriesストア作成
      if (!db.objectStoreNames.contains(STORES.entries)) {
        const entriesStore = db.createObjectStore(STORES.entries, {
          keyPath: 'id',
        });
        entriesStore.createIndex('createdAt', 'createdAt', { unique: false });
        entriesStore.createIndex('tags', 'tags', { multiEntry: true, unique: false });
        entriesStore.createIndex('category', 'category', { unique: false });
      }

      // weeklySummariesストア作成
      if (!db.objectStoreNames.contains(STORES.weeklySummaries)) {
        const weeklySummariesStore = db.createObjectStore(STORES.weeklySummaries, {
          keyPath: 'id',
        });
        weeklySummariesStore.createIndex('weekStart', 'weekStart', { unique: false });
      }

      // monthlySummariesストア作成
      if (!db.objectStoreNames.contains(STORES.monthlySummaries)) {
        const monthlySummariesStore = db.createObjectStore(STORES.monthlySummaries, {
          keyPath: 'id',
        });
        monthlySummariesStore.createIndex('month', 'month', { unique: false });
      }
    };
  });
}

/**
 * データベースを閉じる
 */
export async function closeDB(): Promise<void> {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

/**
 * ジャーナルエントリーを追加
 */
export async function addEntry(entry: CreateJournalEntry): Promise<string> {
  const db = await initDB();
  const id = generateUUID();
  const now = new Date();

  const fullEntry: JournalEntry = {
    ...entry,
    id,
    createdAt: now,
    updatedAt: now,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.entries], 'readwrite');
    const store = transaction.objectStore(STORES.entries);
    const request = store.add(fullEntry);

    request.onsuccess = () => {
      resolve(id);
    };

    request.onerror = () => {
      reject(new Error('Failed to add entry'));
    };
  });
}

/**
 * ジャーナルエントリーを取得
 */
export async function getEntry(id: string): Promise<JournalEntry | undefined> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.entries], 'readonly');
    const store = transaction.objectStore(STORES.entries);
    const request = store.get(id);

    request.onsuccess = () => {
      const entry = request.result as JournalEntry | undefined;
      if (entry) {
        // Dateオブジェクトに変換
        entry.createdAt = new Date(entry.createdAt);
        entry.updatedAt = new Date(entry.updatedAt);
        if (entry.emotionAnalysis) {
          entry.emotionAnalysis.analyzedAt = new Date(entry.emotionAnalysis.analyzedAt);
        }
        entry.aiConversations = entry.aiConversations.map(conv => ({
          ...conv,
          timestamp: new Date(conv.timestamp),
        }));
      }
      resolve(entry);
    };

    request.onerror = () => {
      reject(new Error('Failed to get entry'));
    };
  });
}

/**
 * ジャーナルエントリーを更新
 */
export async function updateEntry(
  id: string,
  updates: UpdateJournalEntry
): Promise<void> {
  const db = await initDB();
  const existingEntry = await getEntry(id);

  if (!existingEntry) {
    throw new Error('Entry not found');
  }

  const updatedEntry: JournalEntry = {
    ...existingEntry,
    ...updates,
    id, // IDは変更不可
    createdAt: existingEntry.createdAt, // 作成日時は変更不可
    updatedAt: new Date(), // 更新日時は自動更新
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.entries], 'readwrite');
    const store = transaction.objectStore(STORES.entries);
    const request = store.put(updatedEntry);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error('Failed to update entry'));
    };
  });
}

/**
 * ジャーナルエントリーを削除
 */
export async function deleteEntry(id: string): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.entries], 'readwrite');
    const store = transaction.objectStore(STORES.entries);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error('Failed to delete entry'));
    };
  });
}

/**
 * すべてのジャーナルエントリーを取得
 */
export async function getAllEntries(): Promise<JournalEntry[]> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.entries], 'readonly');
    const store = transaction.objectStore(STORES.entries);
    const request = store.getAll();

    request.onsuccess = () => {
      const entries = (request.result as JournalEntry[]).map(entry => {
        // Dateオブジェクトに変換
        entry.createdAt = new Date(entry.createdAt);
        entry.updatedAt = new Date(entry.updatedAt);
        if (entry.emotionAnalysis) {
          entry.emotionAnalysis.analyzedAt = new Date(entry.emotionAnalysis.analyzedAt);
        }
        entry.aiConversations = entry.aiConversations.map(conv => ({
          ...conv,
          timestamp: new Date(conv.timestamp),
        }));
        return entry;
      });
      resolve(entries);
    };

    request.onerror = () => {
      reject(new Error('Failed to get all entries'));
    };
  });
}

/**
 * 日付範囲でジャーナルエントリーを取得
 */
export async function getEntriesByDateRange(
  startDate: Date,
  endDate: Date
): Promise<JournalEntry[]> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.entries], 'readonly');
    const store = transaction.objectStore(STORES.entries);
    const index = store.index('createdAt');
    const range = IDBKeyRange.bound(startDate, endDate);
    const request = index.getAll(range);

    request.onsuccess = () => {
      const entries = (request.result as JournalEntry[]).map(entry => {
        // Dateオブジェクトに変換
        entry.createdAt = new Date(entry.createdAt);
        entry.updatedAt = new Date(entry.updatedAt);
        if (entry.emotionAnalysis) {
          entry.emotionAnalysis.analyzedAt = new Date(entry.emotionAnalysis.analyzedAt);
        }
        entry.aiConversations = entry.aiConversations.map(conv => ({
          ...conv,
          timestamp: new Date(conv.timestamp),
        }));
        return entry;
      });
      resolve(entries);
    };

    request.onerror = () => {
      reject(new Error('Failed to get entries by date range'));
    };
  });
}

/**
 * タグでジャーナルエントリーを取得
 */
export async function getEntriesByTag(tag: string): Promise<JournalEntry[]> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.entries], 'readonly');
    const store = transaction.objectStore(STORES.entries);
    const index = store.index('tags');
    const request = index.getAll(tag);

    request.onsuccess = () => {
      const entries = (request.result as JournalEntry[]).map(entry => {
        // Dateオブジェクトに変換
        entry.createdAt = new Date(entry.createdAt);
        entry.updatedAt = new Date(entry.updatedAt);
        if (entry.emotionAnalysis) {
          entry.emotionAnalysis.analyzedAt = new Date(entry.emotionAnalysis.analyzedAt);
        }
        entry.aiConversations = entry.aiConversations.map(conv => ({
          ...conv,
          timestamp: new Date(conv.timestamp),
        }));
        return entry;
      });
      resolve(entries);
    };

    request.onerror = () => {
      reject(new Error('Failed to get entries by tag'));
    };
  });
}

/**
 * カテゴリでジャーナルエントリーを取得
 */
export async function getEntriesByCategory(
  category: Category
): Promise<JournalEntry[]> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.entries], 'readonly');
    const store = transaction.objectStore(STORES.entries);
    const index = store.index('category');
    const request = index.getAll(category);

    request.onsuccess = () => {
      const entries = (request.result as JournalEntry[]).map(entry => {
        // Dateオブジェクトに変換
        entry.createdAt = new Date(entry.createdAt);
        entry.updatedAt = new Date(entry.updatedAt);
        if (entry.emotionAnalysis) {
          entry.emotionAnalysis.analyzedAt = new Date(entry.emotionAnalysis.analyzedAt);
        }
        entry.aiConversations = entry.aiConversations.map(conv => ({
          ...conv,
          timestamp: new Date(conv.timestamp),
        }));
        return entry;
      });
      resolve(entries);
    };

    request.onerror = () => {
      reject(new Error('Failed to get entries by category'));
    };
  });
}
