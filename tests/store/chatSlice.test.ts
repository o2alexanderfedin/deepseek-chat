import { describe, it, expect } from 'vitest';
import chatReducer, {
  addMessage,
  setLoading,
  setError,
  setModelStatus,
  setLoadProgress,
  clearChat,
  initialState,
} from '../../src/store/slices/chatSlice';
import type { ChatState, ChatMessage } from '../../src/types/chat';

describe('chatSlice', () => {
  describe('initial state', () => {
    it('should return the initial state', () => {
      const state = chatReducer(undefined, { type: 'unknown' });
      expect(state).toEqual(initialState);
    });

    it('should have correct initial values', () => {
      expect(initialState.messages).toEqual([]);
      expect(initialState.isLoading).toBe(false);
      expect(initialState.error).toBeNull();
      expect(initialState.modelStatus).toBe('idle');
      expect(initialState.loadProgress).toBe(0);
    });
  });

  describe('addMessage', () => {
    it('should add a message to the messages array', () => {
      const message: ChatMessage = {
        id: '1',
        role: 'user',
        content: 'Hello',
        timestamp: Date.now(),
      };
      const state = chatReducer(initialState, addMessage(message));
      expect(state.messages).toHaveLength(1);
      expect(state.messages[0]).toEqual(message);
    });

    it('should append messages in order', () => {
      const message1: ChatMessage = {
        id: '1',
        role: 'user',
        content: 'Hello',
        timestamp: Date.now(),
      };
      const message2: ChatMessage = {
        id: '2',
        role: 'assistant',
        content: 'Hi there!',
        timestamp: Date.now() + 1000,
      };

      let state = chatReducer(initialState, addMessage(message1));
      state = chatReducer(state, addMessage(message2));

      expect(state.messages).toHaveLength(2);
      expect(state.messages[0]).toEqual(message1);
      expect(state.messages[1]).toEqual(message2);
    });
  });

  describe('setLoading', () => {
    it('should set isLoading to true', () => {
      const state = chatReducer(initialState, setLoading(true));
      expect(state.isLoading).toBe(true);
    });

    it('should set isLoading to false', () => {
      const loadingState: ChatState = { ...initialState, isLoading: true };
      const state = chatReducer(loadingState, setLoading(false));
      expect(state.isLoading).toBe(false);
    });
  });

  describe('setError', () => {
    it('should set error message', () => {
      const errorMessage = 'Something went wrong';
      const state = chatReducer(initialState, setError(errorMessage));
      expect(state.error).toBe(errorMessage);
    });

    it('should clear error when set to null', () => {
      const errorState: ChatState = { ...initialState, error: 'Previous error' };
      const state = chatReducer(errorState, setError(null));
      expect(state.error).toBeNull();
    });
  });

  describe('setModelStatus', () => {
    it('should set modelStatus to loading', () => {
      const state = chatReducer(initialState, setModelStatus('loading'));
      expect(state.modelStatus).toBe('loading');
    });

    it('should set modelStatus to ready', () => {
      const state = chatReducer(initialState, setModelStatus('ready'));
      expect(state.modelStatus).toBe('ready');
    });

    it('should set modelStatus to error', () => {
      const state = chatReducer(initialState, setModelStatus('error'));
      expect(state.modelStatus).toBe('error');
    });

    it('should set modelStatus to idle', () => {
      const readyState: ChatState = { ...initialState, modelStatus: 'ready' };
      const state = chatReducer(readyState, setModelStatus('idle'));
      expect(state.modelStatus).toBe('idle');
    });
  });

  describe('setLoadProgress', () => {
    it('should set loadProgress to 0', () => {
      const state = chatReducer(initialState, setLoadProgress(0));
      expect(state.loadProgress).toBe(0);
    });

    it('should set loadProgress to 50', () => {
      const state = chatReducer(initialState, setLoadProgress(50));
      expect(state.loadProgress).toBe(50);
    });

    it('should set loadProgress to 100', () => {
      const state = chatReducer(initialState, setLoadProgress(100));
      expect(state.loadProgress).toBe(100);
    });
  });

  describe('clearChat', () => {
    it('should clear all messages', () => {
      const stateWithMessages: ChatState = {
        ...initialState,
        messages: [
          { id: '1', role: 'user', content: 'Hello', timestamp: Date.now() },
          { id: '2', role: 'assistant', content: 'Hi', timestamp: Date.now() },
        ],
      };
      const state = chatReducer(stateWithMessages, clearChat());
      expect(state.messages).toEqual([]);
    });

    it('should reset error to null', () => {
      const stateWithError: ChatState = {
        ...initialState,
        error: 'Some error',
        messages: [{ id: '1', role: 'user', content: 'Hello', timestamp: Date.now() }],
      };
      const state = chatReducer(stateWithError, clearChat());
      expect(state.error).toBeNull();
    });

    it('should preserve modelStatus', () => {
      const stateWithReadyModel: ChatState = {
        ...initialState,
        modelStatus: 'ready',
        messages: [{ id: '1', role: 'user', content: 'Hello', timestamp: Date.now() }],
      };
      const state = chatReducer(stateWithReadyModel, clearChat());
      expect(state.modelStatus).toBe('ready');
    });
  });
});
