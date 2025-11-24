import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import { renderWithProviders } from '../testUtils';
import App from '../../src/App';
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

// Mock storage service
vi.mock('../../src/services/storage', () => ({
  storageService: {
    getAllConversations: vi.fn().mockResolvedValue([]),
    getConversation: vi.fn().mockResolvedValue(undefined),
    saveConversation: vi.fn().mockResolvedValue(undefined),
    deleteConversation: vi.fn().mockResolvedValue(undefined),
    clearAll: vi.fn().mockResolvedValue(undefined),
  },
  IndexedDBStorageService: vi.fn(),
}));

describe('Chat Integration', () => {
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
      chat: vi.fn().mockResolvedValue('I am DeepSeek, an AI assistant.'),
      chatStream: vi.fn(),
      abort: vi.fn(),
      reset: vi.fn().mockResolvedValue(undefined),
      isReady: vi.fn().mockReturnValue(true),
    };

    (WebLLMService.getInstance as Mock) = vi.fn().mockReturnValue(mockInstance);
    (WebLLMService.resetInstance as Mock) = vi.fn();
  });

  it('should render the app and initialize model', async () => {
    renderWithProviders(<App />);

    expect(screen.getByText('DeepSeek Chat')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockInstance.initialize).toHaveBeenCalled();
    });
  });

  it('should show ready status after model loads', async () => {
    mockInstance.isReady.mockReturnValue(true);

    renderWithProviders(<App />);

    await waitFor(() => {
      const status = screen.getByTestId('status-indicator');
      expect(status).toHaveTextContent('Ready');
    });
  });

  it('should send message and display response', async () => {
    const user = userEvent.setup();
    mockInstance.isReady.mockReturnValue(true);

    renderWithProviders(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('status-indicator')).toHaveTextContent('Ready');
    });

    const input = screen.getByPlaceholderText(/type.*message/i);
    await user.type(input, 'Hello, who are you?');

    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Hello, who are you?')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('I am DeepSeek, an AI assistant.')).toBeInTheDocument();
    });
  });

  it('should display error when model fails to load', async () => {
    mockInstance.initialize.mockRejectedValue(new Error('WebGPU not supported'));

    renderWithProviders(<App />);

    await waitFor(() => {
      const status = screen.getByTestId('status-indicator');
      expect(status).toHaveTextContent('Error');
    });

    await waitFor(() => {
      expect(screen.getByText(/webgpu not supported/i)).toBeInTheDocument();
    });
  });

  it('should clear chat history', async () => {
    const user = userEvent.setup();
    mockInstance.isReady.mockReturnValue(true);
    mockInstance.chat.mockResolvedValue('Test response for clear');

    renderWithProviders(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('status-indicator')).toHaveTextContent('Ready');
    });

    // Send a message
    const input = screen.getByPlaceholderText(/type.*message/i);
    await user.type(input, 'Test message');

    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Test response for clear')).toBeInTheDocument();
    });

    // Clear chat
    const clearButton = screen.getByRole('button', { name: /clear/i });
    await user.click(clearButton);

    await waitFor(() => {
      expect(screen.queryByText('Test message')).not.toBeInTheDocument();
      expect(screen.queryByText('Test response for clear')).not.toBeInTheDocument();
    });

    expect(mockInstance.reset).toHaveBeenCalled();
  });

  it('should handle generation errors gracefully', async () => {
    const user = userEvent.setup();
    mockInstance.isReady.mockReturnValue(true);
    mockInstance.chat.mockRejectedValue(new Error('Generation failed'));

    renderWithProviders(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('status-indicator')).toHaveTextContent('Ready');
    });

    const input = screen.getByPlaceholderText(/type.*message/i);
    await user.type(input, 'Hello');

    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(/generation failed/i)).toBeInTheDocument();
    });
  });
});
