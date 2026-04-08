import { useCallback, useEffect } from 'react';
import { Box, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import type { GameMode, StationFeature } from '../types';
import { useGame } from '../hooks/useGame';
import { MapView } from './MapView';
import { QuestionPanel } from './QuestionPanel';

type GameScreenProps = {
  mode: GameMode;
  stations: StationFeature[];
  baseUrl: string;
  onFinish: (score: number) => void;
  onBackToTitle?: () => void;
};

/**
 * ゲーム画面（地図 + 出題パネル）
 */
export const GameScreen = ({ mode, stations, baseUrl, onFinish, onBackToTitle }: GameScreenProps) => {
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
    (featureId: string, stationGroupName: string) => {
      handleStationClick(featureId, stationGroupName);
    },
    [handleStationClick],
  );

  const handleNext = useCallback(() => {
    goToNextQuestion();
  }, [goToNextQuestion]);

  const correctStationGroupName = currentQuestion?.resolved
    ? currentQuestion.station.stationGroupName
    : undefined;
  const wrongFeatureIds = currentQuestion?.wrongFeatureIds ?? [];

  return (
    <Box sx={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <MapView
        mode={mode}
        baseUrl={baseUrl}
        stations={stations}
        correctStationGroupName={correctStationGroupName}
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

      {mode === 'browse' && onBackToTitle && (
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={onBackToTitle}
          sx={{
            position: 'absolute',
            top: 16,
            left: 56,
            zIndex: 500,
            backgroundColor: 'rgba(255,255,255,0.95)',
            color: 'text.primary',
            '&:hover': { backgroundColor: 'rgba(255,255,255,1)' },
          }}
        >
          タイトルに戻る
        </Button>
      )}
    </Box>
  );
};
