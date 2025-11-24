export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export type ModelStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  modelStatus: ModelStatus;
  loadProgress: number;
}
