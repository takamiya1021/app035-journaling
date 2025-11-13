'use client';

import { useState } from 'react';
import type { Category } from '@/types/journal';
import type { FilterOptions } from '@/lib/search';

interface FilterPanelProps {
  onFilter: (options: FilterOptions) => void;
  availableTags: string[];
}

export default function FilterPanel({ onFilter, availableTags }: FilterPanelProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
  const [showFilters, setShowFilters] = useState(false);

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    applyFilters(newTags, selectedCategory);
  };

  const handleCategoryChange = (category: string) => {
    const newCategory = category === 'all' ? undefined : (category as Category);
    setSelectedCategory(newCategory);
    applyFilters(selectedTags, newCategory);
  };

  const applyFilters = (tags: string[], category?: Category) => {
    onFilter({
      tags: tags.length > 0 ? tags : undefined,
      category,
    });
  };

  const handleClearFilters = () => {
    setSelectedTags([]);
    setSelectedCategory(undefined);
    onFilter({});
  };

  const hasActiveFilters = selectedTags.length > 0 || selectedCategory;

  return (
    <div className="mb-6">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <span>🎛️</span>
        <span>フィルター</span>
        {hasActiveFilters && (
          <span className="px-2 py-1 bg-warm-orange text-white text-xs rounded-full">
            {(selectedTags.length || 0) + (selectedCategory ? 1 : 0)}
          </span>
        )}
      </button>

      {showFilters && (
        <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg space-y-4">
          {/* カテゴリフィルタ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📂 カテゴリ
            </label>
            <select
              value={selectedCategory || 'all'}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-warm-orange focus:border-transparent"
            >
              <option value="all">すべて</option>
              <option value="仕事">仕事</option>
              <option value="プライベート">プライベート</option>
              <option value="学習">学習</option>
              <option value="その他">その他</option>
            </select>
          </div>

          {/* タグフィルタ */}
          {availableTags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🏷️ タグ
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-warm-orange text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* クリアボタン */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              フィルターをクリア
            </button>
          )}
        </div>
      )}
    </div>
  );
}
