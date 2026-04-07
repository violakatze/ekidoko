import { describe, it, expect } from 'vitest';

import { sampleWithoutReplacement } from '../utils/stationUtils';

describe('sampleWithoutReplacement', () => {
  it('指定した数だけ抽出する', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = sampleWithoutReplacement(arr, 3);
    expect(result).toHaveLength(3);
  });

  it('重複なしで抽出する', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = sampleWithoutReplacement(arr, 5);
    const unique = new Set(result);
    expect(unique.size).toBe(5);
  });

  it('配列長より多く指定した場合は全要素を返す', () => {
    const arr = [1, 2, 3];
    const result = sampleWithoutReplacement(arr, 10);
    expect(result).toHaveLength(3);
  });

  it('元の配列を変更しない', () => {
    const arr = [1, 2, 3, 4, 5];
    const original = [...arr];
    sampleWithoutReplacement(arr, 3);
    expect(arr).toEqual(original);
  });

  it('空配列に対して空配列を返す', () => {
    const result = sampleWithoutReplacement([], 5);
    expect(result).toHaveLength(0);
  });
});
