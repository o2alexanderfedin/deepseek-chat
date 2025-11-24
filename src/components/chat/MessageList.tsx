import React, { useEffect, useRef } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { ChatMessage } from '../../types/chat';
import { MarkdownRenderer } from '../common/MarkdownRenderer';

interface MessageListProps {
  messages: ChatMessage[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
      {messages.map((message) => (
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
            }}
          >
            <MarkdownRenderer content={message.content} />
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
      ))}
      <div ref={bottomRef} />
    </Box>
  );
};
