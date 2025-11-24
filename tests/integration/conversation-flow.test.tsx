import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import chatReducer, { initialState, addMessage, setLoading, setError } from '../../src/store/slices/chatSlice';
import { MessageInput } from '../../src/components/chat/MessageInput';
import { MessageList } from '../../src/components/chat/MessageList';
import type { Conversation, ChatMessage } from '../../src/types/chat';

describe('Conversation Flow Integration Tests', () => {
  const createTestStore = (preloadedState = {}) => {
    return configureStore({
      reducer: {
        chat: chatReducer,
      },
      preloadedState: {
        chat: {
          ...initialState,
          modelStatus: 'ready' as const,
          loadProgress: 100,
          ...preloadedState,
        },
      },
    });
  };

  const createConversationData = (id: string): Conversation => ({
    id,
    title: 'Test Conversation',
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  describe('MessageInput Component', () => {
    it('should call onSend when submitting message', async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      const store = createTestStore();

      render(
        <Provider store={store}>
          <MessageInput onSend={onSend} disabled={false} />
        </Provider>
      );

      const input = screen.getByPlaceholderText(/type a message/i);
      await user.type(input, 'Test message');

      const sendButton = screen.getByRole('button', { name: /send/i });
      await user.click(sendButton);

      expect(onSend).toHaveBeenCalledWith('Test message');
    });

    it('should not call onSend for empty messages', async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      const store = createTestStore();

      render(
        <Provider store={store}>
          <MessageInput onSend={onSend} disabled={false} />
        </Provider>
      );

      // The send button is disabled when input is empty
      const sendButton = screen.getByRole('button', { name: /send/i });
      expect(sendButton).toBeDisabled();
      expect(onSend).not.toHaveBeenCalled();
    });

    it('should be disabled when disabled prop is true', () => {
      const onSend = vi.fn();
      const store = createTestStore();

      render(
        <Provider store={store}>
          <MessageInput onSend={onSend} disabled={true} />
        </Provider>
      );

      const input = screen.getByPlaceholderText(/type a message/i);
      expect(input).toBeDisabled();
    });

    it('should clear input after sending', async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      const store = createTestStore();

      render(
        <Provider store={store}>
          <MessageInput onSend={onSend} disabled={false} />
        </Provider>
      );

      const input = screen.getByPlaceholderText(/type a message/i) as HTMLTextAreaElement;
      await user.type(input, 'Test message');

      const sendButton = screen.getByRole('button', { name: /send/i });
      await user.click(sendButton);

      expect(input.value).toBe('');
    });

    it('should handle Enter key to send', async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      const store = createTestStore();

      render(
        <Provider store={store}>
          <MessageInput onSend={onSend} disabled={false} />
        </Provider>
      );

      const input = screen.getByPlaceholderText(/type a message/i);
      await user.type(input, 'Test{enter}');

      expect(onSend).toHaveBeenCalledWith('Test');
    });

    it('should allow Shift+Enter for newlines', async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      const store = createTestStore();

      render(
        <Provider store={store}>
          <MessageInput onSend={onSend} disabled={false} />
        </Provider>
      );

      const input = screen.getByPlaceholderText(/type a message/i) as HTMLTextAreaElement;
      await user.type(input, 'Line 1{shift>}{enter}{/shift}Line 2');

      expect(onSend).not.toHaveBeenCalled();
      expect(input.value).toContain('Line 1');
      expect(input.value).toContain('Line 2');
    });
  });

  describe('MessageList Component', () => {
    it('should display messages', () => {
      const messages: ChatMessage[] = [
        { id: '1', role: 'user', content: 'Hello', timestamp: Date.now() },
        { id: '2', role: 'assistant', content: 'Hi there!', timestamp: Date.now() },
      ];

      const store = createTestStore();

      render(
        <Provider store={store}>
          <MessageList messages={messages} />
        </Provider>
      );

      expect(screen.getByText('Hello')).toBeInTheDocument();
      expect(screen.getByText('Hi there!')).toBeInTheDocument();
    });

    it('should show empty state when no messages', () => {
      const store = createTestStore();

      render(
        <Provider store={store}>
          <MessageList messages={[]} />
        </Provider>
      );

      expect(screen.getByText(/no messages yet/i)).toBeInTheDocument();
    });

    it('should display only provided messages', () => {
      const messages: ChatMessage[] = [
        { id: '1', role: 'user', content: 'Conv 1 message', timestamp: Date.now() },
      ];

      const store = createTestStore();

      render(
        <Provider store={store}>
          <MessageList messages={messages} />
        </Provider>
      );

      expect(screen.getByText('Conv 1 message')).toBeInTheDocument();
    });
  });

  describe('Redux State Flow', () => {
    it('should add messages to state correctly', () => {
      const store = createTestStore({
        conversations: [createConversationData('conv-1')],
        activeConversationId: 'conv-1',
      });

      // Add user message
      store.dispatch(addMessage({
        id: 'user-1',
        role: 'user',
        content: 'Hello',
        timestamp: Date.now(),
      }));

      // Add assistant message
      store.dispatch(addMessage({
        id: 'assistant-1',
        role: 'assistant',
        content: 'Hi there!',
        timestamp: Date.now(),
      }));

      const state = store.getState().chat;
      expect(state.conversations[0].messages).toHaveLength(2);
      expect(state.conversations[0].messages[0].content).toBe('Hello');
      expect(state.conversations[0].messages[1].content).toBe('Hi there!');
    });

    it('should handle loading state', () => {
      const store = createTestStore({
        conversations: [createConversationData('conv-1')],
        activeConversationId: 'conv-1',
      });

      store.dispatch(setLoading(true));
      expect(store.getState().chat.isLoading).toBe(true);

      store.dispatch(setLoading(false));
      expect(store.getState().chat.isLoading).toBe(false);
    });

    it('should handle error state', () => {
      const store = createTestStore({
        conversations: [createConversationData('conv-1')],
        activeConversationId: 'conv-1',
      });

      store.dispatch(setError('Generation failed'));
      expect(store.getState().chat.error).toBe('Generation failed');

      store.dispatch(setError(null));
      expect(store.getState().chat.error).toBeNull();
    });

    it('should update conversation title from first message', () => {
      const store = createTestStore({
        conversations: [createConversationData('conv-1')],
        activeConversationId: 'conv-1',
      });

      store.dispatch(addMessage({
        id: 'user-1',
        role: 'user',
        content: 'What is the weather?',
        timestamp: Date.now(),
      }));

      const state = store.getState().chat;
      expect(state.conversations[0].title).toBe('What is the weather?');
    });
  });

  describe('Multi-turn Conversation State', () => {
    it('should preserve full conversation history', () => {
      const store = createTestStore({
        conversations: [createConversationData('conv-1')],
        activeConversationId: 'conv-1',
      });

      // Simulate multi-turn conversation
      const messages = [
        { id: '1', role: 'user' as const, content: 'Hello', timestamp: Date.now() },
        { id: '2', role: 'assistant' as const, content: 'Hi!', timestamp: Date.now() + 1 },
        { id: '3', role: 'user' as const, content: 'How are you?', timestamp: Date.now() + 2 },
        { id: '4', role: 'assistant' as const, content: 'I am well!', timestamp: Date.now() + 3 },
        { id: '5', role: 'user' as const, content: 'Great!', timestamp: Date.now() + 4 },
        { id: '6', role: 'assistant' as const, content: 'Indeed!', timestamp: Date.now() + 5 },
      ];

      for (const msg of messages) {
        store.dispatch(addMessage(msg));
      }

      const state = store.getState().chat;
      expect(state.conversations[0].messages).toHaveLength(6);

      // Verify order
      state.conversations[0].messages.forEach((msg, i) => {
        expect(msg.content).toBe(messages[i].content);
      });
    });

    it('should handle conversation with many messages', () => {
      const store = createTestStore({
        conversations: [createConversationData('conv-1')],
        activeConversationId: 'conv-1',
      });

      // Add 100 messages
      for (let i = 0; i < 100; i++) {
        store.dispatch(addMessage({
          id: `msg-${i}`,
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: `Message ${i}`,
          timestamp: Date.now() + i,
        }));
      }

      const state = store.getState().chat;
      expect(state.conversations[0].messages).toHaveLength(100);
    });
  });
});
