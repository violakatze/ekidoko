import { useState, useCallback, useRef, useEffect } from 'react';

import type { GameMode, GameState, QuestionState, StationFeature } from '../types';
import { sampleWithoutReplacement } from '../utils/stationUtils';

/** 1ゲームの出題数 */
const QUESTION_COUNT = 10;
/** 1問あたりの制限時間（秒） */
const TIME_LIMIT = 60;
/** 1問あたりの回答機会数 */
const MAX_ATTEMPTS = 3;

const createQuestion = (station: StationFeature): QuestionState => ({
  station,
  remainingAttempts: MAX_ATTEMPTS,
  resolved: false,
  correct: false,
  wrongFeatureIds: [],
});

/**
 * ゲームロジック管理フック
 */
export const useGame = (mode: GameMode, allStations: StationFeature[]) => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const sampled = sampleWithoutReplacement(allStations, QUESTION_COUNT);
    return {
      mode,
      questions: sampled.map(createQuestion),
      currentIndex: 0,
      score: 0,
    };
  });

  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [isFinished, setIsFinished] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // stale closureを避けるためにrefでも管理する
  const timeLeftRef = useRef(TIME_LIMIT);

  const currentQuestion = gameState.questions[gameState.currentIndex];
  const isResolved = currentQuestion?.resolved ?? true;

  /** タイマー停止 */
  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /** 問題を確定状態にして正解表示フェーズへ移行する */
  const resolveQuestion = useCallback((correct: boolean) => {
    stopTimer();
    setGameState((prev) => {
      const questions = [...prev.questions];
      const q = questions[prev.currentIndex];
      if (!q) return prev;
      questions[prev.currentIndex] = { ...q, resolved: true, correct };
      return {
        ...prev,
        questions,
        score: correct ? prev.score + 1 : prev.score,
      };
    });
  }, [stopTimer]);

  /**
   * タイマー開始
   * @param from - 開始秒数（省略時はTIME_LIMITから）
   */
  const startTimer = useCallback((from = TIME_LIMIT) => {
    stopTimer();
    timeLeftRef.current = from;
    setTimeLeft(from);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          resolveQuestion(false);
          timeLeftRef.current = 0;
          return 0;
        }
        timeLeftRef.current = t - 1;
        return t - 1;
      });
    }, 1000);
  }, [stopTimer, resolveQuestion]);

  /** 問題が切り替わったときにタイマーをリセット（閲覧モード以外） */
  useEffect(() => {
    if (mode === 'browse' || isResolved || isFinished) return;
    startTimer();
    return () => stopTimer();
    // currentIndex が変わるたびに再実行
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.currentIndex, isFinished]);

  /** バックグラウンドタブになったときタイマーを一時停止し、復帰時に再開する */
  useEffect(() => {
    if (mode === 'browse') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopTimer();
      } else if (!isResolved && !isFinished) {
        startTimer(timeLeftRef.current);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [mode, isResolved, isFinished, startTimer, stopTimer]);

  /**
   * 駅をクリックしたときの処理
   * @param featureId - クリックした駅のfeatureId（ハイライト用）
   * @param stationGroupName - クリックした駅のN02_005g（正解判定用）
   * @returns クリック結果 ('correct' | 'wrong' | 'resolved' | 'browse')
   */
  const handleStationClick = useCallback(
    (featureId: string, stationGroupName: string): 'correct' | 'wrong' | 'resolved' | 'browse' => {
      if (mode === 'browse') return 'browse';

      const q = gameState.questions[gameState.currentIndex];
      if (!q || q.resolved) return 'resolved';

      if (stationGroupName === q.station.stationGroupName) {
        resolveQuestion(true);
        return 'correct';
      }

      // 不正解
      const newAttempts = q.remainingAttempts - 1;
      setGameState((prev) => {
        const questions = [...prev.questions];
        const current = questions[prev.currentIndex];
        if (!current) return prev;
        questions[prev.currentIndex] = {
          ...current,
          remainingAttempts: newAttempts,
          wrongFeatureIds: [...current.wrongFeatureIds, featureId],
        };
        return { ...prev, questions };
      });

      if (newAttempts <= 0) {
        resolveQuestion(false);
      }

      return 'wrong';
    },
    [gameState, mode, resolveQuestion],
  );

  /** 「次の問題へ」を押したときの処理 */
  const goToNextQuestion = useCallback(() => {
    const nextIndex = gameState.currentIndex + 1;
    if (nextIndex >= gameState.questions.length) {
      setIsFinished(true);
    } else {
      setGameState((prev) => ({ ...prev, currentIndex: nextIndex }));
    }
  }, [gameState]);

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  return {
    gameState,
    currentQuestion,
    timeLeft,
    isFinished,
    handleStationClick,
    goToNextQuestion,
  };
};
