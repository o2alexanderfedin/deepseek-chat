import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import chatReducer, { initialState, createConversation } from '../../src/store/slices/chatSlice';
import { useChat } from '../../src/hooks/useChat';
import type { Conversation } from '../../src/types/chat';
import type { ReactNode } from 'react';

describe('useChat - Comprehensive Tests', () => {
  const createMockService = () => ({
    chat: vi.fn(),
    chatStream: vi.fn(),
    abort: vi.fn(),
    reset: vi.fn(),
    initialize: vi.fn(),
    isReady: vi.fn().mockReturnValue(true),
  });

  const createTestStore = (preloadedState = {}) => {
    return configureStore({
      reducer: {
        chat: chatReducer,
      },
      preloadedState: {
        chat: {
          ...initialState,
          ...preloadedState,
        },
      },
    });
  };

  const createWrapper = (store: ReturnType<typeof createTestStore>) => {
    return ({ children }: { children: ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
  };

  const createConversationData = (id: string): Conversation => ({
    id,
    title: 'Test Conversation',
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  describe('sendMessage', () => {
    it('should send message and receive response', async () => {
      const mockService = createMockService();
      mockService.chat.mockResolvedValue('Hello from AI');

      const conversation = createConversationData('conv-1');
      const store = createTestStore({
        conversations: [conversation],
        activeConversationId: 'conv-1',
      });

      const { result } = renderHook(() => useChat(mockService as never), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.sendMessage('Hello');
      });

      const state = store.getState().chat;
      expect(state.conversations[0].messages).toHaveLength(2);
      expect(state.conversations[0].messages[0].role).toBe('user');
      expect(state.conversations[0].messages[0].content).toBe('Hello');
      expect(state.conversations[0].messages[1].role).toBe('assistant');
      expect(state.conversations[0].messages[1].content).toBe('Hello from AI');
    });

    it('should handle multi-turn conversation correctly', async () => {
      const mockService = createMockService();

      // First response
      mockService.chat.mockResolvedValueOnce('First response');

      const conversation = createConversationData('conv-1');
      const store = createTestStore({
        conversations: [conversation],
        activeConversationId: 'conv-1',
      });

      const { result } = renderHook(() => useChat(mockService as never), {
        wrapper: createWrapper(store),
      });

      // First message
      await act(async () => {
        await result.current.sendMessage('First message');
      });

      // Second response
      mockService.chat.mockResolvedValueOnce('Second response');

      // Second message - this is where the bug would manifest
      await act(async () => {
        await result.current.sendMessage('Second message');
      });

      const state = store.getState().chat;
      expect(state.conversations[0].messages).toHaveLength(4);

      // Verify the messages are in correct order
      expect(state.conversations[0].messages[0].content).toBe('First message');
      expect(state.conversations[0].messages[1].content).toBe('First response');
      expect(state.conversations[0].messages[2].content).toBe('Second message');
      expect(state.conversations[0].messages[3].content).toBe('Second response');

      // Verify the second call included the full history
      const secondCallMessages = mockService.chat.mock.calls[1][0];
      expect(secondCallMessages).toHaveLength(3);
      expect(secondCallMessages[0]).toEqual({
        role: 'user',
        content: 'First message',
      });
      expect(secondCallMessages[1]).toEqual({
        role: 'assistant',
        content: 'First response',
      });
      expect(secondCallMessages[2]).toEqual({
        role: 'user',
        content: 'Second message',
      });
    });

    it('should not send empty messages', async () => {
      const mockService = createMockService();
      const store = createTestStore({
        conversations: [createConversationData('conv-1')],
        activeConversationId: 'conv-1',
      });

      const { result } = renderHook(() => useChat(mockService as never), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.sendMessage('');
      });

      expect(mockService.chat).not.toHaveBeenCalled();
    });

    it('should not send when service is null', async () => {
      const store = createTestStore({
        conversations: [createConversationData('conv-1')],
        activeConversationId: 'conv-1',
      });

      const { result } = renderHook(() => useChat(null), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.sendMessage('Hello');
      });

      const state = store.getState().chat;
      expect(state.conversations[0].messages).toHaveLength(0);
    });

    it('should trim whitespace from messages', async () => {
      const mockService = createMockService();
      mockService.chat.mockResolvedValue('Response');

      const store = createTestStore({
        conversations: [createConversationData('conv-1')],
        activeConversationId: 'conv-1',
      });

      const { result } = renderHook(() => useChat(mockService as never), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.sendMessage('  Hello  ');
      });

      const state = store.getState().chat;
      expect(state.conversations[0].messages[0].content).toBe('Hello');
    });

    it('should set loading state during generation', async () => {
      const mockService = createMockService();

      let resolveChat: (value: string) => void;
      mockService.chat.mockImplementation(() =>
        new Promise((resolve) => {
          resolveChat = resolve;
        })
      );

      const store = createTestStore({
        conversations: [createConversationData('conv-1')],
        activeConversationId: 'conv-1',
      });

      const { result } = renderHook(() => useChat(mockService as never), {
        wrapper: createWrapper(store),
      });

      act(() => {
        result.current.sendMessage('Hello');
      });

      // Check loading is true
      await waitFor(() => {
        expect(store.getState().chat.isLoading).toBe(true);
      });

      // Resolve and check loading is false
      await act(async () => {
        resolveChat!('Response');
      });

      await waitFor(() => {
        expect(store.getState().chat.isLoading).toBe(false);
      });
    });

    it('should handle errors and set error state', async () => {
      const mockService = createMockService();
      mockService.chat.mockRejectedValue(new Error('Generation failed'));

      const store = createTestStore({
        conversations: [createConversationData('conv-1')],
        activeConversationId: 'conv-1',
      });

      const { result } = renderHook(() => useChat(mockService as never), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.sendMessage('Hello');
      });

      const state = store.getState().chat;
      expect(state.error).toBe('Generation failed');
      expect(state.isLoading).toBe(false);
      // User message should still be added
      expect(state.conversations[0].messages).toHaveLength(1);
    });

    it('should clear error before sending new message', async () => {
      const mockService = createMockService();
      mockService.chat.mockResolvedValue('Response');

      const store = createTestStore({
        conversations: [createConversationData('conv-1')],
        activeConversationId: 'conv-1',
        error: 'Previous error',
      });

      const { result } = renderHook(() => useChat(mockService as never), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.sendMessage('Hello');
      });

      // Wait for state update
      await waitFor(() => {
        const state = store.getState().chat;
        expect(state.error).toBeNull();
      });
    });
  });

  describe('abort', () => {
    it('should call service abort and clear loading', async () => {
      const mockService = createMockService();

      const store = createTestStore({
        conversations: [createConversationData('conv-1')],
        activeConversationId: 'conv-1',
        isLoading: true,
      });

      const { result } = renderHook(() => useChat(mockService as never), {
        wrapper: createWrapper(store),
      });

      act(() => {
        result.current.abort();
      });

      expect(mockService.abort).toHaveBeenCalled();
      expect(store.getState().chat.isLoading).toBe(false);
    });

    it('should handle null service gracefully', () => {
      const store = createTestStore({
        conversations: [createConversationData('conv-1')],
        activeConversationId: 'conv-1',
      });

      const { result } = renderHook(() => useChat(null), {
        wrapper: createWrapper(store),
      });

      expect(() => {
        act(() => {
          result.current.abort();
        });
      }).not.toThrow();
    });
  });

  describe('clear', () => {
    it('should clear chat and reset service', async () => {
      const mockService = createMockService();
      mockService.reset.mockResolvedValue(undefined);

      const conversation: Conversation = {
        ...createConversationData('conv-1'),
        messages: [
          { id: '1', role: 'user', content: 'Hello', timestamp: Date.now() },
        ],
      };

      const store = createTestStore({
        conversations: [conversation],
        activeConversationId: 'conv-1',
      });

      const { result } = renderHook(() => useChat(mockService as never), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.clear();
      });

      const state = store.getState().chat;
      expect(state.conversations[0].messages).toHaveLength(0);
      expect(mockService.reset).toHaveBeenCalled();
    });

    it('should handle null service gracefully', async () => {
      const store = createTestStore({
        conversations: [createConversationData('conv-1')],
        activeConversationId: 'conv-1',
      });

      const { result } = renderHook(() => useChat(null), {
        wrapper: createWrapper(store),
      });

      await expect(
        act(async () => {
          await result.current.clear();
        })
      ).resolves.not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle no active conversation', async () => {
      const mockService = createMockService();

      const store = createTestStore({
        conversations: [createConversationData('conv-1')],
        activeConversationId: null,
      });

      const { result } = renderHook(() => useChat(mockService as never), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.sendMessage('Hello');
      });

      // Message should be added via dispatch but conversation won't receive it
      expect(mockService.chat).toHaveBeenCalled();
    });

    it('should handle conversation with existing messages', async () => {
      const mockService = createMockService();
      mockService.chat.mockResolvedValue('New response');

      const conversation: Conversation = {
        ...createConversationData('conv-1'),
        messages: [
          { id: '1', role: 'user', content: 'Existing', timestamp: Date.now() },
          { id: '2', role: 'assistant', content: 'Previous response', timestamp: Date.now() },
        ],
      };

      const store = createTestStore({
        conversations: [conversation],
        activeConversationId: 'conv-1',
      });

      const { result } = renderHook(() => useChat(mockService as never), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.sendMessage('New message');
      });

      // Verify the call included existing messages
      const callMessages = mockService.chat.mock.calls[0][0];
      expect(callMessages).toHaveLength(3);
      expect(callMessages[0]).toEqual({ role: 'user', content: 'Existing' });
      expect(callMessages[1]).toEqual({ role: 'assistant', content: 'Previous response' });
      expect(callMessages[2]).toEqual({ role: 'user', content: 'New message' });
    });

    it('should handle very long messages', async () => {
      const mockService = createMockService();
      mockService.chat.mockResolvedValue('Response');

      const store = createTestStore({
        conversations: [createConversationData('conv-1')],
        activeConversationId: 'conv-1',
      });

      const { result } = renderHook(() => useChat(mockService as never), {
        wrapper: createWrapper(store),
      });

      const longMessage = 'A'.repeat(10000);
      await act(async () => {
        await result.current.sendMessage(longMessage);
      });

      const state = store.getState().chat;
      expect(state.conversations[0].messages[0].content).toBe(longMessage);
    });
  });
});
