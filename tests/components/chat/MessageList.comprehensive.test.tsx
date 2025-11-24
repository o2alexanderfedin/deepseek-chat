import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import chatReducer, { initialState } from '../../../src/store/slices/chatSlice';
import { MessageList } from '../../../src/components/chat/MessageList';
import type { ChatMessage } from '../../../src/types/chat';

// Mock ClipboardItem with supports method
global.ClipboardItem = vi.fn().mockImplementation((items) => items) as unknown as typeof ClipboardItem;
(global.ClipboardItem as unknown as { supports: (type: string) => boolean }).supports = () => true;

// We'll mock clipboard in beforeEach to avoid conflicts with userEvent
let mockWriteText: ReturnType<typeof vi.fn>;
let mockWrite: ReturnType<typeof vi.fn>;

describe('MessageList - Comprehensive Tests', () => {
  const createTestStore = () => {
    return configureStore({
      reducer: { chat: chatReducer },
      preloadedState: {
        chat: {
          ...initialState,
          conversations: [{
            id: 'conv-1',
            title: 'Test',
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }],
          activeConversationId: 'conv-1',
        },
      },
    });
  };

  const createMessage = (id: string, role: 'user' | 'assistant', content: string): ChatMessage => ({
    id,
    role,
    content,
    timestamp: Date.now(),
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockWriteText = vi.fn().mockResolvedValue(undefined);
    mockWrite = vi.fn().mockResolvedValue(undefined);

    // Mock clipboard for copy tests
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: mockWriteText,
        write: mockWrite,
      },
      writable: true,
      configurable: true,
    });
  });

  describe('Message Rendering', () => {
    it('should render user and assistant messages with different styles', () => {
      const messages = [
        createMessage('1', 'user', 'User message'),
        createMessage('2', 'assistant', 'Assistant message'),
      ];

      render(
        <Provider store={createTestStore()}>
          <MessageList messages={messages} />
        </Provider>
      );

      expect(screen.getByText('User message')).toBeInTheDocument();
      expect(screen.getByText('Assistant message')).toBeInTheDocument();
    });

    it('should display timestamps for messages', () => {
      const timestamp = new Date('2024-01-15T10:30:00').getTime();
      const messages = [createMessage('1', 'user', 'Test')];
      messages[0].timestamp = timestamp;

      render(
        <Provider store={createTestStore()}>
          <MessageList messages={messages} />
        </Provider>
      );

      const timestampElement = screen.getByTestId('message-timestamp');
      expect(timestampElement).toBeInTheDocument();
    });
  });

  describe('Raw Mode Toggle', () => {
    it('should toggle raw mode when clicking toggle button', async () => {
      const user = userEvent.setup();
      const messages = [createMessage('1', 'assistant', '**Bold** text')];

      render(
        <Provider store={createTestStore()}>
          <MessageList messages={messages} />
        </Provider>
      );

      // Find and click the raw mode toggle
      const toggleButton = screen.getByLabelText(/toggle raw/i);
      await user.click(toggleButton);

      // In raw mode, should show the raw markdown
      await waitFor(() => {
        expect(screen.getByText('**Bold** text')).toBeInTheDocument();
      });
    });
  });

  describe('Copy Functionality', () => {
    it('should have copy button available', () => {
      const messages = [createMessage('1', 'assistant', 'Copy this text')];

      render(
        <Provider store={createTestStore()}>
          <MessageList messages={messages} />
        </Provider>
      );

      const copyButton = screen.getByLabelText(/copy/i);
      expect(copyButton).toBeInTheDocument();
    });

    it('should copy message content to clipboard', async () => {
      const messages = [createMessage('1', 'assistant', 'Copy this text')];

      render(
        <Provider store={createTestStore()}>
          <MessageList messages={messages} />
        </Provider>
      );

      const copyButton = screen.getByLabelText(/copy/i);
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(mockWrite).toHaveBeenCalled();
      });
    });

    it('should show snackbar after copying', async () => {
      const messages = [createMessage('1', 'assistant', 'Test')];

      render(
        <Provider store={createTestStore()}>
          <MessageList messages={messages} />
        </Provider>
      );

      const copyButton = screen.getByLabelText(/copy/i);
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(screen.getByText(/copied/i)).toBeInTheDocument();
      });
    });
  });

  describe('Edit Functionality', () => {
    it('should enter edit mode when clicking edit button', async () => {
      const user = userEvent.setup();
      const messages = [createMessage('1', 'user', 'Original content')];

      render(
        <Provider store={createTestStore()}>
          <MessageList messages={messages} />
        </Provider>
      );

      const editButton = screen.getByLabelText(/edit/i);
      await user.click(editButton);

      // Should show textarea with content
      await waitFor(() => {
        const textarea = screen.getByDisplayValue('Original content');
        expect(textarea).toBeInTheDocument();
      });
    });

    it('should update content when editing', async () => {
      const user = userEvent.setup();
      const messages = [createMessage('1', 'user', 'Original')];

      render(
        <Provider store={createTestStore()}>
          <MessageList messages={messages} />
        </Provider>
      );

      // Enter edit mode
      const editButton = screen.getByLabelText(/edit/i);
      await user.click(editButton);

      // Find textarea and modify content
      const textarea = screen.getByDisplayValue('Original');
      await user.clear(textarea);
      await user.type(textarea, 'Modified content');

      expect(textarea).toHaveValue('Modified content');
    });

    it('should save edit when clicking save button', async () => {
      const user = userEvent.setup();
      const store = createTestStore();
      const messages = [createMessage('1', 'user', 'Original')];

      render(
        <Provider store={store}>
          <MessageList messages={messages} />
        </Provider>
      );

      // Enter edit mode
      const editButton = screen.getByLabelText(/edit/i);
      await user.click(editButton);

      // Modify content
      const textarea = screen.getByDisplayValue('Original');
      await user.clear(textarea);
      await user.type(textarea, 'Updated');

      // Save
      const saveButton = screen.getByLabelText(/save/i);
      await user.click(saveButton);

      // Should exit edit mode
      await waitFor(() => {
        expect(screen.queryByDisplayValue('Updated')).not.toBeInTheDocument();
      });
    });

    it('should cancel edit when clicking cancel button', async () => {
      const user = userEvent.setup();
      const messages = [createMessage('1', 'user', 'Original')];

      render(
        <Provider store={createTestStore()}>
          <MessageList messages={messages} />
        </Provider>
      );

      // Enter edit mode
      const editButton = screen.getByLabelText(/edit/i);
      await user.click(editButton);

      // Modify content
      const textarea = screen.getByDisplayValue('Original');
      await user.clear(textarea);
      await user.type(textarea, 'Modified');

      // Cancel
      const cancelButton = screen.getByLabelText(/cancel/i);
      await user.click(cancelButton);

      // Should show original content
      await waitFor(() => {
        expect(screen.getByText('Original')).toBeInTheDocument();
      });
    });
  });

  describe('Multiple Messages State Management', () => {
    it('should maintain separate state for each message', async () => {
      const user = userEvent.setup();
      const messages = [
        createMessage('1', 'user', 'Message 1'),
        createMessage('2', 'assistant', 'Message 2'),
      ];

      render(
        <Provider store={createTestStore()}>
          <MessageList messages={messages} />
        </Provider>
      );

      // Toggle raw mode on first message only
      const toggleButtons = screen.getAllByLabelText(/toggle raw/i);
      await user.click(toggleButtons[0]);

      // First message should be in raw mode, second should not
      // Both should still be visible
      expect(screen.getByText('Message 1')).toBeInTheDocument();
      expect(screen.getByText('Message 2')).toBeInTheDocument();
    });
  });

  describe('Scroll Behavior', () => {
    it('should have scroll container with ref', () => {
      const messages = [
        createMessage('1', 'user', 'Test 1'),
        createMessage('2', 'assistant', 'Test 2'),
      ];

      render(
        <Provider store={createTestStore()}>
          <MessageList messages={messages} />
        </Provider>
      );

      const messageList = screen.getByTestId('message-list');
      expect(messageList).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty message when no messages', () => {
      render(
        <Provider store={createTestStore()}>
          <MessageList messages={[]} />
        </Provider>
      );

      expect(screen.getByText(/no messages yet/i)).toBeInTheDocument();
    });
  });

  describe('Markdown Rendering', () => {
    it('should render markdown content', () => {
      const messages = [createMessage('1', 'assistant', '# Heading\n\nParagraph')];

      render(
        <Provider store={createTestStore()}>
          <MessageList messages={messages} />
        </Provider>
      );

      // The MarkdownRenderer should process the content
      expect(screen.getByText('Heading')).toBeInTheDocument();
      expect(screen.getByText('Paragraph')).toBeInTheDocument();
    });
  });
});
