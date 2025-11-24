import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConversationItem } from '../../../src/components/sidebar/ConversationItem';
import type { Conversation } from '../../../src/types/chat';

describe('ConversationItem', () => {
  const mockConversation: Conversation = {
    id: 'conv-1',
    title: 'Test Conversation',
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const defaultProps = {
    conversation: mockConversation,
    isActive: false,
    onSelect: vi.fn(),
    onDelete: vi.fn(),
    onRename: vi.fn(),
  };

  it('should render conversation title', () => {
    render(<ConversationItem {...defaultProps} />);
    expect(screen.getByText('Test Conversation')).toBeInTheDocument();
  });

  it('should enter edit mode on double-click', async () => {
    const user = userEvent.setup();
    render(<ConversationItem {...defaultProps} />);

    const title = screen.getByText('Test Conversation');
    await user.dblClick(title);

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('Test Conversation');
  });

  it('should save on Enter key', async () => {
    const user = userEvent.setup();
    const onRename = vi.fn();
    render(<ConversationItem {...defaultProps} onRename={onRename} />);

    const title = screen.getByText('Test Conversation');
    await user.dblClick(title);

    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'New Title{Enter}');

    expect(onRename).toHaveBeenCalledWith('conv-1', 'New Title');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('should save on blur', async () => {
    const user = userEvent.setup();
    const onRename = vi.fn();
    render(<ConversationItem {...defaultProps} onRename={onRename} />);

    const title = screen.getByText('Test Conversation');
    await user.dblClick(title);

    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'New Title');
    fireEvent.blur(input);

    expect(onRename).toHaveBeenCalledWith('conv-1', 'New Title');
  });

  it('should cancel on Escape key', async () => {
    const user = userEvent.setup();
    const onRename = vi.fn();
    render(<ConversationItem {...defaultProps} onRename={onRename} />);

    const title = screen.getByText('Test Conversation');
    await user.dblClick(title);

    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'New Title{Escape}');

    expect(onRename).not.toHaveBeenCalled();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByText('Test Conversation')).toBeInTheDocument();
  });

  it('should revert to original title if empty', async () => {
    const user = userEvent.setup();
    const onRename = vi.fn();
    render(<ConversationItem {...defaultProps} onRename={onRename} />);

    const title = screen.getByText('Test Conversation');
    await user.dblClick(title);

    const input = screen.getByRole('textbox');
    await user.clear(input);
    fireEvent.blur(input);

    expect(onRename).not.toHaveBeenCalled();
    expect(screen.getByText('Test Conversation')).toBeInTheDocument();
  });

  it('should not enter edit mode when clicking delete button', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<ConversationItem {...defaultProps} onDelete={onDelete} />);

    const deleteButton = screen.getByLabelText('delete');
    await user.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith('conv-1');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('should show edit icon button', () => {
    render(<ConversationItem {...defaultProps} />);
    expect(screen.getByLabelText('edit')).toBeInTheDocument();
  });

  it('should enter edit mode when clicking edit icon', async () => {
    const user = userEvent.setup();
    render(<ConversationItem {...defaultProps} />);

    const editButton = screen.getByLabelText('edit');
    await user.click(editButton);

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });
});
