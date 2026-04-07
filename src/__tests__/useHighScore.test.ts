import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useHighScore } from '../hooks/useHighScore';

// localStorageのモック
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useHighScore', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('初期状態では全スコアが0', () => {
    const { result } = renderHook(() => useHighScore());
    expect(result.current.highScores).toEqual({ level1: 0, level2: 0, level3: 0 });
  });

  it('ハイスコアを超えたとき更新する', () => {
    const { result } = renderHook(() => useHighScore());
    act(() => {
      const updated = result.current.updateHighScore('level1', 7);
      expect(updated).toBe(true);
    });
    expect(result.current.highScores.level1).toBe(7);
  });

  it('ハイスコア以下のとき更新しない', () => {
    const { result } = renderHook(() => useHighScore());
    act(() => {
      result.current.updateHighScore('level1', 7);
    });
    act(() => {
      const updated = result.current.updateHighScore('level1', 5);
      expect(updated).toBe(false);
    });
    expect(result.current.highScores.level1).toBe(7);
  });

  it('リセットで全スコアが0になる', () => {
    const { result } = renderHook(() => useHighScore());
    act(() => {
      result.current.updateHighScore('level1', 8);
      result.current.updateHighScore('level2', 6);
    });
    act(() => {
      result.current.resetHighScores();
    });
    expect(result.current.highScores).toEqual({ level1: 0, level2: 0, level3: 0 });
  });
});
