import { describe, it, expect } from 'vitest';
import chatReducer, {
  initialState,
  updateConversationTitle,
} from '../../src/store/slices/chatSlice';
import type { ChatState, Conversation } from '../../src/types/chat';

describe('chatSlice', () => {
  describe('updateConversationTitle', () => {
    it('should update conversation title when conversation exists', () => {
      const conversation: Conversation = {
        id: 'conv-1',
        title: 'Original Title',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const stateWithConversation: ChatState = {
        ...initialState,
        conversations: [conversation],
        activeConversationId: conversation.id,
      };

      const newState = chatReducer(
        stateWithConversation,
        updateConversationTitle({ id: 'conv-1', title: 'New Title' })
      );

      expect(newState.conversations[0].title).toBe('New Title');
    });

    it('should not modify state when conversation does not exist', () => {
      const conversation: Conversation = {
        id: 'conv-1',
        title: 'Original Title',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const stateWithConversation: ChatState = {
        ...initialState,
        conversations: [conversation],
        activeConversationId: conversation.id,
      };

      const newState = chatReducer(
        stateWithConversation,
        updateConversationTitle({ id: 'non-existent', title: 'New Title' })
      );

      expect(newState.conversations[0].title).toBe('Original Title');
    });

    it('should only update the targeted conversation', () => {
      const conv1: Conversation = {
        id: 'conv-1',
        title: 'Title 1',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const conv2: Conversation = {
        id: 'conv-2',
        title: 'Title 2',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const stateWithConversations: ChatState = {
        ...initialState,
        conversations: [conv1, conv2],
        activeConversationId: conv1.id,
      };

      const newState = chatReducer(
        stateWithConversations,
        updateConversationTitle({ id: 'conv-2', title: 'Updated Title 2' })
      );

      expect(newState.conversations[0].title).toBe('Title 1');
      expect(newState.conversations[1].title).toBe('Updated Title 2');
    });
  });
});
