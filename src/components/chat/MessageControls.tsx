import React from 'react';
import {
  Box,
  IconButton,
  TextField,
  Tooltip,
} from '@mui/material';
import {
  ContentCopy,
  Edit,
  Code,
  Visibility,
  Check,
  Close,
} from '@mui/icons-material';
import { ChatMessage } from '../../types/chat';

interface MessageControlsProps {
  message: ChatMessage;
  isRawMode: boolean;
  onToggleRawMode: () => void;
  onCopy: () => void;
  onEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  isEditing: boolean;
  editContent: string;
  onEditContentChange: (content: string) => void;
}

export const MessageControls: React.FC<MessageControlsProps> = ({
  message,
  isRawMode,
  onToggleRawMode,
  onCopy,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  isEditing,
  editContent,
  onEditContentChange,
}) => {
  const isUserMessage = message.role === 'user';

  if (isEditing) {
    return (
      <Box sx={{ width: '100%' }}>
        <TextField
          fullWidth
          multiline
          minRows={2}
          value={editContent}
          onChange={(e) => onEditContentChange(e.target.value)}
          size="small"
          sx={{ mb: 1 }}
        />
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
          <Tooltip title="Save">
            <IconButton
              size="small"
              onClick={onSaveEdit}
              aria-label="save edit"
              color="primary"
            >
              <Check fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Cancel">
            <IconButton
              size="small"
              onClick={onCancelEdit}
              aria-label="cancel edit"
            >
              <Close fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
      <Tooltip title={isRawMode ? 'Show rendered' : 'Show raw'}>
        <IconButton
          size="small"
          onClick={onToggleRawMode}
          aria-label="toggle raw mode"
        >
          {isRawMode ? (
            <Visibility fontSize="small" data-testid="VisibilityIcon" />
          ) : (
            <Code fontSize="small" data-testid="CodeIcon" />
          )}
        </IconButton>
      </Tooltip>
      <Tooltip title="Copy">
        <IconButton
          size="small"
          onClick={onCopy}
          aria-label="copy message"
        >
          <ContentCopy fontSize="small" />
        </IconButton>
      </Tooltip>
      {isUserMessage && (
        <Tooltip title="Edit">
          <IconButton
            size="small"
            onClick={onEdit}
            aria-label="edit message"
          >
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};
