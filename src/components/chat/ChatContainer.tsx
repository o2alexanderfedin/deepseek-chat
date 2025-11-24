import React from 'react';
import { Box, Paper, Typography, Chip, IconButton, Select, MenuItem, FormControl } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import DeleteIcon from '@mui/icons-material/Delete';
import { RootState } from '../../store';
import { clearError } from '../../store/slices/chatSlice';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { LoadingIndicator } from './LoadingIndicator';
import { ErrorDisplay } from './ErrorDisplay';
import { AVAILABLE_MODELS } from '../../services/webllm';

interface ChatContainerProps {
  onSendMessage?: (message: string) => void;
  onClear?: () => void;
  onRetry?: () => void;
  currentModel?: string;
  onModelChange?: (modelId: string) => void;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  onSendMessage,
  onClear,
  onRetry,
  currentModel,
  onModelChange,
}) => {
  const dispatch = useDispatch();
  const { conversations, activeConversationId, isLoading, modelStatus, loadProgress, error } = useSelector(
    (state: RootState) => state.chat
  );
  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const messages = activeConversation?.messages || [];

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

  const handleModelChange = (modelId: string) => {
    if (onModelChange) {
      onModelChange(modelId);
    }
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
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={currentModel || AVAILABLE_MODELS[0].id}
              onChange={(e) => handleModelChange(e.target.value)}
              disabled={modelStatus === 'loading'}
              sx={{
                color: 'inherit',
                '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                '.MuiSvgIcon-root': { color: 'inherit' },
              }}
              aria-label="Select model"
            >
              {AVAILABLE_MODELS.map((model) => (
                <MenuItem key={model.id} value={model.id}>
                  {model.name} ({model.vram})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
