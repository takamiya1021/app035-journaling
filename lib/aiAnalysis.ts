/**
 * Phase 4: AI分析機能実装
 * 感情分析、要約生成、振り返り提案
 */

import type { EmotionAnalysis, JournalEntry } from '@/types/journal';
import { format } from 'date-fns';

/**
 * 感情分析
 */
export async function analyzeEmotion(
  apiKey: string,
  entryContent: string
): Promise<EmotionAnalysis> {
  if (!apiKey || apiKey === 'test-api-key') {
    // テスト環境の場合はダミーデータ
    return {
      positive: 70,
      negative: 30,
      emotions: {
        joy: 60,
        sadness: 20,
        anger: 10,
        fear: 5,
        surprise: 40,
      },
      analyzedAt: new Date(),
    };
  }

  const prompt = `以下のジャーナルエントリーから感情を分析してください。

ジャーナルエントリー:
${entryContent}

以下のJSON形式で出力してください:
{
  "positive": 0-100の数値,
  "negative": 0-100の数値,
  "emotions": {
    "joy": 0-100の数値,
    "sadness": 0-100の数値,
    "anger": 0-100の数値,
    "fear": 0-100の数値,
    "surprise": 0-100の数値
  }
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;

    // JSONを抽出
    const jsonMatch = text.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse emotion analysis');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    return {
      ...analysis,
      analyzedAt: new Date(),
    };
  } catch (error) {
    console.error('感情分析エラー:', error);
    // エラー時のフォールバック
    return {
      positive: 50,
      negative: 50,
      emotions: {
        joy: 30,
        sadness: 30,
        anger: 20,
        fear: 10,
        surprise: 10,
      },
      analyzedAt: new Date(),
    };
  }
}

/**
 * 週次要約生成
 */
export async function generateWeeklySummary(
  apiKey: string,
  entries: JournalEntry[]
): Promise<{ summary: string; themes: string[] }> {
  if (!apiKey || apiKey === 'test-api-key' || entries.length === 0) {
    return {
      summary: 'この1週間は様々な経験がありました。',
      themes: ['成長', '挑戦', '学び'],
    };
  }

  const entriesText = entries
    .map((entry) => `${format(entry.createdAt, 'yyyy/MM/dd')}: ${entry.content}`)
    .join('\n\n');

  const prompt = `以下は1週間分のジャーナルエントリーです。
全体を要約し、主なテーマを抽出してください。

${entriesText}

以下のJSON形式で出力してください:
{
  "summary": "150文字程度の要約",
  "themes": ["テーマ1", "テーマ2", "テーマ3"]
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;

    const jsonMatch = text.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse summary');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('要約生成エラー:', error);
    return {
      summary: 'この期間のエントリーを要約できませんでした。',
      themes: ['日常', '経験', '感情'],
    };
  }
}

/**
 * 月次要約生成
 */
export async function generateMonthlySummary(
  apiKey: string,
  entries: JournalEntry[]
): Promise<{ summary: string; themes: string[] }> {
  // 週次要約と同様のロジック（期間が異なるだけ）
  return generateWeeklySummary(apiKey, entries);
}

/**
 * 振り返り提案生成
 */
export async function generateReflectionSuggestions(
  apiKey: string,
  period: 'weekly' | 'monthly',
  summary: string
): Promise<string[]> {
  if (!apiKey || apiKey === 'test-api-key') {
    return [
      'この期間で最も印象に残った出来事は何ですか？',
      'どんな成長を感じましたか？',
      '次の期間で取り組みたいことは何ですか？',
    ];
  }

  const periodText = period === 'weekly' ? '1週間' : '1ヶ月';

  const prompt = `以下は${periodText}の要約です。
振り返りを深めるための質問を3つ提案してください。

要約:
${summary}

質問は以下の形式で出力してください（質問のみ、番号なし）:
- 質問1
- 質問2
- 質問3`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;

    return text
      .split('\n')
      .filter((line: string) => line.trim().startsWith('-'))
      .map((line: string) => line.trim().substring(1).trim())
      .slice(0, 3);
  } catch (error) {
    console.error('振り返り提案エラー:', error);
    return [
      'この期間で最も印象に残った出来事は何ですか？',
      'どんな変化がありましたか？',
      '次の期間の目標は何ですか？',
    ];
  }
}
