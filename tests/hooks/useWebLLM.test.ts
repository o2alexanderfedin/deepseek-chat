import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import React from 'react';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import { useWebLLM } from '../../src/hooks/useWebLLM';
import chatReducer from '../../src/store/slices/chatSlice';
import { WebLLMService } from '../../src/services/webllm';

// Mock WebLLMService and AVAILABLE_MODELS
vi.mock('../../src/services/webllm', () => ({
  WebLLMService: {
    getInstance: vi.fn(),
    resetInstance: vi.fn(),
  },
  AVAILABLE_MODELS: [
    { id: 'test-model', name: 'Test Model', vram: '4GB' },
  ],
}));

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

describe('useWebLLM', () => {
  let mockInstance: {
    initialize: Mock;
    chat: Mock;
    chatStream: Mock;
    abort: Mock;
    reset: Mock;
    isReady: Mock;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockInstance = {
      initialize: vi.fn().mockResolvedValue(undefined),
      chat: vi.fn().mockResolvedValue('Mock response'),
      chatStream: vi.fn(),
      abort: vi.fn(),
      reset: vi.fn().mockResolvedValue(undefined),
      isReady: vi.fn().mockReturnValue(false),
    };

    (WebLLMService.getInstance as Mock) = vi.fn().mockReturnValue(mockInstance);
    (WebLLMService.resetInstance as Mock) = vi.fn();
  });

  it('should initialize model on mount', async () => {
    const store = createTestStore();

    const { result } = renderHook(() => useWebLLM(), {
      wrapper: createWrapper(store),
    });

    await waitFor(() => {
      expect(mockInstance.initialize).toHaveBeenCalled();
    });

    expect(result.current.service).toBe(mockInstance);
  });

  it('should update model status to ready after initialization', async () => {
    const store = createTestStore();
    mockInstance.isReady.mockReturnValue(true);

    renderHook(() => useWebLLM(), {
      wrapper: createWrapper(store),
    });

    await waitFor(() => {
      const state = store.getState();
      expect(state.chat.modelStatus).toBe('ready');
    });
  });

  it('should update load progress during initialization', async () => {
    const store = createTestStore();

    mockInstance.initialize.mockImplementation(async (_model, onProgress) => {
      if (onProgress) {
        onProgress({ progress: 50, stage: 'Loading model...' });
      }
    });

    renderHook(() => useWebLLM(), {
      wrapper: createWrapper(store),
    });

    await waitFor(() => {
      const state = store.getState();
      expect(state.chat.loadProgress).toBe(50);
    });
  });

  it('should set error on initialization failure', async () => {
    const store = createTestStore();
    mockInstance.initialize.mockRejectedValue(new Error('WebGPU not supported'));

    renderHook(() => useWebLLM(), {
      wrapper: createWrapper(store),
    });

    await waitFor(() => {
      const state = store.getState();
      expect(state.chat.modelStatus).toBe('error');
      expect(state.chat.error).toBe('WebGPU not supported');
    });
  });

  it('should provide abort function', async () => {
    const store = createTestStore();

    const { result } = renderHook(() => useWebLLM(), {
      wrapper: createWrapper(store),
    });

    await waitFor(() => {
      expect(mockInstance.initialize).toHaveBeenCalled();
    });

    act(() => {
      result.current.abort();
    });

    expect(mockInstance.abort).toHaveBeenCalled();
  });

  it('should provide reset function', async () => {
    const store = createTestStore();

    const { result } = renderHook(() => useWebLLM(), {
      wrapper: createWrapper(store),
    });

    await waitFor(() => {
      expect(mockInstance.initialize).toHaveBeenCalled();
    });

    await act(async () => {
      await result.current.reset();
    });

    expect(mockInstance.reset).toHaveBeenCalled();
  });
});
