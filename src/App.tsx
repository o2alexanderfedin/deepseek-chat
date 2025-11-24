import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { store } from './store';
import { theme } from './theme';
import { ChatContainer } from './components/chat';
import { useWebLLM, useChat } from './hooks';
import './App.css';

/**
 * Main chat application component with all integrations wired up.
 */
function ChatApp() {
  const { service, reset: resetModel } = useWebLLM();
  const { sendMessage, clear } = useChat(service);

  const handleClear = async () => {
    await clear();
  };

  const handleRetry = async () => {
    // Re-initialize the model
    await resetModel();
  };

  return (
    <ChatContainer
      onSendMessage={sendMessage}
      onClear={handleClear}
      onRetry={handleRetry}
    />
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
