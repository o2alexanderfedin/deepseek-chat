import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, screen, fireEvent } from '../../testUtils';
import userEvent from '@testing-library/user-event';
import { MessageInput } from '../../../src/components/chat/MessageInput';

describe('MessageInput', () => {
  it('renders text input', () => {
    const onSend = vi.fn();
    renderWithProviders(<MessageInput onSend={onSend} disabled={false} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders send button', () => {
    const onSend = vi.fn();
    renderWithProviders(<MessageInput onSend={onSend} disabled={false} />);
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('updates text value on input', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    renderWithProviders(<MessageInput onSend={onSend} disabled={false} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'Hello');
    expect(input).toHaveValue('Hello');
  });

  it('calls onSend when send button clicked', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    renderWithProviders(<MessageInput onSend={onSend} disabled={false} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'Hello');
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);
    
    expect(onSend).toHaveBeenCalledWith('Hello');
  });

  it('clears input after send', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    renderWithProviders(<MessageInput onSend={onSend} disabled={false} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'Hello');
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);
    
    expect(input).toHaveValue('');
  });

  it('sends on Enter key press', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    renderWithProviders(<MessageInput onSend={onSend} disabled={false} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'Hello{Enter}');
    
    expect(onSend).toHaveBeenCalledWith('Hello');
  });

  it('does not send on Shift+Enter (newline)', async () => {
    const onSend = vi.fn();
    renderWithProviders(<MessageInput onSend={onSend} disabled={false} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });
    
    expect(onSend).not.toHaveBeenCalled();
  });

  it('disables send button when disabled prop is true', () => {
    const onSend = vi.fn();
    renderWithProviders(<MessageInput onSend={onSend} disabled={true} />);
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).toBeDisabled();
  });

  it('disables send button when input is empty', () => {
    const onSend = vi.fn();
    renderWithProviders(<MessageInput onSend={onSend} disabled={false} />);
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).toBeDisabled();
  });

  it('shows character count', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    renderWithProviders(<MessageInput onSend={onSend} disabled={false} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'Hello');
    
    expect(screen.getByTestId('char-count')).toHaveTextContent('5');
  });

  it('has proper accessibility attributes', () => {
    const onSend = vi.fn();
    renderWithProviders(<MessageInput onSend={onSend} disabled={false} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-label', 'Message input');
  });
});
