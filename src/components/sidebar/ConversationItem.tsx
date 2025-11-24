import React, { useState, useRef, useEffect } from 'react';
import {
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  TextField,
  Box,
} from '@mui/material';
import { Delete as DeleteIcon, Chat as ChatIcon, Edit as EditIcon } from '@mui/icons-material';
import type { Conversation } from '../../types/chat';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  onSelect,
  onDelete,
  onRename,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(conversation.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(conversation.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditValue(conversation.title);
    setIsEditing(true);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditValue(conversation.title);
    setIsEditing(true);
  };

  const handleSave = () => {
    const trimmedValue = editValue.trim();
    if (trimmedValue && trimmedValue !== conversation.title) {
      onRename(conversation.id, trimmedValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(conversation.title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  return (
    <ListItem
      disablePadding
      aria-selected={isActive}
      secondaryAction={
        <Box sx={{ display: 'flex', gap: 0 }}>
          <IconButton
            edge="end"
            aria-label="edit"
            onClick={handleEdit}
            size="small"
            sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            edge="end"
            aria-label="delete"
            onClick={handleDelete}
            size="small"
            sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      }
    >
      <ListItemButton
        selected={isActive}
        onClick={() => !isEditing && onSelect(conversation.id)}
        sx={{
          borderRadius: 1,
          mx: 1,
          '&.Mui-selected': {
            backgroundColor: 'action.selected',
          },
        }}
      >
        <ChatIcon sx={{ mr: 1, fontSize: 18, opacity: 0.7 }} />
        {isEditing ? (
          <TextField
            inputRef={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            size="small"
            variant="standard"
            fullWidth
            onClick={(e) => e.stopPropagation()}
            sx={{
              '& .MuiInput-root': {
                fontSize: '0.875rem',
              },
            }}
          />
        ) : (
          <ListItemText
            primary={conversation.title}
            primaryTypographyProps={{
              noWrap: true,
              fontSize: '0.875rem',
            }}
            onDoubleClick={handleDoubleClick}
          />
        )}
      </ListItemButton>
    </ListItem>
  );
};
