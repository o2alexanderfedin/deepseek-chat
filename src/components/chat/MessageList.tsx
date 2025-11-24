import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Typography, Paper, Snackbar } from '@mui/material';
import { useDispatch } from 'react-redux';
import { ChatMessage } from '../../types/chat';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { MessageControls } from './MessageControls';
import { updateMessage } from '../../store/slices/chatSlice';

interface MessageRenderState {
  isRawMode: boolean;
  isEditing: boolean;
  editContent: string;
}

const convertToHtml = (content: string): string => {
  // Simple markdown to HTML conversion for copy
  const html = content
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');
  return html;
};

interface MessageListProps {
  messages: ChatMessage[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const [messageStates, setMessageStates] = useState<Record<string, MessageRenderState>>({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMessageState = useCallback((messageId: string): MessageRenderState => {
    return messageStates[messageId] || { isRawMode: false, isEditing: false, editContent: '' };
  }, [messageStates]);

  const handleToggleRawMode = useCallback((messageId: string) => {
    setMessageStates(prev => ({
      ...prev,
      [messageId]: {
        ...getMessageState(messageId),
        isRawMode: !getMessageState(messageId).isRawMode,
      },
    }));
  }, [getMessageState]);

  const handleCopy = useCallback(async (message: ChatMessage, isRawMode: boolean) => {
    try {
      if (isRawMode) {
        await navigator.clipboard.writeText(message.content);
      } else {
        // Include both HTML and plain text so paste works everywhere
        const htmlContent = convertToHtml(message.content);
        const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
        const textBlob = new Blob([message.content], { type: 'text/plain' });
        const item = new ClipboardItem({
          'text/html': htmlBlob,
          'text/plain': textBlob,
        });
        await navigator.clipboard.write([item]);
      }
      setSnackbarMessage('Copied to clipboard');
      setSnackbarOpen(true);
    } catch {
      // Fallback to text copy
      await navigator.clipboard.writeText(message.content);
      setSnackbarMessage('Copied as text');
      setSnackbarOpen(true);
    }
  }, []);

  const handleEdit = useCallback((message: ChatMessage) => {
    setMessageStates(prev => ({
      ...prev,
      [message.id]: {
        ...getMessageState(message.id),
        isEditing: true,
        editContent: message.content,
      },
    }));
  }, [getMessageState]);

  const handleSaveEdit = useCallback((messageId: string) => {
    const state = getMessageState(messageId);
    dispatch(updateMessage({ id: messageId, content: state.editContent }));
    setMessageStates(prev => ({
      ...prev,
      [messageId]: {
        ...state,
        isEditing: false,
      },
    }));
  }, [dispatch, getMessageState]);

  const handleCancelEdit = useCallback((messageId: string) => {
    setMessageStates(prev => ({
      ...prev,
      [messageId]: {
        ...getMessageState(messageId),
        isEditing: false,
        editContent: '',
      },
    }));
  }, [getMessageState]);

  const handleEditContentChange = useCallback((messageId: string, content: string) => {
    setMessageStates(prev => ({
      ...prev,
      [messageId]: {
        ...getMessageState(messageId),
        editContent: content,
      },
    }));
  }, [getMessageState]);

  if (messages.length === 0) {
    return (
      <Box
        data-testid="message-list"
        role="log"
        aria-label="Chat messages"
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}
      >
        <Typography variant="body1" color="text.secondary">
          No messages yet. Start a conversation!
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      data-testid="message-list"
      role="log"
      aria-label="Chat messages"
      sx={{
        flex: 1,
        overflow: 'auto',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
      }}
    >
      {messages.map((message) => {
        const state = getMessageState(message.id);
        return (
          <Box
            key={message.id}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <Paper
              data-testid="message-bubble"
              elevation={1}
              sx={{
                p: 1.5,
                maxWidth: '80%',
                backgroundColor: message.role === 'user' ? 'primary.main' : 'grey.100',
                color: message.role === 'user' ? 'primary.contrastText' : 'text.primary',
                borderRadius: 2,
                borderTopRightRadius: message.role === 'user' ? 0 : 2,
                borderTopLeftRadius: message.role === 'assistant' ? 0 : 2,
                position: 'relative',
                '&:hover .message-controls': {
                  opacity: 1,
                },
              }}
            >
              {state.isEditing ? (
                <MessageControls
                  message={message}
                  isRawMode={state.isRawMode}
                  onToggleRawMode={() => handleToggleRawMode(message.id)}
                  onCopy={() => handleCopy(message, state.isRawMode)}
                  onEdit={() => handleEdit(message)}
                  onSaveEdit={() => handleSaveEdit(message.id)}
                  onCancelEdit={() => handleCancelEdit(message.id)}
                  isEditing={state.isEditing}
                  editContent={state.editContent}
                  onEditContentChange={(content) => handleEditContentChange(message.id, content)}
                />
              ) : (
                <>
                  {state.isRawMode ? (
                    <Typography
                      component="pre"
                      sx={{
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                        m: 0,
                      }}
                    >
                      {message.content}
                    </Typography>
                  ) : (
                    <MarkdownRenderer content={message.content} />
                  )}
                  <Box
                    className="message-controls"
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: 1,
                    }}
                  >
                    <MessageControls
                      message={message}
                      isRawMode={state.isRawMode}
                      onToggleRawMode={() => handleToggleRawMode(message.id)}
                      onCopy={() => handleCopy(message, state.isRawMode)}
                      onEdit={() => handleEdit(message)}
                      onSaveEdit={() => handleSaveEdit(message.id)}
                      onCancelEdit={() => handleCancelEdit(message.id)}
                      isEditing={state.isEditing}
                      editContent={state.editContent}
                      onEditContentChange={(content) => handleEditContentChange(message.id, content)}
                    />
                  </Box>
                </>
              )}
            </Paper>
            <Typography
              data-testid="message-timestamp"
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.5, px: 0.5 }}
            >
              {formatTimestamp(message.timestamp)}
            </Typography>
          </Box>
        );
      })}
      <div ref={bottomRef} />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};
