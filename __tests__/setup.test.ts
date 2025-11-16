/**
 * Phase 0: テスト環境セットアップの確認
 */

describe('Test Environment Setup', () => {
  it('should run tests', () => {
    expect(true).toBe(true);
  });

  it('should have IndexedDB available', () => {
    expect(typeof indexedDB).toBe('object');
    expect(indexedDB).toBeDefined();
  });

  it('should be able to create IndexedDB', async () => {
    const dbName = 'test-db';
    const request = indexedDB.open(dbName, 1);

    await new Promise<void>((resolve, reject) => {
      request.onsuccess = () => {
        const db = request.result;
        expect(db.name).toBe(dbName);
        db.close();
        indexedDB.deleteDatabase(dbName);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  });
});
