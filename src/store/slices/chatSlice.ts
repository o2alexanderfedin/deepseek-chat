import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ChatState, ChatMessage, ModelStatus } from '../../types/chat';

export const initialState: ChatState = {
  messages: [],
  isLoading: false,
  error: null,
  modelStatus: 'idle',
  loadProgress: 0,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setModelStatus: (state, action: PayloadAction<ModelStatus>) => {
      state.modelStatus = action.payload;
    },
    setLoadProgress: (state, action: PayloadAction<number>) => {
      state.loadProgress = action.payload;
    },
    clearChat: (state) => {
      state.messages = [];
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  addMessage,
  setLoading,
  setError,
  setModelStatus,
  setLoadProgress,
  clearChat,
  clearError,
} = chatSlice.actions;

export default chatSlice.reducer;
