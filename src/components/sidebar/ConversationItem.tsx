import React from 'react';
import {
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
} from '@mui/material';
import { Delete as DeleteIcon, Chat as ChatIcon } from '@mui/icons-material';
import type { Conversation } from '../../types/chat';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  onSelect,
  onDelete,
}) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(conversation.id);
  };

  return (
    <ListItem
      disablePadding
      aria-selected={isActive}
      secondaryAction={
        <IconButton
          edge="end"
          aria-label="delete"
          onClick={handleDelete}
          size="small"
          sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      }
    >
      <ListItemButton
        selected={isActive}
        onClick={() => onSelect(conversation.id)}
        sx={{
          borderRadius: 1,
          mx: 1,
          '&.Mui-selected': {
            backgroundColor: 'action.selected',
          },
        }}
      >
        <ChatIcon sx={{ mr: 1, fontSize: 18, opacity: 0.7 }} />
        <ListItemText
          primary={conversation.title}
          primaryTypographyProps={{
            noWrap: true,
            fontSize: '0.875rem',
          }}
        />
      </ListItemButton>
    </ListItem>
  );
};
