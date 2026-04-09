import { Box, Paper, Typography, Button, Chip } from '@mui/material';
import TrainIcon from '@mui/icons-material/Train';
import TimerIcon from '@mui/icons-material/Timer';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

import type { QuestionState } from '../types';

type QuestionPanelProps = {
  questionNumber: number;
  totalQuestions: number;
  question: QuestionState;
  timeLeft: number;
  score: number;
  onNext: () => void;
};

/**
 * ゲーム画面の出題パネル
 */
export const QuestionPanel = ({
  questionNumber,
  totalQuestions,
  question,
  timeLeft,
  score,
  onNext,
}: QuestionPanelProps) => {
  const { station, remainingAttempts, resolved, correct } = question;
  // questionNumber - 1 = 回答済み問題数
  const answeredCount = questionNumber - 1;

  return (
    <Paper
      elevation={4}
      sx={{
        position: 'absolute',
        top: 16,
        left: 56,
        zIndex: 500,
        p: 2,
        minWidth: 240,
        maxWidth: 300,
        backgroundColor: 'rgba(255,255,255,0.95)',
      }}
    >
      {/* ヘッダー行 */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="caption" color="text.secondary">
          問{questionNumber} / {totalQuestions}
        </Typography>
        {/* 回答済みが1問以上のときだけスコアを表示 */}
        {answeredCount > 0 && (
          <Typography variant="caption" color="text.secondary">
            正解 {score} / {answeredCount}
          </Typography>
        )}
      </Box>

      {/* 駅名 */}
      <Box display="flex" alignItems="center" gap={1} mb={0.5}>
        <TrainIcon fontSize="small" color="action" aria-hidden="true" />
        <Typography variant="h6" fontWeight="bold">
          {station.stationName}
        </Typography>
      </Box>

      {/* 路線名・会社名 */}
      <Typography variant="body2" color="text.secondary" ml={0.5}>
        {station.lineName}
      </Typography>
      <Typography variant="body2" color="text.secondary" ml={0.5} mb={1}>
        {station.companyName}
      </Typography>

      {/* タイマーと残り回答機会 */}
      {!resolved && (
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
          <Box display="flex" alignItems="center" gap={0.5}>
            <TimerIcon
              fontSize="small"
              color={timeLeft <= 10 ? 'error' : 'action'}
              aria-hidden="true"
            />
            <Typography
              variant="body2"
              color={timeLeft <= 10 ? 'error' : 'text.primary'}
              fontWeight={timeLeft <= 10 ? 'bold' : 'normal'}
              role="timer"
              aria-label={`残り${timeLeft}秒`}
              aria-live={timeLeft <= 10 && timeLeft % 5 === 0 ? 'assertive' : 'off'}
            >
              {timeLeft}秒
            </Typography>
          </Box>
          <Chip
            label={`残り${remainingAttempts}回`}
            size="small"
            color={remainingAttempts === 1 ? 'warning' : 'default'}
            aria-label={`残り回答機会${remainingAttempts}回`}
          />
        </Box>
      )}

      {/* 確定後: 正解・不正解表示と次へボタン */}
      {resolved && (
        <Box mt={1}>
          <Box display="flex" alignItems="center" gap={0.5} mb={1}>
            {correct ? (
              <CheckCircleOutlineIcon fontSize="small" color="success" aria-hidden="true" />
            ) : (
              <CancelOutlinedIcon fontSize="small" color="error" aria-hidden="true" />
            )}
            <Typography
              variant="body2"
              fontWeight="bold"
              color={correct ? 'success.main' : 'error.main'}
            >
              {correct ? '正解！' : '不正解'}
            </Typography>
          </Box>
          {!correct && (
            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
              正解は「{station.stationName}」でした（{station.lineName}）
            </Typography>
          )}
          <Button variant="contained" size="small" fullWidth onClick={onNext}>
            次の問題へ
          </Button>
        </Box>
      )}
    </Paper>
  );
};
