'use client';

import { useState } from 'react';
import type { Category, CreateJournalEntry } from '@/types/journal';

interface JournalEditorProps {
  onSave: (entry: CreateJournalEntry) => Promise<void>;
}

export default function JournalEditor({ onSave }: JournalEditorProps) {
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [category, setCategory] = useState<Category>('その他');
  const [isSaving, setIsSaving] = useState(false);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      alert('内容を入力してください');
      return;
    }

    setIsSaving(true);

    try {
      const entry: CreateJournalEntry = {
        content: content.trim(),
        tags,
        category,
        images: [],
        aiConversations: [],
      };

      await onSave(entry);

      // リセット
      setContent('');
      setTags([]);
      setTagInput('');
      setCategory('その他');

      alert('保存しました！');
    } catch (error) {
      console.error('保存エラー:', error);
      alert('保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-cream-50 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <span className="mr-2">📖</span>
        新しいエントリー
      </h2>

      <form onSubmit={handleSubmit}>
        {/* テキストエリア */}
        <div className="mb-6">
          <div className="relative bg-white rounded-lg shadow-inner p-6 min-h-[300px]">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full min-h-[250px] bg-transparent border-none outline-none resize-none text-gray-800 text-lg leading-relaxed"
              placeholder="今日の出来事や気持ちを書いてみましょう..."
              disabled={isSaving}
            />
          </div>
        </div>

        {/* タグ入力 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🏷️ タグ
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-warm-peach rounded-full text-sm text-gray-700 flex items-center"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                  disabled={isSaving}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-warm-orange focus:border-transparent"
              placeholder="タグを入力してEnter"
              disabled={isSaving}
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-warm-orange text-white rounded-lg hover:bg-opacity-90 transition-colors"
              disabled={isSaving}
            >
              追加
            </button>
          </div>
        </div>

        {/* カテゴリ選択 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📂 カテゴリ
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-warm-orange focus:border-transparent"
            disabled={isSaving}
          >
            <option value="仕事">仕事</option>
            <option value="プライベート">プライベート</option>
            <option value="学習">学習</option>
            <option value="その他">その他</option>
          </select>
        </div>

        {/* 保存ボタン */}
        <button
          type="submit"
          disabled={isSaving || !content.trim()}
          className="w-full px-6 py-3 bg-warm-orange text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isSaving ? '保存中...' : '💾 保存'}
        </button>
      </form>
    </div>
  );
}
