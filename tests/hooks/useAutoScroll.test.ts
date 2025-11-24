import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAutoScroll } from '../../src/hooks/useAutoScroll';

describe('useAutoScroll', () => {
  it('should return a ref', () => {
    const { result } = renderHook(() => useAutoScroll<HTMLDivElement>());

    expect(result.current).toBeDefined();
    expect(result.current.current).toBeNull();
  });

  it('should scroll to bottom when deps change', () => {
    const mockScrollTop = vi.fn();
    const mockElement = {
      scrollTop: 0,
      scrollHeight: 1000,
    };

    Object.defineProperty(mockElement, 'scrollTop', {
      set: mockScrollTop,
      get: () => 0,
    });

    const { result, rerender } = renderHook(
      ({ deps }) => useAutoScroll<HTMLDivElement>(deps),
      { initialProps: { deps: [0] } }
    );

    // Manually set the ref
    Object.defineProperty(result.current, 'current', {
      value: mockElement,
      writable: true,
    });

    // Trigger effect by changing deps
    rerender({ deps: [1] });

    expect(mockScrollTop).toHaveBeenCalledWith(1000);
  });

  it('should handle null ref gracefully', () => {
    const { rerender } = renderHook(
      ({ deps }) => useAutoScroll<HTMLDivElement>(deps),
      { initialProps: { deps: [0] } }
    );

    // Should not throw when ref is null
    expect(() => rerender({ deps: [1] })).not.toThrow();
  });

  it('should work with empty deps array', () => {
    const { result } = renderHook(() => useAutoScroll<HTMLDivElement>([]));

    expect(result.current).toBeDefined();
  });

  it('should work with multiple deps', () => {
    const mockElement = {
      scrollTop: 0,
      scrollHeight: 500,
    };

    const { result, rerender } = renderHook(
      ({ deps }) => useAutoScroll<HTMLDivElement>(deps),
      { initialProps: { deps: ['a', 1, true] } }
    );

    Object.defineProperty(result.current, 'current', {
      value: mockElement,
      writable: true,
    });

    // Should not throw
    expect(() => rerender({ deps: ['b', 2, false] })).not.toThrow();
  });
});
