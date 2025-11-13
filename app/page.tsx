'use client';

import { useEffect, useState } from 'react';
import JournalEditor from './components/JournalEditor';
import EntryList from './components/EntryList';
import { addEntry, getAllEntries, deleteEntry } from '@/lib/db';
import type { JournalEntry, CreateJournalEntry } from '@/types/journal';

export default function Home() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // エントリーを読み込む
  const loadEntries = async () => {
    try {
      const allEntries = await getAllEntries();
      // 新しい順に並び替え
      const sorted = allEntries.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
      setEntries(sorted);
    } catch (error) {
      console.error('エントリーの読み込みエラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 初回ロード
  useEffect(() => {
    loadEntries();
  }, []);

  // エントリーを保存
  const handleSave = async (entry: CreateJournalEntry) => {
    await addEntry(entry);
    await loadEntries(); // リロード
  };

  // エントリーを削除
  const handleDelete = async (id: string) => {
    await deleteEntry(id);
    await loadEntries(); // リロード
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-cream-50 to-cream-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            📖 ジャーナリングアプリ
          </h1>
          <p className="text-xl text-gray-600">
            自己を見つめ、思考を整理するためのアプリです
          </p>
        </header>

        {/* ジャーナルエディタ */}
        <section className="mb-12">
          <JournalEditor onSave={handleSave} />
        </section>

        {/* エントリーリスト */}
        <section>
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">
              <p>読み込み中...</p>
            </div>
          ) : (
            <EntryList entries={entries} onDelete={handleDelete} />
          )}
        </section>
      </div>
    </main>
  );
}
