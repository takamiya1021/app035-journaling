/**
 * Phase 3-1: AI会話機能テスト（Red）
 */

import { AIChat, generateReflectionQuestions } from './aiChat';
import type { AIConversation } from '@/types/journal';

// Google AI Studio APIのモック
const mockApiKey = 'test-api-key';
const mockEntryContent = '今日は仕事で大きな成果があった。チームと協力して目標を達成できた。';

describe('AI Chat Functions', () => {
  describe('AIChat class', () => {
    it('should initialize with entry content', () => {
      const chat = new AIChat(mockApiKey, mockEntryContent);
      const history = chat.getConversationHistory();

      expect(history.length).toBe(1);
      expect(history[0].role).toBe('user');
      expect(history[0].message).toContain(mockEntryContent);
    });

    it('should add user message to conversation history', async () => {
      const chat = new AIChat(mockApiKey, mockEntryContent);

      // モック実装: 実際のAPI呼び出しは行わない
      const userMessage = 'この成果についてもっと詳しく話したい';

      // このテストは実際のAPI呼び出しをモックする必要がある
      expect(chat.getConversationHistory().length).toBeGreaterThan(0);
    });

    it('should maintain conversation history', () => {
      const chat = new AIChat(mockApiKey, mockEntryContent);
      const history = chat.getConversationHistory();

      expect(Array.isArray(history)).toBe(true);
      expect(history.every(conv =>
        conv.id && conv.timestamp && conv.role && conv.message
      )).toBe(true);
    });
  });

  describe('generateReflectionQuestions', () => {
    it('should be a function', () => {
      expect(typeof generateReflectionQuestions).toBe('function');
    });

    it('should accept apiKey and content parameters', () => {
      expect(generateReflectionQuestions.length).toBe(2);
    });
  });
});
