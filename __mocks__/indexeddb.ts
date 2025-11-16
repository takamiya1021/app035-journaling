import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';

// グローバルなIndexedDBをモックに置き換え
if (typeof window !== 'undefined') {
  window.indexedDB = new IDBFactory();
}

export {};
