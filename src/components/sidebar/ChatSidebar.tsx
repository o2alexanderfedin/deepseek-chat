import React from 'react';
import {
  Box,
  List,
  Button,
  Typography,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Add as AddIcon, GitHub as GitHubIcon } from '@mui/icons-material';
import { useAppSelector } from '../../store/hooks';
import { ConversationItem } from './ConversationItem';

interface ChatSidebarProps {
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  onRenameConversation,
}) => {
  const conversations = useAppSelector((state) => state.chat.conversations);
  const activeConversationId = useAppSelector((state) => state.chat.activeConversationId);

  return (
    <Box
      sx={{
        width: 250,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRight: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ p: 2 }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={onNewChat}
          fullWidth
        >
          New Chat
        </Button>
      </Box>

      <Divider />

      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {conversations.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ p: 2, textAlign: 'center' }}
          >
            No conversations yet
          </Typography>
        ) : (
          <List dense>
            {conversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={conversation.id === activeConversationId}
                onSelect={onSelectConversation}
                onDelete={onDeleteConversation}
                onRename={onRenameConversation}
              />
            ))}
          </List>
        )}
      </Box>

      <Divider />

      <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
        <Tooltip title="View on GitHub">
          <IconButton
            component="a"
            href="https://github.com/o2alexanderfedin/deepseek-chat"
            target="_blank"
            rel="noopener noreferrer"
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            <GitHubIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};
