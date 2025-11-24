import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../../src/theme';
import chatReducer from '../../../src/store/slices/chatSlice';
import { ChatSidebar } from '../../../src/components/sidebar/ChatSidebar';
import type { Conversation } from '../../../src/types/chat';

const createTestStore = (conversations: Conversation[] = [], activeId: string | null = null) => {
  return configureStore({
    reducer: { chat: chatReducer },
    preloadedState: {
      chat: {
        conversations,
        activeConversationId: activeId,
        isLoading: false,
        error: null,
        modelStatus: 'ready' as const,
        loadProgress: 100,
      },
    },
  });
};

const renderWithProviders = (
  ui: React.ReactElement,
  store = createTestStore()
) => {
  return render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        {ui}
      </ThemeProvider>
    </Provider>
  );
};

describe('ChatSidebar', () => {
  const mockOnNewChat = vi.fn();
  const mockOnSelectConversation = vi.fn();
  const mockOnDeleteConversation = vi.fn();
  const mockOnRenameConversation = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render new chat button', () => {
      renderWithProviders(
        <ChatSidebar
          onNewChat={mockOnNewChat}
          onSelectConversation={mockOnSelectConversation}
          onDeleteConversation={mockOnDeleteConversation}
          onRenameConversation={mockOnRenameConversation}
        />
      );

      expect(screen.getByRole('button', { name: /new chat/i })).toBeInTheDocument();
    });

    it('should render list of conversations', () => {
      const conversations: Conversation[] = [
        {
          id: 'conv-1',
          title: 'Chat 1',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'conv-2',
          title: 'Chat 2',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const store = createTestStore(conversations, 'conv-1');
      renderWithProviders(
        <ChatSidebar
          onNewChat={mockOnNewChat}
          onSelectConversation={mockOnSelectConversation}
          onDeleteConversation={mockOnDeleteConversation}
          onRenameConversation={mockOnRenameConversation}
        />,
        store
      );

      expect(screen.getByText('Chat 1')).toBeInTheDocument();
      expect(screen.getByText('Chat 2')).toBeInTheDocument();
    });

    it('should highlight active conversation', () => {
      const conversations: Conversation[] = [
        {
          id: 'conv-1',
          title: 'Active Chat',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const store = createTestStore(conversations, 'conv-1');
      renderWithProviders(
        <ChatSidebar
          onNewChat={mockOnNewChat}
          onSelectConversation={mockOnSelectConversation}
          onDeleteConversation={mockOnDeleteConversation}
          onRenameConversation={mockOnRenameConversation}
        />,
        store
      );

      const listItem = screen.getByText('Active Chat').closest('li');
      expect(listItem).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('interactions', () => {
    it('should call onNewChat when new chat button is clicked', () => {
      renderWithProviders(
        <ChatSidebar
          onNewChat={mockOnNewChat}
          onSelectConversation={mockOnSelectConversation}
          onDeleteConversation={mockOnDeleteConversation}
          onRenameConversation={mockOnRenameConversation}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /new chat/i }));
      expect(mockOnNewChat).toHaveBeenCalledTimes(1);
    });

    it('should call onSelectConversation when a conversation is clicked', () => {
      const conversations: Conversation[] = [
        {
          id: 'conv-1',
          title: 'Chat 1',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const store = createTestStore(conversations, 'conv-1');
      renderWithProviders(
        <ChatSidebar
          onNewChat={mockOnNewChat}
          onSelectConversation={mockOnSelectConversation}
          onDeleteConversation={mockOnDeleteConversation}
          onRenameConversation={mockOnRenameConversation}
        />,
        store
      );

      fireEvent.click(screen.getByText('Chat 1'));
      expect(mockOnSelectConversation).toHaveBeenCalledWith('conv-1');
    });

    it('should call onDeleteConversation when delete button is clicked', () => {
      const conversations: Conversation[] = [
        {
          id: 'conv-1',
          title: 'Chat 1',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const store = createTestStore(conversations, 'conv-1');
      renderWithProviders(
        <ChatSidebar
          onNewChat={mockOnNewChat}
          onSelectConversation={mockOnSelectConversation}
          onDeleteConversation={mockOnDeleteConversation}
          onRenameConversation={mockOnRenameConversation}
        />,
        store
      );

      const deleteButton = screen.getByLabelText(/delete/i);
      fireEvent.click(deleteButton);
      expect(mockOnDeleteConversation).toHaveBeenCalledWith('conv-1');
    });
  });

  describe('empty state', () => {
    it('should show empty message when no conversations', () => {
      renderWithProviders(
        <ChatSidebar
          onNewChat={mockOnNewChat}
          onSelectConversation={mockOnSelectConversation}
          onDeleteConversation={mockOnDeleteConversation}
          onRenameConversation={mockOnRenameConversation}
        />
      );

      expect(screen.getByText(/no conversations/i)).toBeInTheDocument();
    });
  });
});
