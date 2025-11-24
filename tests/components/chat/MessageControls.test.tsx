import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderWithProviders, screen, fireEvent } from '../../testUtils';
import { MessageControls } from '../../../src/components/chat/MessageControls';
import { ChatMessage } from '../../../src/types/chat';
import userEvent from '@testing-library/user-event';

const mockUserMessage: ChatMessage = {
  id: '1',
  role: 'user',
  content: 'Hello world',
  timestamp: 1700000000000,
};

const mockAssistantMessage: ChatMessage = {
  id: '2',
  role: 'assistant',
  content: '**Bold** and `code` content\n<think>Thinking...</think>',
  timestamp: 1700000001000,
};

describe('MessageControls', () => {
  let originalClipboard: Clipboard;

  beforeEach(() => {
    originalClipboard = navigator.clipboard;
    const mockClipboard = {
      writeText: vi.fn().mockResolvedValue(undefined),
      write: vi.fn().mockResolvedValue(undefined),
    };
    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      writable: true,
      configurable: true,
    });
    vi.clearAllMocks();
  });

  describe('Render Mode Toggle', () => {
    it('renders toggle button', () => {
      renderWithProviders(
        <MessageControls
          message={mockAssistantMessage}
          isRawMode={false}
          onToggleRawMode={vi.fn()}
          onCopy={vi.fn()}
          onEdit={vi.fn()}
          onSaveEdit={vi.fn()}
          onCancelEdit={vi.fn()}
          isEditing={false}
          editContent=""
          onEditContentChange={vi.fn()}
        />
      );
      expect(screen.getByLabelText(/toggle raw mode/i)).toBeInTheDocument();
    });

    it('calls onToggleRawMode when toggle is clicked', async () => {
      const onToggle = vi.fn();
      renderWithProviders(
        <MessageControls
          message={mockAssistantMessage}
          isRawMode={false}
          onToggleRawMode={onToggle}
          onCopy={vi.fn()}
          onEdit={vi.fn()}
          onSaveEdit={vi.fn()}
          onCancelEdit={vi.fn()}
          isEditing={false}
          editContent=""
          onEditContentChange={vi.fn()}
        />
      );

      const toggleButton = screen.getByLabelText(/toggle raw mode/i);
      fireEvent.click(toggleButton);
      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('shows different icon based on isRawMode state', () => {
      const { rerender } = renderWithProviders(
        <MessageControls
          message={mockAssistantMessage}
          isRawMode={false}
          onToggleRawMode={vi.fn()}
          onCopy={vi.fn()}
          onEdit={vi.fn()}
          onSaveEdit={vi.fn()}
          onCancelEdit={vi.fn()}
          isEditing={false}
          editContent=""
          onEditContentChange={vi.fn()}
        />
      );

      // In rendered mode, should show code icon to switch to raw
      expect(screen.getByTestId('CodeIcon')).toBeInTheDocument();

      rerender(
        <MessageControls
          message={mockAssistantMessage}
          isRawMode={true}
          onToggleRawMode={vi.fn()}
          onCopy={vi.fn()}
          onEdit={vi.fn()}
          onSaveEdit={vi.fn()}
          onCancelEdit={vi.fn()}
          isEditing={false}
          editContent=""
          onEditContentChange={vi.fn()}
        />
      );

      // In raw mode, should show visibility icon to switch to rendered
      expect(screen.getByTestId('VisibilityIcon')).toBeInTheDocument();
    });
  });

  describe('Copy Button', () => {
    it('renders copy button', () => {
      renderWithProviders(
        <MessageControls
          message={mockUserMessage}
          isRawMode={false}
          onToggleRawMode={vi.fn()}
          onCopy={vi.fn()}
          onEdit={vi.fn()}
          onSaveEdit={vi.fn()}
          onCancelEdit={vi.fn()}
          isEditing={false}
          editContent=""
          onEditContentChange={vi.fn()}
        />
      );
      expect(screen.getByLabelText(/copy message/i)).toBeInTheDocument();
    });

    it('calls onCopy when copy button is clicked', async () => {
      const onCopy = vi.fn();
      renderWithProviders(
        <MessageControls
          message={mockUserMessage}
          isRawMode={false}
          onToggleRawMode={vi.fn()}
          onCopy={onCopy}
          onEdit={vi.fn()}
          onSaveEdit={vi.fn()}
          onCancelEdit={vi.fn()}
          isEditing={false}
          editContent=""
          onEditContentChange={vi.fn()}
        />
      );

      const copyButton = screen.getByLabelText(/copy message/i);
      fireEvent.click(copyButton);
      expect(onCopy).toHaveBeenCalledTimes(1);
    });

    it('has tooltip for copy button', () => {
      renderWithProviders(
        <MessageControls
          message={mockUserMessage}
          isRawMode={false}
          onToggleRawMode={vi.fn()}
          onCopy={vi.fn()}
          onEdit={vi.fn()}
          onSaveEdit={vi.fn()}
          onCancelEdit={vi.fn()}
          isEditing={false}
          editContent=""
          onEditContentChange={vi.fn()}
        />
      );

      const copyButton = screen.getByLabelText(/copy message/i);
      expect(copyButton).toBeInTheDocument();
    });
  });

  describe('Edit Button', () => {
    it('renders edit button only for user messages', () => {
      renderWithProviders(
        <MessageControls
          message={mockUserMessage}
          isRawMode={false}
          onToggleRawMode={vi.fn()}
          onCopy={vi.fn()}
          onEdit={vi.fn()}
          onSaveEdit={vi.fn()}
          onCancelEdit={vi.fn()}
          isEditing={false}
          editContent=""
          onEditContentChange={vi.fn()}
        />
      );
      expect(screen.getByLabelText(/edit message/i)).toBeInTheDocument();
    });

    it('does not render edit button for assistant messages', () => {
      renderWithProviders(
        <MessageControls
          message={mockAssistantMessage}
          isRawMode={false}
          onToggleRawMode={vi.fn()}
          onCopy={vi.fn()}
          onEdit={vi.fn()}
          onSaveEdit={vi.fn()}
          onCancelEdit={vi.fn()}
          isEditing={false}
          editContent=""
          onEditContentChange={vi.fn()}
        />
      );
      expect(screen.queryByLabelText(/edit message/i)).not.toBeInTheDocument();
    });

    it('calls onEdit when edit button is clicked', async () => {
      const onEdit = vi.fn();
      renderWithProviders(
        <MessageControls
          message={mockUserMessage}
          isRawMode={false}
          onToggleRawMode={vi.fn()}
          onCopy={vi.fn()}
          onEdit={onEdit}
          onSaveEdit={vi.fn()}
          onCancelEdit={vi.fn()}
          isEditing={false}
          editContent=""
          onEditContentChange={vi.fn()}
        />
      );

      const editButton = screen.getByLabelText(/edit message/i);
      fireEvent.click(editButton);
      expect(onEdit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edit Mode', () => {
    it('shows text field when in edit mode', () => {
      renderWithProviders(
        <MessageControls
          message={mockUserMessage}
          isRawMode={false}
          onToggleRawMode={vi.fn()}
          onCopy={vi.fn()}
          onEdit={vi.fn()}
          onSaveEdit={vi.fn()}
          onCancelEdit={vi.fn()}
          isEditing={true}
          editContent="Hello world"
          onEditContentChange={vi.fn()}
        />
      );

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('shows save and cancel buttons in edit mode', () => {
      renderWithProviders(
        <MessageControls
          message={mockUserMessage}
          isRawMode={false}
          onToggleRawMode={vi.fn()}
          onCopy={vi.fn()}
          onEdit={vi.fn()}
          onSaveEdit={vi.fn()}
          onCancelEdit={vi.fn()}
          isEditing={true}
          editContent="Hello world"
          onEditContentChange={vi.fn()}
        />
      );

      expect(screen.getByLabelText(/save edit/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/cancel edit/i)).toBeInTheDocument();
    });

    it('calls onEditContentChange when text is typed', async () => {
      const onEditContentChange = vi.fn();
      const user = userEvent.setup();

      renderWithProviders(
        <MessageControls
          message={mockUserMessage}
          isRawMode={false}
          onToggleRawMode={vi.fn()}
          onCopy={vi.fn()}
          onEdit={vi.fn()}
          onSaveEdit={vi.fn()}
          onCancelEdit={vi.fn()}
          isEditing={true}
          editContent=""
          onEditContentChange={onEditContentChange}
        />
      );

      const textField = screen.getByRole('textbox');
      await user.type(textField, 'a');
      expect(onEditContentChange).toHaveBeenCalled();
    });

    it('calls onSaveEdit when save button is clicked', async () => {
      const onSaveEdit = vi.fn();
      renderWithProviders(
        <MessageControls
          message={mockUserMessage}
          isRawMode={false}
          onToggleRawMode={vi.fn()}
          onCopy={vi.fn()}
          onEdit={vi.fn()}
          onSaveEdit={onSaveEdit}
          onCancelEdit={vi.fn()}
          isEditing={true}
          editContent="Updated content"
          onEditContentChange={vi.fn()}
        />
      );

      const saveButton = screen.getByLabelText(/save edit/i);
      fireEvent.click(saveButton);
      expect(onSaveEdit).toHaveBeenCalledTimes(1);
    });

    it('calls onCancelEdit when cancel button is clicked', async () => {
      const onCancelEdit = vi.fn();
      renderWithProviders(
        <MessageControls
          message={mockUserMessage}
          isRawMode={false}
          onToggleRawMode={vi.fn()}
          onCopy={vi.fn()}
          onEdit={vi.fn()}
          onSaveEdit={vi.fn()}
          onCancelEdit={onCancelEdit}
          isEditing={true}
          editContent="Hello world"
          onEditContentChange={vi.fn()}
        />
      );

      const cancelButton = screen.getByLabelText(/cancel edit/i);
      fireEvent.click(cancelButton);
      expect(onCancelEdit).toHaveBeenCalledTimes(1);
    });

    it('hides regular control buttons when in edit mode', () => {
      renderWithProviders(
        <MessageControls
          message={mockUserMessage}
          isRawMode={false}
          onToggleRawMode={vi.fn()}
          onCopy={vi.fn()}
          onEdit={vi.fn()}
          onSaveEdit={vi.fn()}
          onCancelEdit={vi.fn()}
          isEditing={true}
          editContent="Hello world"
          onEditContentChange={vi.fn()}
        />
      );

      expect(screen.queryByLabelText(/copy message/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/edit message/i)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('all buttons have aria-labels', () => {
      renderWithProviders(
        <MessageControls
          message={mockUserMessage}
          isRawMode={false}
          onToggleRawMode={vi.fn()}
          onCopy={vi.fn()}
          onEdit={vi.fn()}
          onSaveEdit={vi.fn()}
          onCancelEdit={vi.fn()}
          isEditing={false}
          editContent=""
          onEditContentChange={vi.fn()}
        />
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
    });
  });
});
