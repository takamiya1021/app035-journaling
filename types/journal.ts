/**
 * ジャーナルエントリーの型定義
 */

export type Category = '仕事' | 'プライベート' | '学習' | 'その他';

export interface AIConversation {
  id: string;
  timestamp: Date;
  role: 'user' | 'ai';
  message: string;
}

export interface EmotionAnalysis {
  positive: number;              // 0-100
  negative: number;              // 0-100
  emotions: {
    joy: number;                 // 喜び 0-100
    sadness: number;             // 悲しみ 0-100
    anger: number;               // 怒り 0-100
    fear: number;                // 恐れ 0-100
    surprise: number;            // 驚き 0-100
  };
  analyzedAt: Date;
}

export interface JournalEntry {
  id: string;                    // UUID
  createdAt: Date;               // 作成日時（自動）
  updatedAt: Date;               // 更新日時（自動）
  content: string;               // 本文（プレーンテキスト）
  tags: string[];                // タグ配列
  category: Category;            // カテゴリ
  images: string[];              // 画像のbase64文字列配列
  aiConversations: AIConversation[];  // AI会話履歴
  emotionAnalysis?: EmotionAnalysis;  // 感情分析結果
}

export interface WeeklySummary {
  id: string;
  weekStart: Date;               // 週の開始日
  weekEnd: Date;                 // 週の終了日
  summary: string;               // 要約文
  themes: string[];              // 抽出されたテーマ
  emotionTrend: EmotionAnalysis; // 週全体の感情傾向
  generatedAt: Date;
}

export interface MonthlySummary {
  id: string;
  month: string;                 // YYYY-MM
  summary: string;
  themes: string[];
  emotionTrend: EmotionAnalysis;
  generatedAt: Date;
}

/**
 * IndexedDBのストア名
 */
export const DB_NAME = 'JournalingApp';
export const DB_VERSION = 1;

export const STORES = {
  entries: 'entries',
  weeklySummaries: 'weeklySummaries',
  monthlySummaries: 'monthlySummaries',
} as const;

/**
 * エントリー作成用の型（IDと日時は自動生成）
 */
export type CreateJournalEntry = Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * エントリー更新用の型（一部のフィールドのみ更新可能）
 */
export type UpdateJournalEntry = Partial<Omit<JournalEntry, 'id' | 'createdAt'>>;
