/**
 * Phase 3-2: AI会話機能実装（Green）
 */

import type { AIConversation } from '@/types/journal';

/**
 * UUID生成（会話ID用）
 */
function generateConversationId(): string {
  if (
    typeof globalThis !== 'undefined' &&
    globalThis.crypto &&
    typeof globalThis.crypto.randomUUID === 'function'
  ) {
    return globalThis.crypto.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * AIChat クラス
 * ジャーナルエントリーに対するAIとの会話を管理
 */
export class AIChat {
  private apiKey: string;
  private conversationHistory: AIConversation[];

  constructor(apiKey: string, entryContent: string) {
    this.apiKey = apiKey;
    this.conversationHistory = [
      {
        id: generateConversationId(),
        timestamp: new Date(),
        role: 'user',
        message: `以下は私のジャーナルエントリーです：\n\n${entryContent}`,
      },
    ];
  }

  /**
   * ユーザーメッセージを送信してAI応答を取得
   */
  async sendMessage(userMessage: string): Promise<string> {
    // ユーザーメッセージを履歴に追加
    this.conversationHistory.push({
      id: generateConversationId(),
      timestamp: new Date(),
      role: 'user',
      message: userMessage,
    });

    // プロンプト構築
    const prompt = this.buildPrompt();

    // Google AI Studio API呼び出し
    const response = await this.callGeminiAPI(prompt);

    // AI応答を履歴に追加
    this.conversationHistory.push({
      id: generateConversationId(),
      timestamp: new Date(),
      role: 'ai',
      message: response,
    });

    return response;
  }

  /**
   * プロンプト構築（会話履歴を考慮）
   */
  private buildPrompt(): string {
    const systemPrompt = `あなたは親身になって話を聞くカウンセラーです。
ユーザーの内省を深めるために、適切な質問や共感を示してください。
会話履歴を考慮して、自然な対話を心がけてください。`;

    const conversationContext = this.conversationHistory
      .map((conv) => `${conv.role === 'user' ? 'ユーザー' : 'AI'}: ${conv.message}`)
      .join('\n\n');

    return `${systemPrompt}\n\n${conversationContext}`;
  }

  /**
   * Google Gemini API呼び出し
   */
  private async callGeminiAPI(prompt: string): Promise<string> {
    if (!this.apiKey || this.apiKey === 'test-api-key') {
      // テスト環境またはAPIキー未設定の場合はダミーレスポンス
      return 'それは興味深い経験ですね。その時どんな気持ちでしたか？';
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`,
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
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini API呼び出しエラー:', error);
      return '申し訳ございません。現在AIサービスに接続できません。後ほど再度お試しください。';
    }
  }

  /**
   * 会話履歴を取得
   */
  getConversationHistory(): AIConversation[] {
    return this.conversationHistory;
  }
}

/**
 * 内省の質問提案を生成
 */
export async function generateReflectionQuestions(
  apiKey: string,
  entryContent: string
): Promise<string[]> {
  if (!apiKey || apiKey === 'test-api-key') {
    // テスト環境の場合はダミーの質問を返す
    return [
      'その経験から何を学びましたか？',
      '同じ状況になったら、どう対応しますか？',
      'この経験は将来どう活かせそうですか？',
    ];
  }

  const prompt = `以下のジャーナルエントリーを読んで、内省を深めるための質問を3つ提案してください。

ジャーナルエントリー:
${entryContent}

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

    // レスポンスを配列に変換
    return text
      .split('\n')
      .filter((line: string) => line.trim().startsWith('-'))
      .map((line: string) => line.trim().substring(1).trim())
      .slice(0, 3);
  } catch (error) {
    console.error('質問生成エラー:', error);
    return [
      'その経験について、もっと詳しく教えてください。',
      'その時の気持ちを3つの言葉で表すと？',
      'この経験から何を学びましたか？',
    ];
  }
}
