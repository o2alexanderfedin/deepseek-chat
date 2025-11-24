import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import React from 'react';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import { useChat } from '../../src/hooks/useChat';
import chatReducer from '../../src/store/slices/chatSlice';
import type { WebLLMService } from '../../src/services/webllm/WebLLMService';

function createTestStore() {
  return configureStore({
    reducer: { chat: chatReducer },
  });
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
    expect(state.chat.messages).toHaveLength(2);
    expect(state.chat.messages[0].role).toBe('user');
    expect(state.chat.messages[0].content).toBe('Hello');
    expect(state.chat.messages[1].role).toBe('assistant');
    expect(state.chat.messages[1].content).toBe('Hello! How can I help you?');
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

    expect(store.getState().chat.messages).toHaveLength(2);

    // Clear chat
    await act(async () => {
      await result.current.clear();
    });

    expect(store.getState().chat.messages).toHaveLength(0);
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

    expect(store.getState().chat.messages).toHaveLength(0);
    expect(mockService.chat).not.toHaveBeenCalled();
  });
});
