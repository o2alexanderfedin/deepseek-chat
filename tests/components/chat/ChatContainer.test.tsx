import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen } from '../../testUtils';
import { ChatContainer } from '../../../src/components/chat/ChatContainer';

describe('ChatContainer', () => {
  it('renders header with title', () => {
    renderWithProviders(<ChatContainer />);
    expect(screen.getByRole('heading', { name: /deepseek chat/i })).toBeInTheDocument();
  });

  it('renders status indicator', () => {
    renderWithProviders(<ChatContainer />);
    expect(screen.getByTestId('status-indicator')).toBeInTheDocument();
  });

  it('shows model status when loading', () => {
    renderWithProviders(<ChatContainer />, {
      preloadedState: {
        chat: {
          messages: [],
          isLoading: false,
          modelStatus: 'loading',
          loadProgress: 50,
          error: null,
        },
      },
    });
    const statusIndicator = screen.getByTestId('status-indicator');
    expect(statusIndicator).toHaveTextContent(/loading/i);
  });

  it('shows ready status when model is ready', () => {
    renderWithProviders(<ChatContainer />, {
      preloadedState: {
        chat: {
          messages: [],
          isLoading: false,
          modelStatus: 'ready',
          loadProgress: 100,
          error: null,
        },
      },
    });
    expect(screen.getByText(/ready/i)).toBeInTheDocument();
  });

  it('renders message list area', () => {
    renderWithProviders(<ChatContainer />);
    expect(screen.getByTestId('message-list')).toBeInTheDocument();
  });

  it('renders message input area', () => {
    renderWithProviders(<ChatContainer />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('displays error when present', () => {
    renderWithProviders(<ChatContainer />, {
      preloadedState: {
        chat: {
          messages: [],
          isLoading: false,
          modelStatus: 'error',
          loadProgress: 0,
          error: 'Test error message',
        },
      },
    });
    expect(screen.getByText(/test error message/i)).toBeInTheDocument();
  });

  it('has accessible structure', () => {
    renderWithProviders(<ChatContainer />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });
});
