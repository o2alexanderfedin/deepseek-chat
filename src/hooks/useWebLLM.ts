import { useEffect, useCallback, useState } from 'react';
import { useAppDispatch } from '../store/hooks';
import {
  setModelStatus,
  setLoadProgress,
  setError,
} from '../store/slices/chatSlice';
import { WebLLMService } from '../services/webllm/WebLLMService';
import type { WebLLMProgress } from '../services/webllm/types';

/**
 * Hook for managing WebLLM model lifecycle.
 * Initializes the model on mount and provides abort/reset functions.
 */
export function useWebLLM() {
  const dispatch = useAppDispatch();
  const [service] = useState<WebLLMService>(() => WebLLMService.getInstance());

  useEffect(() => {
    const initializeModel = async () => {
      dispatch(setModelStatus('loading'));
      dispatch(setLoadProgress(0));

      try {
        await service.initialize((progress: WebLLMProgress) => {
          dispatch(setLoadProgress(progress.progress));
        });

        dispatch(setModelStatus('ready'));
        dispatch(setLoadProgress(100));
      } catch (error) {
        dispatch(setModelStatus('error'));
        dispatch(
          setError(
            error instanceof Error ? error.message : 'Failed to initialize model'
          )
        );
      }
    };

    initializeModel();
  }, [dispatch, service]);

  const abort = useCallback(() => {
    service.abort();
  }, [service]);

  const reset = useCallback(async () => {
    await service.reset();
  }, [service]);

  return {
    service,
    abort,
    reset,
  };
}
