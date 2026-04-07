import { Box, Typography, Button, Paper, Chip } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrainIcon from '@mui/icons-material/Train';

import type { GameMode } from '../types';

type ResultScreenProps = {
  mode: GameMode;
  score: number;
  totalQuestions: number;
  isNewRecord: boolean;
  onBackToTitle: () => void;
};

const MODE_LABELS: Record<GameMode, string> = {
  level1: 'レベル1',
  level2: 'レベル2',
  level3: 'レベル3',
  browse: '閲覧モード',
};

/**
 * ゲーム結果画面
 */
export const ResultScreen = ({
  mode,
  score,
  totalQuestions,
  isNewRecord,
  onBackToTitle,
}: ResultScreenProps) => {
  const percentage = Math.round((score / totalQuestions) * 100);

  const getScoreComment = (): string => {
    if (score === totalQuestions) return '全問正解！素晴らしい！';
    if (percentage >= 80) return 'よくできました！';
    if (percentage >= 60) return 'もう少し！';
    return 'もっと練習しよう！';
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      bgcolor="grey.100"
      p={3}
    >
      <Paper elevation={4} sx={{ p: 4, maxWidth: 400, width: '100%', textAlign: 'center' }}>
        {/* アイコン */}
        <TrainIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />

        <Typography variant="h5" fontWeight="bold" gutterBottom>
          ゲーム終了
        </Typography>

        <Chip label={MODE_LABELS[mode]} color="primary" size="small" sx={{ mb: 2 }} />

        {/* スコア表示 */}
        <Box my={3}>
          <Typography variant="h2" fontWeight="bold" color="primary.main">
            {score}
            <Typography component="span" variant="h4" color="text.secondary">
              {' '}
              / {totalQuestions}
            </Typography>
          </Typography>
          <Typography variant="body1" color="text.secondary" mt={1}>
            {getScoreComment()}
          </Typography>
        </Box>

        {/* 新記録表示 */}
        {isNewRecord && (
          <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={2}>
            <EmojiEventsIcon color="warning" />
            <Typography variant="body1" fontWeight="bold" color="warning.dark">
              新記録！
            </Typography>
          </Box>
        )}

        <Button variant="contained" size="large" fullWidth onClick={onBackToTitle} sx={{ mt: 2 }}>
          タイトルに戻る
        </Button>
      </Paper>
    </Box>
  );
};
