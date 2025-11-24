import { useEffect, useRef } from 'react';

/**
 * Hook for auto-scrolling to the bottom when content changes.
 * Returns a ref to attach to the scrollable container.
 */
export function useAutoScroll<T extends HTMLElement>(deps: unknown[] = []) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [deps]);

  return containerRef;
}
