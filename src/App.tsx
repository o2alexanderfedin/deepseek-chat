import { useEffect, useCallback, useRef } from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { Box } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { store } from './store';
import { theme } from './theme';
import { ChatContainer } from './components/chat';
import { ChatSidebar } from './components/sidebar';
import { useWebLLM, useChat } from './hooks';
import { useAppDispatch, useAppSelector } from './store/hooks';
import {
  createConversation,
  deleteConversation,
  setActiveConversation,
  loadConversations,
  updateConversationTitle,
} from './store/slices/chatSlice';
import { storageService } from './services/storage';
import type { Conversation } from './types/chat';
import './App.css';

/**
 * Main chat application component with all integrations wired up.
 */
function ChatApp() {
  const dispatch = useAppDispatch();
  const conversations = useAppSelector((state) => state.chat.conversations);
  const activeConversationId = useAppSelector((state) => state.chat.activeConversationId);

  const { service, reset: resetModel, currentModel, switchModel } = useWebLLM();
  const { sendMessage, clear } = useChat(service);

  // Debounce timer for saving
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load conversations on mount
  useEffect(() => {
    const loadFromStorage = async () => {
      const stored = await storageService.getAllConversations();
      if (stored.length > 0) {
        dispatch(loadConversations(stored));
      } else {
        // Create default conversation if none exist
        handleNewChat();
      }
    };
    loadFromStorage();
  }, [dispatch]);

  // Save conversations to storage with debounce
  useEffect(() => {
    if (conversations.length === 0) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      const activeConv = conversations.find(c => c.id === activeConversationId);
      if (activeConv) {
        await storageService.saveConversation(activeConv);
      }
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [conversations, activeConversationId]);

  const handleNewChat = useCallback(() => {
    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    dispatch(createConversation(newConversation));
  }, [dispatch]);

  const handleSelectConversation = useCallback((id: string) => {
    dispatch(setActiveConversation(id));
  }, [dispatch]);

  const handleDeleteConversation = useCallback(async (id: string) => {
    await storageService.deleteConversation(id);
    dispatch(deleteConversation(id));

    // Create new chat if no conversations left
    const remaining = conversations.filter(c => c.id !== id);
    if (remaining.length === 0) {
      handleNewChat();
    }
  }, [dispatch, conversations, handleNewChat]);

  const handleRenameConversation = useCallback(async (id: string, newTitle: string) => {
    dispatch(updateConversationTitle({ id, title: newTitle }));

    // Persist to storage
    const conversation = conversations.find(c => c.id === id);
    if (conversation) {
      await storageService.saveConversation({
        ...conversation,
        title: newTitle,
        updatedAt: Date.now(),
      });
    }
  }, [dispatch, conversations]);

  const handleClear = async () => {
    await clear();
  };

  const handleRetry = async () => {
    await resetModel();
  };

  const handleModelChange = async (modelId: string) => {
    await switchModel(modelId);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <ChatSidebar
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
      />
      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        <ChatContainer
          onSendMessage={sendMessage}
          onClear={handleClear}
          onRetry={handleRetry}
          currentModel={currentModel}
          onModelChange={handleModelChange}
        />
      </Box>
    </Box>
  );
}

/**
 * Root App component with providers.
 */
function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ChatApp />
      </ThemeProvider>
    </Provider>
  );
}

export default App;
