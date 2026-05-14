import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useRealtimeCollection } from './useRealtimeCollection';

describe('useRealtimeCollection', () => {
  it('fica em loading até o primeiro snapshot do listener', async () => {
    let emit: (items: string[]) => void = () => {};
    const unsubscribe = vi.fn();
    const listener = (onChange: (items: string[]) => void) => {
      emit = onChange;
      return unsubscribe;
    };

    const { result } = renderHook(() => useRealtimeCollection(listener));

    expect(result.current.loading).toBe(true);
    expect(result.current.items).toEqual([]);

    await act(async () => {
      emit(['a', 'b']);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.items).toEqual(['a', 'b']);
  });

  it('com listener null retorna lista vazia e não carrega', () => {
    const { result } = renderHook(() => useRealtimeCollection(null));
    expect(result.current.loading).toBe(false);
    expect(result.current.items).toEqual([]);
  });

  it('chama unsubscribe ao desmontar', () => {
    const unsubscribe = vi.fn();
    const listener = (onChange: (items: number[]) => void) => {
      void onChange;
      return unsubscribe;
    };

    const { unmount } = renderHook(() => useRealtimeCollection(listener));
    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });
});
