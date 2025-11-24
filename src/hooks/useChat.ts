import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  addMessage,
  setLoading,
  setError,
  clearChat,
} from '../store/slices/chatSlice';
import type { WebLLMService } from '../services/webllm/WebLLMService';
import type { ChatMessage } from '../types/chat';

/**
 * Hook for managing chat interactions.
 * Handles sending messages, receiving responses, and clearing chat.
 */
export function useChat(service: WebLLMService | null) {
  const dispatch = useAppDispatch();
  const messages = useAppSelector((state) => state.chat.messages);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmedContent = content.trim();
      if (!trimmedContent || !service) {
        return;
      }

      // Add user message
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: trimmedContent,
        timestamp: Date.now(),
      };
      dispatch(addMessage(userMessage));
      dispatch(setLoading(true));
      dispatch(setError(null));

      try {
        // Prepare messages for the API
        const chatMessages = [
          ...messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          { role: 'user' as const, content: trimmedContent },
        ];

        // Get response from WebLLM
        const response = await service.chat(chatMessages);

        // Add assistant message
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response,
          timestamp: Date.now(),
        };
        dispatch(addMessage(assistantMessage));
      } catch (error) {
        dispatch(
          setError(
            error instanceof Error ? error.message : 'Failed to generate response'
          )
        );
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, messages, service]
  );

  const abort = useCallback(() => {
    service?.abort();
    dispatch(setLoading(false));
  }, [dispatch, service]);

  const clear = useCallback(async () => {
    dispatch(clearChat());
    await service?.reset();
  }, [dispatch, service]);

  return {
    sendMessage,
    abort,
    clear,
  };
}
