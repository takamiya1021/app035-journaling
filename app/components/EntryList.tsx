'use client';

import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { JournalEntry } from '@/types/journal';

interface EntryListProps {
  entries: JournalEntry[];
  onDelete?: (id: string) => Promise<void>;
}

export default function EntryList({ entries, onDelete }: EntryListProps) {
  const handleDelete = async (id: string) => {
    if (!onDelete) return;

    if (confirm('このエントリーを削除しますか？')) {
      try {
        await onDelete(id);
      } catch (error) {
        console.error('削除エラー:', error);
        alert('削除に失敗しました');
      }
    }
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-xl mb-2">📭</p>
        <p>まだエントリーがありません</p>
        <p className="text-sm mt-2">上のフォームから新しいエントリーを作成してください</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <span className="mr-2">📋</span>
        エントリー一覧 ({entries.length}件)
      </h2>

      {entries.map((entry) => (
        <div
          key={entry.id}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          {/* ヘッダー */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-500">
                📅 {format(entry.createdAt, 'yyyy年MM月dd日 (E) HH:mm', { locale: ja })}
              </p>
              {entry.createdAt.getTime() !== entry.updatedAt.getTime() && (
                <p className="text-xs text-gray-400 mt-1">
                  更新: {format(entry.updatedAt, 'yyyy年MM月dd日 HH:mm', { locale: ja })}
                </p>
              )}
            </div>
            {onDelete && (
              <button
                onClick={() => handleDelete(entry.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="削除"
              >
                🗑️
              </button>
            )}
          </div>

          {/* コンテンツ */}
          <div className="mb-4">
            <p className="text-gray-800 whitespace-pre-wrap">{entry.content}</p>
          </div>

          {/* メタ情報 */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* カテゴリ */}
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              📂 {entry.category}
            </span>

            {/* タグ */}
            {entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-warm-peach text-gray-700 rounded-full text-sm"
                  >
                    🏷️ {tag}
                  </span>
                ))}
              </div>
            )}

            {/* 画像数 */}
            {entry.images.length > 0 && (
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                🖼️ {entry.images.length}枚
              </span>
            )}

            {/* AI会話数 */}
            {entry.aiConversations.length > 0 && (
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                🤖 {entry.aiConversations.length}件の会話
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
