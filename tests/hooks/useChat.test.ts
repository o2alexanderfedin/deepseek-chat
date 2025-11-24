import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import React from 'react';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import { useChat } from '../../src/hooks/useChat';
import chatReducer, { createConversation } from '../../src/store/slices/chatSlice';
import type { WebLLMService } from '../../src/services/webllm/WebLLMService';
import type { Conversation } from '../../src/types/chat';

function createTestStore() {
  const store = configureStore({
    reducer: { chat: chatReducer },
  });

  // Create a default conversation
  const conversation: Conversation = {
    id: 'test-conv-1',
    title: 'Test Chat',
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  store.dispatch(createConversation(conversation));

  return store;
}

function createWrapper(store: ReturnType<typeof createTestStore>) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(Provider, { store, children });
  };
}

describe('useChat', () => {
  let mockService: {
    initialize: Mock;
    chat: Mock;
    chatStream: Mock;
    abort: Mock;
    reset: Mock;
    isReady: Mock;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockService = {
      initialize: vi.fn().mockResolvedValue(undefined),
      chat: vi.fn().mockResolvedValue('Mock response'),
      chatStream: vi.fn(),
      abort: vi.fn(),
      reset: vi.fn().mockResolvedValue(undefined),
      isReady: vi.fn().mockReturnValue(true),
    };
  });

  it('should send message and receive response', async () => {
    const store = createTestStore();
    mockService.chat.mockResolvedValue('Hello! How can I help you?');

    const { result } = renderHook(() => useChat(mockService as unknown as WebLLMService), {
      wrapper: createWrapper(store),
    });

    await act(async () => {
      await result.current.sendMessage('Hello');
    });

    const state = store.getState();
    const activeConv = state.chat.conversations.find(c => c.id === state.chat.activeConversationId);
    expect(activeConv?.messages).toHaveLength(2);
    expect(activeConv?.messages[0].role).toBe('user');
    expect(activeConv?.messages[0].content).toBe('Hello');
    expect(activeConv?.messages[1].role).toBe('assistant');
    expect(activeConv?.messages[1].content).toBe('Hello! How can I help you?');
  });

  it('should set loading state while generating', async () => {
    const store = createTestStore();
    let resolveChat: (value: string) => void;
    const chatPromise = new Promise<string>((resolve) => {
      resolveChat = resolve;
    });
    mockService.chat.mockReturnValue(chatPromise);

    const { result } = renderHook(() => useChat(mockService as unknown as WebLLMService), {
      wrapper: createWrapper(store),
    });

    act(() => {
      result.current.sendMessage('Hello');
    });

    await waitFor(() => {
      expect(store.getState().chat.isLoading).toBe(true);
    });

    await act(async () => {
      resolveChat!('Response');
      await chatPromise;
    });

    await waitFor(() => {
      expect(store.getState().chat.isLoading).toBe(false);
    });
  });

  it('should handle chat errors', async () => {
    const store = createTestStore();
    mockService.chat.mockRejectedValue(new Error('Generation failed'));

    const { result } = renderHook(() => useChat(mockService as unknown as WebLLMService), {
      wrapper: createWrapper(store),
    });

    await act(async () => {
      await result.current.sendMessage('Hello');
    });

    const state = store.getState();
    expect(state.chat.error).toBe('Generation failed');
    expect(state.chat.isLoading).toBe(false);
  });

  it('should clear chat', async () => {
    const store = createTestStore();
    mockService.chat.mockResolvedValue('Response');

    const { result } = renderHook(() => useChat(mockService as unknown as WebLLMService), {
      wrapper: createWrapper(store),
    });

    // Send a message first
    await act(async () => {
      await result.current.sendMessage('Hello');
    });

    const stateBefore = store.getState();
    const activeConvBefore = stateBefore.chat.conversations.find(c => c.id === stateBefore.chat.activeConversationId);
    expect(activeConvBefore?.messages).toHaveLength(2);

    // Clear chat
    await act(async () => {
      await result.current.clear();
    });

    const stateAfter = store.getState();
    const activeConvAfter = stateAfter.chat.conversations.find(c => c.id === stateAfter.chat.activeConversationId);
    expect(activeConvAfter?.messages).toHaveLength(0);
    expect(mockService.reset).toHaveBeenCalled();
  });

  it('should abort generation', async () => {
    const store = createTestStore();

    const { result } = renderHook(() => useChat(mockService as unknown as WebLLMService), {
      wrapper: createWrapper(store),
    });

    act(() => {
      result.current.abort();
    });

    expect(mockService.abort).toHaveBeenCalled();
  });

  it('should not send empty messages', async () => {
    const store = createTestStore();

    const { result } = renderHook(() => useChat(mockService as unknown as WebLLMService), {
      wrapper: createWrapper(store),
    });

    await act(async () => {
      await result.current.sendMessage('   ');
    });

    const state = store.getState();
    const activeConv = state.chat.conversations.find(c => c.id === state.chat.activeConversationId);
    expect(activeConv?.messages).toHaveLength(0);
    expect(mockService.chat).not.toHaveBeenCalled();
  });
});
