/**
 * Phase 5: エクスポート・インポート機能実装
 */

import yaml from 'js-yaml';
import { format } from 'date-fns';
import type { JournalEntry, CreateJournalEntry, Category } from '@/types/journal';

/**
 * YAMLエクスポート
 */
export function exportToYAML(entries: JournalEntry[]): string {
  const data = entries.map((entry) => ({
    id: entry.id,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
    content: entry.content,
    tags: entry.tags,
    category: entry.category,
    // 画像はbase64なので容量大きいため省略可能
    hasImages: entry.images.length > 0,
    imageCount: entry.images.length,
    hasAIConversations: entry.aiConversations.length > 0,
    conversationCount: entry.aiConversations.length,
  }));

  return yaml.dump(data, {
    indent: 2,
    lineWidth: -1,
  });
}

/**
 * Markdownエクスポート
 */
export function exportToMarkdown(entries: JournalEntry[]): string {
  return entries
    .map((entry) => {
      const date = format(entry.createdAt, 'yyyy年MM月dd日 HH:mm');
      const tags = entry.tags.map((tag) => `#${tag}`).join(' ');

      let markdown = `## ${date}\n\n`;
      markdown += `**カテゴリ**: ${entry.category}\n`;
      if (tags) {
        markdown += `**タグ**: ${tags}\n`;
      }
      markdown += `\n${entry.content}\n`;

      // AI会話があれば追記
      if (entry.aiConversations.length > 0) {
        markdown += `\n### AI会話 (${entry.aiConversations.length}件)\n\n`;
        entry.aiConversations.forEach((conv) => {
          const role = conv.role === 'user' ? '👤' : '🤖';
          markdown += `${role} ${conv.message}\n\n`;
        });
      }

      markdown += `---\n`;
      return markdown;
    })
    .join('\n\n');
}

/**
 * Markdownインポート
 */
export function importFromMarkdown(markdown: string): Partial<CreateJournalEntry>[] {
  const entries: Partial<CreateJournalEntry>[] = [];

  // ## で始まる行を日付として認識
  const sections = markdown.split(/^## /m).filter(Boolean);

  for (const section of sections) {
    const lines = section.split('\n');
    const dateStr = lines[0].trim();

    // 日付パース（簡易実装）
    let date = new Date();
    try {
      // "2025年01月13日 20:30" 形式をパース
      const match = dateStr.match(/(\d{4})年(\d{2})月(\d{2})日\s+(\d{2}):(\d{2})/);
      if (match) {
        date = new Date(
          parseInt(match[1]),
          parseInt(match[2]) - 1,
          parseInt(match[3]),
          parseInt(match[4]),
          parseInt(match[5])
        );
      }
    } catch (e) {
      // パース失敗時は現在時刻
      date = new Date();
    }

    // タグ・カテゴリ・コンテンツ抽出
    const tags: string[] = [];
    let category: Category = 'その他';
    let content = '';
    let inContent = false;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('**タグ**:')) {
        const tagStr = line.replace('**タグ**:', '').trim();
        tags.push(
          ...tagStr
            .split(/\s+/)
            .map((t) => t.replace('#', ''))
            .filter(Boolean)
        );
      } else if (line.startsWith('**カテゴリ**:')) {
        const catStr = line.replace('**カテゴリ**:', '').trim() as Category;
        if (['仕事', 'プライベート', '学習', 'その他'].includes(catStr)) {
          category = catStr;
        }
      } else if (line.trim() === '---') {
        break;
      } else if (line.startsWith('### AI会話')) {
        break; // AI会話はインポート対象外
      } else if (!line.startsWith('**') && line.trim()) {
        inContent = true;
        content += line + '\n';
      } else if (inContent) {
        content += line + '\n';
      }
    }

    if (content.trim()) {
      entries.push({
        content: content.trim(),
        tags,
        category,
        images: [],
        aiConversations: [],
      });
    }
  }

  return entries;
}

/**
 * ファイルダウンロード
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
