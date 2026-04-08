import { useState, useEffect, useCallback } from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';

import type { GameMode, StationFeature } from './types';
import { loadStations } from './utils/stationUtils';
import { useHighScore } from './hooks/useHighScore';
import { TitleScreen } from './components/TitleScreen';
import { GameScreen } from './components/GameScreen';
import { ResultScreen } from './components/ResultScreen';

/** 画面の状態 */
type Screen = 'title' | 'game' | 'result';

const BASE_URL = import.meta.env.BASE_URL;
const TOTAL_QUESTIONS = 10;

export const App = () => {
  const [screen, setScreen] = useState<Screen>('title');
  const [gameMode, setGameMode] = useState<GameMode>('level1');
  const [stations, setStations] = useState<StationFeature[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [finalScore, setFinalScore] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);

  const { highScores, updateHighScore, resetHighScores } = useHighScore();

  // 駅データの読み込み（初回のみ）
  useEffect(() => {
    loadStations(BASE_URL)
      .then((data) => setStations(data))
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : '不明なエラー';
        setLoadError(msg);
      });
  }, []);

  const handleStart = useCallback((mode: GameMode) => {
    setGameMode(mode);
    setScreen('game');
  }, []);

  const handleFinish = useCallback(
    (score: number) => {
      setFinalScore(score);
      // 閲覧モードはスコアなし
      if (gameMode !== 'browse') {
        const level = gameMode as 'level1' | 'level2' | 'level3';
        const updated = updateHighScore(level, score);
        setIsNewRecord(updated);
      } else {
        setIsNewRecord(false);
      }
      setScreen('result');
    },
    [gameMode, updateHighScore],
  );

  const handleBackToTitle = useCallback(() => {
    setScreen('title');
  }, []);

  // ローディング中
  if (stations.length === 0 && !loadError) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        gap={2}
      >
        <CircularProgress />
        <Typography variant="body1" color="text.secondary">
          駅データを読み込み中…
        </Typography>
      </Box>
    );
  }

  // 読み込みエラー
  if (loadError) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
      >
        <Typography color="error">
          データの読み込みに失敗しました: {loadError}
        </Typography>
      </Box>
    );
  }

  if (screen === 'title') {
    return (
      <TitleScreen
        highScores={highScores}
        onStart={handleStart}
        onResetScores={resetHighScores}
      />
    );
  }

  if (screen === 'game') {
    return (
      <GameScreen
        mode={gameMode}
        stations={stations}
        baseUrl={BASE_URL}
        onFinish={handleFinish}
        onBackToTitle={gameMode === 'browse' ? handleBackToTitle : undefined}
      />
    );
  }

  return (
    <ResultScreen
      mode={gameMode}
      score={finalScore}
      totalQuestions={TOTAL_QUESTIONS}
      isNewRecord={isNewRecord}
      onBackToTitle={handleBackToTitle}
    />
  );
};
