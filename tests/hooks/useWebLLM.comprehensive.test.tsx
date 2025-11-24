import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import chatReducer, { initialState } from '../../src/store/slices/chatSlice';
import { useWebLLM } from '../../src/hooks/useWebLLM';
import { WebLLMService } from '../../src/services/webllm';
import type { ReactNode } from 'react';

// Mock WebLLMService
vi.mock('../../src/services/webllm', () => {
  const mockInstance = {
    initialize: vi.fn(),
    chat: vi.fn(),
    chatStream: vi.fn(),
    abort: vi.fn(),
    reset: vi.fn(),
    isReady: vi.fn(),
  };

  return {
    WebLLMService: {
      getInstance: vi.fn(() => mockInstance),
      resetInstance: vi.fn(),
    },
    AVAILABLE_MODELS: [{ id: 'test-model', name: 'Test Model' }],
  };
});

describe('useWebLLM - Comprehensive Tests', () => {
  let mockService: {
    initialize: ReturnType<typeof vi.fn>;
    chat: ReturnType<typeof vi.fn>;
    chatStream: ReturnType<typeof vi.fn>;
    abort: ReturnType<typeof vi.fn>;
    reset: ReturnType<typeof vi.fn>;
    isReady: ReturnType<typeof vi.fn>;
  };

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

  beforeEach(() => {
    mockService = WebLLMService.getInstance() as unknown as typeof mockService;
    vi.clearAllMocks();
    mockService.initialize.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize model on mount', async () => {
      const store = createTestStore();

      renderHook(() => useWebLLM(), {
        wrapper: createWrapper(store),
      });

      await waitFor(() => {
        expect(mockService.initialize).toHaveBeenCalled();
      });
    });

    it('should set model status to loading then ready', async () => {
      const store = createTestStore();

      renderHook(() => useWebLLM(), {
        wrapper: createWrapper(store),
      });

      // Initially should be loading
      await waitFor(() => {
        const state = store.getState().chat;
        expect(state.modelStatus).toBe('loading');
      });

      // After initialization should be ready
      await waitFor(() => {
        const state = store.getState().chat;
        expect(state.modelStatus).toBe('ready');
      });
    });

    it('should set progress to 100 on completion', async () => {
      const store = createTestStore();

      renderHook(() => useWebLLM(), {
        wrapper: createWrapper(store),
      });

      await waitFor(() => {
        const state = store.getState().chat;
        expect(state.loadProgress).toBe(100);
      });
    });

    it('should handle initialization error', async () => {
      mockService.initialize.mockRejectedValue(new Error('WebGPU not supported'));
      const store = createTestStore();

      renderHook(() => useWebLLM(), {
        wrapper: createWrapper(store),
      });

      await waitFor(() => {
        const state = store.getState().chat;
        expect(state.modelStatus).toBe('error');
        expect(state.error).toBe('WebGPU not supported');
      });
    });

    it('should update progress during loading', async () => {
      mockService.initialize.mockImplementation(async (_modelId, onProgress) => {
        // Simulate progress updates
        await new Promise<void>((resolve) => {
          setTimeout(() => {
            onProgress?.({ progress: 25 });
            setTimeout(() => {
              onProgress?.({ progress: 50 });
              setTimeout(() => {
                onProgress?.({ progress: 75 });
                resolve();
              }, 10);
            }, 10);
          }, 10);
        });
      });

      const store = createTestStore();

      renderHook(() => useWebLLM(), {
        wrapper: createWrapper(store),
      });

      // Wait for progress updates
      await waitFor(() => {
        const state = store.getState().chat;
        expect(state.loadProgress).toBeGreaterThan(0);
      });
    });
  });

  describe('switchModel', () => {
    it('should switch to a different model', async () => {
      const store = createTestStore();

      const { result } = renderHook(() => useWebLLM(), {
        wrapper: createWrapper(store),
      });

      await waitFor(() => {
        expect(mockService.initialize).toHaveBeenCalled();
      });

      // Reset mock to track new call
      mockService.initialize.mockClear();

      await act(async () => {
        await result.current.switchModel('new-model-id');
      });

      expect(mockService.initialize).toHaveBeenCalledWith(
        'new-model-id',
        expect.any(Function)
      );
    });

    it('should not reinitialize if same model', async () => {
      const store = createTestStore();

      const { result } = renderHook(() => useWebLLM(), {
        wrapper: createWrapper(store),
      });

      await waitFor(() => {
        expect(mockService.initialize).toHaveBeenCalled();
      });

      mockService.initialize.mockClear();

      await act(async () => {
        // Use the default model ID
        await result.current.switchModel(result.current.currentModel);
      });

      expect(mockService.initialize).not.toHaveBeenCalled();
    });
  });

  describe('abort', () => {
    it('should call service abort', async () => {
      const store = createTestStore();

      const { result } = renderHook(() => useWebLLM(), {
        wrapper: createWrapper(store),
      });

      await waitFor(() => {
        expect(mockService.initialize).toHaveBeenCalled();
      });

      act(() => {
        result.current.abort();
      });

      expect(mockService.abort).toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('should call service reset', async () => {
      mockService.reset.mockResolvedValue(undefined);
      const store = createTestStore();

      const { result } = renderHook(() => useWebLLM(), {
        wrapper: createWrapper(store),
      });

      await waitFor(() => {
        expect(mockService.initialize).toHaveBeenCalled();
      });

      await act(async () => {
        await result.current.reset();
      });

      expect(mockService.reset).toHaveBeenCalled();
    });
  });

  describe('Return Values', () => {
    it('should return service instance', async () => {
      const store = createTestStore();

      const { result } = renderHook(() => useWebLLM(), {
        wrapper: createWrapper(store),
      });

      expect(result.current.service).toBeDefined();
    });

    it('should return current model', async () => {
      const store = createTestStore();

      const { result } = renderHook(() => useWebLLM(), {
        wrapper: createWrapper(store),
      });

      expect(result.current.currentModel).toBeDefined();
      expect(typeof result.current.currentModel).toBe('string');
    });

    it('should return abort function', async () => {
      const store = createTestStore();

      const { result } = renderHook(() => useWebLLM(), {
        wrapper: createWrapper(store),
      });

      expect(typeof result.current.abort).toBe('function');
    });

    it('should return reset function', async () => {
      const store = createTestStore();

      const { result } = renderHook(() => useWebLLM(), {
        wrapper: createWrapper(store),
      });

      expect(typeof result.current.reset).toBe('function');
    });

    it('should return switchModel function', async () => {
      const store = createTestStore();

      const { result } = renderHook(() => useWebLLM(), {
        wrapper: createWrapper(store),
      });

      expect(typeof result.current.switchModel).toBe('function');
    });
  });

  describe('Edge Cases', () => {
    it('should handle non-Error exceptions', async () => {
      mockService.initialize.mockRejectedValue('String error');
      const store = createTestStore();

      renderHook(() => useWebLLM(), {
        wrapper: createWrapper(store),
      });

      await waitFor(() => {
        const state = store.getState().chat;
        expect(state.modelStatus).toBe('error');
        expect(state.error).toBe('Failed to initialize model');
      });
    });

    it('should handle rapid model switches', async () => {
      const store = createTestStore();

      const { result } = renderHook(() => useWebLLM(), {
        wrapper: createWrapper(store),
      });

      await waitFor(() => {
        expect(mockService.initialize).toHaveBeenCalled();
      });

      mockService.initialize.mockClear();

      // Rapidly switch models
      await act(async () => {
        const promises = [
          result.current.switchModel('model-1'),
          result.current.switchModel('model-2'),
          result.current.switchModel('model-3'),
        ];
        await Promise.all(promises);
      });

      // All switches should be attempted
      expect(mockService.initialize).toHaveBeenCalledTimes(3);
    });
  });
});
