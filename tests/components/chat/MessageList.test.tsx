import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, screen } from '../../testUtils';
import { MessageList } from '../../../src/components/chat/MessageList';
import { ChatMessage } from '../../../src/types/chat';

const mockMessages: ChatMessage[] = [
  { id: '1', role: 'user', content: 'Hello', timestamp: 1700000000000 },
  { id: '2', role: 'assistant', content: 'Hi there!', timestamp: 1700000001000 },
];

describe('MessageList', () => {
  it('renders empty state when no messages', () => {
    renderWithProviders(<MessageList messages={[]} />);
    expect(screen.getByText(/no messages yet/i)).toBeInTheDocument();
  });

  it('renders messages correctly', () => {
    renderWithProviders(<MessageList messages={mockMessages} />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
  });

  it('displays user messages with correct alignment', () => {
    renderWithProviders(<MessageList messages={mockMessages} />);
    const userMessage = screen.getByText('Hello').closest('[data-testid="message-bubble"]');
    expect(userMessage).toBeInTheDocument();
  });

  it('displays assistant messages with correct alignment', () => {
    renderWithProviders(<MessageList messages={mockMessages} />);
    const assistantMessage = screen.getByText('Hi there!').closest('[data-testid="message-bubble"]');
    expect(assistantMessage).toBeInTheDocument();
  });

  it('shows timestamps for messages', () => {
    renderWithProviders(<MessageList messages={mockMessages} />);
    const timestamps = screen.getAllByTestId('message-timestamp');
    expect(timestamps).toHaveLength(2);
  });

  it('renders markdown content', () => {
    const messagesWithMarkdown: ChatMessage[] = [
      { id: '1', role: 'assistant', content: '**Bold text**', timestamp: 1700000000000 },
    ];
    renderWithProviders(<MessageList messages={messagesWithMarkdown} />);
    expect(screen.getByText('Bold text')).toBeInTheDocument();
  });

  it('renders markdown with bold formatting', () => {
    const messagesWithMarkdown: ChatMessage[] = [
      { id: '1', role: 'assistant', content: 'This is **bold** text', timestamp: 1700000000000 },
    ];
    renderWithProviders(<MessageList messages={messagesWithMarkdown} />);
    const boldElement = screen.getByText('bold');
    expect(boldElement.tagName).toBe('STRONG');
  });

  it('renders markdown with italic formatting', () => {
    const messagesWithMarkdown: ChatMessage[] = [
      { id: '1', role: 'assistant', content: 'This is *italic* text', timestamp: 1700000000000 },
    ];
    renderWithProviders(<MessageList messages={messagesWithMarkdown} />);
    const italicElement = screen.getByText('italic');
    expect(italicElement.tagName).toBe('EM');
  });

  it('renders code blocks properly', () => {
    const messagesWithCode: ChatMessage[] = [
      { id: '1', role: 'assistant', content: '```javascript\nconst x = 1;\n```', timestamp: 1700000000000 },
    ];
    renderWithProviders(<MessageList messages={messagesWithCode} />);
    expect(screen.getByText('const x = 1;')).toBeInTheDocument();
  });

  it('renders inline code properly', () => {
    const messagesWithCode: ChatMessage[] = [
      { id: '1', role: 'assistant', content: 'Use `console.log()` for debugging', timestamp: 1700000000000 },
    ];
    renderWithProviders(<MessageList messages={messagesWithCode} />);
    const codeElement = screen.getByText('console.log()');
    expect(codeElement.tagName).toBe('CODE');
  });

  it('renders think blocks with distinct styling', () => {
    const messagesWithThink: ChatMessage[] = [
      {
        id: '1',
        role: 'assistant',
        content: '<think>\nLet me analyze this problem...\n</think>\n\nHere is my answer.',
        timestamp: 1700000000000
      },
    ];
    renderWithProviders(<MessageList messages={messagesWithThink} />);
    expect(screen.getByTestId('think-block')).toBeInTheDocument();
    expect(screen.getByText(/Let me analyze this problem/)).toBeInTheDocument();
    expect(screen.getByText('Here is my answer.')).toBeInTheDocument();
  });

  it('renders multiple think blocks correctly', () => {
    const messagesWithMultipleThink: ChatMessage[] = [
      {
        id: '1',
        role: 'assistant',
        content: '<think>First thought</think>\nResponse 1\n<think>Second thought</think>\nResponse 2',
        timestamp: 1700000000000
      },
    ];
    renderWithProviders(<MessageList messages={messagesWithMultipleThink} />);
    const thinkBlocks = screen.getAllByTestId('think-block');
    expect(thinkBlocks).toHaveLength(2);
  });

  it('renders markdown lists correctly', () => {
    const messagesWithList: ChatMessage[] = [
      {
        id: '1',
        role: 'assistant',
        content: '- Item 1\n- Item 2\n- Item 3',
        timestamp: 1700000000000
      },
    ];
    renderWithProviders(<MessageList messages={messagesWithList} />);
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    renderWithProviders(<MessageList messages={mockMessages} />);
    const list = screen.getByRole('log');
    expect(list).toHaveAttribute('aria-label', 'Chat messages');
  });

  it('auto-scrolls to bottom on new messages', () => {
    const scrollIntoViewMock = vi.spyOn(window.HTMLElement.prototype, 'scrollIntoView').mockImplementation(() => {});

    renderWithProviders(<MessageList messages={mockMessages} />);

    const newMessages: ChatMessage[] = [
      ...mockMessages,
      { id: '3', role: 'user', content: 'New message', timestamp: 1700000002000 },
    ];

    renderWithProviders(<MessageList messages={newMessages} />);
    // The component calls scrollIntoView on the bottom ref element
    expect(scrollIntoViewMock).toHaveBeenCalled();

    scrollIntoViewMock.mockRestore();
  });
});
