'use client';

import { useEffect, useState, useMemo } from 'react';
import JournalEditor from './components/JournalEditor';
import EntryList from './components/EntryList';
import SearchBar from './components/SearchBar';
import FilterPanel from './components/FilterPanel';
import { addEntry, getAllEntries, deleteEntry } from '@/lib/db';
import { combineSearchAndFilter } from '@/lib/search';
import { exportToYAML, exportToMarkdown, downloadFile } from '@/lib/export';
import type { JournalEntry, CreateJournalEntry } from '@/types/journal';
import type { FilterOptions } from '@/lib/search';

export default function Home() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({});

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

  // 検索とフィルタを適用
  const filteredEntries = useMemo(() => {
    return combineSearchAndFilter(entries, searchQuery, filterOptions);
  }, [entries, searchQuery, filterOptions]);

  // 利用可能なタグを取得
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    entries.forEach((entry) => {
      entry.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [entries]);

  // エクスポート機能
  const handleExportYAML = () => {
    const yaml = exportToYAML(entries);
    const filename = `journal-export-${new Date().toISOString().split('T')[0]}.yaml`;
    downloadFile(yaml, filename, 'application/x-yaml');
  };

  const handleExportMarkdown = () => {
    const markdown = exportToMarkdown(entries);
    const filename = `journal-export-${new Date().toISOString().split('T')[0]}.md`;
    downloadFile(markdown, filename, 'text/markdown');
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

        {/* 検索・フィルタ・エクスポート */}
        <section className="mb-8">
          <div className="mb-4">
            <SearchBar
              onSearch={setSearchQuery}
              placeholder="エントリーを検索..."
            />
          </div>
          <div className="flex flex-wrap gap-4 items-start">
            <div className="flex-1 min-w-[250px]">
              <FilterPanel
                onFilter={setFilterOptions}
                availableTags={availableTags}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExportYAML}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                title="YAML形式でエクスポート"
              >
                📤 YAML
              </button>
              <button
                onClick={handleExportMarkdown}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                title="Markdown形式でエクスポート"
              >
                📤 MD
              </button>
            </div>
          </div>
        </section>

        {/* 検索結果サマリー */}
        {(searchQuery || filterOptions.tags || filterOptions.category) && (
          <section className="mb-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                {filteredEntries.length}件のエントリーが見つかりました
                {searchQuery && ` (検索: "${searchQuery}")`}
              </p>
            </div>
          </section>
        )}

        {/* エントリーリスト */}
        <section>
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">
              <p>読み込み中...</p>
            </div>
          ) : (
            <EntryList entries={filteredEntries} onDelete={handleDelete} />
          )}
        </section>
      </div>
    </main>
  );
}
