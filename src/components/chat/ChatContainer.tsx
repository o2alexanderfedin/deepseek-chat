import React from 'react';
import { Box, Paper, Typography, Chip, IconButton } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import DeleteIcon from '@mui/icons-material/Delete';
import { RootState } from '../../store';
import { clearError } from '../../store/slices/chatSlice';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { LoadingIndicator } from './LoadingIndicator';
import { ErrorDisplay } from './ErrorDisplay';

interface ChatContainerProps {
  onSendMessage?: (message: string) => void;
  onClear?: () => void;
  onRetry?: () => void;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  onSendMessage,
  onClear,
  onRetry,
}) => {
  const dispatch = useDispatch();
  const { messages, isLoading, modelStatus, loadProgress, error } = useSelector(
    (state: RootState) => state.chat
  );

  const handleSendMessage = (content: string) => {
    if (onSendMessage) {
      onSendMessage(content);
    }
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    }
  };

  const handleDismiss = () => {
    dispatch(clearError());
  };

  const getStatusColor = () => {
    switch (modelStatus) {
      case 'ready':
        return 'success';
      case 'loading':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = () => {
    switch (modelStatus) {
      case 'ready':
        return 'Ready';
      case 'loading':
        return 'Loading';
      case 'error':
        return 'Error';
      default:
        return 'Idle';
    }
  };

  return (
    <Paper
      component="main"
      role="main"
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 0,
      }}
    >
      <Box
        component="header"
        role="banner"
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'primary.main',
          color: 'primary.contrastText',
        }}
      >
        <Typography variant="h6" component="h1">
          DeepSeek Chat
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            color="inherit"
            onClick={handleClear}
            disabled={messages.length === 0 || isLoading}
            aria-label="Clear chat"
            size="small"
          >
            <DeleteIcon />
          </IconButton>
          <Chip
            data-testid="status-indicator"
            label={getStatusLabel()}
            color={getStatusColor()}
            size="small"
            variant="filled"
          />
        </Box>
      </Box>

      {error && (
        <ErrorDisplay
          message={error}
          onRetry={handleRetry}
          onDismiss={handleDismiss}
        />
      )}

      {modelStatus === 'loading' && (
        <LoadingIndicator
          progress={loadProgress}
          stage="Loading model..."
        />
      )}

      <MessageList messages={messages} />

      <MessageInput
        onSend={handleSendMessage}
        disabled={isLoading || modelStatus === 'loading'}
      />
    </Paper>
  );
};
