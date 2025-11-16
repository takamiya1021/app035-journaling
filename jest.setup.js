// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// IndexedDBモックを読み込み
import './__mocks__/indexeddb'

// structuredClone polyfill for fake-indexeddb
if (typeof globalThis.structuredClone === 'undefined') {
  globalThis.structuredClone = (obj) => {
    // シンプルなディープクローン実装
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }

    if (obj instanceof Array) {
      return obj.map(item => globalThis.structuredClone(item));
    }

    if (obj instanceof Object) {
      const cloned = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = globalThis.structuredClone(obj[key]);
        }
      }
      return cloned;
    }

    return obj;
  };
}
