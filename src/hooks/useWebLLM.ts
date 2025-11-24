import { useEffect, useCallback, useState } from 'react';
import { useAppDispatch } from '../store/hooks';
import {
  setModelStatus,
  setLoadProgress,
  setError,
} from '../store/slices/chatSlice';
import { WebLLMService, AVAILABLE_MODELS } from '../services/webllm';
import type { WebLLMProgress } from '../services/webllm/types';

/**
 * Hook for managing WebLLM model lifecycle.
 * Initializes the model on mount and provides abort/reset functions.
 */
export function useWebLLM() {
  const dispatch = useAppDispatch();
  const [service] = useState<WebLLMService>(() => WebLLMService.getInstance());
  const [currentModel, setCurrentModel] = useState<string>(AVAILABLE_MODELS[0].id);

  const loadModel = useCallback(async (modelId: string) => {
    dispatch(setModelStatus('loading'));
    dispatch(setLoadProgress(0));

    try {
      await service.initialize(modelId, (progress: WebLLMProgress) => {
        dispatch(setLoadProgress(progress.progress));
      });

      dispatch(setModelStatus('ready'));
      dispatch(setLoadProgress(100));
      setCurrentModel(modelId);
    } catch (error) {
      dispatch(setModelStatus('error'));
      dispatch(
        setError(
          error instanceof Error ? error.message : 'Failed to initialize model'
        )
      );
    }
  }, [dispatch, service]);

  useEffect(() => {
    loadModel(currentModel);
  }, []);

  const switchModel = useCallback(async (modelId: string) => {
    if (modelId !== currentModel) {
      await loadModel(modelId);
    }
  }, [currentModel, loadModel]);

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
    currentModel,
    switchModel,
  };
}
