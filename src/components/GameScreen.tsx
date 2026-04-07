import { useCallback, useEffect } from 'react';
import { Box } from '@mui/material';

import type { GameMode, StationFeature } from '../types';
import { useGame } from '../hooks/useGame';
import { MapView } from './MapView';
import { QuestionPanel } from './QuestionPanel';

type GameScreenProps = {
  mode: GameMode;
  stations: StationFeature[];
  baseUrl: string;
  onFinish: (score: number) => void;
};

/**
 * ゲーム画面（地図 + 出題パネル）
 */
export const GameScreen = ({ mode, stations, baseUrl, onFinish }: GameScreenProps) => {
  const { gameState, currentQuestion, timeLeft, isFinished, handleStationClick, goToNextQuestion } =
    useGame(mode, stations);

  const { score, currentIndex } = gameState;

  // 10問終了時に結果画面へ遷移
  useEffect(() => {
    if (isFinished) {
      onFinish(score);
    }
  }, [isFinished, score, onFinish]);

  const handleStationClickWrapper = useCallback(
    (featureId: string) => {
      handleStationClick(featureId);
    },
    [handleStationClick],
  );

  const handleNext = useCallback(() => {
    goToNextQuestion();
  }, [goToNextQuestion]);

  const correctFeatureId = currentQuestion?.resolved
    ? currentQuestion.station.featureId
    : undefined;
  const wrongFeatureIds = currentQuestion?.wrongFeatureIds ?? [];

  return (
    <Box sx={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <MapView
        mode={mode}
        baseUrl={baseUrl}
        stations={stations}
        correctFeatureId={correctFeatureId}
        wrongFeatureIds={wrongFeatureIds}
        onStationClick={mode !== 'browse' ? handleStationClickWrapper : undefined}
      />

      {mode !== 'browse' && currentQuestion && !isFinished && (
        <QuestionPanel
          questionNumber={currentIndex + 1}
          totalQuestions={gameState.questions.length}
          question={currentQuestion}
          timeLeft={timeLeft}
          score={score}
          onNext={handleNext}
        />
      )}
    </Box>
  );
};
