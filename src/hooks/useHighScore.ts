import { useState, useCallback } from 'react';

import type { HighScores } from '../types';

const STORAGE_KEY_PREFIX = 'ekidoko_highscore_';

const loadHighScores = (): HighScores => {
  try {
    const parse = (key: string): number => {
      const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${key}`);
      const n = Number(raw);
      return Number.isFinite(n) ? n : 0;
    };
    return {
      level1: parse('level1'),
      level2: parse('level2'),
      level3: parse('level3'),
    };
  } catch {
    // プライベートモードや容量超過など localStorage が使えない場合
    return { level1: 0, level2: 0, level3: 0 };
  }
};

/**
 * ハイスコアのlocalStorage管理フック
 * localStorage が使用不可の環境でも例外を出さずに動作する
 */
export const useHighScore = () => {
  const [highScores, setHighScores] = useState<HighScores>(loadHighScores);

  /**
   * スコアを更新し、ハイスコアを超えた場合のみ保存する
   * @returns ハイスコアを更新したかどうか
   */
  const updateHighScore = useCallback(
    (level: 'level1' | 'level2' | 'level3', score: number): boolean => {
      const current = highScores[level];
      if (score > current) {
        try {
          localStorage.setItem(`${STORAGE_KEY_PREFIX}${level}`, String(score));
        } catch {
          // 保存失敗は無視（スコアは画面上には反映する）
        }
        setHighScores((prev) => ({ ...prev, [level]: score }));
        return true;
      }
      return false;
    },
    [highScores],
  );

  /** 全レベルのハイスコアを削除する */
  const resetHighScores = useCallback(() => {
    try {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}level1`);
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}level2`);
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}level3`);
    } catch {
      // 削除失敗は無視
    }
    setHighScores({ level1: 0, level2: 0, level3: 0 });
  }, []);

  return { highScores, updateHighScore, resetHighScores };
};
